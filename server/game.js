'use strict';

const { v4: uuidv4 } = require('uuid');
const { createCharacter, recalcStats } = require('./classes');
const { generateFloor, getAvailableRooms, getPlayerScaling, generateFloorBossReward, applyFloorBossReward } = require('./mapGenerator');
const { processPlayerAction, processEnemyTurns, awardExpAndLoot, resetActed, tickEffects, tickAllEffects, initializeCombatGrid, processMoveAction, processSingleEnemyTurn, getMoveRange, getAttackRange, gridDist, bfsReachable } = require('./combat');
const { createMinigame, processMinigameAction, getMinigameClientState } = require('./minigames');
const { getCurrentBonus, applyBonusToCharacter } = require('./bonuses');
const { applyLegacyPerks } = require('./meta');

const GAME_PHASE = {
  LOBBY: 'lobby',
  CLASS_SELECT: 'class_select',
  PLAYING: 'playing',
  VOTING: 'voting',
  DOOR_CHALLENGE: 'door_challenge',
  GAME_OVER: 'game_over',
  VICTORY: 'victory'
};

const DOOR_FORCE_DAMAGE_PCT = 0.15; // % of maxHp all players take when forcing door
const MAX_INVENTORY = 8;

const VOTE_TIMEOUT = 30000;
const MAX_FLOORS = 5;

class GameRoom {
  constructor(roomId, hostId) {
    this.id = roomId;
    this.hostId = hostId;
    this.phase = GAME_PHASE.LOBBY;
    this.players = {};
    this.floor = null;
    this.floorNumber = 1;
    this.combatLog = [];
    this.chatLog = [];
    this.vote = null;
    this.voteTimer = null;
    this.doorChallenge = null;
    this.turnPhase = 'player';
    this.io = null;
    this.createdAt = Date.now();
    this.lootRoundIndex = 0;
    this.synergies = {};
  }

  addPlayer(socketId, playerName) {
    if (Object.keys(this.players).length >= 4) return null;
    if (this.phase !== GAME_PHASE.LOBBY) return null;

    const sessionToken = uuidv4().replace(/-/g, '').substr(0, 12).toUpperCase();
    this.players[socketId] = {
      socketId,
      name: playerName,
      isHost: socketId === this.hostId,
      isReady: false,
      classId: null,
      character: null,
      isConnected: true,
      sessionToken
    };
    return sessionToken;
  }

  getPlayerByToken(token) {
    return Object.values(this.players).find(p => p.sessionToken === token) || null;
  }

  removePlayer(socketId) {
    if (!this.players[socketId]) return;
    this.players[socketId].isConnected = false;

    const activePhases = [GAME_PHASE.PLAYING, GAME_PHASE.VOTING, GAME_PHASE.CLASS_SELECT, GAME_PHASE.DOOR_CHALLENGE];
    if (activePhases.includes(this.phase)) {
      this.addLog(`⚠ ${this.players[socketId].name} отключился.`);
      if (this.players[socketId].character) {
        this.players[socketId].character.isAI = true;
      }
    } else {
      delete this.players[socketId];
    }

    if (socketId === this.hostId) {
      const remaining = Object.keys(this.players).filter(id => this.players[id].isConnected);
      if (remaining.length > 0) {
        this.hostId = remaining[0];
        this.players[remaining[0]].isHost = true;
        this.addLog(`${this.players[remaining[0]].name} стал новым хостом.`);
      }
    }
  }

  reconnectPlayer(newSocketId, sessionToken) {
    const player = this.getPlayerByToken(sessionToken);
    if (!player) return false;
    const oldSocketId = player.socketId;
    player.socketId = newSocketId;
    player.isConnected = true;
    if (player.character) player.character.isAI = false;
    this.players[newSocketId] = player;
    if (oldSocketId !== newSocketId) delete this.players[oldSocketId];
    return true;
  }

  setPlayerClass(socketId, classId) {
    if (!this.players[socketId]) return false;
    if (this.phase !== GAME_PHASE.CLASS_SELECT) return false;
    this.players[socketId].classId = classId;
    return true;
  }

  setPlayerReady(socketId, ready) {
    if (!this.players[socketId]) return false;
    this.players[socketId].isReady = ready;
    return true;
  }

  startClassSelect() {
    if (Object.keys(this.players).length === 0) return false;
    this.phase = GAME_PHASE.CLASS_SELECT;
    return true;
  }

  startGame() {
    const players = Object.values(this.players);
    const allReady = players.every(p => p.isReady && p.classId);
    if (!allReady) return { ok: false, reason: 'Не все игроки готовы или выбрали класс.' };

    const { bonus } = getCurrentBonus();
    for (const p of players) {
      p.character = createCharacter(p.classId, p.name, p.socketId);
      // Apply legacy perks BEFORE recalcStats so stat bonuses propagate
      const appliedPerks = applyLegacyPerks(p.character, p.name);
      recalcStats(p.character);
      if (appliedPerks.length > 0) {
        const perkNames = appliedPerks.map(pk => `${pk.icon} ${pk.name}`).join(', ');
        this.addLog(`🏆 ${p.name} несёт наследие: ${perkNames}`);
      }
      applyBonusToCharacter(p.character, bonus);
    }
    if (bonus) {
      this.addLog(`🌟 Активный бонус: ${bonus.title} — ${bonus.desc}`);
    }

    // Group synergies
    this.synergies = {};
    const classIds = players.map(p => p.classId);
    const uniqueClasses = new Set(classIds);
    if (classIds.includes('warrior') && classIds.includes('cleric')) {
      this.synergies.warriorClericShield = true;
      this.addLog('⚔✚ Синергия: Воин + Жрец — Воин защищён от первого удара каждого боя!');
    }
    if (uniqueClasses.size === 4) {
      this.synergies.fullTeamBonus = true;
      this.addLog('★ Идеальный состав! +10% к опыту за каждого врага.');
    }
    if (classIds.filter(c => c === 'mage').length >= 2) {
      this.synergies.doubleMage = true;
      this.addLog('✦✦ Двойной маг! Маги получают +5 MP ежеход дополнительно.');
    }
    if (classIds.includes('rogue') && classIds.includes('mage')) {
      this.synergies.rogueMageShadow = true;
      this.addLog('†✦ Синергия: Плут + Маг — "Теневая магия": криты плута восстанавливают 8 MP магу!');
    }
    if (classIds.includes('warrior') && classIds.includes('rogue')) {
      this.synergies.warriorRogueIronShadow = true;
      this.addLog('⚔† Синергия: Воин + Плут — "Железная тень": пока воин в провокации следующая атака плута — гарантированный крит!');
    }
    if (classIds.includes('mage') && classIds.includes('cleric')) {
      this.synergies.mageClericHolyArcana = true;
      this.addLog('✦✚ Синергия: Маг + Жрец — "Святая аркана": исцеление жреца снимает один дебафф с цели!');
    }

    const playerCount = players.length;
    this.floor = generateFloor(this.floorNumber, playerCount);
    this.phase = GAME_PHASE.PLAYING;
    this.combatLog = [];
    this.addLog('=== Добро пожаловать в подземелье! Удачи, авантюристы... ===');
    const scaling = getPlayerScaling(playerCount);
    this.addLog(`⚔ Режим: ${scaling.label} | ${scaling.minEnemies}-${scaling.maxEnemies} врагов в боевых комнатах`);
    this.enterRoom(0);

    return { ok: true };
  }

