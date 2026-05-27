'use strict';

const CLASSES = {
  warrior: {
    id: 'warrior',
    name: 'Воин',
    symbol: '⚔',
    description: 'Закалённый в битвах боец. Высокое HP и защита, мощные удары в ближнем бою.',
    baseStats: {
      hp: 120,
      maxHp: 120,
      mp: 60,
      maxMp: 60,
      attack: 18,
      defense: 12,
      speed: 8,
      critChance: 0.08
    },
    ultName: 'Рёв Берсерка',
    ultDescription: 'Атакует ВСЕХ врагов с 300% уроном и гарантированным критом. Оглушает каждого на 1 ход.',
    ultKillsNeeded: 5,
    abilities: [
      {
        id: 'shield_bash',
        name: 'Удар щитом',
        description: 'Оглушает врага на 1 ход, наносит 80% урона. Ближний бой.',
        type: 'attack',
        target: 'single',
        rangeType: 'melee',
        maxRange: 1.5,
        damageMultiplier: 0.8,
        effect: { stun: 1 },
        cooldown: 3,
        currentCooldown: 0,
        mpCost: 10
      },
      {
        id: 'whirlwind',
        name: 'Вихрь',
        description: 'Атакует всех врагов вблизи, нанося 60% урона каждому.',
        type: 'attack',
        target: 'all_enemies',
        rangeType: 'melee',
        maxRange: 1.5,
        aoeRadius: 1.5,
        damageMultiplier: 0.6,
        cooldown: 4,
        currentCooldown: 0,
        mpCost: 20
      },
      {
        id: 'battle_cry',
        name: 'Боевой клич',
        description: 'Повышает атаку всей группы на 20% на 2 хода',
        type: 'buff',
        target: 'all_allies',
        rangeType: 'self',
        effect: { attackBonus: 0.2, duration: 2 },
        cooldown: 5,
        currentCooldown: 0,
        mpCost: 25
      },
      {
        id: 'provoke',
        name: 'Провокация',
        description: 'Все враги атакуют только тебя следующий ход. +30% к защите.',
        type: 'buff',
        target: 'self',
        rangeType: 'self',
        effect: { taunt: 1, defenseBonus: 0.3, duration: 1 },
        cooldown: 4,
        currentCooldown: 0,
        mpCost: 15
      },
      {
        id: 'execute',
        name: 'Казнь',
        description: 'Тройной урон по врагу с HP < 25%. Ближний бой.',
        type: 'attack',
        target: 'single',
        rangeType: 'melee',
        maxRange: 1.5,
        damageMultiplier: 3.0,
        condition: 'target_hp_low',
        cooldown: 3,
        currentCooldown: 0,
        mpCost: 20
      }
    ],
    startingItem: { id: 'iron_sword', name: 'Железный меч', type: 'weapon', attackBonus: 5 }
  },

  mage: {
    id: 'mage',
    name: 'Маг',
    symbol: '✦',
    description: 'Мастер тёмной магии. Низкое HP, но разрушительные заклинания по области.',
    ultName: 'Армагеддон',
    ultDescription: 'Испепеляет ВСЕХ врагов ударом 400% урона, игнорируя половину их защиты.',
    ultKillsNeeded: 5,
    baseStats: {
      hp: 70,
      maxHp: 70,
      mp: 120,
      maxMp: 120,
      attack: 24,
      defense: 4,
      speed: 10,
      critChance: 0.12
    },
    abilities: [
      {
        id: 'fireball',
        name: 'Огненный шар',
        description: 'Выбери точку на поле боя — взрыв поражает врагов в радиусе 2 клеток. Урон 150%.',
        type: 'attack',
        target: 'all_enemies',
        rangeType: 'ranged',
        maxRange: 7,
        aoeRadius: 2,
        damageMultiplier: 1.5,
        cooldown: 3,
        currentCooldown: 0,
        mpCost: 30
      },
      {
        id: 'ice_lance',
        name: 'Ледяное копьё',
        description: 'Пронзает цель на расстоянии до 7 клеток, замедляя на 1 ход. Урон 200%.',
        type: 'attack',
        target: 'single',
        rangeType: 'ranged',
        maxRange: 7,
        damageMultiplier: 2.0,
        effect: { slow: 1 },
        cooldown: 3,
        currentCooldown: 0,
        mpCost: 25
      },
      {
        id: 'arcane_shield',
        name: 'Магический щит',
        description: 'Поглощает следующую атаку по любому союзнику',
        type: 'shield',
        target: 'all_allies',
        rangeType: 'self',
        effect: { absorbHits: 1, duration: 2 },
        cooldown: 5,
        currentCooldown: 0,
        mpCost: 35
      },
      {
        id: 'curse',
        name: 'Проклятие',
        description: 'Снижает атаку и защиту цели на расстоянии до 6 клеток на 30% на 2 хода.',
        type: 'debuff',
        target: 'single',
        rangeType: 'ranged',
        maxRange: 6,
        effect: { attackDebuff: 0.3, defenseDebuff: 0.3, duration: 2 },
        cooldown: 4,
        currentCooldown: 0,
        mpCost: 20
      },
      {
        id: 'chain_lightning',
        name: 'Цепная молния',
        description: 'Выбери точку — молния поражает до 3 врагов в радиусе 3 клеток от неё. Урон 120%.',
        type: 'attack',
        target: 'random_3',
        rangeType: 'ranged',
        maxRange: 8,
        aoeRadius: 3,
        damageMultiplier: 1.2,
        cooldown: 4,
        currentCooldown: 0,
        mpCost: 40
      }
    ],
    startingItem: { id: 'spell_tome', name: 'Гримуар', type: 'weapon', attackBonus: 7 }
  },

  rogue: {
    id: 'rogue',
    name: 'Плут',
    symbol: '†',
    description: 'Тень в ночи. Высокий шанс крита, уклонение, яды.',
    ultName: 'Пляска смерти',
    ultDescription: 'Наносит 5 молниеносных ударов случайным врагам — каждый 200% гарантированного крита.',
    ultKillsNeeded: 5,
    baseStats: {
      hp: 90,
      maxHp: 90,
      mp: 80,
      maxMp: 80,
      attack: 20,
      defense: 7,
      speed: 14,
      critChance: 0.25
    },
    abilities: [
      {
        id: 'backstab',
        name: 'Удар в спину',
        description: 'Гарантированный крит из ближнего боя, 250% урона.',
        type: 'attack',
        target: 'single',
        rangeType: 'melee',
        maxRange: 1.5,
        damageMultiplier: 2.5,
        guaranteedCrit: true,
        cooldown: 3,
        currentCooldown: 0,
        mpCost: 20
      },
      {
        id: 'poison_blade',
        name: 'Ядовитый клинок',
        description: 'Отравляет цель в ближнем бою: 10% урона каждый ход на 3 хода.',
        type: 'attack',
        target: 'single',
        rangeType: 'melee',
        maxRange: 1.5,
        damageMultiplier: 1.0,
        effect: { poison: { damagePercent: 0.1, duration: 3 } },
        cooldown: 3,
        currentCooldown: 0,
        mpCost: 15
      },
      {
        id: 'shadow_step',
        name: 'Шаг тени',
        description: 'Следующая атака наносит 200% урона и не может промахнуться',
        type: 'buff',
        target: 'self',
        rangeType: 'self',
        effect: { shadowStep: true, duration: 1 },
        cooldown: 4,
        currentCooldown: 0,
        mpCost: 25
      },
      {
        id: 'smoke_bomb',
        name: 'Дымовая бомба',
        description: 'Бросаешь бомбу (до 5 клеток) — враги в радиусе 2 промахиваются на 50%.',
        type: 'debuff',
        target: 'all_enemies',
        rangeType: 'ranged',
        maxRange: 5,
        aoeRadius: 2,
        effect: { missChance: 0.5, duration: 1 },
        cooldown: 5,
        currentCooldown: 0,
        mpCost: 20
      },
      {
        id: 'fan_of_knives',
        name: 'Веер ножей',
        description: 'Атакует всех врагов вблизи (до 2.5 кл.), 80% урона, может критовать.',
        type: 'attack',
        target: 'all_enemies',
        rangeType: 'melee',
        maxRange: 2.5,
        aoeRadius: 2.5,
        damageMultiplier: 0.8,
        cooldown: 4,
        currentCooldown: 0,
        mpCost: 25
      }
    ],
    startingItem: { id: 'twin_daggers', name: 'Парные кинжалы', type: 'weapon', attackBonus: 6 }
  },

  cleric: {
    id: 'cleric',
    name: 'Жрец',
    symbol: '✚',
    description: 'Хранитель жизни. Исцеляет союзников, защищает от тьмы.',
    ultName: 'Небесный суд',
    ultDescription: 'Восстанавливает HP всей группы до максимума, воскрешает павших с 50% HP, и наносит 250% священного урона всем врагам (400% нежити).',
    ultKillsNeeded: 5,
    baseStats: {
      hp: 100,
      maxHp: 100,
      mp: 100,
      maxMp: 100,
      attack: 14,
      defense: 10,
      speed: 9,
      critChance: 0.06
    },
    abilities: [
      {
        id: 'heal',
        name: 'Исцеление',
        description: 'Восстанавливает 40% максимального HP одного союзника',
        type: 'heal',
        target: 'single_ally',
        rangeType: 'any',
        healPercent: 0.4,
        cooldown: 2,
        currentCooldown: 0,
        mpCost: 20
      },
      {
        id: 'mass_heal',
        name: 'Массовое исцеление',
        description: 'Восстанавливает 20% HP всем союзникам',
        type: 'heal',
        target: 'all_allies',
        rangeType: 'self',
        healPercent: 0.2,
        cooldown: 4,
        currentCooldown: 0,
        mpCost: 35
      },
      {
        id: 'holy_smite',
        name: 'Священный удар',
        description: 'Наносит 180% урона нежити (100% остальным) на расстоянии до 5 клеток.',
        type: 'attack',
        target: 'single',
        rangeType: 'ranged',
        maxRange: 5,
        damageMultiplier: 1.8,
        bonusVsUndead: 1.8,
        cooldown: 3,
        currentCooldown: 0,
        mpCost: 15
      },
      {
        id: 'divine_shield',
        name: 'Божественный щит',
        description: 'Один союзник неуязвим 1 ход',
        type: 'shield',
        target: 'single_ally',
        rangeType: 'any',
        effect: { invulnerable: 1 },
        cooldown: 5,
        currentCooldown: 0,
        mpCost: 30
      },
      {
        id: 'resurrect',
        name: 'Воскрешение',
        description: 'Возвращает павшего союзника с 30% HP',
        type: 'heal',
        target: 'dead_ally',
        rangeType: 'any',
        reviveHpPercent: 0.3,
        cooldown: 8,
        currentCooldown: 0,
        mpCost: 50
      }
    ],
    startingItem: { id: 'holy_staff', name: 'Священный посох', type: 'weapon', attackBonus: 4 }
  }
};

