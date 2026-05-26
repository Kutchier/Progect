'use strict';

const { levelUp } = require('./classes');
const { getBonusMultiplier } = require('./bonuses');

function calculateDamage(attacker, defender, multiplier = 1.0, guaranteedCrit = false) {
  const baseAtk = getEffectiveStat(attacker, 'attack');
  const baseDef = getEffectiveStat(defender, 'defense');

  let damage = Math.max(1, baseAtk - Math.floor(baseDef * 0.5));
  damage = Math.floor(damage * multiplier);

  const critChance = attacker.critChance || 0.1;
  const isCrit = guaranteedCrit || Math.random() < critChance;
  if (isCrit) {
    damage = Math.floor(damage * 1.8);
  }

  const variance = 0.9 + Math.random() * 0.2;
  damage = Math.max(1, Math.floor(damage * variance));

  // Active bonus multiplier (damage_mult or enemy_tag_damage)
  if (attacker.activeBonus) {
    const bonusMult = getBonusMultiplier(attacker.activeBonus, {
      classId: attacker.classId,
      event: 'damage',
      enemyTag: defender.isUndead ? 'undead' : null
    });
    if (bonusMult > 0) damage = Math.floor(damage * (1 + bonusMult));
  }

  return { damage, isCrit };
}

function getEffectiveStat(entity, stat) {
  let value = entity[stat] || 0;
  if (!entity.effects) return value;

  for (const effect of entity.effects) {
    if (effect.type === 'attackBonus' && stat === 'attack') value = Math.floor(value * (1 + effect.value));
    if (effect.type === 'attackDebuff' && stat === 'attack') value = Math.floor(value * (1 - effect.value));
    if (effect.type === 'defenseBonus' && stat === 'defense') value = Math.floor(value * (1 + effect.value));
    if (effect.type === 'defenseDebuff' && stat === 'defense') value = Math.floor(value * (1 - effect.value));
  }

  return Math.max(0, value);
}

function applyDamage(target, damage) {
  if (hasEffect(target, 'invulnerable')) return { finalDamage: 0, blocked: true };
  if (hasEffect(target, 'absorbHit')) {
    removeEffect(target, 'absorbHit');
    return { finalDamage: 0, blocked: true };
  }

  let finalDamage = damage;
  if (target.isDefending) {
    finalDamage = Math.floor(finalDamage * 0.5);
  }

  target.hp = Math.max(0, target.hp - finalDamage);
  if (target.hp === 0) target.isAlive = false;

  return { finalDamage, blocked: false };
}

function processPlayerAction(gameState, playerId, action) {
  const logs = [];
  const player = gameState.players[playerId];
  const room = gameState.floor.rooms[gameState.floor.currentRoomIndex];
  const aliveEnemies = room.enemies.filter(e => e.isAlive);

  if (!player || !player.isAlive) return { logs, stateChanged: false };
  if (player.hasActed) return { logs: ['Вы уже совершили действие в этот ход.'], stateChanged: false };

  player.isDefending = false;

  switch (action.type) {
    case 'attack': {
      const target = aliveEnemies.find(e => e.id === action.targetId);
      if (!target) return { logs: ['Цель не найдена.'], stateChanged: false };

      const hasWeapon = player.inventory && player.inventory.some(i => i.type === 'weapon');
      if (!hasWeapon) return { logs: ['У вас нет оружия — вы не можете атаковать!'], stateChanged: false };

      const { damage, isCrit } = calculateDamage(player, target);
      const { finalDamage } = applyDamage(target, damage);

      const critText = isCrit ? ' [КРИТ!]' : '';
      logs.push(`${player.name} атакует ${target.name} на ${finalDamage} урона${critText}.`);

      if (!target.isAlive) {
        logs.push(`${target.name} повержен!`);
        incrementUltKills(player, target.isBoss ? 5 : 1);
      }
      break;
    }

    case 'ability': {
      const ability = player.abilities.find(a => a.id === action.abilityId);
      if (!ability) return { logs: ['Способность не найдена.'], stateChanged: false };
      if (ability.currentCooldown > 0) return { logs: [`${ability.name}: перезарядка ${ability.currentCooldown} ход(ов).`], stateChanged: false };
      if (ability.mpCost > 0 && player.mp < ability.mpCost) {
        return { logs: [`${ability.name}: недостаточно маны! Нужно ${ability.mpCost} MP, есть ${player.mp} MP.`], stateChanged: false };
      }

      // Melee single-target: validate adjacency
      if (ability.rangeType === 'melee' && ability.target === 'single') {
        const target = aliveEnemies.find(e => e.id === action.targetId);
        if (!target) return { logs: ['Цель не найдена.'], stateChanged: false };
        if (player.gridX !== undefined && target.gridX !== undefined) {
          if (gridDist(player.gridX, player.gridZ, target.gridX, target.gridZ) > (ability.maxRange || 1.5)) {
            return { logs: [`${ability.name}: враг слишком далеко! Подойдите вплотную.`], stateChanged: false };
          }
        }
      }

      // Ranged single-target: validate distance
      if (ability.rangeType === 'ranged' && ability.target === 'single') {
        const target = aliveEnemies.find(e => e.id === action.targetId);
        if (!target) return { logs: ['Цель не найдена.'], stateChanged: false };
        if (player.gridX !== undefined && target.gridX !== undefined && ability.maxRange) {
          if (gridDist(player.gridX, player.gridZ, target.gridX, target.gridZ) > ability.maxRange) {
            return { logs: [`${ability.name}: цель вне дальности (макс. ${ability.maxRange} кл.).`], stateChanged: false };
          }
        }
      }

      // Ranged AoE with targetCell: validate distance to chosen point
      if (ability.rangeType === 'ranged' && action.targetCell) {
        if (player.gridX !== undefined && ability.maxRange) {
          if (gridDist(player.gridX, player.gridZ, action.targetCell.x, action.targetCell.z) > ability.maxRange) {
            return { logs: [`${ability.name}: позиция вне дальности!`], stateChanged: false };
          }
        }
      }

      const abilityLogs = useAbility(gameState, player, ability, action.targetId, action.targetCell);
      logs.push(...abilityLogs);
      ability.currentCooldown = ability.cooldown;
      if (ability.mpCost > 0) player.mp -= ability.mpCost;
      break;
    }

    case 'defend': {
      player.isDefending = true;
      logs.push(`${player.name} занимает оборонительную позицию. Урон снижен на 50%.`);
      break;
    }

    case 'item': {
      const itemLogs = useItem(gameState, player, action.itemId, action.targetId);
      logs.push(...itemLogs);
      if (itemLogs.length === 0) return { logs: ['Предмет не найден или не может быть использован.'], stateChanged: false };
      break;
    }

    case 'end_turn': {
      logs.push(`${player.name} завершает ход.`);
      break;
    }

    case 'ultimate': {
      if (!player.ultReady) return { logs: ['Ультимативная атака ещё не готова!'], stateChanged: false };
      const ultLogs = useUltimate(gameState, player);
      logs.push(...ultLogs);
      player.ultKills = 0;
      player.ultReady = false;
      break;
    }

    default:
      return { logs: ['Неизвестное действие.'], stateChanged: false };
  }

  player.hasActed = true;
  return { logs, stateChanged: true };
}