  rollInitiative(room) {
    const logs = [];
    const players = Object.values(this.players).filter(p => p.character?.isAlive);
    const enemies = room.enemies.filter(e => e.isAlive);
    const rolls = [];

    for (const p of players) {
      const roll = Math.floor(Math.random() * 20) + 1;
      const spd = p.character.speed || 0;
      const bonus = Math.floor(spd / 2);
      const total = roll + bonus;
      rolls.push({ id: p.socketId, name: p.name, symbol: p.character.symbol, roll, bonus, total, isPlayer: true });
      logs.push(`  ${p.character.symbol} ${p.name}: к20 = ${roll}${bonus > 0 ? ` +${bonus}` : ''} → [${total}]`);
    }

    for (const e of enemies) {
      const roll = Math.floor(Math.random() * 20) + 1;
      rolls.push({ id: e.id, name: e.name, symbol: e.symbol, roll, bonus: 0, total: roll, isPlayer: false, isBoss: e.isBoss || false });
      logs.push(`  ${e.symbol} ${e.name}: к20 = ${roll} → [${roll}]`);
    }

    rolls.sort((a, b) => b.total - a.total || (a.isPlayer ? -1 : 1));
    room.initiativeOrder = rolls;

    return logs;
  }

  enterRoom(roomIndex) {
    const room = this.floor.rooms[roomIndex];
    this.floor.currentRoomIndex = roomIndex;
    room.isVisited = true;

    this.addLog(`--- ${room.name} ---`);
    this.addLog(room.description);

    if (room.type === 'combat' || room.type === 'boss') {
      // Reset Rogue first-attack passive each combat
      // Apply starting cooldowns to powerful abilities at start of each fight
      const STARTING_COOLDOWNS = {
        fireball: 1, chain_lightning: 1, whirlwind: 1,
        backstab: 1, execute: 1, divine_shield: 1
      };
      for (const p of Object.values(this.players)) {
        if (p.character) {
          p.character.firstAttackUsed = false;
          for (const ability of (p.character.abilities || [])) {
            const startCD = STARTING_COOLDOWNS[ability.id];
            if (startCD !== undefined && ability.currentCooldown < startCD) {
              ability.currentCooldown = startCD;
            }
          }
        }
      }
      // Warrior+Cleric synergy: Warrior absorbs first hit of each combat
      if (this.synergies.warriorClericShield) {
        for (const p of Object.values(this.players)) {
          if (p.character?.classId === 'warrior' && p.character?.isAlive) {
            p.character.effects = p.character.effects || [];
            if (!p.character.effects.some(e => e.type === 'absorbHit')) {
              p.character.effects.push({ type: 'absorbHit', value: 1, duration: 2 });
            }
          }
        }
        this.addLog('✚ Аура жреца: Воин поглотит первый удар!');
      }

      const enemyNames = room.enemies.map(e => `${e.symbol} ${e.name} (${e.hp}HP)`).join(', ');
      this.addLog(`Враги: ${enemyNames}`);
      this.addLog(`⚄ Бросок инициативы:`);
      const initLogs = this.rollInitiative(room);
      for (const log of initLogs) this.addLog(log);
      const orderStr = room.initiativeOrder.map(r => `${r.symbol}${r.name}`).join(' → ');
      this.addLog(`Порядок ходов: ${orderStr}`);

      // Initialize combat grid
      const gameState = this.getGameState();
      room.combatGrid = initializeCombatGrid(gameState.players, room.enemies);
      this.syncFromGameState(gameState);

      // Start individual turn tracking
      room.currentTurnIndex = 0;
      this._startTurnForCurrent(room);
    } else if (room.type === 'rest') {
      this.applyRestBonus(room);
      this.startVoting();
    } else if (room.type === 'treasure') {
      this.addLog('Вы находите сокровища! Подберите предметы и нажмите "Идти дальше".');
    } else if (room.type === 'merchant') {
      this.addLog('⚖ Загадочный торговец расставил товары. Торгуйтесь, пока есть время!');
      if (room.shopItems?.length) {
        const itemList = room.shopItems.map(i => `${i.name} — ${i.price}💰`).join(' | ');
        this.addLog(`Товары: ${itemList}`);
      }
    } else if (room.type === 'start') {
      this.addLog('Выберите следующую комнату.');
      this.startVoting();
    }
  }

  applyRestBonus(room) {
    const players = Object.values(this.players).filter(p => p.character?.isAlive);
    for (const p of players) {
      const heal = Math.floor(p.character.maxHp * (room.restBonus?.hpPercent || 0.3));
      p.character.hp = Math.min(p.character.maxHp, p.character.hp + heal);
      const manaRestore = Math.floor(p.character.maxMp * 0.4);
      p.character.mp = Math.min(p.character.maxMp, p.character.mp + manaRestore);
    }
    this.addLog(`Группа отдыхает. HP и мана восстановлены.`);
    room.isCleared = true;
  }

  requestProceed(socketId) {
    const room = this.floor.rooms[this.floor.currentRoomIndex];
    if (!room.isCleared) return;
    if (this.phase !== GAME_PHASE.PLAYING) return;
    this.startVoting();
  }