// ── Stat Recalculation ────────────────────────────────────────────────────────
// Recomputes effective stats from: base class × level scaling + levelBonuses + equipment
function recalcStats(character) {
  const cls = CLASSES[character.classId];
  if (!cls) return;
  const base = cls.baseStats;
  const lvl  = character.level || 1;
  const lvlMult = 1 + 0.07 * (lvl - 1);

  const lb = character.levelBonuses || {};

  // Base + level scaling + accumulated level-up bonuses
  let atk   = Math.floor(base.attack   * lvlMult) + (lb.attack   || 0);
  let def   = Math.floor(base.defense  * lvlMult) + (lb.defense  || 0);
  let maxHp = Math.floor(base.maxHp    * lvlMult) + (lb.maxHp    || 0);
  let maxMp = Math.floor(base.maxMp    * lvlMult) + (lb.maxMp    || 0);
  let spd   = base.speed                          + (lb.speed    || 0);
  let crit  = base.critChance                     + (lb.critChance || 0);

  // Add equipment bonuses
  const equip = character.equipment || {};
  for (const item of Object.values(equip)) {
    if (!item) continue;
    atk   += item.attackBonus   || 0;
    def   += item.defenseBonus  || 0;
    maxHp += item.maxHpBonus    || 0;
    maxMp += item.maxMpBonus    || 0;
    spd   += item.speedBonus    || 0;
    crit  += item.critBonus     || 0;
  }

  character.attack    = Math.max(1, atk);
  character.defense   = Math.max(0, def);
  const hpDiff = Math.max(1, maxHp) - (character.maxHp || 1);
  character.maxHp     = Math.max(1, maxHp);
  character.hp        = Math.min(character.maxHp, Math.max(1, (character.hp || 1) + Math.max(0, hpDiff)));
  const mpDiff = Math.max(0, maxMp) - (character.maxMp || 0);
  character.maxMp     = Math.max(0, maxMp);
  character.mp        = Math.min(character.maxMp, Math.max(0, (character.mp || 0) + Math.max(0, mpDiff)));
  character.speed     = Math.max(1, spd);
  character.critChance = Math.min(0.90, Math.max(0, crit));
}