function incrementUltKills(player, amount = 1) {
  player.ultKills = (player.ultKills || 0) + amount;
  if (!player.ultReady && player.ultKills >= (player.ultKillsNeeded || 5)) {
    player.ultReady = true;
  }
}

function useAbility(gameState, player, ability, targetId, targetCell) {
  const logs = [];
  const room = gameState.floor.rooms[gameState.floor.currentRoomIndex];
  const aliveEnemies = room.enemies.filter(e => e.isAlive);
  const alivePlayers = Object.values(gameState.players).filter(p => p.isAlive);

  switch (ability.type) {
    case 'attack': {
      let targets = [];
      if (ability.target === 'single') {
        const t = aliveEnemies.find(e => e.id === targetId);
        if (t) targets = [t];
      } else if (ability.target === 'all_enemies') {
        if (ability.rangeType === 'melee' && ability.aoeRadius && player.gridX !== undefined) {
          // Melee AoE: only hit enemies within aoeRadius of player
          targets = aliveEnemies.filter(e =>
            e.gridX !== undefined &&
            gridDist(player.gridX, player.gridZ, e.gridX, e.gridZ) <= ability.aoeRadius
          );
          if (targets.length === 0) targets = aliveEnemies;
        } else if (ability.rangeType === 'ranged' && targetCell) {
          // Ranged AoE: hit enemies within aoeRadius of chosen cell
          const aoeR = ability.aoeRadius || 2;
          targets = aliveEnemies.filter(e =>
            e.gridX !== undefined &&
            gridDist(targetCell.x, targetCell.z, e.gridX, e.gridZ) <= aoeR
          );
          if (targets.length === 0) {
            logs.push(`${ability.name}: ни один враг не попал в зону поражения.`);
            return logs;
          }
        } else {
          targets = aliveEnemies;
        }
      } else if (ability.target === 'random_3') {
        let pool = aliveEnemies;
        if (ability.rangeType === 'ranged' && targetCell && ability.aoeRadius) {
          pool = aliveEnemies.filter(e =>
            e.gridX !== undefined &&
            gridDist(targetCell.x, targetCell.z, e.gridX, e.gridZ) <= ability.aoeRadius
          );
          if (pool.length === 0) pool = aliveEnemies;
        }
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        targets = shuffled.slice(0, 3);
      }

      for (const target of targets) {
        let mult = ability.damageMultiplier || 1.0;
        if (ability.bonusVsUndead && target.isUndead) mult = ability.bonusVsUndead;
        if (ability.condition === 'target_hp_low' && target.hp / target.maxHp >= 0.25) mult = 1.0;

        const { damage, isCrit } = calculateDamage(player, target, mult, ability.guaranteedCrit);
        const { finalDamage } = applyDamage(target, damage);

        const critText = isCrit ? ' [КРИТ!]' : '';
        logs.push(`${player.name} использует ${ability.name} → ${target.name}: ${finalDamage} урона${critText}.`);

        if (ability.effect?.poison) {
          addEffect(target, { type: 'poison', value: ability.effect.poison.damagePercent, duration: ability.effect.poison.duration });
          logs.push(`${target.name} отравлен!`);
        }
        if (ability.effect?.stun) {
          addEffect(target, { type: 'stun', value: 1, duration: ability.effect.stun });
          logs.push(`${target.name} оглушён!`);
        }
        if (ability.effect?.slow) {
          addEffect(target, { type: 'slow', value: 1, duration: ability.effect.slow });
          logs.push(`${target.name} замедлен!`);
        }

        if (!target.isAlive) {
          logs.push(`${target.name} повержен!`);
          incrementUltKills(player, target.isBoss ? 5 : 1);
        }
      }
      break;
    }

    case 'heal': {
      let targets = [];
      if (ability.target === 'single_ally') {
        const t = alivePlayers.find(p => p.id === targetId);
        if (t) targets = [t];
        else targets = [player];
      } else if (ability.target === 'all_allies') {
        targets = alivePlayers;
      } else if (ability.target === 'dead_ally') {
        const dead = Object.values(gameState.players).find(p => !p.isAlive && p.id === targetId);
        if (dead) {
          dead.isAlive = true;
          dead.hp = Math.floor(dead.maxHp * (ability.reviveHpPercent || 0.3));
          logs.push(`${player.name} воскрешает ${dead.name}! HP: ${dead.hp}`);
          return logs;
        }
        logs.push('Цель для воскрешения не найдена.');
        return logs;
      }

      const healBonus = player.activeBonus
        ? getBonusMultiplier(player.activeBonus, { classId: player.classId, event: 'heal' })
        : 0;

      for (const t of targets) {
        let healAmt = Math.floor(t.maxHp * (ability.healPercent || 0.3));
        if (healBonus > 0) healAmt = Math.floor(healAmt * (1 + healBonus));
        t.hp = Math.min(t.maxHp, t.hp + healAmt);
        logs.push(`${player.name} исцеляет ${t.name} на ${healAmt} HP. (${t.hp}/${t.maxHp})`);
      }
      break;
    }

    case 'buff': {
      const targets = ability.target === 'all_allies' ? alivePlayers : [player];
      if (ability.effect?.attackBonus) {
        for (const t of targets) {
          addEffect(t, { type: 'attackBonus', value: ability.effect.attackBonus, duration: ability.effect.duration });
        }
        logs.push(`${player.name} использует ${ability.name}! Атака группы повышена.`);
      }
      if (ability.effect?.shadowStep) {
        addEffect(player, { type: 'shadowStep', value: 1, duration: 1 });
        logs.push(`${player.name} растворяется в тени...`);
      }
      if (ability.effect?.taunt) {
        addEffect(player, { type: 'taunt', value: 1, duration: ability.effect.duration });
        addEffect(player, { type: 'defenseBonus', value: ability.effect.defenseBonus, duration: ability.effect.duration });
        for (const e of aliveEnemies) {
          addEffect(e, { type: 'taunted', targetId: player.id, duration: 1 });
        }
        logs.push(`${player.name} провоцирует врагов! Все атакуют его.`);
      }
      break;
    }

    case 'debuff': {
      let debuffTargets = [];
      if (ability.target === 'all_enemies') {
        if (ability.rangeType === 'ranged' && targetCell && ability.aoeRadius) {
          debuffTargets = aliveEnemies.filter(e =>
            e.gridX !== undefined &&
            gridDist(targetCell.x, targetCell.z, e.gridX, e.gridZ) <= ability.aoeRadius
          );
          if (debuffTargets.length === 0) {
            logs.push(`${ability.name}: ни один враг не попал в зону поражения.`);
            return logs;
          }
        } else if (ability.rangeType === 'melee' && ability.aoeRadius && player.gridX !== undefined) {
          debuffTargets = aliveEnemies.filter(e =>
            e.gridX !== undefined &&
            gridDist(player.gridX, player.gridZ, e.gridX, e.gridZ) <= ability.aoeRadius
          );
          if (debuffTargets.length === 0) debuffTargets = aliveEnemies;
        } else {
          debuffTargets = aliveEnemies;
        }
      } else {
        const target = aliveEnemies.find(e => e.id === targetId);
        if (target) debuffTargets = [target];
      }

      for (const t of debuffTargets) {
        if (ability.effect?.attackDebuff) addEffect(t, { type: 'attackDebuff', value: ability.effect.attackDebuff, duration: ability.effect.duration });
        if (ability.effect?.defenseDebuff) addEffect(t, { type: 'defenseDebuff', value: ability.effect.defenseDebuff, duration: ability.effect.duration });
        if (ability.effect?.missChance) addEffect(t, { type: 'missChance', value: ability.effect.missChance, duration: ability.effect.duration });
        logs.push(`${player.name} использует ${ability.name} на ${t.name}!`);
      }
      break;
    }

    case 'shield': {
      const shieldTargets = ability.target === 'all_allies' ? alivePlayers :
        (ability.target === 'single_ally' ? [alivePlayers.find(p => p.id === targetId) || player] : [player]);

      for (const t of shieldTargets) {
        if (ability.effect?.invulnerable) addEffect(t, { type: 'invulnerable', value: 1, duration: 1 });
        if (ability.effect?.absorbHits) addEffect(t, { type: 'absorbHit', value: 1, duration: ability.effect.duration });
      }
      logs.push(`${player.name} использует ${ability.name}!`);
      break;
    }
  }

  return logs;
}