  // Start the turn for the entity at room.currentTurnIndex
  _startTurnForCurrent(room) {
    if (!room.initiativeOrder || !room.initiativeOrder.length) return;

    const entity = room.initiativeOrder[room.currentTurnIndex];
    if (!entity) return;

    if (entity.isPlayer) {
      const conn = this.players[entity.id];
      const player = conn?.character;
      if (player) { player.hasMoved = false; player.hasActed = false; }

      // Poison damage at start of player turn, then tick all player effects
      if (player?.isAlive) {
        const poisonEff = player.effects?.find(e => e.type === 'poison');
        if (poisonEff) {
          const dmg = Math.floor(player.maxHp * poisonEff.value);
          player.hp = Math.max(0, player.hp - dmg);
          this.addLog(`☠ ${entity.name} получает ${dmg} урона от яда.`);
          if (player.hp === 0) {
            player.isAlive = false;
            tickEffects(player);
            this.addLog(`${entity.name} погибает от яда...`);
            if (this.io) this.io.to(this.id).emit('room_update', this.getClientState());
            this._advanceCombatTurn(room);
            return;
          }
        }
        tickEffects(player);
      }

      // Mana regen at start of player turn (base + passive extraMpRegen)
      if (player?.isAlive && player.maxMp > 0) {
        const extraRegen = player.passives?.extraMpRegen || 0;
        player.mp = Math.min(player.maxMp, player.mp + 5 + extraRegen);
      }
      // Double mage synergy: extra 5 MP regen for mages
      if (player?.isAlive && player.classId === 'mage' && this.synergies?.doubleMage) {
        player.mp = Math.min(player.maxMp, player.mp + 5);
      }
      // Cleric passive aura: heal all alive allies (amount from passive or default 3)
      if (player?.classId === 'cleric' && player?.isAlive) {
        const allies = Object.values(this.players).filter(p => p.character?.isAlive && p.socketId !== entity.id);
        if (allies.length > 0) {
          const auraHeal = player.passives?.clericAuraBonus || 3;
          for (const ally of allies) ally.character.hp = Math.min(ally.character.maxHp, ally.character.hp + auraHeal);
          this.addLog(`✚ Аура исцеления: союзники восстанавливают ${auraHeal} HP.`);
        }
      }
      // Tick cooldowns
      if (player) {
        for (const ability of (player.abilities || [])) {
          if (ability.currentCooldown > 0) ability.currentCooldown--;
        }
      }

      if (conn && !conn.isConnected) {
        // Disconnected player: auto-attack after short delay to avoid sync stack overflow
        this.addLog(`--- Ход: ${entity.name} (авто) ---`);
        setTimeout(() => {
          if (this.phase !== GAME_PHASE.PLAYING) return;
          if (room.isCleared) return; // Баг 2 (AI): комната уже очищена
          const aliveEnemies = room.enemies.filter(e => e.isAlive);
          if (aliveEnemies.length === 0 || !player.isAlive || player.hasActed) return;
          const gameState = this.getGameState();
          const { logs } = processPlayerAction(gameState, entity.id, { type: 'attack', targetId: aliveEnemies[0].id });
          for (const log of logs) this.addLog(log);
          this.syncFromGameState(gameState);
          this._advanceCombatTurn(room);
          if (this.io) this.io.to(this.id).emit('room_update', this.getClientState());
        }, 500);
      } else {
        this.addLog(`--- Ход: ${entity.name} ---`);
      }
    } else {
      // Enemy turn: auto-resolve immediately
      this._executeEnemyTurnById(room, entity.id);
    }
  }

  // Advance to the next turn in initiative order
  _advanceCombatTurn(room) {
    // Guard: игнорировать устаревшие вызовы (например из setTimeout) если комната уже очищена
    if (room.isCleared) return;

    const total = room.initiativeOrder.length;
    if (!total) return;

    let attempts = 0;
    let nextIndex = (room.currentTurnIndex + 1) % total;

    while (attempts < total) {
      const entity = room.initiativeOrder[nextIndex];
      const isAlive = entity.isPlayer
        ? this.players[entity.id]?.character?.isAlive
        : room.enemies.find(e => e.id === entity.id)?.isAlive;

      if (isAlive) break;
      nextIndex = (nextIndex + 1) % total;
      attempts++;
    }

    // Check end conditions before advancing
    const aliveEnemies = room.enemies.filter(e => e.isAlive);
    const alivePlayers = Object.values(this.players).filter(p => p.character?.isAlive);

    if (alivePlayers.length === 0) {
      this.phase = GAME_PHASE.GAME_OVER;
      this.addLog('=== ПОРАЖЕНИЕ! Вся группа пала. ===');
      if (this.io) this.io.to(this.id).emit('room_update', this.getClientState());
      return;
    }

    if (aliveEnemies.length === 0) {
      room.isCleared = true;
      const gameState = this.getGameState();
      const { logs, lootItems } = awardExpAndLoot(gameState, room.enemies.filter(e => !e.isAlive));
      this.syncFromGameState(gameState);
      for (const log of logs) this.addLog(log);
      if (lootItems?.length > 0) this.distributeLoot(lootItems);

      if (room.type === 'boss' && this.floorNumber >= MAX_FLOORS) {
        this.phase = GAME_PHASE.VICTORY;
        this.addLog('=== ПОБЕДА! Вы прошли подземелье! ===');
        if (this.io) this.io.to(this.id).emit('room_update', this.getClientState());
        return;
      }

      if (room.type === 'boss') {
        // ── Floor boss reward: give every alive player 3 relic choices ───────
        const alivePlayers = Object.values(this.players).filter(p => p.character?.isAlive);
        for (const p of alivePlayers) {
          const options = generateFloorBossReward(3);
          p.character.pendingFloorReward = { options, floorNumber: this.floorNumber };
        }
        this.addLog(`🏆 Босс повержен! Каждый герой выбирает боевую реликвию этажа.`);

        const summary = this._buildFloorSummary();
        if (this.io) this.io.to(this.id).emit('floor_complete', summary);
        if (this.io) this.io.to(this.id).emit('room_update', this.getClientState());
        // Delay next-floor voting until all players have chosen (or 20 s timeout)
        this._startFloorRewardTimeout();
        return;
      }

      this.startVoting();
      return;
    }

    room.currentTurnIndex = nextIndex;
    this._startTurnForCurrent(room);
    if (this.io) this.io.to(this.id).emit('room_update', this.getClientState());
  }

  // Execute a single enemy turn by id
  _executeEnemyTurnById(room, enemyId) {
    const enemy = room.enemies.find(e => e.id === enemyId);
    if (!enemy || !enemy.isAlive) {
      this._advanceCombatTurn(room);
      return;
    }

    const gameState = this.getGameState();
    const logs = processSingleEnemyTurn(gameState, enemy);
    this.syncFromGameState(gameState);
    for (const log of logs) this.addLog(log);

    if (this.io) this.io.to(this.id).emit('room_update', this.getClientState());

    // Small delay to let client see the update before advancing
    // Баг 2: проверяем что room не устарела (не была очищена пока таймер висел)
    setTimeout(() => {
      if (room.isCleared) return;
      this._advanceCombatTurn(room);
    }, 600);
  }

