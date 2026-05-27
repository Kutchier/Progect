'use strict';

const { getItemById } = require('./items');

// Helper: build a loot entry from items.js (adds chance field)
function itemLoot(id, chance) {
  const item = getItemById(id);
  if (!item) return null;
  return { ...item, chance };
}

// Common consumables (standalone, no class restriction)
const POTION_SMALL  = { id: 'health_potion',  name: 'Зелье лечения',   type: 'consumable', healAmount: 35,  chance: 0.22 };
const POTION_MED    = { id: 'greater_potion',  name: 'Большое зелье',   type: 'consumable', healAmount: 70,  chance: 0.15 };
const ANTIDOTE      = { id: 'antidote',        name: 'Противоядие',     type: 'consumable', curesPoison: true, chance: 0.20 };
const MANA_SMALL    = { id: 'mana_potion',     name: 'Зелье маны',      type: 'consumable', manaAmount: 50,  chance: 0.18 };
const SPELL_SCROLL  = { id: 'spell_scroll',    name: 'Свиток заклинания', type: 'consumable', effect: 'random_spell', chance: 0.18 };
const ELIXIR_FULL   = { id: 'soul_gem',        name: 'Камень душ',      type: 'consumable', effect: 'full_heal', chance: 0.25 };
const MANA_LARGE    = { id: 'mana_large',      name: 'Большое зелье маны', type: 'consumable', manaAmount: 100, chance: 0.22 };

