'use strict';

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { GameRoom, GAME_PHASE } = require('./game');
const { saveScore, getTopScores, savePlayerStats } = require('./database');
const { initBonusSystem, getCurrentBonus, getTimeUntilNext } = require('./bonuses');
const { applyLevelUpOption } = require('./classes');
const { getLegacy, updateLegacy, getLockedPerksWithHints } = require('./meta');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 30000,
  pingInterval: 10000
});

const PORT = process.env.PORT || 3000;
const rooms = new Map();

// ── Bonus system ──────────────────────────────────────────────────────────────
initBonusSystem((bonus, expiresAt) => {
  // Broadcast new bonus to all connected clients
  io.emit('bonus_update', { bonus, expiresAt });
  console.log(`[Bonus] New bonus: ${bonus.title} (expires in ${Math.round((expiresAt - Date.now()) / 60000)}min)`);
});

app.use(express.static(path.join(__dirname, '..', 'public'), {
  maxAge: 0,
  etag: false,
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-store');
  }
}));
app.use(express.json());

app.get('/api/scores', (req, res) => {
  res.json(getTopScores(10));
});

app.get('/api/bonus', (req, res) => {
  const { bonus, expiresAt } = getCurrentBonus();
  res.json({ bonus, expiresAt, timeUntilNext: getTimeUntilNext() });
});

app.get('/api/legacy/:playerName', (req, res) => {
  const name = req.params.playerName?.trim();
  if (!name) return res.status(400).json({ error: 'Укажите имя игрока.' });
  const legacy  = getLegacy(name);
  const locked  = getLockedPerksWithHints(name);
  res.json({ legacy, locked });
});

app.get('/api/rooms', (req, res) => {
  const list = [];
  for (const [id, room] of rooms) {
    if (room.phase === GAME_PHASE.LOBBY) {
      list.push({
        id,
        playerCount: Object.keys(room.players).length,
        hostName: room.players[room.hostId]?.name || 'Unknown'
      });
    }
  }
  res.json(list);
});

function cleanupRooms() {
  const now = Date.now();
  for (const [id, room] of rooms) {
    const connectedPlayers = Object.values(room.players).filter(p => p.isConnected);
    if (connectedPlayers.length === 0 && now - room.createdAt > 300000) {
      rooms.delete(id);
    }
  }
}
setInterval(cleanupRooms, 60000);

