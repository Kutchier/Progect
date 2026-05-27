'use strict';

// ═══════════════════════════════════════════════════════
//  RARITY SYSTEM
// ═══════════════════════════════════════════════════════
const RARITY = {
  common:    { id: 'common',    name: 'Обычный',     color: '#9a9a9a', glow: 'rgba(154,154,154,0.3)' },
  uncommon:  { id: 'uncommon',  name: 'Необычный',   color: '#1ec94e', glow: 'rgba(30,201,78,0.35)'  },
  rare:      { id: 'rare',      name: 'Редкий',      color: '#e03030', glow: 'rgba(224,48,48,0.4)'   },
  epic:      { id: 'epic',      name: 'Эпический',   color: '#b035e0', glow: 'rgba(176,53,224,0.45)' },
  legendary: { id: 'legendary', name: 'Легендарный', color: '#e0a800', glow: 'rgba(224,168,0,0.55)'  }
};

// ═══════════════════════════════════════════════════════
//  EQUIPMENT SLOTS
// ═══════════════════════════════════════════════════════
const EQUIP_SLOTS = {
  helmet:   { id: 'helmet',   name: 'Шлем',        pos: 'top' },
  armor:    { id: 'armor',    name: 'Броня',        pos: 'center' },
  pants:    { id: 'pants',    name: 'Штаны',        pos: 'lower' },
  boots:    { id: 'boots',    name: 'Сапоги',       pos: 'bottom' },
  mainHand: { id: 'mainHand', name: 'Правая рука',  pos: 'left' },
  offHand:  { id: 'offHand',  name: 'Левая рука',   pos: 'right' },
  ring1:    { id: 'ring1',    name: 'Украшение I',  pos: 'ring-left' },
  ring2:    { id: 'ring2',    name: 'Украшение II', pos: 'ring-right' }
};

const EQUIP_SLOT_KEYS = Object.keys(EQUIP_SLOTS);

// ═══════════════════════════════════════════════════════
//  WEAPON TYPE → CLASS RESTRICTIONS
// ═══════════════════════════════════════════════════════
// Warriors use heavy melee, rogues use light/ranged, mages use arcane, clerics use divine
const WEAPON_CLASS_MAP = {
  sword:      ['warrior'],
  axe:        ['warrior'],
  greatsword: ['warrior'],
  dagger:     ['rogue'],
  blade:      ['rogue'],
  bow:        ['rogue'],
  staff:      ['mage'],
  tome:       ['mage'],
  wand:       ['mage'],
  holy_staff: ['cleric'],
  mace:       ['cleric'],
  scepter:    ['cleric']
};