  processAction(socketId, action) {
    if (this.phase !== GAME_PHASE.PLAYING) return;
    const player = this.players[socketId];
    if (!player?.character) return;

    const room = this.floor.rooms[this.floor.currentRoomIndex];
    const isCombat = room.type === 'combat' || room.type === 'boss';

    // In combat rooms: enforce turn order
    if (isCombat && room.initiativeOrder && room.initiativeOrder.length) {
      const currentTurn = room.initiativeOrder[room.currentTurnIndex];
      if (!currentTurn || !currentTurn.isPlayer || currentTurn.id !== socketId) {
        if (this.io) this.io.to(this.id).emit('log', { ts: Date.now(), msg: 'Сейчас не ваш ход!' });
        return;
      }

      // Handle movement separately
      if (action.type === 'move') {
        const gameState = this.getGameState();
        const { logs, stateChanged } = processMoveAction(gameState, socketId, action.x, action.z);
        this.syncFromGameState(gameState);
        for (const log of logs) this.addLog(log);
        if (this.io) this.io.to(this.id).emit('room_update', this.getClientState());
        return;
      }
    }

    const gameState = this.getGameState();
    const { logs, stateChanged } = processPlayerAction(gameState, socketId, action);
    this.syncFromGameState(gameState);
    for (const log of logs) this.addLog(log);

    if (stateChanged) {
      if (isCombat) {
        this._advanceCombatTurn(room);
      } else {
        if (this.io) this.io.to(this.id).emit('room_update', this.getClientState());
      }
    } else {
      if (this.io) this.io.to(this.id).emit('room_update', this.getClientState());
    }
  }

  // Legacy stub kept for non-combat use (door challenge cleanup etc.)
  executeEnemyTurn() {
    const room = this.floor.rooms[this.floor.currentRoomIndex];
    if (room?.currentTurnIndex !== undefined) return; // handled by individual turns
    // Fallback for rooms without grid
    const gameState = this.getGameState();
    const logs = processEnemyTurns(gameState);
    tickAllEffects(gameState);
    this.syncFromGameState(gameState);
    for (const log of logs) this.addLog(log);
    resetActed(gameState);
    this.syncFromGameState(gameState);
  }

  processAIPlayers() {
    const room = this.floor.rooms[this.floor.currentRoomIndex];
    for (const player of Object.values(this.players)) {
      if (!player.character?.isAlive || player.character.hasActed) continue;
      if (!player.character.isAI && player.isConnected) continue;
      const aliveEnemies = room.enemies.filter(e => e.isAlive);
      if (!aliveEnemies.length) continue;
      this.processAction(player.socketId, { type: 'attack', targetId: aliveEnemies[0].id });
    }
  }

  startVoting() {
    const nextRooms = getAvailableRooms(this.floor);
    if (nextRooms.length === 0) {
      if (this.floorNumber < MAX_FLOORS) {
        this.nextFloor();
      } else {
        this.phase = GAME_PHASE.VICTORY;
        this.addLog('=== ПОБЕДА! Подземелье пройдено! ===');
      }
      return;
    }

    this.phase = GAME_PHASE.VOTING;
    this.vote = {
      options: nextRooms.map(r => ({ id: r.id, name: r.name, symbol: r.symbol, type: r.type, description: r.description, direction: r.direction, locked: !!r.locked })),
      votes: {},
      deadline: Date.now() + VOTE_TIMEOUT
    };

    this.addLog('=== Выберите следующую комнату! (30 секунд) ===');
    for (const opt of this.vote.options) {
      this.addLog(`  [${opt.id}] ${opt.symbol} ${opt.name} — ${opt.description}`);
    }

    if (this.voteTimer) clearTimeout(this.voteTimer);
    this.voteTimer = setTimeout(() => this.resolveVote(), VOTE_TIMEOUT);

    // Баг 1: отправить room_update всем клиентам чтобы они увидели фазу голосования
    if (this.io) this.io.to(this.id).emit('room_update', this.getClientState());
  }

  castVote(socketId, roomId) {
    if (this.phase !== GAME_PHASE.VOTING) return;
    if (!this.vote) return;

    const option = this.vote.options.find(o => o.id === roomId);
    if (!option) return;

    this.vote.votes[socketId] = roomId;
    const playerName = this.players[socketId]?.name || 'Неизвестный';
    this.addLog(`${playerName} голосует за: ${option.name}`);

    const connectedPlayers = Object.values(this.players).filter(p => p.isConnected && p.character?.isAlive);
    if (Object.keys(this.vote.votes).length >= connectedPlayers.length) {
      if (this.voteTimer) clearTimeout(this.voteTimer);
      this.resolveVote();
    }
  }

  resolveVote() {
    if (!this.vote) return;

    const tally = {};
    for (const roomId of Object.values(this.vote.votes)) {
      tally[roomId] = (tally[roomId] || 0) + 1;
    }

    let winner;
    if (Object.keys(tally).length === 0) {
      const idx = Math.floor(Math.random() * this.vote.options.length);
      winner = this.vote.options[idx].id;
      this.addLog('Никто не выбрал направление — группа идёт наугад!');
    } else {
      winner = this.vote.options[0].id;
      let maxVotes = 0;
      for (const [roomId, count] of Object.entries(tally)) {
        if (count > maxVotes) { maxVotes = count; winner = Number(roomId); }
      }
    }

    const winnerRoom = this.vote.options.find(o => o.id === winner);
    this.addLog(`Группа направляется в: ${winnerRoom?.name || 'следующую комнату'}`);

    this.vote = null;
    this.voteTimer = null;

    // Check if the chosen connection has a locked door
    if (winnerRoom?.locked) {
      this.phase = GAME_PHASE.DOOR_CHALLENGE;
      this.startDoorChallenge(winner);
    } else {
      this.phase = GAME_PHASE.PLAYING;
      this.resetPlayerActions();
      this.enterRoom(winner);
    }

    if (this.io) {
      this.io.to(this.id).emit('room_update', this.getClientState());
    }
  }