function useUltimate(gameState, player) {
  const logs = [];
  const room = gameState.floor.rooms[gameState.floor.currentRoomIndex];
  const aliveEnemies = room.enemies.filter(e => e.isAlive);
  const allPlayers = Object.values(gameState.players);
  const alivePlayers = allPlayers.filter(p => p.isAlive);

  logs.push(`★ ${player.name} активирует УЛЬТИМУ: ${player.ultName || 'Ультимативная атака'}! ★`);

  switch (player.classId) {
    case 'warrior': {
      // Rёv berserka: 300% guaranteed crit on ALL enemies + stun 1 turn
      for (const enemy of aliveEnemies) {
        const { damage } = calculateDamage(player, enemy, 3.0, true);
        const { finalDamage } = applyDamage(enemy, damage);
        logs.push(`  ⚔ ${enemy.name} получает ${finalDamage} урона [КРИТ!]`);
        addEffect(enemy, { type: 'stun', value: 1, duration: 1 });
        if (!enemy.isAlive) {
          logs.push(`  ${enemy.name} сокрушён!`);
          incrementUltKills(player, 0);
        } else {
          logs.push(`  ${enemy.name} оглушён!`);
        }
      }
      break;
    }

    case 'mage': {
      // Armageddon: 400% damage to ALL enemies, ignoring 50% defense
      for (const enemy of aliveEnemies) {
        const savedDef = enemy.defense;
        enemy.defense = Math.floor(enemy.defense * 0.5);
        const { damage } = calculateDamage(player, enemy, 4.0, false);
        const { finalDamage } = applyDamage(enemy, damage);
        enemy.defense = savedDef;
        logs.push(`  ✦ ${enemy.name} получает ${finalDamage} урона [АРМАГЕДДОН!]`);
        if (!enemy.isAlive) logs.push(`  ${enemy.name} испепелён!`);
      }
      break;
    }

    case 'rogue': {
      // Death Dance: 5 guaranteed-crit strikes of 200% on random enemies
      if (aliveEnemies.length === 0) { logs.push('Нет живых врагов!'); break; }
      for (let i = 0; i < 5; i++) {
        const living = room.enemies.filter(e => e.isAlive);
        if (living.length === 0) break;
        const target = living[Math.floor(Math.random() * living.length)];
        const { damage } = calculateDamage(player, target, 2.0, true);
        const { finalDamage } = applyDamage(target, damage);
        logs.push(`  † Удар ${i + 1}: ${target.name} — ${finalDamage} урона [КРИТ!]`);
        if (!target.isAlive) logs.push(`  ${target.name} повержен!`);
      }
      break;
    }

    case 'cleric': {
      // Heavenly Judgment: full heal all + resurrect dead at 50% + 250%/400% holy to all enemies
      for (const p of alivePlayers) {
        p.hp = p.maxHp;
        logs.push(`  ✚ ${p.name} полностью исцелён! (${p.hp}/${p.maxHp})`);
      }
      const deadPlayers = allPlayers.filter(p => !p.isAlive);
      for (const p of deadPlayers) {
        p.isAlive = true;
        p.hp = Math.floor(p.maxHp * 0.5);
        logs.push(`  ✚ ${p.name} воскрешён с ${p.hp} HP!`);
      }
      for (const enemy of aliveEnemies) {
        const mult = enemy.isUndead ? 4.0 : 2.5;
        const { damage } = calculateDamage(player, enemy, mult, false);
        const { finalDamage } = applyDamage(enemy, damage);
        logs.push(`  ✚ ${enemy.name} получает ${finalDamage} священного урона${enemy.isUndead ? ' [НЕЖИТЬ!]' : ''}!`);
        if (!enemy.isAlive) logs.push(`  ${enemy.name} уничтожен!`);
      }
      break;
    }

    default:
      logs.push('Неизвестный класс!');
  }

  return logs;
}

