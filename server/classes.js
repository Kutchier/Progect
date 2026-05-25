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
        type: 'taunt',
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
        type: 'resurrect',
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

function createCharacter(classId, playerName, playerId) {
  const cls = CLASSES[classId];
  if (!cls) throw new Error(`Unknown class: ${classId}`);

  return {
    id: playerId,
    name: playerName,
    classId: cls.id,
    className: cls.name,
    symbol: cls.symbol,
    level: 1,
    exp: 0,
    expToNext: 100,
    hp: cls.baseStats.hp,
    maxHp: cls.baseStats.maxHp,
    mp: cls.baseStats.mp,
    maxMp: cls.baseStats.maxMp,
    attack: cls.baseStats.attack,
    defense: cls.baseStats.defense,
    speed: cls.baseStats.speed,
    critChance: cls.baseStats.critChance,
    abilities: cls.abilities.map(a => ({ ...a })),
    inventory: [{ ...cls.startingItem, quantity: 1 }],
    potions: 2,
    gold: 0,
    isAlive: true,
    isReady: false,
    effects: [],
    hasActed: false,
    isDefending: false
  };
}

function levelUp(character) {
  character.level += 1;
  character.expToNext = Math.floor(character.expToNext * 1.5);

  const cls = CLASSES[character.classId];
  const base = cls.baseStats;

  character.maxHp = Math.floor(base.maxHp * (1 + 0.1 * (character.level - 1)));
  character.hp = Math.min(character.hp + Math.floor(base.maxHp * 0.1), character.maxHp);
  character.maxMp = Math.floor(base.maxMp * (1 + 0.1 * (character.level - 1)));
  character.mp = Math.min(character.mp + Math.floor(base.maxMp * 0.2), character.maxMp);
  character.attack = Math.floor(base.attack * (1 + 0.1 * (character.level - 1)));
  character.defense = Math.floor(base.defense * (1 + 0.1 * (character.level - 1)));

  return character;
}

module.exports = { CLASSES, createCharacter, levelUp };
