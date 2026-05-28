'use strict';

const path = require('path');
const fs   = require('fs');

const LEGACY_FILE = path.join(__dirname, '..', 'data', 'legacy.json');

// ── Perk pool — every perk that can be unlocked across runs ──────────────────
const LEGACY_PERKS = [
  {
    id: 'extra_potion',
    name: '🧪 Запас зелий',
    desc: 'Начинаете каждый забег с +1 зельем лечения',
    icon: '🧪',
    apply(ch) { ch.potions = (ch.potions || 2) + 1; }
  },
  {
    id: 'iron_will',
    name: '❤ Железная воля',
    desc: '+15 к максимальному HP в начале каждого забега',
    icon: '❤',
    apply(ch) {
      ch.levelBonuses = ch.levelBonuses || {};
      ch.levelBonuses.maxHp = (ch.levelBonuses.maxHp || 0) + 15;
    }
  },
  {
    id: 'arcane_memory',
    name: '💧 Арканная память',
    desc: '+20 к максимальной мане в начале каждого забега',
    icon: '💧',
    apply(ch) {
      ch.levelBonuses = ch.levelBonuses || {};
      ch.levelBonuses.maxMp = (ch.levelBonuses.maxMp || 0) + 20;
    }
  },
  {
    id: 'veteran_instinct',
    name: '⚔ Ветеранский инстинкт',
    desc: '+3 к атаке и +2 к защите с первого хода',
    icon: '⚔',
    apply(ch) {
      ch.levelBonuses = ch.levelBonuses || {};
      ch.levelBonuses.attack  = (ch.levelBonuses.attack  || 0) + 3;
      ch.levelBonuses.defense = (ch.levelBonuses.defense || 0) + 2;
    }
  },
  {
    id: 'lucky_start',
    name: '★ Счастливое начало',
    desc: 'Начинаете каждый забег с 30 золотом',
    icon: '★',
    apply(ch) { ch.gold = (ch.gold || 0) + 30; }
  },
  {
    id: 'swift_feet',
    name: '💨 Лёгкий шаг',
    desc: '+2 к скорости на весь забег',
    icon: '💨',
    apply(ch) {
      ch.levelBonuses = ch.levelBonuses || {};
      ch.levelBonuses.speed = (ch.levelBonuses.speed || 0) + 2;
    }
  }
];

// ── Unlock conditions (checked after each run) ───────────────────────────────
const UNLOCK_CONDITIONS = [
  { perkId: 'extra_potion',     check: (l) => l.maxFloor >= 2,      hint: 'Доберитесь до 2-го этажа'      },
  { perkId: 'iron_will',        check: (l) => l.totalRuns >= 3,      hint: 'Сыграйте 3 забега'             },
  { perkId: 'arcane_memory',    check: (l) => l.totalKills >= 10,    hint: 'Убейте 10 врагов суммарно'     },
  { perkId: 'veteran_instinct', check: (l) => l.totalKills >= 25,    hint: 'Убейте 25 врагов суммарно'     },
  { perkId: 'lucky_start',      check: (l) => l.maxFloor >= 3,       hint: 'Доберитесь до 3-го этажа'      },
  { perkId: 'swift_feet',       check: (l) => l.totalRuns >= 7,      hint: 'Сыграйте 7 забегов'            }
];

// ── Persistence helpers ───────────────────────────────────────────────────────
function _read() {
  try {
    if (!fs.existsSync(LEGACY_FILE)) return {};
    return JSON.parse(fs.readFileSync(LEGACY_FILE, 'utf8'));
  } catch { return {}; }
}

function _write(data) {
  fs.writeFileSync(LEGACY_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function _defaultLegacy() {
  return { totalRuns: 0, totalKills: 0, totalGold: 0, maxFloor: 0, wins: 0, unlockedPerks: [] };
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Returns persisted legacy record for a player (or default empty record). */
function getLegacy(playerName) {
  if (!playerName) return _defaultLegacy();
  return _read()[playerName] || _defaultLegacy();
}

/**
 * Called at the end of a game session.
 * Updates cumulative stats and unlocks any newly-earned perks.
 * Returns { legacy, newPerks[] } so callers can broadcast unlock messages.
 */
function updateLegacy(playerName, gameStats) {
  if (!playerName) return { legacy: _defaultLegacy(), newPerks: [] };
  const all = _read();
  const l   = all[playerName] || _defaultLegacy();

  l.totalRuns++;
  l.totalKills += (gameStats.kills  || 0);
  l.totalGold  += (gameStats.gold   || 0);
  l.maxFloor    = Math.max(l.maxFloor, gameStats.floor || 0);
  if (gameStats.won) l.wins++;

  // Evaluate unlock conditions and collect newly earned perks
  const newPerks = [];
  for (const cond of UNLOCK_CONDITIONS) {
    if (!l.unlockedPerks.includes(cond.perkId) && cond.check(l)) {
      l.unlockedPerks.push(cond.perkId);
      const perk = LEGACY_PERKS.find(p => p.id === cond.perkId);
      if (perk) newPerks.push(perk);
    }
  }

  all[playerName] = l;
  _write(all);
  return { legacy: l, newPerks };
}

/**
 * Applies all unlocked perks to a freshly-created character.
 * Must be called BEFORE recalcStats so stat bonuses take effect.
 * Returns the list of applied perks for log messages.
 */
function applyLegacyPerks(character, playerName) {
  if (!playerName) return [];
  const l       = getLegacy(playerName);
  const applied = [];

  for (const perkId of l.unlockedPerks) {
    const perk = LEGACY_PERKS.find(p => p.id === perkId);
    if (perk?.apply) {
      perk.apply(character);
      applied.push(perk);
    }
  }
  return applied;
}

/**
 * Returns perks that are still locked along with their unlock hints —
 * used by the client to show "legacy progress" screen after game over.
 */
function getLockedPerksWithHints(playerName) {
  const l = getLegacy(playerName);
  return UNLOCK_CONDITIONS
    .filter(c => !l.unlockedPerks.includes(c.perkId))
    .map(c => {
      const perk = LEGACY_PERKS.find(p => p.id === c.perkId);
      return { id: c.perkId, name: perk?.name, icon: perk?.icon, hint: c.hint };
    });
}

module.exports = { getLegacy, updateLegacy, applyLegacyPerks, getLockedPerksWithHints, LEGACY_PERKS };