function createCharacter(classId, playerName, playerId) {
  const cls = CLASSES[classId];
  if (!cls) throw new Error(`Unknown class: ${classId}`);

  const { CLASS_STARTING_WEAPONS, getItemById } = require('./items');
  const startWeaponId = CLASS_STARTING_WEAPONS[classId];
  const startWeapon   = startWeaponId ? { ...getItemById(startWeaponId) } : null;
  if (startWeapon) startWeapon.id = startWeaponId; // keep clean id for starting item

  const character = {
    id: playerId,
    name: playerName,
    classId: cls.id,
    className: cls.name,
    symbol: cls.symbol,
    level: 1,
    exp: 0,
    expToNext: 100,
    // stats will be set by recalcStats below
    hp: cls.baseStats.hp,
    maxHp: cls.baseStats.maxHp,
    mp: cls.baseStats.mp,
    maxMp: cls.baseStats.maxMp,
    attack: cls.baseStats.attack,
    defense: cls.baseStats.defense,
    speed: cls.baseStats.speed,
    critChance: cls.baseStats.critChance,
    abilities: cls.abilities.map(a => ({ ...a })),
    // Equipment slots (8 slots)
    equipment: {
      helmet:   null,
      armor:    null,
      pants:    null,
      boots:    null,
      mainHand: startWeapon,
      offHand:  null,
      ring1:    null,
      ring2:    null
    },
    // Bag of unequipped items (max 12)
    inventory: [],
    // Cumulative stat bonuses from level-up choices
    levelBonuses: { attack: 0, defense: 0, maxHp: 0, maxMp: 0, speed: 0, critChance: 0 },
    potions: 2,
    gold: 0,
    isAlive: true,
    isReady: false,
    effects: [],
    hasActed: false,
    isDefending: false,
    kills: 0,
    firstAttackUsed: false,
    ultKills: 0,
    ultReady: false,
    ultKillsNeeded: cls.ultKillsNeeded || 5,
    ultName: cls.ultName || 'Ульта',
    ultDescription: cls.ultDescription || '',
    passives: {},
    pendingLevelUp: null
  };

  // Apply equipment bonuses to base stats
  recalcStats(character);
  return character;
}