  startDoorChallenge(targetRoomIndex) {
    const room = this.floor.rooms[targetRoomIndex];
    this.doorChallenge = {
      targetRoomIndex,
      roomName: room.name,
      volunteerId: null,
      minigame: null,
      failedAttempts: 0,
      triedIds: new Set()
    };
    this.addLog(`🔒 ЗАКРЫТАЯ ДВЕРЬ! Путь в "${room.name}" преграждает запертая дверь.`);
    this.addLog(`Кто возьмётся за взлом? Нажмите "Взломать дверь" для участия.`);
    this.addLog(`💡 Плут взламывает замки лучше всех. Воин — тараном, Маг — магией, Жрец — молитвой.`);

    if (this.io) {
      this.io.to(this.id).emit('room_update', this.getClientState());
    }
  }

  volunteerForDoor(socketId) {
    if (this.phase !== GAME_PHASE.DOOR_CHALLENGE) return { ok: false, reason: 'Нет запертой двери.' };
    if (!this.doorChallenge) return { ok: false, reason: 'Нет данных о двери.' };
    if (this.doorChallenge.volunteerId) return { ok: false, reason: 'Кто-то уже взламывает дверь.' };

    const player = this.players[socketId];
    if (!player?.character?.isAlive) return { ok: false, reason: 'Мёртвые не взламывают замки.' };
    if (this.doorChallenge.triedIds.has(socketId)) return { ok: false, reason: 'Вы уже пробовали — и не смогли.' };

    const classId = player.character.classId;
    const mg = createMinigame(classId);

    this.doorChallenge.volunteerId = socketId;
    this.doorChallenge.minigame    = mg;

    const nativeClass = { lockpick: 'Плут', tower_stack: 'Воин', arcane_sequence: 'Маг', holy_resonance: 'Жрец' };
    const typeNames   = { lockpick: 'Взлом замка', tower_stack: 'Таран', arcane_sequence: 'Магическая печать', holy_resonance: 'Святой резонанс' };
    const isNative    = player.character.classId === Object.keys({ rogue:'lockpick', warrior:'tower_stack', mage:'arcane_sequence', cleric:'holy_resonance' }).find(k => ({ rogue:'lockpick', warrior:'tower_stack', mage:'arcane_sequence', cleric:'holy_resonance' })[k] === mg.type);
    const nativeTip   = isNative ? ' (родная стихия!)' : ` (нативно для: ${nativeClass[mg.type]})`;

    this.addLog(`${player.name} берётся за дело: ${typeNames[mg.type]}${nativeTip}`);

    if (this.io) {
      this.io.to(this.id).emit('room_update', this.getClientState());
    }
    return { ok: true };
  }

  processDoorAction(socketId, action) {
    if (this.phase !== GAME_PHASE.DOOR_CHALLENGE) return;
    const dc = this.doorChallenge;
    if (!dc || dc.volunteerId !== socketId || !dc.minigame) return;

    const { logs, done, success } = processMinigameAction(dc.minigame, action);
    for (const log of logs) this.addLog(log);

    if (done) {
      dc.triedIds.add(socketId);
      dc.volunteerId = null;

      if (success) {
        this.addLog(`✓ Дверь открыта! Группа проходит вперёд.`);
        this.doorChallenge = null;
        this.phase = GAME_PHASE.PLAYING;
        this.resetPlayerActions();
        this.enterRoom(dc.targetRoomIndex);
      } else {
        dc.failedAttempts++;
        const alivePlayers = Object.values(this.players).filter(p => p.character?.isAlive && p.isConnected);
        const untried = alivePlayers.filter(p => !dc.triedIds.has(p.socketId));

        if (untried.length > 0 && dc.failedAttempts < 3) {
          this.addLog(`Попытка провалена. Ещё ${untried.length} игрок(ов) могут попробовать.`);
          dc.minigame = null;
        } else {
          // Force the door — everyone takes damage and gets debuffed
          this.addLog(`⚡ Дверь выбивают силой! Все получают урон и оглушение.`);
          for (const p of alivePlayers) {
            const dmg = Math.floor(p.character.maxHp * DOOR_FORCE_DAMAGE_PCT);
            p.character.hp = Math.max(1, p.character.hp - dmg);
            // Apply attack debuff for 2 turns
            p.character.effects = p.character.effects || [];
            const existing = p.character.effects.find(e => e.type === 'attackDebuff');
            if (existing) existing.duration = Math.max(existing.duration, 2);
            else p.character.effects.push({ type: 'attackDebuff', value: 0.15, duration: 2 });
            this.addLog(`  ${p.name} получает ${dmg} урона. Атака −15% на 2 хода.`);
          }
          this.doorChallenge = null;
          this.phase = GAME_PHASE.PLAYING;
          this.resetPlayerActions();
          this.enterRoom(dc.targetRoomIndex);
        }
      }
    }

    if (this.io) {
      this.io.to(this.id).emit('room_update', this.getClientState());
    }
  }

  solveRiddle(socketId, answer) {
    const room = this.floor.rooms[this.floor.currentRoomIndex];
    if (room.type !== 'riddle' || !room.riddle || room.riddle.solved) return;

    room.riddle.attempts++;
    const correct = room.riddle.answer.toLowerCase().trim() === answer.toLowerCase().trim();

    if (correct) {
      room.riddle.solved = true;
      room.isCleared = true;
      this.addLog(`✓ Верно! Загадка разгадана.`);

      const alivePlayers = Object.values(this.players).filter(p => p.character?.isAlive);
      for (const p of alivePlayers) {
        p.character.exp += room.riddle.reward.exp;
        p.character.gold += Math.floor(room.riddle.reward.gold / alivePlayers.length);
      }
      this.addLog(`Награда: ${room.riddle.reward.exp} опыта, ${room.riddle.reward.gold} золота.`);
      this.startVoting();
    } else {
      const player = this.players[socketId];
      const damage = Math.floor(player.character.maxHp * 0.2);
      player.character.hp = Math.max(1, player.character.hp - damage);
      this.addLog(`✗ Неверно! ${player.name} получает ${damage} урона (попытка ${room.riddle.attempts}).`);
      if (room.riddle.attempts >= 3) {
        this.addLog('Загадка провалена! Вы можете продолжить путь.');
        room.isCleared = true;
        this.startVoting();
      }
    }
  }

  skipSecret(socketId) {
    const room = this.floor.rooms[this.floor.currentRoomIndex];
    if (room.type !== 'secret' || room.isCleared) return;
    this.addLog('Группа решила не исследовать тайную комнату и двигается дальше.');
    room.isCleared = true;
    this.startVoting();
  }