const ENEMY_TYPES = {
  // ── TIER 1 ───────────────────────────────────────────────────────────────────
  goblin: {
    id: 'goblin', name: 'Гоблин', symbol: '@',
    description: 'Мелкая зеленокожая тварь с ржавым ножом.',
    tier: 1, baseHp: 30, baseAttack: 8, baseDefense: 2, attackRange: 1.5,
    expReward: 15, goldReward: [3, 8], isUndead: false,
    abilities: ['attack'],
    lootTable: [
      POTION_SMALL,
      itemLoot('ring_copper_atk', 0.08),
      itemLoot('boots_leather', 0.06)
    ].filter(Boolean),
    ai: 'random'
  },

  skeleton: {
    id: 'skeleton', name: 'Скелет', symbol: 'S',
    description: 'Громыхающие кости, сжимающие пожелтевший меч.',
    tier: 1, baseHp: 40, baseAttack: 10, baseDefense: 4, attackRange: 1.5,
    expReward: 20, goldReward: [5, 12], isUndead: true,
    abilities: ['attack'],
    lootTable: [
      POTION_SMALL,
      itemLoot('helmet_leather', 0.10),
      itemLoot('amulet_bone', 0.08)
    ].filter(Boolean),
    ai: 'low_hp_target'
  },

  rat_swarm: {
    id: 'rat_swarm', name: 'Крысиная стая', symbol: 'r',
    description: 'Сотни голодных крыс, захлёстывающих жертву волной острых зубов.',
    tier: 1, baseHp: 25, baseAttack: 6, baseDefense: 1, attackRange: 1.5,
    expReward: 12, goldReward: [2, 6], isUndead: false,
    abilities: ['attack', 'poison_bite'],
    lootTable: [
      ANTIDOTE,
      itemLoot('pants_leather', 0.06)
    ].filter(Boolean),
    ai: 'random'
  },

  cave_bat: {
    id: 'cave_bat', name: 'Пещерная летучая мышь', symbol: 'b',
    description: 'Слепая тварь с острыми зубами, атакует рёвом и укусами.',
    tier: 1, baseHp: 20, baseAttack: 9, baseDefense: 0, attackRange: 1.5,
    expReward: 10, goldReward: [2, 5], isUndead: false,
    abilities: ['attack', 'stun_bash'],
    lootTable: [
      POTION_SMALL,
      itemLoot('ring_copper_def', 0.07)
    ].filter(Boolean),
    ai: 'random'
  },

  kobold: {
    id: 'kobold', name: 'Кобольд', symbol: 'k',
    description: 'Хитрый ящерообразный охотник с самодельными ловушками.',
    tier: 1, baseHp: 35, baseAttack: 7, baseDefense: 3, attackRange: 2.5,
    expReward: 18, goldReward: [4, 10], isUndead: false,
    abilities: ['attack', 'throw_trap'],
    lootTable: [
      POTION_SMALL,
      itemLoot('armor_leather', 0.08),
      itemLoot('boots_leather', 0.07)
    ].filter(Boolean),
    ai: 'random'
  },

  // ── TIER 2 ───────────────────────────────────────────────────────────────────
  zombie: {
    id: 'zombie', name: 'Зомби', symbol: 'Z',
    description: 'Гнилая плоть тащится к жертве, источая миазмы.',
    tier: 2, baseHp: 65, baseAttack: 12, baseDefense: 3, attackRange: 1.5,
    expReward: 30, goldReward: [8, 15], isUndead: true,
    abilities: ['attack', 'poison_bite'],
    lootTable: [
      ANTIDOTE,
      itemLoot('armor_leather', 0.12),
      itemLoot('pants_leather', 0.10),
      itemLoot('helmet_steel', 0.06)
    ].filter(Boolean),
    ai: 'low_hp_target'
  },

  dark_mage: {
    id: 'dark_mage', name: 'Тёмный маг', symbol: 'M',
    description: 'Безумный колдун в обугленных робах.',
    tier: 2, baseHp: 50, baseAttack: 18, baseDefense: 2, attackRange: 5,
    expReward: 40, goldReward: [10, 20], isUndead: false,
    abilities: ['attack', 'fireball', 'curse'],
    lootTable: [
      SPELL_SCROLL,
      MANA_SMALL,
      itemLoot('staff_wooden', 0.12),
      itemLoot('tome_spells', 0.08),
      itemLoot('ring_silver', 0.07)
    ].filter(Boolean),
    ai: 'low_hp_target'
  },

  werewolf: {
    id: 'werewolf', name: 'Оборотень', symbol: 'W',
    description: 'Человек, проклятый луной. В ярости теряет разум и удваивает силу.',
    tier: 2, baseHp: 60, baseAttack: 16, baseDefense: 5, attackRange: 1.5,
    expReward: 35, goldReward: [8, 18], isUndead: false,
    abilities: ['attack', 'feral_bite', 'howl'],
    lootTable: [
      POTION_MED,
      itemLoot('armor_chain', 0.10),
      itemLoot('boots_steel', 0.09),
      itemLoot('amulet_lucky', 0.08)
    ].filter(Boolean),
    ai: 'random'
  },

  giant_spider: {
    id: 'giant_spider', name: 'Гигантский паук', symbol: '8',
    description: 'Восьминогий кошмар размером с лошадь, опутывающий жертву паутиной.',
    tier: 2, baseHp: 45, baseAttack: 13, baseDefense: 3, attackRange: 1.5,
    expReward: 28, goldReward: [6, 14], isUndead: false,
    abilities: ['attack', 'poison_bite', 'web_trap'],
    lootTable: [
      ANTIDOTE,
      itemLoot('pants_reinforced', 0.10),
      itemLoot('dagger_shadow', 0.07),
      itemLoot('ring_silver', 0.06)
    ].filter(Boolean),
    ai: 'low_hp_target'
  },

  shadow: {
    id: 'shadow', name: 'Тень', symbol: '§',
    description: 'Тёмный сгусток магии, почти неуязвимый. Пьёт свет и жизненные силы.',
    tier: 2, baseHp: 40, baseAttack: 14, baseDefense: 8, attackRange: 2.5,
    expReward: 35, goldReward: [5, 12], isUndead: true,
    abilities: ['attack', 'shadow_bind', 'drain'],
    lootTable: [
      { id: 'shadow_essence', name: 'Сгусток тьмы', type: 'consumable', attackBuff: { value: 0.25, duration: 2 }, chance: 0.20 },
      itemLoot('boots_wind', 0.07),
      itemLoot('helmet_shadow', 0.04)
    ].filter(Boolean),
    ai: 'random'
  },

  // ── TIER 3 ───────────────────────────────────────────────────────────────────
  troll: {
    id: 'troll', name: 'Тролль', symbol: 'T',
    description: 'Огромная туша с дубиной, медленно, но смертоносно.',
    tier: 3, baseHp: 100, baseAttack: 22, baseDefense: 8, attackRange: 1.5,
    expReward: 60, goldReward: [15, 30], isUndead: false,
    abilities: ['attack', 'heavy_blow', 'regenerate'],
    lootTable: [
      POTION_MED,
      itemLoot('armor_plate', 0.12),
      itemLoot('helmet_horned', 0.09),
      itemLoot('ring_gold', 0.07)
    ].filter(Boolean),
    ai: 'random'
  },

  vampire: {
    id: 'vampire', name: 'Вампир', symbol: 'V',
    description: 'Бледный хищник, пьющий кровь своих жертв.',
    tier: 3, baseHp: 80, baseAttack: 25, baseDefense: 6, attackRange: 1.5,
    expReward: 70, goldReward: [20, 40], isUndead: true,
    abilities: ['attack', 'blood_drain', 'charm'],
    lootTable: [
      POTION_MED,
      itemLoot('blade_twin', 0.10),
      itemLoot('amulet_protection', 0.09),
      itemLoot('boots_shadow', 0.05)
    ].filter(Boolean),
    ai: 'low_hp_target'
  },

  death_knight: {
    id: 'death_knight', name: 'Рыцарь смерти', symbol: '†',
    description: 'Павший воин, поднятый тёмной силой. Несёт скверну в каждом ударе.',
    tier: 3, baseHp: 90, baseAttack: 20, baseDefense: 15, attackRange: 1.5,
    expReward: 55, goldReward: [15, 28], isUndead: true,
    abilities: ['attack', 'death_bolt', 'heavy_blow'],
    lootTable: [
      itemLoot('axe_battle', 0.12),
      itemLoot('armor_plate', 0.11),
      itemLoot('helmet_horned', 0.09),
      itemLoot('ring_gold', 0.07)
    ].filter(Boolean),
    ai: 'low_hp_target'
  },

  golem: {
    id: 'golem', name: 'Каменный голем', symbol: 'G',
    description: 'Оживлённая статуя из горного камня. Почти неуязвим, но медлителен.',
    tier: 3, baseHp: 130, baseAttack: 18, baseDefense: 20, attackRange: 1.5,
    expReward: 65, goldReward: [12, 25], isUndead: false,
    abilities: ['attack', 'heavy_blow'],
    lootTable: [
      itemLoot('armor_scale', 0.10),
      itemLoot('pants_plate', 0.10),
      itemLoot('amulet_protection', 0.09),
      itemLoot('ring_arcane', 0.05)
    ].filter(Boolean),
    ai: 'random'
  },

  harpy: {
    id: 'harpy', name: 'Гарпия', symbol: 'H',
    description: 'Крылатая хищница с птичьими когтями. Пикирует на жертву с высоты.',
    tier: 3, baseHp: 70, baseAttack: 24, baseDefense: 4, attackRange: 3,
    expReward: 58, goldReward: [14, 28], isUndead: false,
    abilities: ['attack', 'wing_buffet', 'screech'],
    lootTable: [
      itemLoot('boots_wind', 0.12),
      itemLoot('blade_twin', 0.09),
      itemLoot('pants_shadow', 0.06),
      itemLoot('ring_arcane', 0.05)
    ].filter(Boolean),
    ai: 'low_hp_target'
  },

  // ── TIER 4 ───────────────────────────────────────────────────────────────────
  lich: {
    id: 'lich', name: 'Лич', symbol: 'L',
    description: 'Могущественный некромант, обретший бессмертие ценой души.',
    tier: 4, baseHp: 120, baseAttack: 30, baseDefense: 10, attackRange: 6,
    expReward: 100, goldReward: [30, 60], isUndead: true,
    abilities: ['attack', 'death_bolt', 'raise_dead', 'curse'],
    lootTable: [
      ELIXIR_FULL,
      MANA_LARGE,
      itemLoot('staff_frost', 0.15),
      itemLoot('staff_arcane', 0.08),
      itemLoot('ring_arcane', 0.10),
      itemLoot('helmet_shadow', 0.08)
    ].filter(Boolean),
    ai: 'low_hp_target'
  },

  demon: {
    id: 'demon', name: 'Демон', symbol: 'D',
    description: 'Порождение Бездны, горящее чёрным огнём.',
    tier: 4, baseHp: 150, baseAttack: 35, baseDefense: 12, attackRange: 4,
    expReward: 130, goldReward: [40, 80], isUndead: false,
    abilities: ['attack', 'hellfire', 'shadow_bind', 'devour'],
    lootTable: [
      itemLoot('sword_flaming', 0.12),
      itemLoot('blade_venom', 0.10),
      itemLoot('armor_scale', 0.10),
      itemLoot('amulet_dragon', 0.08),
      itemLoot('ring_arcane', 0.07)
    ].filter(Boolean),
    ai: 'random'
  },

  witch: {
    id: 'witch', name: 'Ведьма', symbol: 'Y',
    description: 'Древняя колдунья с варевом из кошмаров. Её проклятия разъедают плоть.',
    tier: 4, baseHp: 85, baseAttack: 28, baseDefense: 6, attackRange: 5,
    expReward: 85, goldReward: [22, 45], isUndead: false,
    abilities: ['attack', 'curse', 'hellfire', 'raise_dead'],
    lootTable: [
      ELIXIR_FULL,
      MANA_LARGE,
      itemLoot('staff_arcane', 0.10),
      itemLoot('scepter_divine', 0.08),
      itemLoot('amulet_dragon', 0.09),
      itemLoot('boots_shadow', 0.08)
    ].filter(Boolean),
    ai: 'low_hp_target'
  },

  frost_giant: {
    id: 'frost_giant', name: 'Ледяной великан', symbol: 'F',
    description: 'Исполин из вечных льдов. Одним ударом кулака крушит стены.',
    tier: 4, baseHp: 160, baseAttack: 30, baseDefense: 18, attackRange: 2,
    expReward: 110, goldReward: [30, 65], isUndead: false,
    abilities: ['attack', 'heavy_blow', 'ice_breath'],
    lootTable: [
      itemLoot('armor_scale', 0.14),
      itemLoot('axe_battle', 0.12),
      itemLoot('pants_legendary', 0.06),
      itemLoot('ring_arcane', 0.08)
    ].filter(Boolean),
    ai: 'random'
  },

  nightmare: {
    id: 'nightmare', name: 'Кошмар', symbol: 'N',
    description: 'Демоническое существо из страхов и теней. Сводит с ума одним взглядом.',
    tier: 4, baseHp: 100, baseAttack: 32, baseDefense: 8, attackRange: 4,
    expReward: 120, goldReward: [35, 70], isUndead: false,
    abilities: ['attack', 'hellfire', 'shadow_bind', 'devour'],
    lootTable: [
      { id: 'nightmare_essence', name: 'Эссенция кошмара', type: 'consumable', attackBuff: { value: 0.6, duration: 2 }, chance: 0.20 },
      itemLoot('blade_venom', 0.10),
      itemLoot('boots_shadow', 0.09),
      itemLoot('ring_arcane', 0.08),
      itemLoot('amulet_dragon', 0.07)
    ].filter(Boolean),
    ai: 'low_hp_target'
  },

  // ── BOSSES ────────────────────────────────────────────────────────────────────
  dragon_boss: {
    id: 'dragon_boss', name: 'Дракон Тьмы', symbol: 'Ω',
    description: 'БОСС — Древний дракон, несущий смерть и разрушение.',
    tier: 5, baseHp: 400, baseAttack: 45, baseDefense: 20, attackRange: 3,
    expReward: 500, goldReward: [100, 200], isUndead: false, isBoss: true,
    abilities: ['attack', 'dragon_breath', 'tail_sweep', 'wing_buffet', 'devour'],
    lootTable: [
      ELIXIR_FULL,
      itemLoot('armor_dragon', 1.0),
      itemLoot('sword_doom', 0.60),
      itemLoot('blade_death', 0.60),
      itemLoot('staff_void', 0.60),
      itemLoot('weapon_judgment', 0.60),
      itemLoot('ring_destiny', 0.80),
      itemLoot('amulet_void', 0.80)
    ].filter(Boolean),
    ai: 'tactical'
  },

  spider_queen: {
    id: 'spider_queen', name: 'Паучья Королева', symbol: 'Q',
    description: 'БОСС — Гигантский паук, мать тысяч порождений.',
    tier: 5, baseHp: 300, baseAttack: 35, baseDefense: 15, attackRange: 2,
    expReward: 400, goldReward: [80, 150], isUndead: false, isBoss: true,
    abilities: ['attack', 'poison_spray', 'spawn_spiders', 'web_trap'],
    lootTable: [
      ELIXIR_FULL,
      itemLoot('blade_venom', 1.0),
      itemLoot('armor_scale', 1.0),
      itemLoot('boots_shadow', 0.80),
      itemLoot('amulet_dragon', 0.80)
    ].filter(Boolean),
    ai: 'tactical'
  },

  chaos_lord: {
    id: 'chaos_lord', name: 'Повелитель Хаоса', symbol: 'Ж',
    description: 'БОСС — Древнее воплощение хаоса. Его появление предвещает конец всего.',
    tier: 5, baseHp: 500, baseAttack: 50, baseDefense: 22, attackRange: 5,
    expReward: 700, goldReward: [120, 280], isUndead: false, isBoss: true,
    abilities: ['attack', 'hellfire', 'death_bolt', 'dragon_breath', 'devour', 'chaos_bolt'],
    lootTable: [
      ELIXIR_FULL,
      itemLoot('sword_doom', 1.0),
      itemLoot('blade_death', 1.0),
      itemLoot('staff_void', 1.0),
      itemLoot('weapon_judgment', 1.0),
      itemLoot('helmet_crown', 1.0),
      itemLoot('ring_destiny', 1.0),
      itemLoot('amulet_void', 1.0)
    ].filter(Boolean),
    ai: 'tactical'
  }
};