// ── Level-Up Option Pool ──────────────────────────────────────────────────────
const LEVEL_UP_OPTIONS = [
  // Universal stat boosts
  { id: 'hp_up',      name: 'Железная воля',       desc: '+20 макс. HP, восстановить 15 HP',       icon: '❤', tags: [] },
  { id: 'mp_up',      name: 'Медитация',            desc: '+20 макс. маны, восстановить 15 MP',      icon: '💧', tags: [] },
  { id: 'atk_up',     name: 'Закалённый клинок',    desc: '+4 к атаке',                              icon: '⚔', tags: [] },
  { id: 'def_up',     name: 'Стальная кожа',        desc: '+3 к защите',                             icon: '🛡', tags: [] },
  { id: 'spd_up',     name: 'Лёгкий шаг',           desc: '+2 к скорости',                           icon: '💨', tags: [] },
  { id: 'crit_up',    name: 'Острый глаз',           desc: '+5% к шансу крита',                       icon: '✦', tags: [] },
  { id: 'potion_up',  name: 'Запасливый',            desc: '+1 зелье лечения',                        icon: '🧪', tags: [] },

  // Stat tradeoffs
  { id: 'berserker',   name: 'Берсерк',          desc: '+8 атаки, −4 защиты',             icon: '⚡', tags: [] },
  { id: 'tank',        name: 'Монолит',           desc: '+8 защиты, −3 атаки',             icon: '🏔', tags: [] },
  { id: 'glasscannon', name: 'Стеклянная пушка',  desc: '+12 атаки, −15 макс. HP',         icon: '💥', tags: [] },

  // Passives
  { id: 'lifesteal',   name: 'Кровожадность',   desc: 'Обычные атаки восстанавливают 8% нанесённого урона', icon: '🩸', tags: [] },
  { id: 'thorns',      name: 'Шипы',             desc: 'При получении урона наносить 15% входящего урона обратно врагу', icon: '🌵', tags: [] },
  { id: 'mana_shield', name: 'Маговый щит',     desc: 'Раз за ход: поглотить смертельный удар, потратив 30 MP', icon: '💜', tags: [] },

  // Class-specific — Warrior
  { id: 'warrior_endure',    name: 'Стойкость воина',   desc: 'Защита в стойке блокирует 70% урона (было 50%)',          icon: '🛡', tags: ['warrior'] },
  { id: 'warrior_execute_cd',name: 'Судный час',         desc: '"Казнь" перезаряжается за 2 хода (было 3)',               icon: '⚔', tags: ['warrior'] },

  // Class-specific — Mage
  { id: 'mage_arcane',   name: 'Аркановая душа',    desc: '+30 макс. маны, регенерация +3 MP/ход',                    icon: '✦', tags: ['mage'] },
  { id: 'mage_overload', name: 'Перегрузка',         desc: '"Огненный шар" −1 кд, +0.3 к множителю урона заклинаний', icon: '🔥', tags: ['mage'] },

  // Class-specific — Rogue
  { id: 'rogue_poison',    name: 'Мастер яда',      desc: 'Яд наносит 15% HP/ход (было 10%)',                          icon: '☠', tags: ['rogue'] },
  { id: 'rogue_shadow_cd', name: 'Мастер теней',    desc: '"Шаг тени" перезаряжается за 2 хода (было 4)',              icon: '†', tags: ['rogue'] },

  // Class-specific — Cleric
  { id: 'cleric_aura',     name: 'Мощная аура',   desc: 'Аура исцеления лечит 6 HP/ход (было 3)',                      icon: '✚', tags: ['cleric'] },
  { id: 'cleric_rez_cost', name: 'Благодать',      desc: '"Воскрешение" стоит 35 MP (было 50), кд −2',                 icon: '✚', tags: ['cleric'] }
];