  exploreSecret(socketId) {
    const room = this.floor.rooms[this.floor.currentRoomIndex];
    if (room.type !== 'secret' || room.secretRevealed) return;

    room.secretRevealed = true;
    const triggered = Math.random() < room.secretTrap.chance;

    if (triggered) {
      this.addLog('⚠ ЛОВУШКА! Тайная комната содержала ловушку!');
      for (const p of Object.values(this.players).filter(p => p.character?.isAlive)) {
        const dmg = room.secretTrap.damage;
        p.character.hp = Math.max(1, p.character.hp - dmg);
        this.addLog(`${p.name} получает ${dmg} урона.`);
      }
    } else {
      this.addLog('✓ Безопасно! Вы находите скрытые сокровища!');
      this.distributeLoot(room.secretLoot);
    }

    room.isCleared = true;
    this.startVoting();
  }

  // ── Equipment Methods ──────────────────────────────────────────────────────
  // Equip an item from inventory into a specific slot (or auto-detect slot)
  equipItem(socketId, itemId, preferredSlot) {
    const player = this.players[socketId];
    if (!player?.character) return { ok: false, reason: 'Персонаж не найден.' };
    if (!player.character.isAlive) return { ok: false, reason: 'Мёртвые не экипируют предметы.' };
    const ch = player.character;

    const idx = ch.inventory.findIndex(i => i.id === itemId);
    if (idx === -1) return { ok: false, reason: 'Предмет не найден в инвентаре.' };
    const item = ch.inventory[idx];

    const { canEquipItem, recalcStats } = require('./items');
    const { recalcStats: recalcS } = require('./classes');

    // Check class restriction
    if (!canEquipItem(ch, item)) {
      return { ok: false, reason: `${ch.className} не может использовать "${item.name}".` };
    }

    // Determine target slot — infer from type if slot field is missing (legacy items)
    const TYPE_TO_SLOT = {
      weapon: 'mainHand', armor: 'armor', helmet: 'helmet',
      pants: 'pants', boots: 'boots', ring: 'ring1',
      accessory: 'ring1', artifact: 'ring1'
    };
    const itemSlot = item.slot || TYPE_TO_SLOT[item.type] || null;
    let targetSlot = preferredSlot || itemSlot;
    // For weapons: if mainHand occupied and offHand free → auto-use offHand
    if (targetSlot === 'mainHand' && ch.equipment.mainHand && !ch.equipment.offHand) {
      targetSlot = 'offHand';
    }
    // For ring-type items: allow ring1 or ring2
    if (itemSlot === 'ring1' || itemSlot === 'ring2') {
      if (!preferredSlot || (preferredSlot !== 'ring1' && preferredSlot !== 'ring2')) {
        // Auto pick the empty ring slot, or ring1 if both occupied
        targetSlot = (!ch.equipment.ring1) ? 'ring1' : (!ch.equipment.ring2) ? 'ring2' : (preferredSlot || 'ring1');
      } else {
        targetSlot = preferredSlot;
      }
    }

    const validSlots = ['helmet','armor','pants','boots','mainHand','offHand','ring1','ring2'];
    if (!validSlots.includes(targetSlot)) return { ok: false, reason: 'Неверный слот экипировки.' };

    // If slot occupied → move old item to inventory
    const oldItem = ch.equipment[targetSlot];
    if (oldItem) {
      ch.inventory.push(oldItem);
    }

    // Move new item from inventory to slot
    ch.inventory.splice(idx, 1);
    ch.equipment[targetSlot] = item;

    recalcS(ch);

    const rarityNames = { common: 'Обычный', uncommon: 'Необычный', rare: 'Редкий', epic: 'Эпический', legendary: 'Легендарный' };
    const rarLabel = item.rarity ? ` [${rarityNames[item.rarity] || item.rarity}]` : '';
    this.addLog(`${player.name} экипирует: ${item.name}${rarLabel}.`);
    return { ok: true };
  }

  // Unequip item from a slot → move to inventory
  unequipItem(socketId, slot) {
    const player = this.players[socketId];
    if (!player?.character) return { ok: false, reason: 'Персонаж не найден.' };
    if (!player.character.isAlive) return { ok: false, reason: 'Нельзя снять экипировку сейчас.' };
    const ch = player.character;

    const validSlots = ['helmet','armor','pants','boots','mainHand','offHand','ring1','ring2'];
    if (!validSlots.includes(slot)) return { ok: false, reason: 'Неверный слот.' };

    const item = ch.equipment[slot];
    if (!item) return { ok: false, reason: 'Слот пуст.' };

    // Prevent unequipping last weapon if we have no alternative
    if (slot === 'mainHand' && !ch.equipment.offHand) {
      const hasInventoryWeapon = ch.inventory.some(i => i.type === 'weapon');
      if (!hasInventoryWeapon) {
        return { ok: false, reason: 'Нельзя снять последнее оружие!' };
      }
    }

    const MAX_BAG = 12;
    if (ch.inventory.length >= MAX_BAG) {
      return { ok: false, reason: `Рюкзак заполнен! Максимум ${MAX_BAG} предметов.` };
    }

    ch.equipment[slot] = null;
    ch.inventory.push(item);

    const { recalcStats } = require('./classes');
    recalcStats(ch);

    this.addLog(`${player.name} снимает: ${item.name}.`);
    return { ok: true };
  }

  distributeLoot(items) {
    const alivePlayers = Object.values(this.players).filter(p => p.character?.isAlive);
    if (alivePlayers.length === 0) return;
    const MAX_BAG = 12;

    for (const item of items) {
      if (item.type === 'gold') {
        const perPlayer = Math.floor(item.amount / alivePlayers.length);
        for (const p of alivePlayers) p.character.gold += perPlayer;
        this.addLog(`Найдено ${item.amount} золота (по ${perPlayer} каждому).`);
      } else {
        // Round-robin distribution — items go to bag (no auto-apply stats)
        let distributed = false;
        for (let attempt = 0; attempt < alivePlayers.length; attempt++) {
          const recipient = alivePlayers[this.lootRoundIndex % alivePlayers.length];
          this.lootRoundIndex++;
          if ((recipient.character.inventory?.length || 0) < MAX_BAG) {
            recipient.character.inventory.push({ ...item });
            const rarityNames = { common: 'Обычный', uncommon: 'Необычный', rare: 'Редкий', epic: 'Эпический', legendary: 'Легендарный' };
            const rar = item.rarity ? ` [${rarityNames[item.rarity] || ''}]` : '';
            this.addLog(`${recipient.name} получает: ${item.name}${rar}.`);
            distributed = true;
            break;
          }
        }
        if (!distributed) {
          this.addLog(`${item.name} никто не смог подобрать — рюкзаки полны.`);
        }
      }
    }
  }

