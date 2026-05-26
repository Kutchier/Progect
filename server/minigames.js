'use strict';

// Symbols for lockpick — 4 directional + 2 special
const LP_SYMBOLS = ['↑', '↓', '←', '→'];
const LP_SYMBOLS_HARD = ['↑', '↓', '←', '→', '◈', '◆'];

const CLASS_MINIGAME = {
  rogue:   'lockpick',
  warrior: 'tower_stack',
  mage:    'arcane_sequence',
  cleric:  'holy_resonance'
};

// ── Lockpick (Rogue native) ──────────────────────────────────────────────────
// Show one symbol at a time; player picks the correct one from a panel.
// Native: shorter sequence, more attempts, more time.
function createLockpick(classId) {
  const native = classId === 'rogue';
  const len    = native ? 3 : 6;
  const pool   = native ? LP_SYMBOLS : LP_SYMBOLS_HARD;
  const seq    = Array.from({ length: len }, () => pool[Math.floor(Math.random() * pool.length)]);
  return {
    type: 'lockpick',
    sequence: seq,
    symbols: pool,
    currentIndex: 0,
    maxAttempts: native ? 7 : 2,
    attemptsLeft: native ? 7 : 2,
    timeLimit: native ? 30000 : 18000,
    startedAt: Date.now(),
    done: false,
    success: false
  };
}

// ── Tower Stack (Warrior native) ─────────────────────────────────────────────
// Client-side physics: player drops polygons to stack a tower above the target line.
// Server provides parameters; client reports success/failure via action.success.
function createTowerStack(classId) {
  const native      = classId === 'warrior';
  const piecesTotal = native ? (5 + Math.floor(Math.random() * 3)) : (7 + Math.floor(Math.random() * 3));
  const targetHeight = (native ? 0.42 : 0.55) + Math.random() * 0.14;
  return {
    type: 'tower_stack',
    piecesTotal,
    targetHeight,     // fraction (0-1) of play area from bottom
    timeLimit: native ? 50000 : 38000,
    startedAt: Date.now(),
    done: false,
    success: false
  };
}

// ── Arcane Sequence (Mage native) ────────────────────────────────────────────
// Memorise a sequence of rune numbers (1-4), then reproduce it after hide timer.
function createArcaneSequence(classId) {
  const native    = classId === 'mage';
  const len       = native ? 4 : 5;
  const revealMs  = native ? 5000 : 2500;
  const inputMs   = native ? 20000 : 12000;
  const runes     = Array.from({ length: len }, () => 1 + Math.floor(Math.random() * 4));
  const now       = Date.now();
  return {
    type: 'arcane_sequence',
    runes,
    input: [],
    maxAttempts: native ? 3 : 1,
    attemptsLeft: native ? 3 : 1,
    revealUntil: now + revealMs,
    deadline: now + revealMs + inputMs,
    startedAt: now,
    done: false,
    success: false
  };
}

// ── Holy Resonance (Cleric native) ──────────────────────────────────────────
// A bar oscillates 0-100. Player hits STRIKE when the cursor is in the holy zone.
// Requires 3 hits; zone shrinks and relocates after each successful hit.
function _randomZone(size) {
  const start = 5 + Math.floor(Math.random() * (90 - size));
  return { zoneStart: start, zoneEnd: start + size, zoneSize: size };
}

function createHolyResonance(classId) {
  const native   = classId === 'cleric';
  const initSize = native ? 20 : 10;
  const zone     = _randomZone(initSize);
  return {
    type: 'holy_resonance',
    barPosition: 0,
    direction: 1,
    speed: native ? 62 : 95,
    ...zone,
    hitsRequired: 3,
    hitsScored: 0,
    maxAttempts: native ? 4 : 2,
    attemptsLeft: native ? 4 : 2,
    timeLimit: 25000,
    startedAt: Date.now(),
    lastTickAt: Date.now(),
    done: false,
    success: false
  };
}

// ── Factory ──────────────────────────────────────────────────────────────────
function createMinigame(classId) {
  switch (CLASS_MINIGAME[classId]) {
    case 'lockpick':        return createLockpick(classId);
    case 'tower_stack':     return createTowerStack(classId);
    case 'arcane_sequence': return createArcaneSequence(classId);
    case 'holy_resonance':  return createHolyResonance(classId);
    default:                return createLockpick(classId);
  }
}

// ── Bar tick helper ──────────────────────────────────────────────────────────
function _tickBar(state) {
  const now = Date.now();
  const dt  = (now - state.lastTickAt) / 1000;
  state.lastTickAt = now;
  let pos = state.barPosition + state.direction * state.speed * dt;
  if (pos >= 100) { pos = 100; state.direction = -1; }
  if (pos <= 0)   { pos = 0;   state.direction =  1; }
  state.barPosition = pos;
}