// ═══════════════════════════════════════════════════════
//  ALL ITEMS DATABASE
// ═══════════════════════════════════════════════════════
const ALL_ITEMS = [

  // ══════════ HELMETS ══════════
  {
    id: 'helmet_leather', name: 'Кожаный шлем',
    slot: 'helmet', type: 'helmet', rarity: 'common', iconKey: 'helmet',
    defenseBonus: 2,
    desc: 'Простая кожаная защита для головы.',
    dropChance: 0.18
  },
  {
    id: 'helmet_steel', name: 'Стальной шлем',
    slot: 'helmet', type: 'helmet', rarity: 'uncommon', iconKey: 'helmet',
    defenseBonus: 5, maxHpBonus: 15,
    desc: 'Закалённый шлем из высококачественной стали. +15 HP.',
    dropChance: 0.10
  },
  {
    id: 'helmet_horned', name: 'Рогатый шлем',
    slot: 'helmet', type: 'helmet', rarity: 'rare', iconKey: 'helmet',
    defenseBonus: 8, attackBonus: 3,
    desc: 'Шлем с железными рогами. Устрашает врагов. +3 ATK.',
    dropChance: 0.05
  },
  {
    id: 'helmet_shadow', name: 'Шлем теней',
    slot: 'helmet', type: 'helmet', rarity: 'epic', iconKey: 'helmet',
    defenseBonus: 11, critBonus: 0.05,
    desc: 'Тьма обволакивает разум. +5% шанс крита.',
    dropChance: 0.02
  },
  {
    id: 'helmet_crown', name: 'Корона вечности',
    slot: 'helmet', type: 'helmet', rarity: 'legendary', iconKey: 'helmet',
    defenseBonus: 16, maxHpBonus: 40, attackBonus: 8,
    desc: 'Корона павшего короля. Дарует неземную мощь.',
    dropChance: 0.005
  },

  // ══════════ ARMOR ══════════
  {
    id: 'armor_leather', name: 'Кожаная броня',
    slot: 'armor', type: 'armor', rarity: 'common', iconKey: 'armor',
    defenseBonus: 4,
    desc: 'Базовая кожаная броня. Лёгкая и удобная.',
    dropChance: 0.18
  },
  {
    id: 'armor_chain', name: 'Кольчуга',
    slot: 'armor', type: 'armor', rarity: 'uncommon', iconKey: 'armor',
    defenseBonus: 8, maxHpBonus: 15,
    desc: 'Плетёная металлическая броня. Хорошо держит удары.',
    dropChance: 0.10
  },
  {
    id: 'armor_plate', name: 'Латная броня',
    slot: 'armor', type: 'armor', rarity: 'rare', iconKey: 'armor',
    defenseBonus: 14, maxHpBonus: 20,
    desc: 'Тяжёлые латы из лучшей стали. Почти неуязвима.',
    dropChance: 0.05
  },
  {
    id: 'armor_scale', name: 'Чешуйчатый доспех',
    slot: 'armor', type: 'armor', rarity: 'epic', iconKey: 'armor',
    defenseBonus: 18, maxHpBonus: 30, attackBonus: 4,
    desc: 'Доспех из чешуи дракона. Лёгкий и прочный.',
    dropChance: 0.02
  },
  {
    id: 'armor_dragon', name: 'Доспех дракона',
    slot: 'armor', type: 'armor', rarity: 'legendary', iconKey: 'armor',
    defenseBonus: 26, maxHpBonus: 60, attackBonus: 6,
    desc: 'Выкован из костей самого Древнего Дракона.',
    dropChance: 0.004
  },

  // ══════════ PANTS ══════════
  {
    id: 'pants_leather', name: 'Кожаные штаны',
    slot: 'pants', type: 'pants', rarity: 'common', iconKey: 'pants',
    defenseBonus: 2,
    desc: 'Простые кожаные штаны авантюриста.',
    dropChance: 0.18
  },
  {
    id: 'pants_reinforced', name: 'Усиленные штаны',
    slot: 'pants', type: 'pants', rarity: 'uncommon', iconKey: 'pants',
    defenseBonus: 4, maxHpBonus: 12,
    desc: 'Штаны с металлическими пластинами на коленях.',
    dropChance: 0.10
  },
  {
    id: 'pants_plate', name: 'Латные поножи',
    slot: 'pants', type: 'pants', rarity: 'rare', iconKey: 'pants',
    defenseBonus: 7, maxHpBonus: 18,
    desc: 'Тяжёлые поножи из закалённого железа.',
    dropChance: 0.05
  },
  {
    id: 'pants_shadow', name: 'Штаны теней',
    slot: 'pants', type: 'pants', rarity: 'epic', iconKey: 'pants',
    defenseBonus: 9, critBonus: 0.03, speedBonus: 1,
    desc: 'Тёмные штаны призрака. Скрытность и скорость.',
    dropChance: 0.02
  },
  {
    id: 'pants_legendary', name: 'Поножи воителя',
    slot: 'pants', type: 'pants', rarity: 'legendary', iconKey: 'pants',
    defenseBonus: 14, maxHpBonus: 35, speedBonus: 2,
    desc: 'Легендарные поножи великого воителя древности.',
    dropChance: 0.004
  },

  // ══════════ BOOTS ══════════
  {
    id: 'boots_leather', name: 'Кожаные сапоги',
    slot: 'boots', type: 'boots', rarity: 'common', iconKey: 'boots',
    speedBonus: 1,
    desc: 'Удобные кожаные сапоги странника.',
    dropChance: 0.18
  },
  {
    id: 'boots_steel', name: 'Стальные сапоги',
    slot: 'boots', type: 'boots', rarity: 'uncommon', iconKey: 'boots',
    defenseBonus: 3, speedBonus: 2,
    desc: 'Прочные сапоги с металлическими накладками.',
    dropChance: 0.10
  },
  {
    id: 'boots_wind', name: 'Сапоги ветра',
    slot: 'boots', type: 'boots', rarity: 'rare', iconKey: 'boots',
    speedBonus: 4, critBonus: 0.04,
    desc: 'Сапоги из кожи грифона. Невероятная скорость.',
    dropChance: 0.05
  },
  {
    id: 'boots_shadow', name: 'Теневые сапоги',
    slot: 'boots', type: 'boots', rarity: 'epic', iconKey: 'boots',
    speedBonus: 5, maxHpBonus: 20, critBonus: 0.03,
    desc: 'Ступни окутаны тьмой. Беззвучные и стремительные.',
    dropChance: 0.02
  },
  {
    id: 'boots_lightning', name: 'Сапоги молнии',
    slot: 'boots', type: 'boots', rarity: 'legendary', iconKey: 'boots',
    speedBonus: 8, attackBonus: 5, critBonus: 0.05,
    desc: 'Молния застыла в подошвах. Быстрее мысли.',
    dropChance: 0.004
  },

  // ══════════ WARRIOR WEAPONS ══════════
  {
    id: 'sword_iron', name: 'Железный меч',
    slot: 'mainHand', type: 'weapon', weaponType: 'sword',
    classRestrictions: ['warrior'], rarity: 'common', iconKey: 'sword',
    attackBonus: 5,
    desc: 'Надёжный железный меч. Оружие молодых воинов.',
    dropChance: 0.15
  },
  {
    id: 'sword_steel', name: 'Стальной меч',
    slot: 'mainHand', type: 'weapon', weaponType: 'sword',
    classRestrictions: ['warrior'], rarity: 'uncommon', iconKey: 'sword',
    attackBonus: 11,
    desc: 'Стальной клинок отменной ковки. +11 ATK.',
    dropChance: 0.09
  },
  {
    id: 'axe_battle', name: 'Боевой топор',
    slot: 'mainHand', type: 'weapon', weaponType: 'axe',
    classRestrictions: ['warrior'], rarity: 'rare', iconKey: 'axe',
    attackBonus: 17, critBonus: 0.04,
    desc: 'Тяжёлый боевой топор берсерка. +4% крит.',
    dropChance: 0.05
  },
  {
    id: 'sword_flaming', name: 'Пылающий меч',
    slot: 'mainHand', type: 'weapon', weaponType: 'sword',
    classRestrictions: ['warrior'], rarity: 'epic', iconKey: 'sword',
    attackBonus: 23, maxHpBonus: 20,
    desc: 'Меч, охваченный вечным пламенем ада.',
    dropChance: 0.02
  },
  {
    id: 'sword_doom', name: 'Клинок рока',
    slot: 'mainHand', type: 'weapon', weaponType: 'greatsword',
    classRestrictions: ['warrior'], rarity: 'legendary', iconKey: 'sword',
    attackBonus: 34, critBonus: 0.08, defenseBonus: 5,
    desc: 'Легендарный клинок. Несёт погибель всему живому.',
    dropChance: 0.004
  },

  // ══════════ ROGUE WEAPONS ══════════
  {
    id: 'dagger_rusty', name: 'Ржавый кинжал',
    slot: 'mainHand', type: 'weapon', weaponType: 'dagger',
    classRestrictions: ['rogue'], rarity: 'common', iconKey: 'dagger',
    attackBonus: 4, critBonus: 0.03,
    desc: 'Потёртый кинжал с острым лезвием. Хорош для внезапных ударов.',
    dropChance: 0.15
  },
  {
    id: 'dagger_shadow', name: 'Кинжал теней',
    slot: 'mainHand', type: 'weapon', weaponType: 'dagger',
    classRestrictions: ['rogue'], rarity: 'uncommon', iconKey: 'dagger',
    attackBonus: 9, critBonus: 0.06,
    desc: 'Кинжал из тьмы. Создан для убийств.',
    dropChance: 0.09
  },
  {
    id: 'blade_twin', name: 'Парные клинки',
    slot: 'mainHand', type: 'weapon', weaponType: 'blade',
    classRestrictions: ['rogue'], rarity: 'rare', iconKey: 'dagger',
    attackBonus: 15, critBonus: 0.08,
    desc: 'Два клинка для смертоносного танца теней.',
    dropChance: 0.05
  },
  {
    id: 'blade_venom', name: 'Ядовитый клинок',
    slot: 'mainHand', type: 'weapon', weaponType: 'blade',
    classRestrictions: ['rogue'], rarity: 'epic', iconKey: 'dagger',
    attackBonus: 20, critBonus: 0.12,
    desc: 'Пропитан ядом смертоносной гадюки.',
    dropChance: 0.02
  },
  {
    id: 'blade_death', name: 'Клинок смерти',
    slot: 'mainHand', type: 'weapon', weaponType: 'blade',
    classRestrictions: ['rogue'], rarity: 'legendary', iconKey: 'dagger',
    attackBonus: 30, critBonus: 0.18,
    desc: 'Оружие самого Азраэля. Крит неизбежен.',
    dropChance: 0.004
  },

  // ══════════ MAGE WEAPONS ══════════
  {
    id: 'staff_wooden', name: 'Деревянный посох',
    slot: 'mainHand', type: 'weapon', weaponType: 'staff',
    classRestrictions: ['mage'], rarity: 'common', iconKey: 'staff',
    attackBonus: 3, maxMpBonus: 20,
    desc: 'Простой деревянный посох начинающего мага.',
    dropChance: 0.15
  },
  {
    id: 'tome_spells', name: 'Гримуар заклинаний',
    slot: 'mainHand', type: 'weapon', weaponType: 'tome',
    classRestrictions: ['mage'], rarity: 'uncommon', iconKey: 'tome',
    attackBonus: 8, maxMpBonus: 35,
    desc: 'Гримуар запретных заклятий. Мана переполняет.',
    dropChance: 0.09
  },
  {
    id: 'staff_frost', name: 'Посох льда',
    slot: 'mainHand', type: 'weapon', weaponType: 'staff',
    classRestrictions: ['mage'], rarity: 'rare', iconKey: 'staff',
    attackBonus: 14, maxMpBonus: 50,
    desc: 'Посох из вечного льда. Замораживает реальность.',
    dropChance: 0.05
  },
  {
    id: 'staff_arcane', name: 'Аркановый скипетр',
    slot: 'mainHand', type: 'weapon', weaponType: 'wand',
    classRestrictions: ['mage'], rarity: 'epic', iconKey: 'staff',
    attackBonus: 20, maxMpBonus: 70,
    desc: 'Скипетр с кристаллом чистой арканы.',
    dropChance: 0.02
  },
  {
    id: 'staff_void', name: 'Посох пустоты',
    slot: 'mainHand', type: 'weapon', weaponType: 'staff',
    classRestrictions: ['mage'], rarity: 'legendary', iconKey: 'staff',
    attackBonus: 30, maxMpBonus: 100,
    desc: 'Создан из пустоты между мирами. Безграничная сила.',
    dropChance: 0.004
  },

  // ══════════ CLERIC WEAPONS ══════════
  {
    id: 'mace_iron', name: 'Железная булава',
    slot: 'mainHand', type: 'weapon', weaponType: 'mace',
    classRestrictions: ['cleric'], rarity: 'common', iconKey: 'mace',
    attackBonus: 4, defenseBonus: 2,
    desc: 'Булава жреца. Карает нечестивых.',
    dropChance: 0.15
  },
  {
    id: 'mace_holy', name: 'Священная булава',
    slot: 'mainHand', type: 'weapon', weaponType: 'mace',
    classRestrictions: ['cleric'], rarity: 'uncommon', iconKey: 'mace',
    attackBonus: 9, maxHpBonus: 25,
    desc: 'Булава, освящённая богами света.',
    dropChance: 0.09
  },
  {
    id: 'staff_sacred', name: 'Священный посох',
    slot: 'mainHand', type: 'weapon', weaponType: 'holy_staff',
    classRestrictions: ['cleric'], rarity: 'rare', iconKey: 'mace',
    attackBonus: 14, maxHpBonus: 35,
    desc: 'Посох высшего священника. Наполнен святой силой.',
    dropChance: 0.05
  },
  {
    id: 'scepter_divine', name: 'Божественный скипетр',
    slot: 'mainHand', type: 'weapon', weaponType: 'scepter',
    classRestrictions: ['cleric'], rarity: 'epic', iconKey: 'mace',
    attackBonus: 19, maxHpBonus: 55, maxMpBonus: 20,
    desc: 'Скипетр самого архиепископа. Богам угоден.',
    dropChance: 0.02
  },
  {
    id: 'weapon_judgment', name: 'Суд небес',
    slot: 'mainHand', type: 'weapon', weaponType: 'scepter',
    classRestrictions: ['cleric'], rarity: 'legendary', iconKey: 'mace',
    attackBonus: 27, maxHpBonus: 75, maxMpBonus: 35,
    desc: 'Оружие небесного суда. Враги пред ним падают ниц.',
    dropChance: 0.004
  },

  // ══════════ RINGS (slot ring1 / ring2) ══════════
  {
    id: 'ring_copper_atk', name: 'Медное кольцо силы',
    slot: 'ring1', type: 'ring', rarity: 'common', iconKey: 'ring',
    attackBonus: 2,
    desc: 'Простое кольцо. Слегка усиливает удар.',
    dropChance: 0.15
  },
  {
    id: 'ring_copper_def', name: 'Медное кольцо стража',
    slot: 'ring1', type: 'ring', rarity: 'common', iconKey: 'ring',
    defenseBonus: 2,
    desc: 'Простое кольцо. Усиливает стойкость.',
    dropChance: 0.15
  },
  {
    id: 'ring_silver', name: 'Серебряное кольцо',
    slot: 'ring1', type: 'ring', rarity: 'uncommon', iconKey: 'ring',
    attackBonus: 4, defenseBonus: 3,
    desc: 'Кольцо с рунами силы и защиты.',
    dropChance: 0.09
  },
  {
    id: 'ring_gold', name: 'Золотое кольцо',
    slot: 'ring1', type: 'ring', rarity: 'rare', iconKey: 'ring',
    attackBonus: 7, maxHpBonus: 20,
    desc: 'Золотое кольцо с рубином. Даёт жизненную силу.',
    dropChance: 0.045
  },
  {
    id: 'ring_arcane', name: 'Кольцо колдуна',
    slot: 'ring1', type: 'ring', rarity: 'epic', iconKey: 'ring',
    attackBonus: 11, defenseBonus: 6, maxMpBonus: 20,
    desc: 'Кольцо архимага. Аркана ощущается физически.',
    dropChance: 0.015
  },
  {
    id: 'ring_destiny', name: 'Кольцо судьбы',
    slot: 'ring1', type: 'ring', rarity: 'legendary', iconKey: 'ring',
    attackBonus: 15, defenseBonus: 10, maxHpBonus: 50,
    desc: 'Меняет нити судьбы. Носитель непобедим.',
    dropChance: 0.003
  },

  // ══════════ AMULETS (slot ring2) ══════════
  {
    id: 'amulet_bone', name: 'Костяной амулет',
    slot: 'ring2', type: 'ring', rarity: 'common', iconKey: 'amulet',
    defenseBonus: 2,
    desc: 'Грубый амулет из костей существ подземелья.',
    dropChance: 0.15
  },
  {
    id: 'amulet_lucky', name: 'Амулет удачи',
    slot: 'ring2', type: 'ring', rarity: 'uncommon', iconKey: 'amulet',
    attackBonus: 3, defenseBonus: 3, critBonus: 0.02,
    desc: 'Приносит удачу в бою. Крит чаще.',
    dropChance: 0.09
  },
  {
    id: 'amulet_protection', name: 'Амулет защиты',
    slot: 'ring2', type: 'ring', rarity: 'rare', iconKey: 'amulet',
    defenseBonus: 9, maxHpBonus: 22,
    desc: 'Мощный амулет, оберегающий от ударов.',
    dropChance: 0.045
  },
  {
    id: 'amulet_dragon', name: 'Клык дракона',
    slot: 'ring2', type: 'ring', rarity: 'epic', iconKey: 'amulet',
    attackBonus: 10, defenseBonus: 8, maxHpBonus: 20,
    desc: 'Амулет из зуба дракона. Часть его силы теперь ваша.',
    dropChance: 0.015
  },
  {
    id: 'amulet_void', name: 'Сердце пустоты',
    slot: 'ring2', type: 'ring', rarity: 'legendary', iconKey: 'amulet',
    attackBonus: 14, defenseBonus: 14, maxHpBonus: 45,
    desc: 'Артефакт из межмирья. Сама пустота защищает носителя.',
    dropChance: 0.003
  }
];