  buyItem(socketId, itemId) {
    const room = this.floor.rooms[this.floor.currentRoomIndex];
    if (room.type !== 'merchant' || !room.shopItems) {
      return { ok: false, reason: 'Торговца здесь нет.' };
    }

    const itemIdx = room.shopItems.findIndex(i => i.id === itemId);
    if (itemIdx === -1) return { ok: false, reason: 'Предмет не найден или уже куплен.' };

    const item = room.shopItems[itemIdx];
    const player = this.players[socketId];
    if (!player?.character) return { ok: false, reason: 'Персонаж не найден.' };
    if (!player.character.isAlive) return { ok: false, reason: 'Мёртвые не покупают.' };
    const MAX_BAG = 12;

    if (player.character.gold < item.price) {
      return { ok: false, reason: `Недостаточно золота! Нужно: ${item.price}💰, у вас: ${player.character.gold}💰` };
    }
    if ((player.character.inventory?.length || 0) >= MAX_BAG) {
      return { ok: false, reason: `Рюкзак заполнен! Максимум ${MAX_BAG} предметов.` };
    }

    player.character.gold -= item.price;
    // Items go to bag — player equips manually
    player.character.inventory.push({ ...item });
    this.addLog(`${player.name} покупает "${item.name}" за ${item.price}💰.`);

    room.shopItems.splice(itemIdx, 1);
    return { ok: true };
  }

  dropItem(socketId, itemId) {
    const player = this.players[socketId];
    if (!player?.character) return { ok: false, reason: 'Персонаж не найден.' };
    if (!player.character.isAlive) return { ok: false, reason: 'Мёртвые не выбрасывают предметы.' };

    const idx = player.character.inventory.findIndex(i => i.id === itemId);
    if (idx === -1) return { ok: false, reason: 'Предмет не найден в рюкзаке.' };

    const item = player.character.inventory[idx];
    player.character.inventory.splice(idx, 1);
    this.addLog(`${player.name} выбрасывает "${item.name}".`);
    return { ok: true };
  }

  _getSellPrice(item) {
    if (item.price) return Math.max(5, Math.floor(item.price * 0.4));
    let val = 0;
    if (item.attackBonus)  val += item.attackBonus * 6;
    if (item.defenseBonus) val += item.defenseBonus * 6;
    if (item.maxHpBonus)   val += Math.abs(item.maxHpBonus);
    if (item.maxMpBonus)   val += item.maxMpBonus;
    if (item.healAmount)   val += Math.floor(item.healAmount * 0.35);
    // Rarity multiplier
    const rarMult = { common: 1, uncommon: 1.5, rare: 2.5, epic: 4, legendary: 8 };
    val *= (rarMult[item.rarity] || 1);
    return Math.max(5, Math.floor(val));
  }

  sellItem(socketId, itemId) {
    const room = this.floor.rooms[this.floor.currentRoomIndex];
    if (room.type !== 'merchant') {
      return { ok: false, reason: 'Торговца здесь нет.' };
    }

    const player = this.players[socketId];
    if (!player?.character) return { ok: false, reason: 'Персонаж не найден.' };
    if (!player.character.isAlive) return { ok: false, reason: 'Мёртвые не продают.' };

    const idx = player.character.inventory.findIndex(i => i.id === itemId);
    if (idx === -1) return { ok: false, reason: 'Предмет не найден в рюкзаке.' };

    const item = player.character.inventory[idx];
    const gold = this._getSellPrice(item);

    player.character.inventory.splice(idx, 1);
    player.character.gold += gold;

    this.addLog(`${player.name} продаёт "${item.name}" торговцу за ${gold}💰.`);
    return { ok: true };
  }

  // ── Floor boss reward helpers ─────────────────────────────────────────────
  _startFloorRewardTimeout() {
    if (this._floorRewardTimer) clearTimeout(this._floorRewardTimer);
    this._floorRewardTimer = setTimeout(() => {
      // Auto-pick first option for anyone who hasn't chosen yet
      for (const p of Object.values(this.players)) {
        if (p.character?.pendingFloorReward) {
          const first = p.character.pendingFloorReward.options[0];
          if (first) this._applyFloorReward(p.character, first.id);
        }
      }
      this.startVoting();
      if (this.io) this.io.to(this.id).emit('room_update', this.getClientState());
    }, 20000);
  }

  _applyFloorReward(character, rewardId) {
    const ok = applyFloorBossReward(character, rewardId);
    if (ok) recalcStats(character);
    character.pendingFloorReward = null;
  }

  chooseFloorReward(socketId, rewardId) {
    const player = this.players[socketId];
    if (!player?.character?.pendingFloorReward) return { ok: false, reason: 'Нет активного выбора реликвии.' };
    const valid = player.character.pendingFloorReward.options.find(o => o.id === rewardId);
    if (!valid) return { ok: false, reason: 'Недопустимый выбор.' };

    this._applyFloorReward(player.character, rewardId);
    this.addLog(`${player.name} выбирает реликвию: ${valid.icon} ${valid.name}`);

    this._checkFloorRewardsDone();
    if (this.io) this.io.to(this.id).emit('room_update', this.getClientState());
    return { ok: true };
  }

  _checkFloorRewardsDone() {
    const alivePlayers = Object.values(this.players).filter(p => p.character?.isAlive && p.isConnected);
    const allChosen = alivePlayers.every(p => !p.character.pendingFloorReward);
    if (allChosen) {
      if (this._floorRewardTimer) { clearTimeout(this._floorRewardTimer); this._floorRewardTimer = null; }
      setTimeout(() => {
        if (this.phase === GAME_PHASE.PLAYING) this.startVoting();
        if (this.io) this.io.to(this.id).emit('room_update', this.getClientState());
      }, 1500);
    }
  }

  nextFloor() {
    this.floorNumber++;
    const activeCount = Math.max(1, Object.values(this.players).filter(p => p.isConnected).length);
    this.floor = generateFloor(this.floorNumber, activeCount);
    this.phase = GAME_PHASE.PLAYING;
    this.addLog(`=== Этаж ${this.floorNumber} ===`);
    const scaling = getPlayerScaling(activeCount);
    this.addLog(`⚔ Активных игроков: ${activeCount} | Режим: ${scaling.label} | ${scaling.minEnemies}-${scaling.maxEnemies} врагов в комнатах`);
    this.enterRoom(0);
  }

