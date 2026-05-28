'use strict';

const BONUS_POOL = [
  // Class damage bonuses
  { id: 'warrior_fury',  type: 'damage_mult', value: 0.20, classId: 'warrior',
    title: '⚔ Ярость воина',        desc: 'Воин наносит +20% урона этот забег' },
  { id: 'mage_surge',    type: 'damage_mult', value: 0.25, classId: 'mage',
    title: '✦ Магический всплеск',  desc: 'Маг наносит +25% урона этот забег' },
  { id: 'rogue_shadow',  type: 'damage_mult', value: 0.20, classId: 'rogue',
    title: '† Тень смерти',         desc: 'Плут наносит +20% урона этот забег' },
  // Class support bonuses
  { id: 'cleric_grace',  type: 'heal_mult',   value: 0.35, classId: 'cleric',
    title: '✚ Благодать',           desc: 'Жрец лечит на +35% больше этот забег' },
  { id: 'warrior_bulk',  type: 'start_hp_bonus', value: 0.25, classId: 'warrior',
    title: '🛡 Несокрушимость',     desc: 'Воин начинает с +25% HP' },
  { id: 'cleric_prayer', type: 'start_mp_bonus', value: 0.40, classId: 'cleric',
    title: '✚ Благословение богов', desc: 'Жрец начинает с +40% маны' },
  { id: 'rogue_reflex',  type: 'crit_bonus',  value: 0.15, classId: 'rogue',
    title: '† Смертельная точность','desc': 'Плут: +15% к шансу крита' },
  // Global bonuses
  { id: 'lucky_drops',   type: 'loot_chance', value: 0.30,
    title: '★ Золотой дождь',       desc: '+30% шанс выпадения лута с врагов' },
  { id: 'gold_fever',    type: 'gold_mult',   value: 0.50,
    title: '💰 Золотая лихорадка',  desc: '+50% золота со всех источников' },
  { id: 'undead_bane',   type: 'enemy_tag_damage', value: 0.40, tag: 'undead',
    title: '☀ Гибель нежити',       desc: '+40% урона по нежити для всех' },
  { id: 'crit_storm',    type: 'crit_bonus',  value: 0.10,
    title: '⚡ Шторм критов',        desc: '+10% к шансу крита для всех' },
  { id: 'fast_cds',      type: 'cooldown_reduction', value: 1,
    title: '⏩ Быстрая магия',       desc: 'Все способности: кулдаун −1 ход с старта' },
  { id: 'mana_wave',     type: 'start_mp_bonus', value: 0.25,
    title: '💧 Магический прилив',  desc: 'Все начинают с +25% маны' },
  { id: 'potion_power',  type: 'potion_mult', value: 0.50,
    title: '🧪 Зелья мощи',         desc: '+50% к эффекту зелий лечения' }
];

let _current  = null;
let _expiresAt = 0;
let _timer     = null;
let _onChange  = null;

const ROTATION_MS = 30 * 60 * 1000; // exactly 30 minutes, synchronized to wall-clock

function _getWindowIndex() {
  return Math.floor(Date.now() / ROTATION_MS);
}

function _roll() {
  const windowIdx = _getWindowIndex();
  _current   = { ...BONUS_POOL[windowIdx % BONUS_POOL.length] };
  _expiresAt = (windowIdx + 1) * ROTATION_MS; // end of current 30-min window

  const msUntilNext = _expiresAt - Date.now();
  if (_timer) clearTimeout(_timer);
  _timer = setTimeout(_roll, msUntilNext);

  if (_onChange) _onChange(_current, _expiresAt);
}

/** Returns milliseconds until the next bonus rotation. */
function getTimeUntilNext() {
  return Math.max(0, _expiresAt - Date.now());
}

function initBonusSystem(onChange) {
  _onChange = onChange;
  _roll();
}

function getCurrentBonus() {
  return { bonus: _current, expiresAt: _expiresAt };
}

// Apply one-time stat bonuses when a character is created
function applyBonusToCharacter(character, bonus) {
  if (!bonus) return;
  if (bonus.classId && bonus.classId !== character.classId) return;

  character.activeBonus = bonus;

  switch (bonus.type) {
    case 'start_hp_bonus':
      character.maxHp = Math.floor(character.maxHp * (1 + bonus.value));
      character.hp    = character.maxHp;
      break;
    case 'start_mp_bonus':
      character.maxMp = Math.floor(character.maxMp * (1 + bonus.value));
      character.mp    = character.maxMp;
      break;
    case 'crit_bonus':
      character.critChance = Math.min(0.95, (character.critChance || 0) + bonus.value);
      break;
    case 'cooldown_reduction':
      for (const a of character.abilities) {
        a.cooldown = Math.max(1, a.cooldown - bonus.value);
      }
      break;
  }
}

// Returns extra multiplier for runtime events (0 = no bonus)
// context: { classId, event: 'damage'|'heal'|'gold'|'loot'|'potion', enemyTag? }
function getBonusMultiplier(bonus, context) {
  if (!bonus) return 0;
  const { type, classId, value, tag } = bonus;
  if (classId && classId !== context.classId) return 0;
  if (tag     && tag     !== context.enemyTag) return 0;

  switch (type) {
    case 'damage_mult':      return context.event === 'damage' ? value : 0;
    case 'enemy_tag_damage': return context.event === 'damage' ? value : 0;
    case 'heal_mult':        return context.event === 'heal'   ? value : 0;
    case 'gold_mult':        return context.event === 'gold'   ? value : 0;
    case 'loot_chance':      return context.event === 'loot'   ? value : 0;
    case 'potion_mult':      return context.event === 'potion' ? value : 0;
    default:                 return 0;
  }
}

module.exports = { initBonusSystem, getCurrentBonus, getTimeUntilNext, applyBonusToCharacter, getBonusMultiplier, BONUS_POOL };
