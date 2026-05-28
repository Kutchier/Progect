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

function applyDamage(target, damage, attacker = null) {
  if (hasEffect(target, 'invulnerable')) return { finalDamage: 0, blocked: true };
  if (hasEffect(target, 'absorbHit')) {
    removeEffect(target, 'absorbHit');
    return { finalDamage: 0, blocked: true };
  }

  let finalDamage = damage;

  const defendReduction = (target.isDefending && target.passives?.defendReduction)
    ? target.passives.defendReduction
    : 0.5;
  if (target.isDefending) {
    finalDamage = Math.floor(finalDamage * (1 - defendReduction));
  }

  // Warrior passive: -15% incoming damage when HP < 30%
  if (target.classId === 'warrior' && target.hp <= target.maxHp * 0.30) {
    finalDamage = Math.floor(finalDamage * 0.85);
  }

  // Mana Shield passive: absorb lethal hit by spending 30 MP (once per hit)
  if (target.passives?.manaShield && target.hp > 0 && target.hp - finalDamage <= 0 && (target.mp || 0) >= 30) {
    target.mp -= 30;
    return { finalDamage: 0, blocked: true, manaShield: true };
  }

  target.hp = Math.max(0, target.hp - finalDamage);
  if (target.hp === 0) target.isAlive = false;

  // Thorns passive: reflect 15% damage back to attacker
  if (finalDamage > 0 && target.passives?.thorns && attacker && attacker.isAlive) {
    const reflect = Math.floor(finalDamage * target.passives.thorns);
    if (reflect > 0) {
      attacker.hp = Math.max(0, attacker.hp - reflect);
      if (attacker.hp === 0) attacker.isAlive = false;
    }
  }

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

      if (player.gridX !== undefined && target.gridX !== undefined) {
        const range = getAttackRange(player);
        const dist = gridDist(player.gridX, player.gridZ, target.gridX, target.gridZ);
        if (dist > range) {
          return { logs: [`${target.name} вне зоны атаки (${dist.toFixed(1)} / макс ${range}).`], stateChanged: false };
        }
        if (room.combatGrid && !hasLineOfSight(room.combatGrid.grid, player.gridX, player.gridZ, target.gridX, target.gridZ)) {
          return { logs: [`Стена блокирует атаку на ${target.name}!`], stateChanged: false };
        }
      }

      // Shadow Step passive: 2× damage, guaranteed crit, consume the effect
      let shadowMult = 1.0;
      let shadowCrit = false;
      if (hasEffect(player, 'shadowStep')) {
        shadowMult = 2.0;
        shadowCrit = true;
        removeEffect(player, 'shadowStep');
        logs.push(`${player.name} выходит из тени — смертоносный удар!`);
      }

      // Rogue passive: first attack of each combat is guaranteed crit
      if (player.classId === 'rogue' && !player.firstAttackUsed) {
        player.firstAttackUsed = true;
        shadowCrit = true;
        if (!hasEffect(player, 'shadowStep')) {
          logs.push(`${player.name} атакует первым из засады!`);
        }
      }

      // Warrior+Rogue synergy: while warrior has taunt, rogue's next attack is guaranteed crit
      if (player.classId === 'rogue' && gameState.synergies?.warriorRogueIronShadow && !shadowCrit) {
        const warrior = Object.values(gameState.players).find(p => p.classId === 'warrior' && p.isAlive);
        if (warrior && hasEffect(warrior, 'taunt')) {
          shadowCrit = true;
          logs.push(`⚔ Железная тень: ${player.name} наносит удар из-за спины воина! [КРИТ]`);
        }
      }

      const { damage, isCrit } = calculateDamage(player, target, shadowMult, shadowCrit);
      const { finalDamage, manaShield } = applyDamage(target, damage, player);

      if (manaShield) {
        logs.push(`${player.name} атакует ${target.name}, но Маговый щит поглощает удар!`);
      } else {
        const critText = isCrit ? ' [КРИТ!]' : '';
        logs.push(`${player.name} атакует ${target.name} на ${finalDamage} урона${critText}.`);

        // Lifesteal passive
        if (finalDamage > 0 && player.passives?.lifesteal) {
          const heal = Math.floor(finalDamage * player.passives.lifesteal);
          if (heal > 0) {
            player.hp = Math.min(player.maxHp, player.hp + heal);
            logs.push(`${player.name} похищает ${heal} HP.`);
          }
        }
      }

      // Rogue+Mage synergy: crits restore 8 MP to the mage
      if (isCrit && finalDamage > 0 && gameState.synergies?.rogueMageShadow && player.classId === 'rogue') {
        const mage = Object.values(gameState.players).find(p => p.classId === 'mage' && p.isAlive);
        if (mage) {
          mage.mp = Math.min(mage.maxMp, mage.mp + 8);
          logs.push(`✦ Теневая магия: ${mage.name} восстанавливает 8 MP!`);
        }
      }

      if (!target.isAlive) {
        logs.push(`${target.name} повержен!`);
        incrementUltKills(player, target.isBoss ? 5 : 1);
        player.kills = (player.kills || 0) + 1;
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

      // Ranged single-target: validate distance and LOS
      if (ability.rangeType === 'ranged' && ability.target === 'single') {
        const target = aliveEnemies.find(e => e.id === action.targetId);
        if (!target) return { logs: ['Цель не найдена.'], stateChanged: false };
        if (player.gridX !== undefined && target.gridX !== undefined && ability.maxRange) {
          if (gridDist(player.gridX, player.gridZ, target.gridX, target.gridZ) > ability.maxRange) {
            return { logs: [`${ability.name}: цель вне дальности (макс. ${ability.maxRange} кл.).`], stateChanged: false };
          }
          if (room.combatGrid && !hasLineOfSight(room.combatGrid.grid, player.gridX, player.gridZ, target.gridX, target.gridZ)) {
            return { logs: [`${ability.name}: цель скрыта за стеной!`], stateChanged: false };
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

        // spellDmgBonus passive (Mage overload)
        if (player.passives?.spellDmgBonus && ability.type === 'attack' && ability.rangeType === 'ranged') {
          mult = mult * (1 + player.passives.spellDmgBonus);
        }

        const { damage, isCrit } = calculateDamage(player, target, mult, ability.guaranteedCrit);
        const { finalDamage, manaShield } = applyDamage(target, damage, player);

        if (manaShield) {
          logs.push(`${player.name} использует ${ability.name} → ${target.name}: Маговый щит поглощает удар!`);
        } else {
          const critText = isCrit ? ' [КРИТ!]' : '';
          logs.push(`${player.name} использует ${ability.name} → ${target.name}: ${finalDamage} урона${critText}.`);

          // Lifesteal on ability attacks
          if (finalDamage > 0 && player.passives?.lifesteal) {
            const heal = Math.floor(finalDamage * player.passives.lifesteal);
            if (heal > 0) player.hp = Math.min(player.maxHp, player.hp + heal);
          }
        }

        if (ability.effect?.poison) {
          const poisonVal = player.passives?.poisonStrength ?? ability.effect.poison.damagePercent;
          addEffect(target, { type: 'poison', value: poisonVal, duration: ability.effect.poison.duration });
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
          player.kills = (player.kills || 0) + 1;
          // Mage passive: 30% chance to refund 15 MP on kill
          if (player.classId === 'mage' && Math.random() < 0.30) {
            player.mp = Math.min(player.maxMp, player.mp + 15);
            logs.push(`Магическая реакция! ${player.name} восстанавливает 15 MP.`);
          }
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

      const DEBUFF_TYPES = ['attackDebuff', 'defenseDebuff', 'slow', 'stun', 'missChance', 'poison'];
      for (const t of targets) {
        let healAmt = Math.floor(t.maxHp * (ability.healPercent || 0.3));
        if (healBonus > 0) healAmt = Math.floor(healAmt * (1 + healBonus));
        t.hp = Math.min(t.maxHp, t.hp + healAmt);
        logs.push(`${player.name} исцеляет ${t.name} на ${healAmt} HP. (${t.hp}/${t.maxHp})`);

        // Mage+Cleric synergy: healing removes one debuff from target
        if (gameState.synergies?.mageClericHolyArcana && player.classId === 'cleric' && t.effects?.length) {
          const debuff = t.effects.find(e => DEBUFF_TYPES.includes(e.type));
          if (debuff) {
            t.effects = t.effects.filter(e => e !== debuff);
            logs.push(`✚ Святая аркана: эффект [${debuff.type}] снят с ${t.name}!`);
          }
        }
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
      for (const enemy of aliveEnemies) {
        const { damage } = calculateDamage(player, enemy, 3.0, true);
        const { finalDamage } = applyDamage(enemy, damage);
        logs.push(`  ⚔ ${enemy.name} получает ${finalDamage} урона [КРИТ!]`);
        addEffect(enemy, { type: 'stun', value: 1, duration: 1 });
        if (!enemy.isAlive) {
          logs.push(`  ${enemy.name} сокрушён!`);
          player.kills = (player.kills || 0) + 1;
        } else {
          logs.push(`  ${enemy.name} оглушён!`);
        }
      }
      break;
    }

    case 'mage': {
      for (const enemy of aliveEnemies) {
        const savedDef = enemy.defense;
        enemy.defense = Math.floor(enemy.defense * 0.5);
        const { damage } = calculateDamage(player, enemy, 4.0, false);
        const { finalDamage } = applyDamage(enemy, damage);
        enemy.defense = savedDef;
        logs.push(`  ✦ ${enemy.name} получает ${finalDamage} урона [АРМАГЕДДОН!]`);
        if (!enemy.isAlive) {
          logs.push(`  ${enemy.name} испепелён!`);
          player.kills = (player.kills || 0) + 1;
        }
      }
      break;
    }

    case 'rogue': {
      if (aliveEnemies.length === 0) { logs.push('Нет живых врагов!'); break; }
      for (let i = 0; i < 5; i++) {
        const living = room.enemies.filter(e => e.isAlive);
        if (living.length === 0) break;
        const target = living[Math.floor(Math.random() * living.length)];
        const { damage } = calculateDamage(player, target, 2.0, true);
        const { finalDamage } = applyDamage(target, damage);
        logs.push(`  † Удар ${i + 1}: ${target.name} — ${finalDamage} урона [КРИТ!]`);
        if (!target.isAlive) {
          logs.push(`  ${target.name} повержен!`);
          player.kills = (player.kills || 0) + 1;
        }
      }
      break;
    }

    case 'cleric': {
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
        if (!enemy.isAlive) {
          logs.push(`  ${enemy.name} уничтожен!`);
          player.kills = (player.kills || 0) + 1;
        }
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
    if (item.curesPoison) {
      const target = alivePlayers.find(p => p.id === targetId) || player;
      const hadPoison = target.effects?.some(e => e.type === 'poison');
      target.effects = (target.effects || []).filter(e => e.type !== 'poison');
      logs.push(hadPoison
        ? `${player.name} использует ${item.name}. Яд снят с ${target.name}!`
        : `${player.name} использует ${item.name}. ${target.name} не был отравлен.`);
      player.inventory.splice(itemIdx, 1);
      return logs;
    }

    if (item.effect === 'random_spell') {
      const room = gameState.floor.rooms[gameState.floor.currentRoomIndex];
      const aliveEnemies = room.enemies.filter(e => e.isAlive);
      if (aliveEnemies.length === 0) {
        logs.push(`${player.name} читает свиток — нет живых врагов!`);
        player.inventory.splice(itemIdx, 1);
        return logs;
      }
      const spellRoll = Math.floor(Math.random() * 4);
      if (spellRoll === 0) {
        // Firebolt — single target high damage
        const t = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        const dmg = Math.max(1, Math.floor(player.attack * 2.0));
        const { finalDamage } = applyDamage(t, dmg);
        logs.push(`${player.name} читает свиток — Огненный разряд: ${t.name} получает ${finalDamage} урона!`);
        if (!t.isAlive) logs.push(`${t.name} повержен!`);
      } else if (spellRoll === 1) {
        // Freeze — stun all enemies 1 turn
        for (const e of aliveEnemies) addEffect(e, { type: 'stun', value: 1, duration: 1 });
        logs.push(`${player.name} читает свиток — Морозная волна: все враги оглушены!`);
      } else if (spellRoll === 2) {
        // Chain lightning — hits all for moderate damage
        logs.push(`${player.name} читает свиток — Цепная молния!`);
        for (const e of aliveEnemies) {
          const dmg = Math.max(1, Math.floor(player.attack * 1.2));
          const { finalDamage } = applyDamage(e, dmg);
          logs.push(`  → ${e.name}: ${finalDamage} урона.`);
          if (!e.isAlive) logs.push(`${e.name} повержен!`);
        }
      } else {
        // Curse all — attack debuff
        for (const e of aliveEnemies) {
          addEffect(e, { type: 'attackDebuff', value: 0.30, duration: 2 });
          addEffect(e, { type: 'defenseDebuff', value: 0.30, duration: 2 });
        }
        logs.push(`${player.name} читает свиток — Массовое проклятие: все враги ослаблены на 2 хода!`);
      }
      player.inventory.splice(itemIdx, 1);
      return logs;
    }

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

    // Dodge check based on target speed
    const dodgeChance = Math.min(0.20, (target.speed || 0) * 0.008);
    if (dodgeChance > 0 && Math.random() < dodgeChance) {
      logs.push(`${target.name} уклоняется от атаки ${enemy.name}!`);
      continue;
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
      case 'stun_bash': { const { damage: d1, isCrit: c1 } = calculateDamage(enemy, target); const { finalDamage: fd1 } = applyDamage(target, d1); addEffect(target, { type: 'stun', value: 1, duration: 1 }); logs.push(`${enemy.name} оглушает ${target.name}: ${fd1} урона${c1 ? ' [КРИТ!]' : ''}! ${target.name} оглушён.`); if (!target.isAlive) logs.push(`${target.name} пал...`); break; }
      case 'throw_trap': { const { damage: d2 } = calculateDamage(enemy, target, 1.2); const { finalDamage: fd2 } = applyDamage(target, d2); addEffect(target, { type: 'slow', value: 1, duration: 2 }); logs.push(`${enemy.name} бросает ловушку в ${target.name}: ${fd2} урона, замедление!`); if (!target.isAlive) logs.push(`${target.name} пал...`); break; }
      case 'feral_bite': { const { damage: d3, isCrit: c3 } = calculateDamage(enemy, target, 1.8); const { finalDamage: fd3 } = applyDamage(target, d3); logs.push(`${enemy.name} яростно кусает ${target.name}: ${fd3} урона${c3 ? ' [КРИТ!]' : ''}!`); if (!target.isAlive) logs.push(`${target.name} пал...`); break; }
      case 'howl': { addEffect(enemy, { type: 'attackBonus', value: 0.25, duration: 2 }); logs.push(`${enemy.name} воет на луну!`); const { damage: d4 } = calculateDamage(enemy, target); const { finalDamage: fd4 } = applyDamage(target, d4); logs.push(`${enemy.name} атакует ${target.name} на ${fd4} урона.`); if (!target.isAlive) logs.push(`${target.name} пал...`); break; }
      case 'web_trap': { const { damage: d5 } = calculateDamage(enemy, target, 0.7); const { finalDamage: fd5 } = applyDamage(target, d5); addEffect(target, { type: 'slow', value: 1, duration: 2 }); logs.push(`${enemy.name} опутывает ${target.name} паутиной: ${fd5} урона, замедление!`); if (!target.isAlive) logs.push(`${target.name} пал...`); break; }
      case 'shadow_bind': { const { damage: d6 } = calculateDamage(enemy, target, 0.8); const { finalDamage: fd6 } = applyDamage(target, d6); addEffect(target, { type: 'defenseDebuff', value: 0.25, duration: 2 }); addEffect(target, { type: 'attackDebuff', value: 0.15, duration: 2 }); logs.push(`${enemy.name} оплетает ${target.name} тьмой: ${fd6} урона, −25% защ, −15% атк.`); if (!target.isAlive) logs.push(`${target.name} пал...`); break; }
      case 'drain': { const { damage: d7 } = calculateDamage(enemy, target, 1.3); const { finalDamage: fd7 } = applyDamage(target, d7); enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.floor(fd7 * 0.6)); logs.push(`${enemy.name} высасывает жизнь из ${target.name}: ${fd7} урона.`); if (!target.isAlive) logs.push(`${target.name} пал...`); break; }
      case 'wing_buffet': { logs.push(`${enemy.name} бьёт крыльями!`); for (const p of alivePlayers) { const { damage: d8 } = calculateDamage(enemy, p, 0.9); const { finalDamage: fd8 } = applyDamage(p, d8); if (Math.random() < 0.4) { addEffect(p, { type: 'stun', value: 1, duration: 1 }); logs.push(`  → ${p.name}: ${fd8} урона, оглушён!`); } else logs.push(`  → ${p.name}: ${fd8} урона.`); if (!p.isAlive) logs.push(`${p.name} пал...`); } break; }
      case 'screech': { for (const p of alivePlayers) addEffect(p, { type: 'attackDebuff', value: 0.20, duration: 2 }); logs.push(`${enemy.name} кричит! Все: атака −20% на 2 хода.`); break; }
      case 'death_bolt': { const { damage: d9, isCrit: c9 } = calculateDamage(enemy, target, 2.2); const { finalDamage: fd9 } = applyDamage(target, d9); logs.push(`${enemy.name} — смертоносный разряд: ${fd9} урона${c9 ? ' [КРИТ!]' : ''}!`); if (!target.isAlive) logs.push(`${target.name} пал...`); break; }
      case 'raise_dead': { const dead = room?.enemies?.filter(e => !e.isAlive); if (dead?.length > 0) { const r = dead[0]; r.isAlive = true; r.hp = Math.floor(r.maxHp * 0.35); r.effects = []; logs.push(`☠ ${enemy.name} поднимает ${r.name}! (${r.hp} HP)`); } else { const { damage: d10 } = calculateDamage(enemy, target); const { finalDamage: fd10 } = applyDamage(target, d10); logs.push(`${enemy.name} атакует ${target.name} на ${fd10} урона.`); if (!target.isAlive) logs.push(`${target.name} пал...`); } break; }
      case 'charm': { addEffect(target, { type: 'stun', value: 1, duration: 1 }); logs.push(`${enemy.name} очаровывает ${target.name}! Пропускает ход.`); break; }
      case 'hellfire': { logs.push(`${enemy.name} — адское пламя!`); for (const p of alivePlayers) { const { damage: d11 } = calculateDamage(enemy, p, 1.3); const { finalDamage: fd11 } = applyDamage(p, d11); logs.push(`  → ${p.name}: ${fd11} урона.`); if (!p.isAlive) logs.push(`${p.name} пал...`); } break; }
      case 'devour': { const { damage: d12 } = calculateDamage(enemy, target, 2.5); const { finalDamage: fd12 } = applyDamage(target, d12); enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.floor(fd12 * 0.7)); logs.push(`${enemy.name} ПОЖИРАЕТ ${target.name}: ${fd12} урона!`); if (!target.isAlive) logs.push(`${target.name} пал...`); break; }
      case 'chaos_bolt': { const rnd = alivePlayers[Math.floor(Math.random() * alivePlayers.length)]; const { damage: d13, isCrit: c13 } = calculateDamage(enemy, rnd, 2.8 + Math.random() * 1.4); const { finalDamage: fd13 } = applyDamage(rnd, d13); logs.push(`${enemy.name} — заряд хаоса в ${rnd.name}: ${fd13} урона${c13 ? ' [КРИТ!]' : ''}!`); if (!rnd.isAlive) logs.push(`${rnd.name} пал...`); break; }
      case 'ice_breath': { logs.push(`${enemy.name} — ледяное дыхание!`); for (const p of alivePlayers) { const { damage: d14 } = calculateDamage(enemy, p, 1.2); const { finalDamage: fd14 } = applyDamage(p, d14); addEffect(p, { type: 'slow', value: 1, duration: 2 }); logs.push(`  → ${p.name}: ${fd14} урона, замедлен.`); if (!p.isAlive) logs.push(`${p.name} пал...`); } break; }
      case 'poison_spray': { logs.push(`${enemy.name} распыляет яд!`); for (const p of alivePlayers) { addEffect(p, { type: 'poison', value: 0.06, duration: 3 }); logs.push(`  → ${p.name} отравлен на 3 хода.`); } break; }
      case 'spawn_spiders': { logs.push(`${enemy.name} призывает паучье потомство!`); for (const p of alivePlayers) { const { damage: d15 } = calculateDamage(enemy, p, 0.5); const { finalDamage: fd15 } = applyDamage(p, d15); addEffect(p, { type: 'poison', value: 0.05, duration: 2 }); logs.push(`  → ${p.name}: ${fd15} урона + яд.`); if (!p.isAlive) logs.push(`${p.name} пал...`); } break; }
      case 'curse': { addEffect(target, { type: 'attackDebuff', value: 0.30, duration: 2 }); addEffect(target, { type: 'defenseDebuff', value: 0.30, duration: 2 }); logs.push(`${enemy.name} проклинает ${target.name}! Атака и защита −30% на 2 хода.`); break; }
      case 'arrow_shot': { const { damage: da, isCrit: ca } = calculateDamage(enemy, target, 1.5); const { finalDamage: fda, blocked: bla } = applyDamage(target, da); if (bla) logs.push(`${enemy.name} стреляет в ${target.name} — заблокировано!`); else { logs.push(`${enemy.name} выпускает стрелу в ${target.name}: ${fda} урона${ca ? ' [КРИТ!]' : ''}!`); if (!target.isAlive) logs.push(`${target.name} пал...`); } break; }
      case 'poison_arrow': { const { damage: dp } = calculateDamage(enemy, target, 1.2); const { finalDamage: fdp } = applyDamage(target, dp); addEffect(target, { type: 'poison', value: 0.07, duration: 3 }); logs.push(`${enemy.name} выпускает отравленную стрелу в ${target.name}: ${fdp} урона! Отравление.`); if (!target.isAlive) logs.push(`${target.name} пал...`); break; }
      case 'multishot': { logs.push(`${enemy.name} выпускает залп стрел!`); const msTargets = [...alivePlayers].sort(() => Math.random() - 0.5).slice(0, Math.min(3, alivePlayers.length)); for (const t of msTargets) { const { damage: dm, isCrit: cm } = calculateDamage(enemy, t, 1.2); const { finalDamage: fdm } = applyDamage(t, dm); logs.push(`  → ${t.name}: ${fdm} урона${cm ? ' [КРИТ!]' : ''}!`); if (!t.isAlive) logs.push(`${t.name} пал...`); } break; }

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

// ─── Tactical AI ──────────────────────────────────────────────────────────────
// Returns { ability, target, moveStyle } based on enemy type and battle context.
// moveStyle: 'aggressive' | 'kite' | 'retreat' | 'flee' | 'hitrun' | 'flank' | 'hold' | 'slow' | 'berserk'
function getEnemyTactics(enemy, alivePlayers, room) {
  if (alivePlayers.length === 0) return null;

  if (!enemy.tacticsState) enemy.tacticsState = { turnCount: 0 };
  enemy.tacticsState.turnCount++;
  const state = enemy.tacticsState;

  const hpPct    = enemy.hp / enemy.maxHp;
  const has      = a => enemy.abilities.includes(a);
  const numP     = alivePlayers.length;
  const rand     = () => alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
  const byLowHp  = () => alivePlayers.reduce((a, b) => a.hp < b.hp ? a : b);
  const byHighHp = () => alivePlayers.reduce((a, b) => a.hp > b.hp ? a : b);
  const byHighAtk = () => alivePlayers.reduce((a, b) =>
    getEffectiveStat(a, 'attack') >= getEffectiveStat(b, 'attack') ? a : b);
  const isSlowed   = p => hasEffect(p, 'slow');
  const isPoisoned = p => hasEffect(p, 'poison');
  const isCursed   = p => hasEffect(p, 'attackDebuff') || hasEffect(p, 'defenseDebuff');
  const isStunned  = p => hasEffect(p, 'stun');

  // Taunt always overrides
  const taunted = alivePlayers.find(p =>
    enemy.effects?.some(e => e.type === 'taunted' && e.targetId === p.id));
  if (taunted) return { ability: 'attack', target: taunted, moveStyle: 'aggressive' };

  switch (enemy.typeId) {

    // ── TIER 1 ────────────────────────────────────────────────────────────────

    case 'goblin': {
      // Cowardly: attacks weakest, panics and retreats when low HP
      const target = byLowHp();
      if (hpPct < 0.30) return { ability: 'attack', target, moveStyle: 'retreat' };
      return { ability: 'attack', target, moveStyle: 'aggressive' };
    }

    case 'skeleton': {
      // Relentless hunter: always targets lowest HP, never retreats
      return { ability: 'attack', target: byLowHp(), moveStyle: 'aggressive' };
    }

    case 'rat_swarm': {
      // Swarmer: targets strongest, always tries to poison
      const target = byHighHp();
      return { ability: has('poison_bite') ? 'poison_bite' : 'attack', target, moveStyle: 'aggressive' };
    }

    case 'cave_bat': {
      // Hit-and-run: stuns then retreats
      const ability = has('stun_bash') && Math.random() < 0.55 ? 'stun_bash' : 'attack';
      return { ability, target: rand(), moveStyle: 'hitrun' };
    }

    case 'kobold': {
      // Trapper: slows targets, then kites at safe distance
      const unslowed = alivePlayers.filter(p => !isSlowed(p));
      const target = byLowHp();
      const ability = has('throw_trap') && unslowed.length > 0 ? 'throw_trap' : 'attack';
      return { ability, target, moveStyle: 'kite' };
    }

    // ── TIER 2 ────────────────────────────────────────────────────────────────

    case 'zombie': {
      // Relentless: locks onto one target for entire fight, always poisons
      if (!state.lockedTarget || !alivePlayers.find(p => p.id === state.lockedTarget)) {
        state.lockedTarget = rand().id;
      }
      const target = alivePlayers.find(p => p.id === state.lockedTarget) || rand();
      return { ability: has('poison_bite') ? 'poison_bite' : 'attack', target, moveStyle: 'aggressive' };
    }

    case 'dark_mage': {
      // Kiter: curses first, then fireballs — never comes close
      const target = byLowHp();
      let ability = 'attack';
      if (has('curse') && !isCursed(target)) ability = 'curse';
      else if (has('fireball')) ability = 'fireball';
      return { ability, target, moveStyle: 'kite' };
    }

    case 'werewolf': {
      // Berserker: howls first, then power-bites, rages at low HP
      const target = byHighHp();
      let ability = 'attack';
      if (state.turnCount === 1 && has('howl')) {
        ability = 'howl';
      } else if (hpPct < 0.35 && has('feral_bite')) {
        ability = 'feral_bite';
      } else if (has('feral_bite') && hasEffect(enemy, 'attackBonus')) {
        ability = 'feral_bite';
      } else if (has('howl') && !hasEffect(enemy, 'attackBonus') && Math.random() < 0.30) {
        ability = 'howl';
      } else {
        ability = has('feral_bite') && Math.random() < 0.55 ? 'feral_bite' : 'attack';
      }
      return { ability, target, moveStyle: hpPct < 0.30 ? 'berserk' : 'aggressive' };
    }

    case 'giant_spider': {
      // Webber: slows first, then stacks poison on slowed targets
      const unslowed = alivePlayers.filter(p => !isSlowed(p));
      const target = unslowed.length > 0
        ? unslowed[Math.floor(Math.random() * unslowed.length)]
        : byLowHp();
      let ability = 'attack';
      if (has('web_trap') && unslowed.length > 0) ability = 'web_trap';
      else if (has('poison_bite')) ability = 'poison_bite';
      return { ability, target, moveStyle: 'aggressive' };
    }

    case 'shadow': {
      // Flanker: targets highest-attack player, debuffs then drains
      const target = byHighAtk();
      let ability = 'attack';
      if (has('shadow_bind') && !isCursed(target)) ability = 'shadow_bind';
      else if (has('drain')) ability = 'drain';
      return { ability, target, moveStyle: 'flank' };
    }

    // ── TIER 3 ────────────────────────────────────────────────────────────────

    case 'troll': {
      // Tank: regenerates when hurt, heavy-blows otherwise
      const target = rand();
      let ability = 'attack';
      if (has('regenerate') && hpPct < 0.45) ability = 'regenerate';
      else if (has('heavy_blow') && Math.random() < 0.60) ability = 'heavy_blow';
      return { ability, target, moveStyle: 'aggressive' };
    }

    case 'vampire': {
      // Predator: charms the biggest threat, drains when hurt
      const target = byHighAtk();
      let ability = 'attack';
      if (has('charm') && !isStunned(target) && Math.random() < 0.35) {
        ability = 'charm';
      } else if (has('blood_drain') && hpPct < 0.55) {
        ability = 'blood_drain';
      } else if (has('blood_drain') && Math.random() < 0.45) {
        ability = 'blood_drain';
      }
      return { ability, target, moveStyle: 'aggressive' };
    }

    case 'death_knight': {
      // Opener: death_bolt first turn, then heavy melee
      const target = byLowHp();
      let ability = 'attack';
      if (state.turnCount === 1 && has('death_bolt')) {
        ability = 'death_bolt';
      } else if (has('heavy_blow') && Math.random() < 0.55) {
        ability = 'heavy_blow';
      } else if (has('death_bolt') && Math.random() < 0.25) {
        ability = 'death_bolt';
      }
      return { ability, target, moveStyle: 'aggressive' };
    }

    case 'golem': {
      // Unstoppable: always heavy_blow, moves slowly and steadily
      return { ability: has('heavy_blow') ? 'heavy_blow' : 'attack', target: rand(), moveStyle: 'slow' };
    }

    case 'harpy': {
      // Hit-and-run: screech first, wing-buffet on groups, then retreats
      const target = byLowHp();
      let ability = 'attack';
      if (state.turnCount === 1 && has('screech')) {
        ability = 'screech';
      } else if (has('wing_buffet') && numP >= 2 && Math.random() < 0.55) {
        ability = 'wing_buffet';
      } else if (has('screech') && !hasEffect(alivePlayers[0], 'attackDebuff') && Math.random() < 0.25) {
        ability = 'screech';
      }
      return { ability, target, moveStyle: 'hitrun' };
    }

    // ── TIER 4 ────────────────────────────────────────────────────────────────

    case 'lich': {
      // Necromancer: revives dead first, then death_bolt, curses weak targets
      const target = byLowHp();
      const deadEnemies = room.enemies.filter(e => !e.isAlive);
      let ability = 'attack';
      if (has('raise_dead') && deadEnemies.length > 0) {
        ability = 'raise_dead';
      } else if (has('curse') && !isCursed(target)) {
        ability = 'curse';
      } else if (has('death_bolt') && Math.random() < 0.65) {
        ability = 'death_bolt';
      }
      return { ability, target, moveStyle: 'hold' };
    }

    case 'demon': {
      // Chaos: hellfire vs groups, shadow_bind then devour to heal
      const target = byLowHp();
      let ability = 'attack';
      if (has('shadow_bind') && !isCursed(target) && Math.random() < 0.35) {
        ability = 'shadow_bind';
      } else if (has('hellfire') && numP >= 2 && Math.random() < 0.55) {
        ability = 'hellfire';
      } else if (has('devour') && hpPct < 0.50) {
        ability = 'devour';
      } else if (has('hellfire') && Math.random() < 0.35) {
        ability = 'hellfire';
      }
      return { ability, target, moveStyle: 'aggressive' };
    }

    case 'witch': {
      // Spellcaster: curse → raise_dead → hellfire cycle, kites
      const target = byLowHp();
      const deadEnemies = room.enemies.filter(e => !e.isAlive);
      let ability = 'attack';
      if (state.turnCount === 1 && has('curse')) {
        ability = 'curse';
      } else if (has('raise_dead') && deadEnemies.length > 0) {
        ability = 'raise_dead';
      } else if (has('hellfire') && Math.random() < 0.55) {
        ability = 'hellfire';
      } else if (has('curse') && !isCursed(target) && Math.random() < 0.40) {
        ability = 'curse';
      }
      return { ability, target, moveStyle: 'kite' };
    }

    case 'frost_giant': {
      // Slows then smashes: ice_breath first, then heavy_blow on slowed targets
      const slowed = alivePlayers.filter(isSlowed);
      const target = slowed.length > 0 ? slowed[0] : rand();
      let ability = 'attack';
      if (state.turnCount === 1 && has('ice_breath')) {
        ability = 'ice_breath';
      } else if (has('ice_breath') && alivePlayers.every(p => !isSlowed(p)) && Math.random() < 0.40) {
        ability = 'ice_breath';
      } else if (has('heavy_blow') && (slowed.length > 0 || Math.random() < 0.50)) {
        ability = 'heavy_blow';
      }
      return { ability, target, moveStyle: 'aggressive' };
    }

    case 'nightmare': {
      // Fear+pain: shadow_bind opener, hellfire AoE, devour when dying
      const target = byLowHp();
      let ability = 'attack';
      if (state.turnCount === 1 && has('shadow_bind')) {
        ability = 'shadow_bind';
      } else if (has('devour') && hpPct < 0.40) {
        ability = 'devour';
      } else if (has('hellfire') && Math.random() < 0.50) {
        ability = 'hellfire';
      } else if (has('shadow_bind') && !isCursed(target) && Math.random() < 0.30) {
        ability = 'shadow_bind';
      }
      return { ability, target, moveStyle: 'aggressive' };
    }

    // ── RANGED ────────────────────────────────────────────────────────────────

    case 'goblin_archer': {
      // Pure kiter: always runs from melee, only shoots
      return { ability: has('arrow_shot') ? 'arrow_shot' : 'attack', target: byLowHp(), moveStyle: 'flee' };
    }

    case 'skeleton_archer': {
      // Poisoner: always poisons fresh targets first
      const target = byLowHp();
      const unpoisoned = alivePlayers.filter(p => !isPoisoned(p));
      const ability = has('poison_arrow') && unpoisoned.length > 0
        ? 'poison_arrow'
        : (has('arrow_shot') ? 'arrow_shot' : 'attack');
      return { ability, target, moveStyle: 'kite' };
    }

    case 'dark_ranger': {
      // Tactician: multishot vs groups, poison+arrow vs single
      const target = byLowHp();
      let ability = 'attack';
      if (has('multishot') && numP >= 2 && Math.random() < 0.60) {
        ability = 'multishot';
      } else if (has('poison_arrow') && !isPoisoned(target)) {
        ability = 'poison_arrow';
      } else {
        ability = has('arrow_shot') ? 'arrow_shot' : 'attack';
      }
      return { ability, target, moveStyle: 'kite' };
    }

    // ── BOSSES ────────────────────────────────────────────────────────────────

    case 'dragon_boss': {
      const target = byLowHp();
      const t = state.turnCount;
      let ability = 'attack';
      if (hpPct < 0.50) {
        if (has('devour') && hpPct < 0.30) ability = 'devour';
        else if (t % 3 === 0 && has('dragon_breath')) ability = 'dragon_breath';
        else if (t % 3 === 1 && has('tail_sweep')) ability = 'tail_sweep';
        else if (has('wing_buffet')) ability = 'wing_buffet';
      } else {
        if (t % 4 === 0 && has('dragon_breath')) ability = 'dragon_breath';
        else if (t % 4 === 1 && has('tail_sweep')) ability = 'tail_sweep';
        else if (t % 4 === 2 && has('wing_buffet')) ability = 'wing_buffet';
        else ability = has('devour') ? 'devour' : 'attack';
      }
      return { ability, target, moveStyle: 'aggressive' };
    }

    case 'spider_queen': {
      const target = byLowHp();
      const t = state.turnCount;
      let ability = 'attack';
      if (hpPct < 0.40 && has('poison_spray')) {
        ability = 'poison_spray';
      } else if (t % 4 === 1 && has('poison_spray')) {
        ability = 'poison_spray';
      } else if (t % 4 === 2 && has('spawn_spiders')) {
        ability = 'spawn_spiders';
      } else if (t % 4 === 3 && has('web_trap')) {
        ability = 'web_trap';
      }
      return { ability, target, moveStyle: 'hold' };
    }

    case 'chaos_lord': {
      const t = state.turnCount;
      let ability = 'attack';
      if (t % 3 === 0 && has('chaos_bolt')) ability = 'chaos_bolt';
      else if (t % 3 === 1 && has('hellfire')) ability = 'hellfire';
      else if (has('death_bolt') && Math.random() < 0.50) ability = 'death_bolt';
      else ability = has('dragon_breath') ? 'dragon_breath' : 'attack';
      return { ability, target: rand(), moveStyle: 'aggressive' };
    }

    default: {
      const target = enemy.ai === 'low_hp_target' ? byLowHp() : rand();
      return { ability: chooseEnemyAbility(enemy), target, moveStyle: 'aggressive' };
    }
  }
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
  if (alivePlayers.length === 0) return { logs, lootItems: [], goldPerPlayer: 0 };

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

  let expPerPlayer = Math.floor(totalExp / alivePlayers.length);
  // Full team synergy: +10% exp
  if (gameState.synergies?.fullTeamBonus) {
    expPerPlayer = Math.floor(expPerPlayer * 1.10);
  }
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
      const extraRegen = player.passives?.extraMpRegen || 0;
      player.mp = Math.min(player.maxMp, player.mp + 5 + extraRegen);
    }
  }
  for (const ability of Object.values(gameState.players).flatMap(p => p.abilities)) {
    if (ability.currentCooldown > 0) ability.currentCooldown--;
  }
}

// ─── Line of Sight ────────────────────────────────────────────────────────────

function hasLineOfSight(grid, x1, z1, x2, z2) {
  // Bresenham's line algorithm — returns false if any intermediate cell is a wall/obstacle
  const dx = Math.abs(x2 - x1);
  const dz = Math.abs(z2 - z1);
  const sx = x1 < x2 ? 1 : -1;
  const sz = z1 < z2 ? 1 : -1;
  let err = dx - dz;
  let cx = x1, cz = z1;

  while (cx !== x2 || cz !== z2) {
    const e2 = 2 * err;
    if (e2 > -dz) { err -= dz; cx += sx; }
    if (e2 < dx)  { err += dx; cz += sz; }
    if (cx === x2 && cz === z2) break;
    const cell = grid[cx]?.[cz];
    if (cell === 'wall' || cell === 'obstacle') return false;
  }
  return true;
}

// ─── Grid Combat System ───────────────────────────────────────────────────────

const GRID_SIZE = 14;
const LEVEL_HEIGHT = 1.2; // vertical gap between floor levels (used by combat3d.js)

const ROOM_THEMES = ['dungeon','crypt','forest','ice','lava','library','throne','sewer','temple','workshop'];
const ROOM_SHAPES = [
  // single-level
  'square', 'two_chambers', 'hourglass', 'fortified', 'three_lanes',
  'l_shape', 'cross', 'pillar_grid', 'arena_ring', 'scattered_pillars',
  // multi-level (2-3 floors)
  'elevated_center', 'split_elevation', 'tiered_arena',
];

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function isWalkable(cell) {
  return cell === 'floor' || cell === 'stairs';
}

function initializeCombatGrid(players, enemies) {
  const size = GRID_SIZE;
  const theme = ROOM_THEMES[Math.floor(Math.random() * ROOM_THEMES.length)];
  const shape = ROOM_SHAPES[Math.floor(Math.random() * ROOM_SHAPES.length)];
  const grid = Array.from({ length: size }, () => Array(size).fill('floor'));
  const elevations = Array.from({ length: size }, () => Array(size).fill(0));

  // Border walls
  for (let i = 0; i < size; i++) {
    grid[0][i] = 'wall'; grid[size - 1][i] = 'wall';
    grid[i][0] = 'wall'; grid[i][size - 1] = 'wall';
  }

  switch (shape) {
    case 'two_chambers': {
      for (let z = 1; z < size - 1; z++) {
        if (z < 5 || z > 8) { grid[6][z] = 'wall'; grid[7][z] = 'wall'; }
      }
      let placed = 0;
      for (let attempt = 0; attempt < 200 && placed < 4; attempt++) {
        const x = Math.random() < 0.5 ? 2 + Math.floor(Math.random() * 3) : 9 + Math.floor(Math.random() * 3);
        const z = 2 + Math.floor(Math.random() * (size - 4));
        if (grid[x][z] === 'floor') { grid[x][z] = 'obstacle'; placed++; }
      }
      break;
    }
    case 'hourglass': {
      for (let z = 1; z <= 4; z++) {
        for (let x = 3; x <= 10; x++) { if (x !== 6 && x !== 7) grid[x][z] = 'wall'; }
      }
      for (let z = 9; z <= 12; z++) {
        for (let x = 3; x <= 10; x++) { if (x !== 6 && x !== 7) grid[x][z] = 'wall'; }
      }
      let placed = 0;
      for (let attempt = 0; attempt < 200 && placed < 4; attempt++) {
        const x = 3 + Math.floor(Math.random() * 8);
        const z = 5 + Math.floor(Math.random() * 4);
        if (grid[x][z] === 'floor') { grid[x][z] = 'obstacle'; placed++; }
      }
      break;
    }
    case 'fortified': {
      for (let x = 3; x <= 10; x++) { if (x < 5 || x > 8) grid[x][6] = 'wall'; }
      let placed = 0;
      for (let attempt = 0; attempt < 200 && placed < 5; attempt++) {
        const x = 3 + Math.floor(Math.random() * 8);
        const z = Math.random() < 0.5 ? 2 + Math.floor(Math.random() * 3) : 8 + Math.floor(Math.random() * 3);
        if (grid[x][z] === 'floor') { grid[x][z] = 'obstacle'; placed++; }
      }
      break;
    }
    case 'three_lanes': {
      for (let z = 1; z < size - 1; z++) {
        const inTopGap = z >= 2 && z <= 3, inBottomGap = z >= 10 && z <= 11;
        if (!inTopGap && !inBottomGap) { grid[4][z] = 'wall'; grid[9][z] = 'wall'; }
      }
      let placed = 0;
      for (let attempt = 0; attempt < 200 && placed < 5; attempt++) {
        const lane = Math.floor(Math.random() * 3);
        const x = lane === 0 ? 2 + Math.floor(Math.random() * 2) : lane === 1 ? 5 + Math.floor(Math.random() * 4) : 10 + Math.floor(Math.random() * 2);
        const z = 4 + Math.floor(Math.random() * 6);
        if (grid[x][z] === 'floor') { grid[x][z] = 'obstacle'; placed++; }
      }
      break;
    }
    case 'l_shape': {
      // Top-right corner walled off → L-shaped room
      const cornerW = 5 + Math.floor(Math.random() * 2);
      const cornerH = 5 + Math.floor(Math.random() * 2);
      for (let x = size - 1 - cornerW; x <= size - 2; x++) {
        for (let z = 1; z <= cornerH; z++) { grid[x][z] = 'wall'; }
      }
      // Random obstacles in L-area
      let placed = 0;
      for (let attempt = 0; attempt < 300 && placed < 5; attempt++) {
        const x = 2 + Math.floor(Math.random() * (size - 4));
        const z = 2 + Math.floor(Math.random() * (size - 4));
        if (grid[x][z] === 'floor') { grid[x][z] = 'obstacle'; placed++; }
      }
      break;
    }
    case 'cross': {
      // Wall off 4 corners → cross-shaped room
      const cs = 3 + Math.floor(Math.random() * 2);
      for (let x = 1; x <= cs; x++) {
        for (let z = 1; z <= cs; z++) {
          grid[x][z] = 'wall'; grid[x][size - 1 - z] = 'wall';
          grid[size - 1 - x][z] = 'wall'; grid[size - 1 - x][size - 1 - z] = 'wall';
        }
      }
      let placed = 0;
      for (let attempt = 0; attempt < 200 && placed < 5; attempt++) {
        const x = cs + 1 + Math.floor(Math.random() * (size - 2 * cs - 2));
        const z = cs + 1 + Math.floor(Math.random() * (size - 2 * cs - 2));
        if (grid[x][z] === 'floor') { grid[x][z] = 'obstacle'; placed++; }
      }
      break;
    }
    case 'pillar_grid': {
      // Regular grid of stone pillars with open corridors between them
      const cols = [3, 6, 10], rows = [3, 6, 10];
      for (const px of cols) {
        for (const pz of rows) {
          if (grid[px][pz] === 'floor') grid[px][pz] = 'obstacle';
          if (Math.random() < 0.6 && px + 1 < size - 1 && grid[px + 1][pz] === 'floor') grid[px + 1][pz] = 'obstacle';
          if (Math.random() < 0.6 && pz + 1 < size - 1 && grid[px][pz + 1] === 'floor') grid[px][pz + 1] = 'obstacle';
        }
      }
      break;
    }
    case 'arena_ring': {
      // Circular ring of walls with 4 gate openings
      const cx = Math.floor(size / 2), cz = Math.floor(size / 2);
      for (let x = 1; x < size - 1; x++) {
        for (let z = 1; z < size - 1; z++) {
          const dx = x - cx, dz = z - cz;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist >= 3.5 && dist <= 4.8) {
            const isGate = (Math.abs(dx) <= 1.2 && Math.abs(dz) <= 1.2);
            if (!isGate) grid[x][z] = 'wall';
          }
        }
      }
      let placed = 0;
      for (let attempt = 0; attempt < 200 && placed < 4; attempt++) {
        const ax = cx - 2 + Math.floor(Math.random() * 5);
        const az = cz - 2 + Math.floor(Math.random() * 5);
        if (ax >= 1 && az >= 1 && ax < size - 1 && az < size - 1 && grid[ax][az] === 'floor') { grid[ax][az] = 'obstacle'; placed++; }
      }
      break;
    }
    case 'scattered_pillars': {
      // Clusters of 2-3 obstacle cells scattered around the room
      const numGroups = 5 + Math.floor(Math.random() * 4);
      for (let g = 0; g < numGroups; g++) {
        const gx = 2 + Math.floor(Math.random() * (size - 4));
        const gz = 2 + Math.floor(Math.random() * (size - 4));
        const groupSize = 1 + Math.floor(Math.random() * 3);
        const offsets = [[0,0],[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,1]];
        shuffleArray(offsets);
        let placed = 0;
        for (const [ox, oz] of offsets) {
          if (placed >= groupSize) break;
          const px = gx + ox, pz = gz + oz;
          if (px >= 1 && pz >= 1 && px < size - 1 && pz < size - 1 && grid[px][pz] === 'floor') {
            grid[px][pz] = 'obstacle'; placed++;
          }
        }
      }
      break;
    }
    case 'elevated_center': {
      // Center platform at level 1 — stairs connect ground to platform at 4 sides
      const pMin = 5, pMax = 8;
      for (let x = pMin; x <= pMax; x++) {
        for (let z = pMin; z <= pMax; z++) { elevations[x][z] = 1; }
      }
      // Stairs at each edge of the platform
      const stairPairs = [
        [pMin - 1, 6], [pMin - 1, 7],
        [pMax + 1, 6], [pMax + 1, 7],
        [6, pMin - 1], [7, pMin - 1],
        [6, pMax + 1], [7, pMax + 1],
      ];
      for (const [sx, sz] of stairPairs) {
        if (sx >= 1 && sz >= 1 && sx < size - 1 && sz < size - 1) {
          grid[sx][sz] = 'stairs';
          elevations[sx][sz] = 0;
        }
      }
      // Obstacles on platform
      let placed = 0;
      for (let attempt = 0; attempt < 100 && placed < 2; attempt++) {
        const x = pMin + 1 + Math.floor(Math.random() * (pMax - pMin - 1));
        const z = pMin + 1 + Math.floor(Math.random() * (pMax - pMin - 1));
        if (grid[x][z] === 'floor') { grid[x][z] = 'obstacle'; placed++; }
      }
      // Obstacles on ground floor
      placed = 0;
      for (let attempt = 0; attempt < 200 && placed < 4; attempt++) {
        const x = 1 + Math.floor(Math.random() * (size - 2));
        const z = 1 + Math.floor(Math.random() * (size - 2));
        if (grid[x][z] === 'floor' && elevations[x][z] === 0) { grid[x][z] = 'obstacle'; placed++; }
      }
      break;
    }
    case 'split_elevation': {
      // Left half level 0, right half level 1 — stairs column at x=7
      for (let x = 8; x <= size - 2; x++) {
        for (let z = 1; z < size - 1; z++) { elevations[x][z] = 1; }
      }
      for (let z = 2; z <= size - 3; z++) {
        grid[7][z] = 'stairs';
        elevations[7][z] = 0;
      }
      // Obstacles on both sides
      let placed = 0;
      for (let attempt = 0; attempt < 200 && placed < 3; attempt++) {
        const x = 2 + Math.floor(Math.random() * 4);
        const z = 2 + Math.floor(Math.random() * (size - 4));
        if (grid[x][z] === 'floor') { grid[x][z] = 'obstacle'; placed++; }
      }
      placed = 0;
      for (let attempt = 0; attempt < 200 && placed < 3; attempt++) {
        const x = 9 + Math.floor(Math.random() * (size - 11));
        const z = 2 + Math.floor(Math.random() * (size - 4));
        if (grid[x][z] === 'floor') { grid[x][z] = 'obstacle'; placed++; }
      }
      break;
    }
    case 'tiered_arena': {
      // Three levels: outer ring = 0, middle ring = 1, inner platform = 2
      for (let x = 3; x <= 10; x++) {
        for (let z = 3; z <= 10; z++) { if (grid[x][z] !== 'wall') elevations[x][z] = 1; }
      }
      for (let x = 5; x <= 8; x++) {
        for (let z = 5; z <= 8; z++) { if (grid[x][z] !== 'wall') elevations[x][z] = 2; }
      }
      // Stairs level 0 → 1 at sides of middle ring
      for (const [sx, sz] of [[2,6],[2,7],[11,6],[11,7],[6,2],[7,2],[6,11],[7,11]]) {
        if (grid[sx][sz] !== 'wall') { grid[sx][sz] = 'stairs'; elevations[sx][sz] = 0; }
      }
      // Stairs level 1 → 2 at sides of inner platform
      for (const [sx, sz] of [[4,6],[4,7],[9,6],[9,7],[6,4],[7,4],[6,9],[7,9]]) {
        if (grid[sx][sz] !== 'wall') { grid[sx][sz] = 'stairs'; elevations[sx][sz] = 1; }
      }
      break;
    }
    case 'square':
    default: {
      const numObstacles = 4 + Math.floor(Math.random() * 6);
      let placed = 0;
      for (let attempt = 0; attempt < 200 && placed < numObstacles; attempt++) {
        const x = 3 + Math.floor(Math.random() * 8);
        const z = 2 + Math.floor(Math.random() * (size - 4));
        if (grid[x][z] === 'floor') { grid[x][z] = 'obstacle'; placed++; }
      }
      break;
    }
  }

  // Collect valid spawn cells in each zone and pick randomly
  const collectSpawnCells = (xMin, xMax, preferLevel) => {
    const preferred = [], fallback = [];
    for (let x = xMin; x <= xMax; x++) {
      for (let z = 1; z < size - 1; z++) {
        if (!isWalkable(grid[x][z])) continue;
        if (elevations[x][z] === preferLevel) preferred.push({ x, z });
        else fallback.push({ x, z });
      }
    }
    const cells = preferred.length >= 2 ? preferred : [...preferred, ...fallback];
    shuffleArray(cells);
    return cells;
  };

  const playerCells = collectSpawnCells(1, 3, 0);
  const enemyCells  = collectSpawnCells(size - 4, size - 2, 0);

  const playerArr = Object.values(players).filter(p => p && p.isAlive);
  for (let i = 0; i < playerArr.length; i++) {
    const p = playerArr[i];
    const cell = playerCells[i % playerCells.length];
    p.gridX = cell.x;
    p.gridZ = cell.z;
    p.gridY = elevations[cell.x][cell.z];
    grid[p.gridX][p.gridZ] = 'floor';
  }

  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    const cell = enemyCells[i % enemyCells.length];
    e.gridX = cell.x;
    e.gridZ = cell.z;
    e.gridY = elevations[cell.x][cell.z];
  }

  return { size, grid, theme, elevations };
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
  const elev = combatGrid.elevations;

  while (queue.length) {
    const [x, z, dist] = queue.shift();
    const key = `${x},${z}`;
    if (visited.has(key) && visited.get(key) <= dist) continue;
    visited.set(key, dist);
    if (dist > 0) reachable.add(key);
    if (dist >= moveRange) continue;

    const curLevel = elev ? elev[x][z] : 0;

    for (const [dx, dz] of DIRS) {
      const nx = x + dx, nz = z + dz;
      if (nx < 0 || nz < 0 || nx >= combatGrid.size || nz >= combatGrid.size) continue;
      if (!isWalkable(combatGrid.grid[nx][nz])) continue;
      if (isOccupied(nx, nz, players, enemies, moverId)) continue;

      // Elevation check: can only change level when current or destination cell is stairs
      if (elev) {
        const destLevel = elev[nx][nz];
        const diff = Math.abs(destLevel - curLevel);
        if (diff === 1) {
          const curStairs = combatGrid.grid[x][z] === 'stairs';
          const dstStairs = combatGrid.grid[nx][nz] === 'stairs';
          if (!curStairs && !dstStairs) continue;
        } else if (diff > 1) {
          continue;
        }
      }

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
  if (!isWalkable(combatGrid.grid[targetX][targetZ])) {
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
  if (combatGrid.elevations) player.gridY = combatGrid.elevations[targetX][targetZ];
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

  // Boss phase 2: activate at 50% HP
  if (enemy.isBoss && !enemy.phase2Active && enemy.hp <= enemy.maxHp * 0.5) {
    enemy.phase2Active = true;
    enemy.attack = Math.floor(enemy.attack * 1.3);
    enemy.critChance = (enemy.critChance || 0.1) + 0.15;
    logs.push(`★ ${enemy.name} ВПАДАЕТ В ЯРОСТЬ! [ФАЗА 2] Атака усилена на 30%! ★`);
  }

  const atkRange = enemy.attackRange || 1.5;

  // ── Tactical AI decision ──────────────────────────────────────────────────
  const tactics = getEnemyTactics(enemy, alivePlayers, room);
  if (!tactics) return logs;
  let { ability, target, moveStyle } = tactics;

  // ── Movement ──────────────────────────────────────────────────────────────
  if (room.combatGrid) {
    let nearestPlayer = null, nearestDist = Infinity;
    for (const p of alivePlayers) {
      if (p.gridX === undefined) continue;
      const d = gridDist(enemy.gridX, enemy.gridZ, p.gridX, p.gridZ);
      if (d < nearestDist) { nearestDist = d; nearestPlayer = p; }
    }

    if (nearestPlayer) {
      let baseMoveRange = 2;
      if (moveStyle === 'slow') baseMoveRange = 1;
      if (moveStyle === 'berserk') baseMoveRange = 3;

      const reachable = bfsReachable(enemy.gridX, enemy.gridZ, baseMoveRange, room.combatGrid,
        gameState.players, room.enemies.filter(e => e.isAlive), enemy.id);

      let bestPos = null;

      switch (moveStyle) {
        case 'aggressive':
        case 'berserk':
        case 'slow': {
          const moveTarget = (target && target.gridX !== undefined) ? target : nearestPlayer;
          const distToTarget = gridDist(enemy.gridX, enemy.gridZ, moveTarget.gridX, moveTarget.gridZ);
          if (distToTarget > atkRange) {
            let best = distToTarget;
            for (const key of reachable) {
              const [bx, bz] = key.split(',').map(Number);
              const d = gridDist(bx, bz, moveTarget.gridX, moveTarget.gridZ);
              if (d < best) { best = d; bestPos = { x: bx, z: bz }; }
            }
          }
          break;
        }

        case 'kite': {
          const idealDist = atkRange * 0.6;
          if (nearestDist > atkRange) {
            let best = nearestDist;
            for (const key of reachable) {
              const [bx, bz] = key.split(',').map(Number);
              const d = gridDist(bx, bz, nearestPlayer.gridX, nearestPlayer.gridZ);
              if (d < best) { best = d; bestPos = { x: bx, z: bz }; }
            }
          } else {
            let bestScore = Infinity;
            for (const key of reachable) {
              const [bx, bz] = key.split(',').map(Number);
              const d = gridDist(bx, bz, nearestPlayer.gridX, nearestPlayer.gridZ);
              const score = Math.abs(d - idealDist);
              if (d <= atkRange && score < bestScore) { bestScore = score; bestPos = { x: bx, z: bz }; }
            }
          }
          break;
        }

        case 'retreat': {
          const pPositions = alivePlayers.filter(p => p.gridX !== undefined);
          let bestMin = -Infinity;
          for (const key of reachable) {
            const [bx, bz] = key.split(',').map(Number);
            const minD = Math.min(...pPositions.map(p => gridDist(bx, bz, p.gridX, p.gridZ)));
            if (minD > bestMin) { bestMin = minD; bestPos = { x: bx, z: bz }; }
          }
          break;
        }

        case 'flee': {
          if (nearestDist < 3.5) {
            let best = -Infinity;
            for (const key of reachable) {
              const [bx, bz] = key.split(',').map(Number);
              const d = gridDist(bx, bz, nearestPlayer.gridX, nearestPlayer.gridZ);
              if (d > best) { best = d; bestPos = { x: bx, z: bz }; }
            }
          } else {
            const idealDist = atkRange * 0.7;
            let bestScore = Infinity;
            for (const key of reachable) {
              const [bx, bz] = key.split(',').map(Number);
              const d = gridDist(bx, bz, nearestPlayer.gridX, nearestPlayer.gridZ);
              const score = Math.abs(d - idealDist);
              if (score < bestScore) { bestScore = score; bestPos = { x: bx, z: bz }; }
            }
          }
          break;
        }

        case 'hitrun': {
          const ts = enemy.tacticsState;
          const moveTarget = (target && target.gridX !== undefined) ? target : nearestPlayer;
          const distToTarget = gridDist(enemy.gridX, enemy.gridZ, moveTarget.gridX, moveTarget.gridZ);
          if (ts.hitrunRetreat) {
            ts.hitrunRetreat = false;
            let best = -Infinity;
            for (const key of reachable) {
              const [bx, bz] = key.split(',').map(Number);
              const d = gridDist(bx, bz, nearestPlayer.gridX, nearestPlayer.gridZ);
              if (d > best) { best = d; bestPos = { x: bx, z: bz }; }
            }
          } else if (distToTarget <= atkRange) {
            ts.hitrunRetreat = true;
          } else {
            let best = distToTarget;
            for (const key of reachable) {
              const [bx, bz] = key.split(',').map(Number);
              const d = gridDist(bx, bz, moveTarget.gridX, moveTarget.gridZ);
              if (d < best) { best = d; bestPos = { x: bx, z: bz }; }
            }
          }
          break;
        }

        case 'flank': {
          const moveTarget = (target && target.gridX !== undefined) ? target : nearestPlayer;
          const distToTarget = gridDist(enemy.gridX, enemy.gridZ, moveTarget.gridX, moveTarget.gridZ);
          if (distToTarget > atkRange) {
            const others = room.enemies.filter(e => e.isAlive && e.id !== enemy.id && e.gridX !== undefined);
            let bestScore = Infinity;
            for (const key of reachable) {
              const [bx, bz] = key.split(',').map(Number);
              const dTgt = gridDist(bx, bz, moveTarget.gridX, moveTarget.gridZ);
              const crowd = others.reduce((s, oe) => s + Math.max(0, 2 - gridDist(bx, bz, oe.gridX, oe.gridZ)), 0);
              const score = dTgt + crowd * 0.5;
              if (score < bestScore) { bestScore = score; bestPos = { x: bx, z: bz }; }
            }
          }
          break;
        }

        case 'hold':
        default:
          break;
      }

      if (bestPos) {
        enemy.gridX = bestPos.x;
        enemy.gridZ = bestPos.z;
        if (room.combatGrid.elevations) enemy.gridY = room.combatGrid.elevations[bestPos.x][bestPos.z];
      }
    }
  }

  if (!target) return logs;

  if (hasEffect(enemy, 'missChance')) {
    const missEff = enemy.effects.find(e => e.type === 'missChance');
    if (Math.random() < missEff.value) { logs.push(`${enemy.name} промахивается!`); return logs; }
  }

  // Range + LOS check
  if (target.gridX !== undefined && enemy.gridX !== undefined) {
    const dist = gridDist(enemy.gridX, enemy.gridZ, target.gridX, target.gridZ);
    if (dist > atkRange) {
      logs.push(`${enemy.name} не может достать до цели.`);
      return logs;
    }
    if (room.combatGrid && !hasLineOfSight(room.combatGrid.grid, enemy.gridX, enemy.gridZ, target.gridX, target.gridZ)) {
      const alternate = alivePlayers.find(p =>
        p !== target && p.gridX !== undefined &&
        gridDist(enemy.gridX, enemy.gridZ, p.gridX, p.gridZ) <= atkRange &&
        hasLineOfSight(room.combatGrid.grid, enemy.gridX, enemy.gridZ, p.gridX, p.gridZ)
      );
      if (alternate) { target = alternate; }
      else { logs.push(`${enemy.name} не видит цели сквозь стену.`); return logs; }
    }
  }

  // Dodge check
  const dodgeChance = Math.min(0.20, (target.speed || 0) * 0.008);
  if (dodgeChance > 0 && Math.random() < dodgeChance) {
    logs.push(`${target.name} уклоняется от атаки ${enemy.name}!`);
    return logs;
  }

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

    // ── Newly implemented abilities ──────────────────────────────────────────

    case 'stun_bash': {
      const { damage, isCrit } = calculateDamage(enemy, target, 1.0);
      const { finalDamage } = applyDamage(target, damage);
      addEffect(target, { type: 'stun', value: 1, duration: 1 });
      logs.push(`${enemy.name} оглушает ${target.name} ударом: ${finalDamage} урона${isCrit ? ' [КРИТ!]' : ''}! ${target.name} оглушён.`);
      if (!target.isAlive) logs.push(`${target.name} пал в бою...`);
      break;
    }

    case 'throw_trap': {
      const { damage } = calculateDamage(enemy, target, 1.2);
      const { finalDamage } = applyDamage(target, damage);
      addEffect(target, { type: 'slow', value: 1, duration: 2 });
      logs.push(`${enemy.name} бросает ловушку в ${target.name}: ${finalDamage} урона, замедление на 2 хода!`);
      if (!target.isAlive) logs.push(`${target.name} пал в бою...`);
      break;
    }

    case 'feral_bite': {
      const { damage, isCrit } = calculateDamage(enemy, target, 1.8);
      const { finalDamage } = applyDamage(target, damage);
      logs.push(`${enemy.name} яростно кусает ${target.name}: ${finalDamage} урона${isCrit ? ' [КРИТ!]' : ''}!`);
      if (!target.isAlive) logs.push(`${target.name} пал в бою...`);
      break;
    }

    case 'howl': {
      addEffect(enemy, { type: 'attackBonus', value: 0.25, duration: 2 });
      logs.push(`${enemy.name} воет на луну — атака усилена на 25% на 2 хода!`);
      // Also make a normal attack this turn
      const { damage } = calculateDamage(enemy, target);
      const { finalDamage } = applyDamage(target, damage);
      logs.push(`${enemy.name} атакует ${target.name} на ${finalDamage} урона.`);
      if (!target.isAlive) logs.push(`${target.name} пал в бою...`);
      break;
    }

    case 'web_trap': {
      const { damage } = calculateDamage(enemy, target, 0.7);
      const { finalDamage } = applyDamage(target, damage);
      addEffect(target, { type: 'slow', value: 1, duration: 2 });
      logs.push(`${enemy.name} опутывает ${target.name} паутиной: ${finalDamage} урона, движение заблокировано на 2 хода!`);
      if (!target.isAlive) logs.push(`${target.name} пал в бою...`);
      break;
    }

    case 'shadow_bind': {
      const { damage } = calculateDamage(enemy, target, 0.8);
      const { finalDamage } = applyDamage(target, damage);
      addEffect(target, { type: 'defenseDebuff', value: 0.25, duration: 2 });
      addEffect(target, { type: 'attackDebuff', value: 0.15, duration: 2 });
      logs.push(`${enemy.name} оплетает ${target.name} тьмой: ${finalDamage} урона. Защита −25%, атака −15% на 2 хода.`);
      if (!target.isAlive) logs.push(`${target.name} пал в бою...`);
      break;
    }

    case 'drain': {
      const { damage } = calculateDamage(enemy, target, 1.3);
      const { finalDamage } = applyDamage(target, damage);
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.floor(finalDamage * 0.6));
      logs.push(`${enemy.name} высасывает жизненную силу из ${target.name}: ${finalDamage} урона. Враг восстанавливает HP!`);
      if (!target.isAlive) logs.push(`${target.name} пал в бою...`);
      break;
    }

    case 'wing_buffet': {
      logs.push(`${enemy.name} бьёт крыльями!`);
      for (const p of alivePlayers) {
        const { damage } = calculateDamage(enemy, p, 0.9);
        const { finalDamage } = applyDamage(p, damage);
        if (Math.random() < 0.40) {
          addEffect(p, { type: 'stun', value: 1, duration: 1 });
          logs.push(`  → ${p.name}: ${finalDamage} урона, оглушён!`);
        } else {
          logs.push(`  → ${p.name}: ${finalDamage} урона.`);
        }
        if (!p.isAlive) logs.push(`${p.name} пал в бою...`);
      }
      break;
    }

    case 'screech': {
      logs.push(`${enemy.name} издаёт пронзительный крик!`);
      for (const p of alivePlayers) {
        addEffect(p, { type: 'attackDebuff', value: 0.20, duration: 2 });
      }
      logs.push(`Все союзники подавлены — атака снижена на 20% на 2 хода!`);
      break;
    }

    case 'death_bolt': {
      const { damage, isCrit } = calculateDamage(enemy, target, 2.2);
      const { finalDamage } = applyDamage(target, damage);
      logs.push(`${enemy.name} выпускает смертоносный разряд в ${target.name}: ${finalDamage} некро-урона${isCrit ? ' [КРИТ!]' : ''}!`);
      if (!target.isAlive) logs.push(`${target.name} пал в бою...`);
      break;
    }

    case 'raise_dead': {
      const deadEnemies = room.enemies.filter(e => !e.isAlive);
      if (deadEnemies.length > 0) {
        const revived = deadEnemies[Math.floor(Math.random() * deadEnemies.length)];
        revived.isAlive = true;
        revived.hp = Math.floor(revived.maxHp * 0.35);
        revived.effects = [];
        logs.push(`☠ ${enemy.name} поднимает из мёртвых ${revived.name}! (${revived.hp} HP)`);
      } else {
        // No dead to revive — do normal attack instead
        const { damage } = calculateDamage(enemy, target);
        const { finalDamage } = applyDamage(target, damage);
        logs.push(`${enemy.name} атакует ${target.name} на ${finalDamage} урона.`);
        if (!target.isAlive) logs.push(`${target.name} пал в бою...`);
      }
      break;
    }

    case 'charm': {
      addEffect(target, { type: 'stun', value: 1, duration: 1 });
      logs.push(`${enemy.name} очаровывает ${target.name}! ${target.name} поддаётся иллюзии и пропускает следующий ход.`);
      break;
    }

    case 'hellfire': {
      logs.push(`${enemy.name} выпускает адское пламя!`);
      for (const p of alivePlayers) {
        const { damage } = calculateDamage(enemy, p, 1.3);
        const { finalDamage } = applyDamage(p, damage);
        logs.push(`  → ${p.name}: ${finalDamage} урона огнём!`);
        if (!p.isAlive) logs.push(`${p.name} пал в бою...`);
      }
      break;
    }

    case 'devour': {
      const { damage } = calculateDamage(enemy, target, 2.5);
      const { finalDamage } = applyDamage(target, damage);
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.floor(finalDamage * 0.7));
      logs.push(`${enemy.name} ПОЖИРАЕТ ${target.name}: ${finalDamage} урона! Враг восстанавливает силы.`);
      if (!target.isAlive) logs.push(`${target.name} пал в бою...`);
      break;
    }

    case 'chaos_bolt': {
      const randomTarget = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
      const mult = 2.8 + Math.random() * 1.4;
      const { damage, isCrit } = calculateDamage(enemy, randomTarget, mult);
      const { finalDamage } = applyDamage(randomTarget, damage);
      logs.push(`${enemy.name} выпускает заряд хаоса в ${randomTarget.name}: ${finalDamage} урона${isCrit ? ' [КРИТ!]' : ''}!`);
      if (!randomTarget.isAlive) logs.push(`${randomTarget.name} пал в бою...`);
      break;
    }

    case 'ice_breath': {
      logs.push(`${enemy.name} выдыхает ледяной холод!`);
      for (const p of alivePlayers) {
        const { damage } = calculateDamage(enemy, p, 1.2);
        const { finalDamage } = applyDamage(p, damage);
        addEffect(p, { type: 'slow', value: 1, duration: 2 });
        logs.push(`  → ${p.name}: ${finalDamage} ледяного урона, замедлен на 2 хода.`);
        if (!p.isAlive) logs.push(`${p.name} пал в бою...`);
      }
      break;
    }

    case 'poison_spray': {
      logs.push(`${enemy.name} распыляет ядовитые споры!`);
      for (const p of alivePlayers) {
        addEffect(p, { type: 'poison', value: 0.06, duration: 3 });
        logs.push(`  → ${p.name} отравлен на 3 хода.`);
      }
      break;
    }

    case 'spawn_spiders': {
      logs.push(`${enemy.name} призывает паучье потомство!`);
      for (const p of alivePlayers) {
        const { damage } = calculateDamage(enemy, p, 0.5);
        const { finalDamage } = applyDamage(p, damage);
        addEffect(p, { type: 'poison', value: 0.05, duration: 2 });
        logs.push(`  → ${p.name}: ${finalDamage} урона от паучьей стаи, отравлен на 2 хода.`);
        if (!p.isAlive) logs.push(`${p.name} пал в бою...`);
      }
      break;
    }

    case 'curse': {
      addEffect(target, { type: 'attackDebuff', value: 0.30, duration: 2 });
      addEffect(target, { type: 'defenseDebuff', value: 0.30, duration: 2 });
      logs.push(`${enemy.name} проклинает ${target.name}! Атака и защита снижены на 30% на 2 хода.`);
      break;
    }

    case 'arrow_shot': {
      const { damage, isCrit } = calculateDamage(enemy, target, 1.5);
      const { finalDamage, blocked } = applyDamage(target, damage);
      if (blocked) logs.push(`${enemy.name} стреляет в ${target.name} — заблокировано!`);
      else {
        logs.push(`${enemy.name} выпускает стрелу в ${target.name}: ${finalDamage} урона${isCrit ? ' [КРИТ!]' : ''}!`);
        if (!target.isAlive) logs.push(`${target.name} пал в бою...`);
      }
      break;
    }

    case 'poison_arrow': {
      const { damage } = calculateDamage(enemy, target, 1.2);
      const { finalDamage } = applyDamage(target, damage);
      addEffect(target, { type: 'poison', value: 0.07, duration: 3 });
      logs.push(`${enemy.name} выпускает отравленную стрелу в ${target.name}: ${finalDamage} урона! Отравление на 3 хода.`);
      if (!target.isAlive) logs.push(`${target.name} пал в бою...`);
      break;
    }

    case 'multishot': {
      logs.push(`${enemy.name} выпускает залп стрел!`);
      const msTargets = [...alivePlayers].sort(() => Math.random() - 0.5).slice(0, Math.min(3, alivePlayers.length));
      for (const t of msTargets) {
        const { damage: dm, isCrit: cm } = calculateDamage(enemy, t, 1.2);
        const { finalDamage: fdm } = applyDamage(t, dm);
        logs.push(`  → ${t.name}: ${fdm} урона${cm ? ' [КРИТ!]' : ''}!`);
        if (!t.isAlive) logs.push(`${t.name} пал в бою...`);
      }
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
  tickEffects,
  tickAllEffects,
  calculateDamage,
  applyDamage,
  initializeCombatGrid,
  processMoveAction,
  processSingleEnemyTurn,
  getMoveRange,
  getAttackRange,
  gridDist,
  bfsReachable,
  hasLineOfSight
};
