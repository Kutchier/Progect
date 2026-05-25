'use strict';

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { GameRoom, GAME_PHASE } = require('./game');
const { saveScore, getTopScores, savePlayerStats } = require('./database');
const { initBonusSystem, getCurrentBonus } = require('./bonuses');

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
  res.json(getTopScores(20));
});

app.get('/api/bonus', (req, res) => {
  res.json(getCurrentBonus());
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
    io.to(room.id).emit('room_update', room.getClientState());

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

    const currentRoom = room.floor?.rooms[room.floor.currentRoomIndex];
    if (!currentRoom?.loot) return cb?.({ ok: false });

    const itemIdx = currentRoom.loot.findIndex(i => i.id === itemId);
    if (itemIdx === -1) return cb?.({ ok: false });

    const item = currentRoom.loot.splice(itemIdx, 1)[0];
    const player = room.players[socket.id];
    if (!player?.character) return cb?.({ ok: false });

    if (item.type === 'gold') {
      player.character.gold += item.amount;
      room.addLog(`${player.name} подбирает ${item.amount} золота.`);
    } else {
      player.character.inventory.push(item);
      room.addLog(`${player.name} подбирает: ${item.name}`);
    }

    io.to(room.id).emit('room_update', room.getClientState());
    cb?.({ ok: true });
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
    const score = (p.character.level * 100) + (p.character.gold * 2) + (p.character.exp);
    totalScore += score;
    savePlayerStats(p.name, {
      kills: 0,
      gold: p.character.gold,
      level: p.character.level,
      won
    });
  }

  if (players.length > 0) {
    saveScore({
      score: totalScore,
      players: players.map(p => ({ name: p.name, class: p.character?.className, level: p.character?.level })),
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