// Starting weapon IDs per class
const CLASS_STARTING_WEAPONS = {
  warrior: 'sword_iron',
  mage:    'staff_wooden',
  rogue:   'dagger_rusty',
  cleric:  'mace_iron'
};

// ─── Helper Functions ──────────────────────────────────────────────────────────
function getItemById(id) {
  return ALL_ITEMS.find(i => i.id === id) || null;
}

function canEquipItem(character, item) {
  if (!item) return false;
  if (item.type === 'weapon' && item.classRestrictions?.length > 0) {
    if (!item.classRestrictions.includes(character.classId)) return false;
  }
  return true;
}

function getSlotFor(item) {
  // ring items can go to ring1 or ring2
  if (item.slot === 'ring1' || item.slot === 'ring2') return null; // choose at equip time
  return item.slot;
}

// Roll a random drop item taking floor number into account
function rollLootItem(floorNumber = 1) {
  const rarityWeights = {
    common:    Math.max(0.30, 0.60 - floorNumber * 0.05),
    uncommon:  Math.min(0.35, 0.20 + floorNumber * 0.04),
    rare:      Math.min(0.20, 0.08 + floorNumber * 0.025),
    epic:      Math.min(0.12, floorNumber * 0.018),
    legendary: Math.min(0.04, floorNumber * 0.006)
  };

  const roll = Math.random();
  let cumulative = 0;
  let selectedRarity = 'common';
  for (const [rar, w] of Object.entries(rarityWeights)) {
    cumulative += w;
    if (roll < cumulative) { selectedRarity = rar; break; }
  }

  const candidates = ALL_ITEMS.filter(i => i.rarity === selectedRarity && i.dropChance > 0);
  if (candidates.length === 0) return null;
  const base = candidates[Math.floor(Math.random() * candidates.length)];
  return { ...base, id: base.id + '_' + Date.now() + '_' + Math.floor(Math.random() * 1000) };
}

module.exports = {
  RARITY, EQUIP_SLOTS, EQUIP_SLOT_KEYS, ALL_ITEMS,
  CLASS_STARTING_WEAPONS, WEAPON_CLASS_MAP,
  getItemById, canEquipItem, getSlotFor, rollLootItem
};