io.on('connection', (socket) => {
  console.log(`[+] Player connected: ${socket.id}`);
  // Send current bonus immediately on connect
  const { bonus, expiresAt } = getCurrentBonus();
  socket.emit('bonus_update', { bonus, expiresAt });

  socket.on('create_room', ({ playerName }, cb) => {
    if (!playerName?.trim()) return cb({ ok: false, reason: 'Укажите имя.' });
    if (playerName.length > 20) return cb({ ok: false, reason: 'Имя слишком длинное.' });

    const roomId = uuidv4().substr(0, 8).toUpperCase();
    const room = new GameRoom(roomId, socket.id);
    room.io = io;
    const sessionToken = room.addPlayer(socket.id, playerName.trim());
    rooms.set(roomId, room);

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.playerName = playerName.trim();

    console.log(`[Room] Created: ${roomId} by ${playerName}`);
    cb({ ok: true, roomId, sessionToken });
    io.to(roomId).emit('room_update', room.getClientState());
  });

  socket.on('join_room', ({ roomId, playerName }, cb) => {
    if (!playerName?.trim()) return cb({ ok: false, reason: 'Укажите имя.' });
    if (playerName.length > 20) return cb({ ok: false, reason: 'Имя слишком длинное.' });

    const room = rooms.get(roomId?.toUpperCase());
    if (!room) return cb({ ok: false, reason: 'Комната не найдена.' });
    if (room.phase !== GAME_PHASE.LOBBY) return cb({ ok: false, reason: 'Игра уже началась.' });

    const sessionToken = room.addPlayer(socket.id, playerName.trim());
    if (!sessionToken) return cb({ ok: false, reason: 'Комната заполнена (максимум 4 игрока).' });

    socket.join(room.id);
    socket.data.roomId = room.id;
    socket.data.playerName = playerName.trim();

    console.log(`[Room] ${playerName} joined ${room.id}`);
    cb({ ok: true, roomId: room.id, sessionToken });
    io.to(room.id).emit('room_update', room.getClientState());
    room.addLog(`${playerName} присоединился к группе.`);
  });

  socket.on('select_class', ({ classId }, cb) => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return cb?.({ ok: false });

    const ok = room.setPlayerClass(socket.id, classId);
    if (ok) {
      room.setPlayerReady(socket.id, true);
      io.to(room.id).emit('room_update', room.getClientState());
      const player = room.players[socket.id];
      room.addLog(`${player.name} выбирает класс: ${classId}.`);
    }
    cb?.({ ok });
  });

  socket.on('set_ready', ({ ready }) => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return;
    room.setPlayerReady(socket.id, ready);
    io.to(room.id).emit('room_update', room.getClientState());
  });

  socket.on('start_class_select', (cb) => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return cb?.({ ok: false });
    if (socket.id !== room.hostId) return cb?.({ ok: false, reason: 'Только хост может начать.' });

    const ok = room.startClassSelect();
    if (ok) io.to(room.id).emit('room_update', room.getClientState());
    cb?.({ ok });
  });

  socket.on('start_game', (cb) => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return cb?.({ ok: false });
    if (socket.id !== room.hostId) return cb?.({ ok: false, reason: 'Только хост может начать игру.' });

    const result = room.startGame();
    if (result.ok) {
      io.to(room.id).emit('room_update', room.getClientState());
    }
    cb?.(result);
  });

  socket.on('player_action', (action, cb) => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return cb?.({ ok: false });
    if (room.phase !== GAME_PHASE.PLAYING) return cb?.({ ok: false, reason: 'Сейчас не ваш ход.' });

    room.processAction(socket.id, action);

    if (room.phase === GAME_PHASE.GAME_OVER || room.phase === GAME_PHASE.VICTORY) {
      handleGameEnd(room);
    }

    cb?.({ ok: true });
  });

  socket.on('request_proceed', () => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return;
    room.requestProceed(socket.id);
    io.to(room.id).emit('room_update', room.getClientState());
  });

  socket.on('cast_vote', ({ roomId }) => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return;
    room.castVote(socket.id, roomId);
    io.to(room.id).emit('room_update', room.getClientState());
  });

  socket.on('solve_riddle', ({ answer }, cb) => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return cb?.({ ok: false });
    room.solveRiddle(socket.id, answer);
    io.to(room.id).emit('room_update', room.getClientState());
    cb?.({ ok: true });
  });

  socket.on('explore_secret', (cb) => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return cb?.({ ok: false });
    room.exploreSecret(socket.id);
    io.to(room.id).emit('room_update', room.getClientState());
    cb?.({ ok: true });
  });

  socket.on('skip_secret', (cb) => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return cb?.({ ok: false });
    room.skipSecret(socket.id);
    io.to(room.id).emit('room_update', room.getClientState());
    cb?.({ ok: true });
  });

  socket.on('collect_loot', ({ itemId }, cb) => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return cb?.({ ok: false });
    if (room.phase !== GAME_PHASE.PLAYING) return cb?.({ ok: false, reason: 'Сейчас нельзя подбирать предметы.' });

    const currentRoom = room.floor?.rooms[room.floor.currentRoomIndex];
    if (!currentRoom?.loot || currentRoom.type !== 'treasure') return cb?.({ ok: false });

    const player = room.players[socket.id];
    if (!player?.character?.isAlive) return cb?.({ ok: false, reason: 'Мёртвые не подбирают предметы.' });

    const itemIdx = currentRoom.loot.findIndex(i => i.id === itemId);
    if (itemIdx === -1) return cb?.({ ok: false, reason: 'Предмет не найден.' });

    const item = currentRoom.loot[itemIdx];
    const MAX_BAG = 12;
    if (item.type !== 'gold') {
      if ((player.character.inventory?.length || 0) >= MAX_BAG) {
        return cb?.({ ok: false, reason: `Рюкзак заполнен! Максимум ${MAX_BAG} предметов.` });
      }
    }

    currentRoom.loot.splice(itemIdx, 1);

    if (item.type === 'gold') {
      player.character.gold += item.amount;
      room.addLog(`${player.name} подбирает ${item.amount} золота.`);
    } else {
      // Items go to bag — player equips manually
      player.character.inventory.push({ ...item });
      const rarityNames = { common: 'Обычный', uncommon: 'Необычный', rare: 'Редкий', epic: 'Эпический', legendary: 'Легендарный' };
      const rar = item.rarity ? ` [${rarityNames[item.rarity] || ''}]` : '';
      room.addLog(`${player.name} подбирает: ${item.name}${rar}.`);
    }

    io.to(room.id).emit('room_update', room.getClientState());
    cb?.({ ok: true });
  });

  socket.on('equip_item', ({ itemId, slot }, cb) => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return cb?.({ ok: false, reason: 'Комната не найдена.' });
    if (room.phase !== GAME_PHASE.PLAYING) return cb?.({ ok: false, reason: 'Неверная фаза.' });
    const result = room.equipItem(socket.id, itemId, slot || null);
    if (result.ok) io.to(room.id).emit('room_update', room.getClientState());
    cb?.(result);
  });

  socket.on('unequip_item', ({ slot }, cb) => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return cb?.({ ok: false, reason: 'Комната не найдена.' });
    if (room.phase !== GAME_PHASE.PLAYING) return cb?.({ ok: false, reason: 'Неверная фаза.' });
    const result = room.unequipItem(socket.id, slot);
    if (result.ok) io.to(room.id).emit('room_update', room.getClientState());
    cb?.(result);
  });

  socket.on('buy_item', ({ itemId }, cb) => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return cb?.({ ok: false, reason: 'Комната не найдена.' });
    if (room.phase !== GAME_PHASE.PLAYING) return cb?.({ ok: false, reason: 'Неверная фаза игры.' });
    const result = room.buyItem(socket.id, itemId);
    if (result.ok) io.to(room.id).emit('room_update', room.getClientState());
    cb?.(result);
  });

  socket.on('sell_item', ({ itemId }, cb) => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return cb?.({ ok: false, reason: 'Комната не найдена.' });
    if (room.phase !== GAME_PHASE.PLAYING) return cb?.({ ok: false, reason: 'Неверная фаза игры.' });
    const result = room.sellItem(socket.id, itemId);
    if (result.ok) io.to(room.id).emit('room_update', room.getClientState());
    cb?.(result);
  });

  socket.on('drop_item', ({ itemId }, cb) => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return cb?.({ ok: false, reason: 'Комната не найдена.' });
    if (room.phase !== GAME_PHASE.PLAYING) return cb?.({ ok: false, reason: 'Неверная фаза игры.' });
    const result = room.dropItem(socket.id, itemId);
    if (result.ok) io.to(room.id).emit('room_update', room.getClientState());
    cb?.(result);
  });

  socket.on('volunteer_door', (cb) => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return cb?.({ ok: false, reason: 'Комната не найдена.' });
    const result = room.volunteerForDoor(socket.id);
    if (result.ok) io.to(room.id).emit('room_update', room.getClientState());
    cb?.(result);
  });

  socket.on('door_action', (action, cb) => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return cb?.({ ok: false });
    room.processDoorAction(socket.id, action);
    // room_update is emitted inside processDoorAction
    cb?.({ ok: true });
  });

  socket.on('choose_level_up', ({ optionId }, cb) => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return cb?.({ ok: false, reason: 'Комната не найдена.' });

    const player = room.players[socket.id];
    if (!player?.character) return cb?.({ ok: false, reason: 'Персонаж не найден.' });

    const pending = player.character.pendingLevelUp;
    if (!pending) return cb?.({ ok: false, reason: 'Нет ожидающего выбора уровня.' });

    const validOption = pending.options.find(o => o.id === optionId);
    if (!validOption) return cb?.({ ok: false, reason: 'Недопустимый выбор.' });

    const applied = applyLevelUpOption(player.character, optionId);
    if (!applied) return cb?.({ ok: false, reason: 'Не удалось применить.' });

    player.character.pendingLevelUp = null;
    room.addLog(`★ ${player.name} (ур. ${player.character.level}) выбирает: ${validOption.icon} ${validOption.name}`);
    io.to(room.id).emit('room_update', room.getClientState());
    cb?.({ ok: true });
  });

  socket.on('choose_floor_reward', ({ rewardId }, cb) => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return cb?.({ ok: false, reason: 'Комната не найдена.' });
    const result = room.chooseFloorReward(socket.id, rewardId);
    cb?.(result);
  });

  socket.on('chat_message', ({ message }) => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return;
    if (!message?.trim() || message.length > 200) return;
    room.addChat(socket.id, message.trim());
  });

  socket.on('reconnect_game', ({ roomId, sessionToken } = {}, cb) => {
    if (!roomId || !sessionToken) return cb?.({ ok: false, reason: 'Неверные данные.' });
    const room = rooms.get(roomId.toUpperCase());
    if (!room) return cb?.({ ok: false, reason: 'Комната не найдена или игра уже закончилась.' });
    if (room.phase === GAME_PHASE.LOBBY) return cb?.({ ok: false, reason: 'Игра ещё в лобби — используйте обычное подключение.' });

    const ok = room.reconnectPlayer(socket.id, sessionToken);
    if (!ok) return cb?.({ ok: false, reason: 'Токен не найден. Возможно, сессия истекла.' });

    socket.join(room.id);
    socket.data.roomId = room.id;
    const player = room.players[socket.id];
    socket.data.playerName = player.name;

    console.log(`[Room] ${player.name} reconnected to ${room.id}`);
    io.to(room.id).emit('room_update', room.getClientState());
    room.addLog(`🔄 ${player.name} вернулся в игру.`);
    cb?.({ ok: true, playerName: player.name });
  });

  socket.on('disconnect', () => {
    console.log(`[-] Player disconnected: ${socket.id}`);
    const room = rooms.get(socket.data.roomId);
    if (room) {
      room.removePlayer(socket.id);
      io.to(room.id).emit('room_update', room.getClientState());
    }
  });

  socket.on('get_state', (cb) => {
    const room = rooms.get(socket.data.roomId);
    if (room) cb?.(room.getClientState());
  });
});