function generateLevelUpOptions(character, count = 3) {
  const p = character.passives || {};

  // Map passive keys → option ids that granted them (to avoid re-offering)
  const takenIds = new Set();
  if (p.lifesteal)       takenIds.add('lifesteal');
  if (p.thorns)          takenIds.add('thorns');
  if (p.manaShield)      takenIds.add('mana_shield');
  if (p.extraMpRegen)    takenIds.add('mage_arcane');
  if (p.spellDmgBonus)   takenIds.add('mage_overload');
  if (p.poisonStrength)  takenIds.add('rogue_poison');
  if (p.clericAuraBonus) takenIds.add('cleric_aura');
  if (p.defendReduction) takenIds.add('warrior_endure');

  const execute   = character.abilities?.find(a => a.id === 'execute');
  const shadowSt  = character.abilities?.find(a => a.id === 'shadow_step');
  const resurrect = character.abilities?.find(a => a.id === 'resurrect');
  const fireball  = character.abilities?.find(a => a.id === 'fireball');
  if (execute   && execute.cooldown   < 3) takenIds.add('warrior_execute_cd');
  if (shadowSt  && shadowSt.cooldown  < 4) takenIds.add('rogue_shadow_cd');
  if (resurrect && resurrect.mpCost   < 50) takenIds.add('cleric_rez_cost');
  if (fireball  && fireball.cooldown  < 3) takenIds.add('mage_overload');

  const pool = LEVEL_UP_OPTIONS.filter(o =>
    (o.tags.length === 0 || o.tags.includes(character.classId)) && !takenIds.has(o.id)
  );

  // Fisher-Yates shuffle
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.slice(0, count).map(o => ({ id: o.id, name: o.name, desc: o.desc, icon: o.icon }));
}