function useItem(gameState, player, itemId, targetId) {
  const logs = [];
  const alivePlayers = Object.values(gameState.players).filter(p => p.isAlive);

  if (itemId === 'potion' || itemId === 'health_potion') {
    if (player.potions <= 0) return ['Зелья закончились!'];
    player.potions--;
    const target = alivePlayers.find(p => p.id === targetId) || player;
    const potBonus = player.activeBonus
      ? getBonusMultiplier(player.activeBonus, { classId: player.classId, event: 'potion' })
      : 0;
    let healAmt = Math.floor(target.maxHp * 0.35);
    if (potBonus > 0) healAmt = Math.floor(healAmt * (1 + potBonus));
    target.hp = Math.min(target.maxHp, target.hp + healAmt);
    logs.push(`${player.name} использует зелье лечения на ${target.name}. HP восстановлено на ${healAmt}. (${target.hp}/${target.maxHp})`);
    return logs;
  }

  const itemIdx = player.inventory.findIndex(i => i.id === itemId);
  if (itemIdx === -1) return [];

  const item = player.inventory[itemIdx];

  if (item.type === 'consumable') {
    if (item.manaAmount) {
      const target = alivePlayers.find(p => p.id === targetId) || player;
      const before = target.mp;
      target.mp = Math.min(target.maxMp, target.mp + item.manaAmount);
      logs.push(`${player.name} использует ${item.name} на ${target.name}. MP: +${target.mp - before} (${target.mp}/${target.maxMp})`);
    } else if (item.effect === 'full_mana') {
      player.mp = player.maxMp;
      logs.push(`${player.name} использует ${item.name}. Мана полностью восстановлена! MP: ${player.mp}/${player.maxMp}`);
    } else if (item.healAmount) {
      const target = alivePlayers.find(p => p.id === targetId) || player;
      target.hp = Math.min(target.maxHp, target.hp + item.healAmount);
      logs.push(`${player.name} использует ${item.name} на ${target.name}. HP: ${target.hp}/${target.maxHp}`);
    } else if (item.effect === 'full_heal') {
      player.hp = player.maxHp;
      logs.push(`${player.name} использует ${item.name}. Полное восстановление! HP: ${player.hp}`);
    } else if (item.attackBuff || item.defenseBuff) {
      const parts = [];
      if (item.attackBuff) {
        addEffect(player, { type: 'attackBonus', value: item.attackBuff.value, duration: item.attackBuff.duration });
        parts.push(`Атака +${Math.round(item.attackBuff.value * 100)}% на ${item.attackBuff.duration} хода(ов)`);
      }
      if (item.defenseBuff) {
        addEffect(player, { type: 'defenseBonus', value: item.defenseBuff.value, duration: item.defenseBuff.duration });
        parts.push(`Защита +${Math.round(item.defenseBuff.value * 100)}% на ${item.defenseBuff.duration} хода(ов)`);
      }
      logs.push(`${player.name} использует ${item.name}. ${parts.join(', ')}!`);
    } else if (item.damage) {
      const room = gameState.floor.rooms[gameState.floor.currentRoomIndex];
      const aliveEnemies = room.enemies.filter(e => e.isAlive);
      if (item.damage.target === 'all_enemies') {
        logs.push(`${player.name} использует ${item.name}!`);
        for (const enemy of aliveEnemies) {
          enemy.hp = Math.max(0, enemy.hp - item.damage.amount);
          if (enemy.hp === 0) enemy.isAlive = false;
          logs.push(`  → ${enemy.name}: ${item.damage.amount} урона${!enemy.isAlive ? ' [ПОВЕРЖЕН]' : ''}.`);
        }
      } else {
        const enemy = aliveEnemies.find(e => e.id === targetId) || aliveEnemies[0];
        if (!enemy) return ['Нет живых врагов.'];
        enemy.hp = Math.max(0, enemy.hp - item.damage.amount);
        if (enemy.hp === 0) enemy.isAlive = false;
        let msg = `${player.name} использует ${item.name} на ${enemy.name}: ${item.damage.amount} урона.`;
        if (item.damage.canStun) {
          addEffect(enemy, { type: 'stun', value: 1, duration: 1 });
          msg += ` ${enemy.name} оглушён!`;
        }
        logs.push(msg);
        if (!enemy.isAlive) logs.push(`${enemy.name} повержен!`);
      }
    } else if (item.poisonEffect) {
      const room = gameState.floor.rooms[gameState.floor.currentRoomIndex];
      const aliveEnemies = room.enemies.filter(e => e.isAlive);
      const enemy = aliveEnemies.find(e => e.id === targetId) || aliveEnemies[0];
      if (!enemy) return ['Нет живых врагов.'];
      addEffect(enemy, { type: 'poison', value: item.poisonEffect.value, duration: item.poisonEffect.duration });
      logs.push(`${player.name} использует ${item.name}. ${enemy.name} отравлен на ${item.poisonEffect.duration} хода(ов)!`);
    } else if (item.reviveEffect) {
      const deadPlayer = Object.values(gameState.players).find(p => !p.isAlive && p.id === targetId) ||
                          Object.values(gameState.players).find(p => !p.isAlive);
      if (!deadPlayer) return ['Нет павших союзников для воскрешения.'];
      deadPlayer.isAlive = true;
      deadPlayer.hp = Math.floor(deadPlayer.maxHp * 0.3);
      logs.push(`${player.name} использует ${item.name}. ${deadPlayer.name} воскрешён с ${deadPlayer.hp} HP!`);
    }
    player.inventory.splice(itemIdx, 1);
  }

  return logs;
}