function handleGameEnd(room) {
  const players = Object.values(room.players);
  const won = room.phase === GAME_PHASE.VICTORY;

  let totalScore = 0;
  for (const p of players) {
    if (!p.character) continue;
    const kills = p.character.kills || 0;
    const score = (p.character.level * 100)
                + (p.character.gold * 3)
                + (p.character.exp)
                + (kills * 15)
                + (room.floorNumber * 200)
                + (won ? 1000 : 0);
    totalScore += score;

    savePlayerStats(p.name, { kills, gold: p.character.gold, level: p.character.level, won });

    // Update legacy progress and broadcast any newly unlocked perks
    const { newPerks } = updateLegacy(p.name, {
      kills,
      gold: p.character.gold,
      floor: room.floorNumber,
      won
    });
    if (newPerks.length > 0 && room.io) {
      const msg = `🏆 ${p.name} разблокировал: ${newPerks.map(pk => `${pk.icon} ${pk.name}`).join(', ')}`;
      room.io.to(room.id).emit('log', { ts: Date.now(), msg });
    }
  }

  if (players.length > 0) {
    saveScore({
      score: totalScore,
      players: players.map(p => ({ name: p.name, class: p.character?.className, level: p.character?.level, kills: p.character?.kills || 0 })),
      won,
      floor: room.floorNumber
    });
  }
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════╗
║   DUNGEON ROGUELIKE SERVER        ║
║   Port: ${PORT}                       ║
║   Optimized for ARM64/Orange Pi   ║
╚═══════════════════════════════════╝
  `);
});

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  server.close(() => process.exit(0));
});