// ── Process an action from the volunteering player ───────────────────────────
// action shape: { symbol, rune, type } depending on mini-game
// Returns { logs[], done, success }
function processMinigameAction(state, action) {
  const logs = [];
  const now  = Date.now();

  // Timeout check
  const deadline = state.type === 'arcane_sequence'
    ? state.deadline
    : state.startedAt + state.timeLimit;

  if (now > deadline) {
    state.done    = true;
    state.success = false;
    return { logs: ['⏰ Время вышло!'], done: true, success: false };
  }

  switch (state.type) {
    case 'lockpick': {
      const expected = state.sequence[state.currentIndex];
      if (action.symbol === expected) {
        state.currentIndex++;
        if (state.currentIndex >= state.sequence.length) {
          state.done = true; state.success = true;
          logs.push('🔓 Замок взломан!');
        } else {
          logs.push(`✓ Щелчок! [${state.currentIndex}/${state.sequence.length}]`);
        }
      } else {
        state.currentIndex = 0;
        state.attemptsLeft--;
        logs.push(`✗ Штифт сорвался! Начинаем сначала. Попыток: ${state.attemptsLeft}`);
        if (state.attemptsLeft <= 0) {
          state.done = true; state.success = false;
          logs.push('Замок устоял.');
        }
      }
      break;
    }

    case 'tower_stack': {
      state.done    = true;
      state.success = !!action.success;
      logs.push(state.success
        ? '🏰 Башня возведена! Дверь открыта силой воли воина!'
        : '💥 Башня рухнула. Попытка провалена.');
      break;
    }

    case 'arcane_sequence': {
      // Check if still in reveal phase
      if (now < state.revealUntil) {
        logs.push('Подождите — руны ещё видны. Запомните последовательность!');
        break;
      }
      state.input.push(action.rune);
      const filled = state.input.length;
      const total  = state.runes.length;
      if (filled === total) {
        const ok = state.runes.every((r, i) => r === state.input[i]);
        if (ok) {
          state.done = true; state.success = true;
          logs.push('✨ Последовательность верна! Магическая печать снята.');
        } else {
          state.attemptsLeft--;
          state.input = [];
          logs.push(`✗ Неверная последовательность. Попыток: ${state.attemptsLeft}`);
          if (state.attemptsLeft <= 0) { state.done = true; state.success = false; logs.push('Печать не поддалась.'); }
        }
      } else {
        logs.push(`Руна ${action.rune} введена [${filled}/${total}]`);
      }
      break;
    }

    case 'holy_resonance': {
      _tickBar(state);
      const pos    = state.barPosition;
      const inZone = pos >= state.zoneStart && pos <= state.zoneEnd;
      if (inZone) {
        state.hitsScored++;
        if (state.hitsScored >= state.hitsRequired) {
          state.done = true; state.success = true;
          logs.push(`✝ Полный резонанс! (${Math.round(pos)}%) Дверь открыта светом веры.`);
        } else {
          // Shrink zone 55–70% of current size, relocate randomly
          const newSize  = Math.max(5, Math.floor(state.zoneSize * (0.55 + Math.random() * 0.15)));
          const newZone  = _randomZone(newSize);
          Object.assign(state, newZone);
          logs.push(`✝ Попадание ${state.hitsScored}/${state.hitsRequired}! (${Math.round(pos)}%) Зона сместилась.`);
        }
      } else {
        state.attemptsLeft--;
        logs.push(`✗ Мимо! (${Math.round(pos)}%) Попыток: ${state.attemptsLeft}`);
        if (state.attemptsLeft <= 0) { state.done = true; state.success = false; logs.push('Вера иссякла.'); }
      }
      break;
    }
  }

  return { logs, done: state.done, success: state.success };
}

// ── Client-safe view (hides full sequence until needed) ──────────────────────
function getMinigameClientState(state) {
  if (!state) return null;
  const base = {
    type: state.type,
    startedAt: state.startedAt,
    timeLimit: state.type === 'arcane_sequence' ? state.deadline - state.startedAt : state.timeLimit,
    deadline: state.type === 'arcane_sequence' ? state.deadline : state.startedAt + state.timeLimit,
    done: state.done,
    success: state.success
  };
  switch (state.type) {
    case 'lockpick':
      return { ...base,
        sequenceLength: state.sequence.length,
        currentIndex: state.currentIndex,
        nextSymbol: (!state.done && state.currentIndex < state.sequence.length)
          ? state.sequence[state.currentIndex] : null,
        availableSymbols: state.symbols || LP_SYMBOLS,
        attemptsLeft: state.attemptsLeft,
        maxAttempts: state.maxAttempts
      };
    case 'tower_stack':
      return { ...base,
        piecesTotal:  state.piecesTotal,
        targetHeight: state.targetHeight
      };
    case 'arcane_sequence': {
      const revealed = Date.now() < state.revealUntil;
      return { ...base,
        runes: revealed ? state.runes : null,
        input: state.input,
        sequenceLength: state.runes.length,
        attemptsLeft: state.attemptsLeft,
        maxAttempts: state.maxAttempts,
        revealed,
        revealUntil: state.revealUntil
      };
    }
    case 'holy_resonance': {
      _tickBar(state);
      return { ...base,
        barPosition: Math.round(state.barPosition),
        direction: state.direction,
        speed: state.speed,
        zoneStart: state.zoneStart,
        zoneEnd: state.zoneEnd,
        hitsScored: state.hitsScored,
        hitsRequired: state.hitsRequired,
        attemptsLeft: state.attemptsLeft,
        maxAttempts: state.maxAttempts
      };
    }
    default: return base;
  }
}

module.exports = { createMinigame, processMinigameAction, getMinigameClientState, CLASS_MINIGAME, LP_SYMBOLS_HARD };