  _buildFloorSummary() {
    const players = Object.values(this.players)
      .filter(p => p.character)
      .map(p => ({
        name: p.name,
        className: p.character.className,
        symbol: p.character.symbol,
        level: p.character.level,
        hp: p.character.hp,
        maxHp: p.character.maxHp,
        kills: p.character.kills || 0,
        gold: p.character.gold,
        isAlive: p.character.isAlive
      }));
    const recentLogs = this.combatLog.slice(-5).map(e => e.msg);
    return { floorNumber: this.floorNumber, players, recentLogs };
  }

  resetPlayerActions() {
    for (const p of Object.values(this.players)) {
      if (p.character) {
        p.character.hasActed = false;
        p.character.hasMoved = false;
      }
    }
  }

  addLog(message) {
    const entry = { ts: Date.now(), msg: message };
    this.combatLog.push(entry);
    if (this.combatLog.length > 200) this.combatLog.shift();
    if (this.io) {
      this.io.to(this.id).emit('log', entry);
    }
  }

  addChat(socketId, message) {
    const player = this.players[socketId];
    if (!player) return;
    const entry = { ts: Date.now(), sender: player.name, msg: message };
    this.chatLog.push(entry);
    if (this.chatLog.length > 100) this.chatLog.shift();
    if (this.io) {
      this.io.to(this.id).emit('chat', entry);
    }
  }

  getGameState() {
    const playerMap = {};
    for (const [socketId, p] of Object.entries(this.players)) {
      if (p.character) playerMap[socketId] = p.character;
    }
    return { players: playerMap, floor: this.floor, synergies: this.synergies || {} };
  }

  syncFromGameState(gameState) {
    for (const [socketId, character] of Object.entries(gameState.players)) {
      if (this.players[socketId]) {
        this.players[socketId].character = character;
      }
    }
    this.floor = gameState.floor;
  }

  getClientState() {
    const room = this.floor?.rooms[this.floor?.currentRoomIndex];
    return {
      roomId: this.id,
      phase: this.phase,
      floorNumber: this.floorNumber,
      players: Object.values(this.players).map(p => ({
        socketId: p.socketId,
        name: p.name,
        isHost: p.isHost,
        isReady: p.isReady,
        classId: p.classId,
        isConnected: p.isConnected,
        character: p.character ? {
          name: p.character.name,
          className: p.character.className,
          classId: p.character.classId,
          symbol: p.character.symbol,
          level: p.character.level,
          exp: p.character.exp,
          expToNext: p.character.expToNext,
          hp: p.character.hp,
          maxHp: p.character.maxHp,
          mp: p.character.mp,
          maxMp: p.character.maxMp,
          attack: p.character.attack,
          defense: p.character.defense,
          speed: p.character.speed || 0,
          kills: p.character.kills || 0,
          gold: p.character.gold,
          potions: p.character.potions,
          isAlive: p.character.isAlive,
          hasActed: p.character.hasActed,
          hasMoved: p.character.hasMoved,
          isDefending: p.character.isDefending,
          effects: p.character.effects,
          abilities: p.character.abilities,
          inventory: p.character.inventory,
          equipment: p.character.equipment,
          isAI: p.character.isAI,
          gridX: p.character.gridX,
          gridZ: p.character.gridZ,
          gridY: p.character.gridY ?? 0,
          ultKills: p.character.ultKills || 0,
          ultReady: p.character.ultReady || false,
          ultKillsNeeded: p.character.ultKillsNeeded || 5,
          ultName: p.character.ultName || '',
          ultDescription: p.character.ultDescription || '',
          passives: p.character.passives || {},
          pendingLevelUp: p.character.pendingLevelUp || null,
          pendingFloorReward: p.character.pendingFloorReward || null
        } : null
      })),
      currentRoom: room ? {
        id: room.id,
        type: room.type,
        name: room.name,
        symbol: room.symbol,
        description: room.description,
        isCleared: room.isCleared,
        enemies: room.enemies?.map(e => ({
          id: e.id,
          typeId: e.typeId,
          name: e.name,
          symbol: e.symbol,
          description: e.description || '',
          hp: e.hp,
          maxHp: e.maxHp,
          isAlive: e.isAlive,
          isBoss: e.isBoss,
          phase2Active: e.phase2Active || false,
          effects: e.effects,
          attackRange: e.attackRange || 1.5,
          gridX: e.gridX,
          gridZ: e.gridZ,
          gridY: e.gridY ?? 0
        })),
        initiativeOrder: room.initiativeOrder || null,
        currentTurnIndex: room.currentTurnIndex ?? null,
        currentTurnEntityId: (() => {
          if (!room.initiativeOrder || room.currentTurnIndex === undefined) return null;
          return room.initiativeOrder[room.currentTurnIndex]?.id ?? null;
        })(),
        combatGrid: room.combatGrid ? { size: room.combatGrid.size, grid: room.combatGrid.grid, theme: room.combatGrid.theme, elevations: room.combatGrid.elevations ?? null } : null,
        riddle: room.riddle ? {
          question: room.riddle.question,
          hint: room.riddle.hint,
          solved: room.riddle.solved,
          attempts: room.riddle.attempts
        } : null,
        secretRevealed: room.secretRevealed,
        secretRisk: room.secretTrap ? Math.round(room.secretTrap.chance * 100) : null,
        loot: room.isCleared ? room.loot : null,
        shopItems: room.shopItems || null
      } : null,
      mapOverview: this.floor?.rooms.map(r => {
        const visited = r.isVisited || r.id === this.floor?.currentRoomIndex;
        return {
          id: r.id,
          type: visited ? r.type : 'unknown',
          symbol: visited ? r.symbol : '?',
          name: visited ? r.name : 'Неизвестно',
          isVisited: r.isVisited,
          isCleared: r.isCleared,
          isCurrent: r.id === this.floor?.currentRoomIndex,
          mapX: r.mapX || 0,
          mapY: r.mapY || 0,
          connections: (r.connections || []).map(c => ({ to: c.to, direction: c.direction }))
        };
      }),
      vote: this.vote,
      combatLog: this.combatLog.slice(-20),
      turnPhase: this.turnPhase,
      doorChallenge: this.doorChallenge ? {
        targetRoomIndex: this.doorChallenge.targetRoomIndex,
        roomName: this.doorChallenge.roomName,
        volunteerId: this.doorChallenge.volunteerId,
        failedAttempts: this.doorChallenge.failedAttempts,
        triedIds: Array.from(this.doorChallenge.triedIds),
        minigame: this.doorChallenge.volunteerId ? getMinigameClientState(this.doorChallenge.minigame) : null
      } : null
    };
  }
}

module.exports = { GameRoom, GAME_PHASE };