function processEnemyTurns(gameState) {
  const logs = [];
  const room = gameState.floor.rooms[gameState.floor.currentRoomIndex];
  const aliveEnemies = room.enemies.filter(e => e.isAlive);
  const alivePlayers = Object.values(gameState.players).filter(p => p.isAlive);

  if (alivePlayers.length === 0) return logs;

  for (const enemy of aliveEnemies) {
    if (hasEffect(enemy, 'stun')) {
      logs.push(`${enemy.name} оглушён и пропускает ход.`);
      continue;
    }

    tickEffects(enemy);

    if (hasEffect(enemy, 'poison')) {
      const poisonEffect = enemy.effects.find(e => e.type === 'poison');
      const poisonDmg = Math.floor(enemy.maxHp * poisonEffect.value);
      enemy.hp = Math.max(0, enemy.hp - poisonDmg);
      if (enemy.hp === 0) { enemy.isAlive = false; logs.push(`${enemy.name} умирает от яда!`); continue; }
      logs.push(`${enemy.name} получает ${poisonDmg} урона от яда.`);
    }

    const ability = chooseEnemyAbility(enemy);
    let target = chooseEnemyTarget(enemy, alivePlayers);
    if (!target) continue;

    if (hasEffect(enemy, 'missChance')) {
      const missEff = enemy.effects.find(e => e.type === 'missChance');
      if (Math.random() < missEff.value) {
        logs.push(`${enemy.name} промахивается!`);
        continue;
      }
    }

    switch (ability) {
      case 'attack': {
        const { damage, isCrit } = calculateDamage(enemy, target);
        const { finalDamage, blocked } = applyDamage(target, damage);

        if (blocked) {
          logs.push(`${enemy.name} атакует ${target.name} — заблокировано!`);
        } else {
          const critText = isCrit ? ' [КРИТ!]' : '';
          logs.push(`${enemy.name} атакует ${target.name} на ${finalDamage} урона${critText}.`);
          if (!target.isAlive) logs.push(`${target.name} пал в бою...`);
        }
        break;
      }

      case 'heavy_blow': {
        const { damage } = calculateDamage(enemy, target, 2.0);
        const { finalDamage } = applyDamage(target, damage);
        logs.push(`${enemy.name} наносит Тяжёлый удар по ${target.name}: ${finalDamage} урона!`);
        if (!target.isAlive) logs.push(`${target.name} пал в бою...`);
        break;
      }

      case 'fireball': {
        logs.push(`${enemy.name} бросает Огненный шар!`);
        for (const p of alivePlayers) {
          const { damage } = calculateDamage(enemy, p, 0.8);
          const { finalDamage } = applyDamage(p, damage);
          logs.push(`  → ${p.name}: ${finalDamage} урона.`);
          if (!p.isAlive) logs.push(`${p.name} пал в бою...`);
        }
        break;
      }

      case 'poison_bite': {
        const { damage } = calculateDamage(enemy, target);
        applyDamage(target, damage);
        addEffect(target, { type: 'poison', value: 0.08, duration: 3 });
        logs.push(`${enemy.name} кусает ${target.name} ядовитыми зубами! Отравление.`);
        break;
      }

      case 'blood_drain': {
        const { damage } = calculateDamage(enemy, target, 1.5);
        const { finalDamage } = applyDamage(target, damage);
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.floor(finalDamage * 0.5));
        logs.push(`${enemy.name} высасывает жизнь из ${target.name}: ${finalDamage} урона. Восстанавливает HP.`);
        break;
      }

      case 'dragon_breath': {
        logs.push(`${enemy.name} извергает пламя!`);
        for (const p of alivePlayers) {
          const { damage } = calculateDamage(enemy, p, 1.5);
          const { finalDamage } = applyDamage(p, damage);
          logs.push(`  → ${p.name}: ${finalDamage} урона!`);
          if (!p.isAlive) logs.push(`${p.name} пал в бою...`);
        }
        break;
      }

      case 'tail_sweep': {
        logs.push(`${enemy.name} хлещет хвостом!`);
        for (const p of alivePlayers) {
          const { damage } = calculateDamage(enemy, p, 1.2);
          const { finalDamage } = applyDamage(p, damage);
          addEffect(p, { type: 'stun', value: 1, duration: 1 });
          logs.push(`  → ${p.name}: ${finalDamage} урона, оглушён!`);
        }
        break;
      }

      case 'regenerate': {
        const regenAmt = Math.floor(enemy.maxHp * 0.1);
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + regenAmt);
        logs.push(`${enemy.name} регенерирует ${regenAmt} HP.`);
        const { damage } = calculateDamage(enemy, target);
        const { finalDamage } = applyDamage(target, damage);
        logs.push(`${enemy.name} атакует ${target.name} на ${finalDamage} урона.`);
        break;
      }

      default: {
        const { damage } = calculateDamage(enemy, target);
        const { finalDamage } = applyDamage(target, damage);
        logs.push(`${enemy.name} атакует ${target.name} на ${finalDamage} урона.`);
        if (!target.isAlive) logs.push(`${target.name} пал в бою...`);
      }
    }
  }

  return logs;
}

function chooseEnemyAbility(enemy) {
  if (!enemy.abilities || enemy.abilities.length <= 1) return 'attack';
  if (Math.random() < 0.6) return 'attack';
  const specials = enemy.abilities.filter(a => a !== 'attack');
  return specials[Math.floor(Math.random() * specials.length)];
}

function chooseEnemyTarget(enemy, players) {
  if (players.length === 0) return null;

  const taunted = players.find(p => enemy.effects?.some(e => e.type === 'taunted' && e.targetId === p.id));
  if (taunted) return taunted;

  return players[Math.floor(Math.random() * players.length)];
}

function tickEffects(entity) {
  if (!entity.effects) return;
  entity.effects = entity.effects
    .map(e => ({ ...e, duration: e.duration - 1 }))
    .filter(e => e.duration > 0);
}

function tickAllEffects(gameState) {
  const room = gameState.floor.rooms[gameState.floor.currentRoomIndex];
  const allEntities = [
    ...Object.values(gameState.players),
    ...(room.enemies || [])
  ];
  for (const entity of allEntities) {
    tickEffects(entity);
  }
}

function addEffect(entity, effect) {
  if (!entity.effects) entity.effects = [];
  const existing = entity.effects.find(e => e.type === effect.type);
  if (existing) {
    existing.duration = Math.max(existing.duration, effect.duration);
    existing.value = effect.value;
  } else {
    entity.effects.push({ ...effect });
  }
}

function removeEffect(entity, effectType) {
  if (!entity.effects) return;
  entity.effects = entity.effects.filter(e => e.type !== effectType);
}

function hasEffect(entity, effectType) {
  return entity.effects?.some(e => e.type === effectType) || false;
}