function applyLevelUpOption(character, optionId) {
  if (!character.passives)      character.passives    = {};
  if (!character.levelBonuses)  character.levelBonuses = { attack: 0, defense: 0, maxHp: 0, maxMp: 0, speed: 0, critChance: 0 };
  const lb = character.levelBonuses;

  switch (optionId) {
    case 'hp_up':
      lb.maxHp += 20;
      recalcStats(character);
      character.hp = Math.min(character.maxHp, character.hp + 15);
      break;
    case 'mp_up':
      lb.maxMp += 20;
      recalcStats(character);
      character.mp = Math.min(character.maxMp, character.mp + 15);
      break;
    case 'atk_up':    lb.attack   += 4;    recalcStats(character); break;
    case 'def_up':    lb.defense  += 3;    recalcStats(character); break;
    case 'spd_up':    lb.speed    += 2;    recalcStats(character); break;
    case 'crit_up':   lb.critChance = Math.min(0.70, (lb.critChance || 0) + 0.05); recalcStats(character); break;
    case 'potion_up': character.potions += 1; break;

    case 'berserker':
      lb.attack  += 8;
      lb.defense -= 4;
      recalcStats(character);
      break;
    case 'tank':
      lb.defense += 8;
      lb.attack  -= 3;
      recalcStats(character);
      break;
    case 'glasscannon':
      lb.attack  += 12;
      lb.maxHp   -= 15;
      recalcStats(character);
      break;

    case 'lifesteal':   character.passives.lifesteal  = 0.08; break;
    case 'thorns':      character.passives.thorns      = 0.15; break;
    case 'mana_shield': character.passives.manaShield  = true; break;

    case 'warrior_endure':
      character.passives.defendReduction = 0.70;
      break;
    case 'warrior_execute_cd': {
      const ex = character.abilities.find(a => a.id === 'execute');
      if (ex) { ex.cooldown = Math.max(1, ex.cooldown - 1); ex.currentCooldown = 0; }
      break;
    }
    case 'mage_arcane':
      lb.maxMp += 30;
      recalcStats(character);
      character.mp = Math.min(character.maxMp, character.mp + 30);
      character.passives.extraMpRegen = (character.passives.extraMpRegen || 0) + 3;
      break;
    case 'mage_overload': {
      const fb = character.abilities.find(a => a.id === 'fireball');
      if (fb) { fb.cooldown = Math.max(1, fb.cooldown - 1); fb.currentCooldown = 0; fb.damageMultiplier = (fb.damageMultiplier || 1.5) + 0.3; }
      character.passives.spellDmgBonus = (character.passives.spellDmgBonus || 0) + 0.3;
      break;
    }
    case 'rogue_poison':
      character.passives.poisonStrength = 0.15;
      break;
    case 'rogue_shadow_cd': {
      const ss = character.abilities.find(a => a.id === 'shadow_step');
      if (ss) { ss.cooldown = 2; ss.currentCooldown = 0; }
      break;
    }
    case 'cleric_aura':
      character.passives.clericAuraBonus = 6;
      break;
    case 'cleric_rez_cost': {
      const rez = character.abilities.find(a => a.id === 'resurrect');
      if (rez) { rez.mpCost = 35; rez.cooldown = Math.max(1, rez.cooldown - 2); rez.currentCooldown = 0; }
      break;
    }
    default:
      return false;
  }
  return true;
}

function levelUp(character) {
  character.level += 1;
  character.expToNext = Math.floor(character.expToNext * 1.5);
  if (!character.levelBonuses) character.levelBonuses = { attack: 0, defense: 0, maxHp: 0, maxMp: 0, speed: 0, critChance: 0 };

  // Recalculate stats with new level (equipment bonuses preserved through recalcStats)
  const hpBefore = character.hp;
  const mpBefore = character.mp;
  recalcStats(character);
  // Heal a bit on level up
  const cls = CLASSES[character.classId];
  character.hp = Math.min(character.maxHp, hpBefore + Math.floor(cls.baseStats.maxHp * 0.07));
  character.mp = Math.min(character.maxMp, mpBefore + Math.floor(cls.baseStats.maxMp * 0.15));

  // Generate 3 choices for player to pick
  character.pendingLevelUp = { options: generateLevelUpOptions(character) };

  return character;
}

module.exports = { CLASSES, createCharacter, levelUp, applyLevelUpOption, recalcStats, LEVEL_UP_OPTIONS };