function createEnemy(typeId, scaleFactor = 1.0) {
  const type = ENEMY_TYPES[typeId];
  if (!type) throw new Error(`Unknown enemy type: ${typeId}`);

  const hp = Math.floor(type.baseHp * scaleFactor);
  return {
    id: `${typeId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    typeId: type.id,
    name: type.name,
    symbol: type.symbol,
    description: type.description,
    hp,
    maxHp: hp,
    attack: Math.floor(type.baseAttack * scaleFactor),
    defense: Math.floor(type.baseDefense * scaleFactor),
    expReward: Math.floor(type.expReward * scaleFactor),
    goldReward: type.goldReward,
    isUndead: type.isUndead,
    isBoss: type.isBoss || false,
    attackRange: type.attackRange || 1.5,
    abilities: [...type.abilities],
    lootTable: type.lootTable,
    ai: type.ai,
    isAlive: true,
    effects: []
  };
}

function getEnemiesForFloor(floor) {
  if (floor <= 2)  return ['goblin', 'skeleton', 'rat_swarm', 'cave_bat'];
  if (floor <= 4)  return ['goblin', 'skeleton', 'kobold', 'zombie', 'giant_spider'];
  if (floor <= 6)  return ['zombie', 'dark_mage', 'werewolf', 'giant_spider', 'shadow'];
  if (floor <= 8)  return ['troll', 'vampire', 'harpy', 'death_knight', 'golem'];
  if (floor <= 10) return ['lich', 'demon', 'witch', 'nightmare'];
  return ['frost_giant', 'nightmare', 'lich', 'demon', 'witch'];
}

function getBossForFloor(floor) {
  if (floor <= 2) return 'spider_queen';
  if (floor <= 4) return 'dragon_boss';
  return 'chaos_lord';
}

module.exports = { ENEMY_TYPES, createEnemy, getEnemiesForFloor, getBossForFloor };