function awardExpAndLoot(gameState, defeatedEnemies) {
  const logs = [];
  const alivePlayers = Object.values(gameState.players).filter(p => p.isAlive);
  if (alivePlayers.length === 0) return logs;

  let totalExp = 0;
  let totalGold = 0;
  const lootItems = [];

  for (const enemy of defeatedEnemies) {
    totalExp += enemy.expReward;
    const [minGold, maxGold] = enemy.goldReward;
    totalGold += minGold + Math.floor(Math.random() * (maxGold - minGold));

    // Average loot bonus across alive players
    const avgLootBonus = alivePlayers.length > 0
      ? alivePlayers.reduce((sum, p) => {
          return sum + (p.activeBonus ? getBonusMultiplier(p.activeBonus, { classId: p.classId, event: 'loot' }) : 0);
        }, 0) / alivePlayers.length
      : 0;

    for (const lootEntry of enemy.lootTable) {
      const chance = Math.min(1, lootEntry.chance * (1 + avgLootBonus));
      if (Math.random() < chance) {
        lootItems.push({ ...lootEntry, id: `${lootEntry.id}_${Date.now()}` });
      }
    }
  }

  const expPerPlayer = Math.floor(totalExp / alivePlayers.length);
  let goldPerPlayer = Math.floor(totalGold / alivePlayers.length);

  for (const player of alivePlayers) {
    player.exp += expPerPlayer;
    // Gold bonus
    const goldBonus = player.activeBonus
      ? getBonusMultiplier(player.activeBonus, { classId: player.classId, event: 'gold' })
      : 0;
    const actualGold = goldBonus > 0 ? Math.floor(goldPerPlayer * (1 + goldBonus)) : goldPerPlayer;
    player.gold += actualGold;

    if (player.exp >= player.expToNext) {
      player.exp -= player.expToNext;
      levelUp(player);
      logs.push(`🎉 ${player.name} достигает уровня ${player.level}! Характеристики улучшены.`);
    }
  }

  if (expPerPlayer > 0) logs.push(`Получено: ${expPerPlayer} опыта, ${goldPerPlayer} золота каждому.`);

  return { logs, lootItems, goldPerPlayer };
}

function resetActed(gameState) {
  for (const player of Object.values(gameState.players)) {
    player.hasActed = false;
    player.hasMoved = false;
    if (player.isAlive && player.maxMp > 0) {
      player.mp = Math.min(player.maxMp, player.mp + 5);
    }
  }
  for (const ability of Object.values(gameState.players).flatMap(p => p.abilities)) {
    if (ability.currentCooldown > 0) ability.currentCooldown--;
  }
}

// ─── Grid Combat System ───────────────────────────────────────────────────────

const GRID_SIZE = 14;

const ROOM_THEMES = ['dungeon','crypt','forest','ice','lava','library','throne','sewer','temple','workshop'];
const ROOM_SHAPES = ['square', 'two_chambers', 'hourglass', 'fortified', 'three_lanes'];

function initializeCombatGrid(players, enemies) {
  const size = GRID_SIZE;
  const theme = ROOM_THEMES[Math.floor(Math.random() * ROOM_THEMES.length)];
  const shape = ROOM_SHAPES[Math.floor(Math.random() * ROOM_SHAPES.length)];
  const grid = Array.from({ length: size }, () => Array(size).fill('floor'));

  // Border walls
  for (let i = 0; i < size; i++) {
    grid[0][i] = 'wall'; grid[size - 1][i] = 'wall';
    grid[i][0] = 'wall'; grid[i][size - 1] = 'wall';
  }

  switch (shape) {
    case 'two_chambers': {
      // Vertical double wall at x=6..7 divides room into left/right chambers.
      // Gap at z=5..8 lets players and enemies cross between chambers.
      for (let z = 1; z < size - 1; z++) {
        if (z < 5 || z > 8) {
          grid[6][z] = 'wall';
          grid[7][z] = 'wall';
        }
      }
      // Scatter obstacles inside both chambers
      let placed = 0;
      for (let attempt = 0; attempt < 200 && placed < 4; attempt++) {
        const x = Math.random() < 0.5 ? 2 + Math.floor(Math.random() * 3) : 9 + Math.floor(Math.random() * 3);
        const z = 2 + Math.floor(Math.random() * (size - 4));
        if (grid[x][z] === 'floor') { grid[x][z] = 'obstacle'; placed++; }
      }
      break;
    }
    case 'hourglass': {
      // Top (z=1..4) and bottom (z=9..12) sections are narrow:
      // only the side corridors (x=1..2, x=11..12) and center channel (x=6..7) are open.
      // Middle (z=5..8) is fully open.
      for (let z = 1; z <= 4; z++) {
        for (let x = 3; x <= 10; x++) {
          if (x !== 6 && x !== 7) grid[x][z] = 'wall';
        }
      }
      for (let z = 9; z <= 12; z++) {
        for (let x = 3; x <= 10; x++) {
          if (x !== 6 && x !== 7) grid[x][z] = 'wall';
        }
      }
      // Obstacles only in the wide middle zone
      let placed = 0;
      for (let attempt = 0; attempt < 200 && placed < 4; attempt++) {
        const x = 3 + Math.floor(Math.random() * 8);
        const z = 5 + Math.floor(Math.random() * 4);
        if (grid[x][z] === 'floor') { grid[x][z] = 'obstacle'; placed++; }
      }
      break;
    }
    case 'fortified': {
      // Horizontal wall at z=6 stretching across the room.
      // Gate (gap) at x=5..8 lets units cross.
      // Player zone (x=1..2) and enemy zone (x=11..12) stay clear on both sides.
      for (let x = 3; x <= 10; x++) {
        if (x < 5 || x > 8) grid[x][6] = 'wall';
      }
      // Obstacles on each side of the wall
      let placed = 0;
      for (let attempt = 0; attempt < 200 && placed < 5; attempt++) {
        const x = 3 + Math.floor(Math.random() * 8);
        const z = Math.random() < 0.5
          ? 2 + Math.floor(Math.random() * 3)
          : 8 + Math.floor(Math.random() * 3);
        if (grid[x][z] === 'floor') { grid[x][z] = 'obstacle'; placed++; }
      }
      break;
    }
    case 'three_lanes': {
      // Two vertical wall strips at x=4 and x=9 create three fighting lanes.
      // Each strip has two gaps: one near the top (z=2..3) and one near the bottom (z=10..11),
      // so units can weave between lanes from both ends.
      for (let z = 1; z < size - 1; z++) {
        const inTopGap    = z >= 2  && z <= 3;
        const inBottomGap = z >= 10 && z <= 11;
        if (!inTopGap && !inBottomGap) {
          grid[4][z] = 'wall';
          grid[9][z] = 'wall';
        }
      }
      // Obstacles inside each lane
      let placed = 0;
      for (let attempt = 0; attempt < 200 && placed < 5; attempt++) {
        const lane = Math.floor(Math.random() * 3);
        const x = lane === 0 ? 2 + Math.floor(Math.random() * 2)
                : lane === 1 ? 5 + Math.floor(Math.random() * 4)
                :              10 + Math.floor(Math.random() * 2);
        const z = 4 + Math.floor(Math.random() * 6);
        if (grid[x][z] === 'floor') { grid[x][z] = 'obstacle'; placed++; }
      }
      break;
    }
    case 'square':
    default: {
      // Standard open arena with random scattered obstacles
      const numObstacles = 4 + Math.floor(Math.random() * 5);
      let placed = 0;
      for (let attempt = 0; attempt < 200 && placed < numObstacles; attempt++) {
        const x = 4 + Math.floor(Math.random() * 6);
        const z = 2 + Math.floor(Math.random() * (size - 4));
        if (grid[x][z] === 'floor') { grid[x][z] = 'obstacle'; placed++; }
      }
      break;
    }
  }

  // Place players on left side (x = 1-2)
  const playerArr = Object.values(players).filter(p => p && p.isAlive);
  const spawnZ = [3, 7, 5, 10, 2, 9];
  for (let i = 0; i < playerArr.length; i++) {
    const p = playerArr[i];
    p.gridX = 1 + (i % 2);
    p.gridZ = Math.min(spawnZ[i] ?? (2 + i * 2), size - 2);
    grid[p.gridX][p.gridZ] = 'floor';
  }

  // Place enemies on right side (x = size-2 to size-3)
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    e.gridX = size - 2 - (i % 2);
    e.gridZ = Math.min(spawnZ[i] ?? (2 + i * 2), size - 2);
    grid[e.gridX][e.gridZ] = 'floor';
  }

  return { size, grid, theme };
}

function getMoveRange(entity) {
  let range = 3;
  if (entity.speed) range += Math.floor(entity.speed / 4);
  if (hasEffect(entity, 'slow')) range = Math.max(1, range - 1);
  return range;
}

function getAttackRange(entity) {
  if (entity.classId === 'mage') return 5;
  if (entity.classId === 'cleric') return 2;
  return 1.5; // melee (includes diagonal)
}

function gridDist(x1, z1, x2, z2) {
  return Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
}

function isOccupied(x, z, players, enemies, excludeId) {
  for (const p of Object.values(players)) {
    if (p && p.isAlive && p.id !== excludeId && p.gridX === x && p.gridZ === z) return true;
  }
  for (const e of enemies) {
    if (e.isAlive && e.id !== excludeId && e.gridX === x && e.gridZ === z) return true;
  }
  return false;
}

function bfsReachable(fromX, fromZ, moveRange, combatGrid, players, enemies, moverId) {
  const reachable = new Set();
  const visited = new Map();
  const queue = [[fromX, fromZ, 0]];
  const DIRS = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];

  while (queue.length) {
    const [x, z, dist] = queue.shift();
    const key = `${x},${z}`;
    if (visited.has(key) && visited.get(key) <= dist) continue;
    visited.set(key, dist);
    if (dist > 0) reachable.add(key);
    if (dist >= moveRange) continue;

    for (const [dx, dz] of DIRS) {
      const nx = x + dx, nz = z + dz;
      if (nx < 0 || nz < 0 || nx >= combatGrid.size || nz >= combatGrid.size) continue;
      if (combatGrid.grid[nx][nz] !== 'floor') continue;
      if (isOccupied(nx, nz, players, enemies, moverId)) continue;
      const nkey = `${nx},${nz}`;
      const ndist = dist + 1;
      if (!visited.has(nkey) || visited.get(nkey) > ndist) queue.push([nx, nz, ndist]);
    }
  }
  return reachable;
}

function processMoveAction(gameState, playerId, targetX, targetZ) {
  const logs = [];
  const player = gameState.players[playerId];
  const room = gameState.floor.rooms[gameState.floor.currentRoomIndex];
  const aliveEnemies = room.enemies.filter(e => e.isAlive);

  if (!player || !player.isAlive) return { logs, stateChanged: false };
  if (player.hasMoved) return { logs: ['Вы уже переместились в этот ход.'], stateChanged: false };
  if (player.hasActed) return { logs: ['Ваш ход уже завершён.'], stateChanged: false };

  const combatGrid = room.combatGrid;
  if (!combatGrid) return { logs: ['Сетка боя не инициализирована.'], stateChanged: false };

  if (targetX < 0 || targetZ < 0 || targetX >= combatGrid.size || targetZ >= combatGrid.size) {
    return { logs: ['Недопустимая позиция.'], stateChanged: false };
  }
  if (combatGrid.grid[targetX][targetZ] !== 'floor') {
    return { logs: ['Нельзя переместиться сюда — препятствие!'], stateChanged: false };
  }
  if (isOccupied(targetX, targetZ, gameState.players, aliveEnemies, playerId)) {
    return { logs: ['Эта клетка занята!'], stateChanged: false };
  }

  const moveRange = getMoveRange(player);
  const reachable = bfsReachable(player.gridX, player.gridZ, moveRange, combatGrid, gameState.players, aliveEnemies, playerId);

  if (!reachable.has(`${targetX},${targetZ}`)) {
    return { logs: ['Слишком далеко для перемещения!'], stateChanged: false };
  }

  player.gridX = targetX;
  player.gridZ = targetZ;
  player.hasMoved = true;
  return { logs, stateChanged: true };
}

function processSingleEnemyTurn(gameState, enemy) {
  const logs = [];
  const room = gameState.floor.rooms[gameState.floor.currentRoomIndex];
  const alivePlayers = Object.values(gameState.players).filter(p => p.isAlive);

  if (hasEffect(enemy, 'stun')) {
    logs.push(`${enemy.name} оглушён и пропускает ход.`);
    tickEffects(enemy);
    return logs;
  }

  tickEffects(enemy);

  if (hasEffect(enemy, 'poison')) {
    const poisonEffect = enemy.effects.find(e => e.type === 'poison');
    const poisonDmg = Math.floor(enemy.maxHp * poisonEffect.value);
    enemy.hp = Math.max(0, enemy.hp - poisonDmg);
    if (enemy.hp === 0) { enemy.isAlive = false; logs.push(`${enemy.name} умирает от яда!`); return logs; }
    logs.push(`${enemy.name} получает ${poisonDmg} урона от яда.`);
  }

  if (alivePlayers.length === 0) return logs;

  // Move toward nearest player
  if (room.combatGrid) {
    let nearestPlayer = null;
    let nearestDist = Infinity;
    for (const p of alivePlayers) {
      if (p.gridX === undefined) continue;
      const d = gridDist(enemy.gridX, enemy.gridZ, p.gridX, p.gridZ);
      if (d < nearestDist) { nearestDist = d; nearestPlayer = p; }
    }

    const atkRange = 1.5; // enemies always melee
    if (nearestPlayer && nearestDist > atkRange && room.combatGrid) {
      const moveRange = 2;
      const reachable = bfsReachable(enemy.gridX, enemy.gridZ, moveRange, room.combatGrid, gameState.players, room.enemies.filter(e => e.isAlive), enemy.id);
      let bestDist = nearestDist;
      let bestPos = null;
      for (const key of reachable) {
        const [bx, bz] = key.split(',').map(Number);
        const d = gridDist(bx, bz, nearestPlayer.gridX, nearestPlayer.gridZ);
        if (d < bestDist) { bestDist = d; bestPos = { x: bx, z: bz }; }
      }
      if (bestPos) { enemy.gridX = bestPos.x; enemy.gridZ = bestPos.z; }
    }
  }

  // Choose target and attack
  let target = chooseEnemyTarget(enemy, alivePlayers);
  if (!target) return logs;

  if (hasEffect(enemy, 'missChance')) {
    const missEff = enemy.effects.find(e => e.type === 'missChance');
    if (Math.random() < missEff.value) { logs.push(`${enemy.name} промахивается!`); return logs; }
  }

  // Check if target is in attack range
  const atkRange = 1.5;
  if (target.gridX !== undefined && enemy.gridX !== undefined) {
    const dist = gridDist(enemy.gridX, enemy.gridZ, target.gridX, target.gridZ);
    if (dist > atkRange) {
      logs.push(`${enemy.name} не может достать до цели.`);
      return logs;
    }
  }

  const ability = chooseEnemyAbility(enemy);
  switch (ability) {
    case 'attack': {
      const { damage, isCrit } = calculateDamage(enemy, target);
      const { finalDamage, blocked } = applyDamage(target, damage);
      if (blocked) logs.push(`${enemy.name} атакует ${target.name} — заблокировано!`);
      else {
        logs.push(`${enemy.name} атакует ${target.name} на ${finalDamage} урона${isCrit ? ' [КРИТ!]' : ''}.`);
        if (!target.isAlive) logs.push(`${target.name} пал в бою...`);
      }
      break;
    }
    case 'heavy_blow': {
      const { damage } = calculateDamage(enemy, target, 2.0);
      const { finalDamage } = applyDamage(target, damage);
      logs.push(`${enemy.name} наносит Тяжёлый удар по ${target.name}: ${finalDamage} урона!`);
      if (!target.isAlive) logs.push(`${target.name} пал в бою...`);
      break;
    }
    case 'fireball': {
      logs.push(`${enemy.name} бросает Огненный шар!`);
      for (const p of alivePlayers) {
        const { damage } = calculateDamage(enemy, p, 0.8);
        const { finalDamage } = applyDamage(p, damage);
        logs.push(`  → ${p.name}: ${finalDamage} урона.`);
        if (!p.isAlive) logs.push(`${p.name} пал в бою...`);
      }
      break;
    }
    case 'poison_bite': {
      const { damage } = calculateDamage(enemy, target);
      applyDamage(target, damage);
      addEffect(target, { type: 'poison', value: 0.08, duration: 3 });
      logs.push(`${enemy.name} кусает ${target.name} ядовитыми зубами! Отравление.`);
      break;
    }
    case 'blood_drain': {
      const { damage } = calculateDamage(enemy, target, 1.5);
      const { finalDamage } = applyDamage(target, damage);
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.floor(finalDamage * 0.5));
      logs.push(`${enemy.name} высасывает жизнь из ${target.name}: ${finalDamage} урона.`);
      break;
    }
    case 'dragon_breath': {
      logs.push(`${enemy.name} извергает пламя!`);
      for (const p of alivePlayers) {
        const { damage } = calculateDamage(enemy, p, 1.5);
        const { finalDamage } = applyDamage(p, damage);
        logs.push(`  → ${p.name}: ${finalDamage} урона!`);
        if (!p.isAlive) logs.push(`${p.name} пал в бою...`);
      }
      break;
    }
    case 'tail_sweep': {
      logs.push(`${enemy.name} хлещет хвостом!`);
      for (const p of alivePlayers) {
        const { damage } = calculateDamage(enemy, p, 1.2);
        const { finalDamage } = applyDamage(p, damage);
        addEffect(p, { type: 'stun', value: 1, duration: 1 });
        logs.push(`  → ${p.name}: ${finalDamage} урона, оглушён!`);
      }
      break;
    }
    case 'regenerate': {
      const regenAmt = Math.floor(enemy.maxHp * 0.1);
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + regenAmt);
      logs.push(`${enemy.name} регенерирует ${regenAmt} HP.`);
      const { damage } = calculateDamage(enemy, target);
      const { finalDamage } = applyDamage(target, damage);
      logs.push(`${enemy.name} атакует ${target.name} на ${finalDamage} урона.`);
      break;
    }
    default: {
      const { damage } = calculateDamage(enemy, target);
      const { finalDamage } = applyDamage(target, damage);
      logs.push(`${enemy.name} атакует ${target.name} на ${finalDamage} урона.`);
      if (!target.isAlive) logs.push(`${target.name} пал в бою...`);
    }
  }

  return logs;
}

module.exports = {
  processPlayerAction,
  processEnemyTurns,
  awardExpAndLoot,
  resetActed,
  tickAllEffects,
  calculateDamage,
  applyDamage,
  initializeCombatGrid,
  processMoveAction,
  processSingleEnemyTurn,
  getMoveRange,
  getAttackRange,
  gridDist,
  bfsReachable
};
