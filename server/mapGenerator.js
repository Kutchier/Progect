'use strict';

const { createEnemy, getEnemiesForFloor, getBossForFloor } = require('./enemies');

const ROOM_TYPES = {
  combat:   { id: 'combat',   name: 'Боевая комната',       symbol: '⚔',  weight: 40 },
  treasure: { id: 'treasure', name: 'Сокровищница',          symbol: '★',  weight: 15 },
  rest:     { id: 'rest',     name: 'Лагерь отдыха',         symbol: '⛺', weight: 15 },
  secret:   { id: 'secret',   name: 'Тайная комната',        symbol: '?',  weight: 10 },
  riddle:   { id: 'riddle',   name: 'Комната загадки',       symbol: '🔮', weight: 10 },
  merchant: { id: 'merchant', name: 'Загадочный торговец',   symbol: '⚖',  weight: 8  },
  boss:     { id: 'boss',     name: 'Логово босса',          symbol: '☠',  weight: 0  },
  start:    { id: 'start',    name: 'Вход',                  symbol: '▶',  weight: 0  }
};

const SHOP_ITEMS = [
  // ── TIER 1 WEAPONS ──────────────────────────────────────────────────────────
  { id: 'ws_iron_sword',    name: 'Железный меч',         type: 'weapon', slot: 'mainHand', tier: 1, price: 35,
    attackBonus: 5,  desc: '+5 к атаке.' },
  { id: 'ws_bone_axe',      name: 'Костяной топор',       type: 'weapon', slot: 'mainHand', tier: 1, price: 45,
    attackBonus: 7,  desc: '+7 к атаке.' },
  { id: 'ws_shadow_dagger', name: 'Кинжал теней',         type: 'weapon', slot: 'mainHand', tier: 1, price: 55,
    attackBonus: 9,  desc: '+9 к атаке.' },
  // ── TIER 1 ARMOR ────────────────────────────────────────────────────────────
  { id: 'as_leather_armor', name: 'Кожаная броня',        type: 'armor',  slot: 'armor',    tier: 1, price: 28,
    defenseBonus: 5, desc: '+5 к защите.' },
  // ── TIER 1 ACCESSORIES ──────────────────────────────────────────────────────
  { id: 'ac_ring_power',    name: 'Кольцо силы',          type: 'ring',   slot: 'ring1',    tier: 1, price: 60,
    attackBonus: 7,  desc: '+7 к атаке.' },
  { id: 'ac_ring_defense',  name: 'Кольцо защиты',        type: 'ring',   slot: 'ring1',    tier: 1, price: 55,
    defenseBonus: 7, desc: '+7 к защите.' },
  { id: 'ac_lucky_charm',   name: 'Амулет удачи',         type: 'ring',   slot: 'ring1',    tier: 1, price: 70,
    attackBonus: 5, defenseBonus: 3, desc: '+5 атк, +3 защ.' },
  // ── TIER 1 CONSUMABLES ──────────────────────────────────────────────────────
  { id: 'cs_potion_minor',  name: 'Малое зелье',          type: 'consumable', tier: 1, price: 18,
    healAmount: 35,  desc: 'Восстанавливает 35 HP.' },
  { id: 'cs_potion_health', name: 'Зелье лечения',        type: 'consumable', tier: 1, price: 35,
    healAmount: 70,  desc: 'Восстанавливает 70 HP.' },
  { id: 'cs_antidote',      name: 'Противоядие',          type: 'consumable', tier: 1, price: 30,
    healAmount: 45,  desc: 'Снимает яд, восстанавливает 45 HP.' },
  { id: 'cs_mana_minor',    name: 'Малое зелье маны',     type: 'consumable', tier: 1, price: 25,
    manaAmount: 30,  desc: 'Восстанавливает 30 MP.' },
  { id: 'cs_mana_potion',   name: 'Зелье маны',           type: 'consumable', tier: 1, price: 50,
    manaAmount: 70,  desc: 'Восстанавливает 70 MP.' },
  { id: 'cs_poison_vial',   name: 'Склянка яда',          type: 'consumable', tier: 1, price: 45,
    poisonEffect: { value: 0.08, duration: 4 }, desc: 'Отравляет врага на 4 хода.' },
  { id: 'cs_scroll_fire',   name: 'Свиток огня',          type: 'consumable', tier: 1, price: 55,
    damage: { amount: 45, target: 'all_enemies' }, desc: 'Наносит 45 урона всем врагам.' },
  { id: 'cs_smoke_bomb',    name: 'Дымовая бомба',        type: 'consumable', tier: 1, price: 50,
    defenseBuff: { value: 0.6, duration: 2 }, desc: 'Защита +60% на 2 хода.' },

  // ── TIER 2 WEAPONS ──────────────────────────────────────────────────────────
  { id: 'ws_steel_sword',   name: 'Стальной меч',         type: 'weapon', slot: 'mainHand', tier: 2, price: 75,
    attackBonus: 12, desc: '+12 к атаке.' },
  { id: 'ws_battle_axe',    name: 'Боевой топор',         type: 'weapon', slot: 'mainHand', tier: 2, price: 95,
    attackBonus: 15, desc: '+15 к атаке.' },
  { id: 'ws_bone_bow',      name: 'Костяной лук',         type: 'weapon', slot: 'mainHand', tier: 2, price: 85,
    attackBonus: 12, desc: '+12 к атаке.' },
  { id: 'ws_frost_staff',   name: 'Посох льда',           type: 'weapon', slot: 'mainHand', tier: 2, price: 110,
    attackBonus: 15, desc: '+15 к атаке.' },
  // ── TIER 2 ARMOR ────────────────────────────────────────────────────────────
  { id: 'as_chain_mail',    name: 'Кольчуга',             type: 'armor',  slot: 'armor',    tier: 2, price: 70,
    defenseBonus: 11, desc: '+11 к защите.' },
  { id: 'as_shadow_cloak',  name: 'Плащ теней',           type: 'armor',  slot: 'armor',    tier: 2, price: 90,
    defenseBonus: 9, attackBonus: 4, desc: '+9 защ, +4 атк.' },
  { id: 'as_mage_robe',     name: 'Мантия мага',          type: 'armor',  slot: 'armor',    tier: 2, price: 95,
    defenseBonus: 8, attackBonus: 7, desc: '+8 защ, +7 атк.' },
  // ── TIER 2 ACCESSORIES ──────────────────────────────────────────────────────
  { id: 'ac_ring_vitality',  name: 'Кольцо жизни',        type: 'ring',   slot: 'ring1',    tier: 2, price: 95,
    maxHpBonus: 40,  desc: '+40 к максимуму HP.' },
  { id: 'ac_mage_crystal',   name: 'Кристалл мага',       type: 'ring',   slot: 'ring1',    tier: 2, price: 110,
    attackBonus: 12, desc: '+12 к атаке.' },
  { id: 'ac_amulet_warrior', name: 'Амулет воина',        type: 'ring',   slot: 'ring1',    tier: 2, price: 120,
    attackBonus: 6, defenseBonus: 6, desc: '+6 атк, +6 защ.' },
  { id: 'ac_dark_pendant',   name: 'Тёмный кулон',        type: 'ring',   slot: 'ring1',    tier: 2, price: 100,
    attackBonus: 14, defenseBonus: -3, desc: '+14 атк, -3 защ.' },
  // ── TIER 2 CONSUMABLES ──────────────────────────────────────────────────────
  { id: 'cs_mana_greater',    name: 'Большое зелье маны', type: 'consumable', tier: 2, price: 90,
    manaAmount: 150, desc: 'Восстанавливает 150 MP.' },
  { id: 'cs_potion_greater',  name: 'Большое зелье',      type: 'consumable', tier: 2, price: 70,
    healAmount: 140, desc: 'Восстанавливает 140 HP.' },
  { id: 'cs_potion_strength', name: 'Зелье силы',         type: 'consumable', tier: 2, price: 55,
    attackBuff: { value: 0.5, duration: 3 }, desc: 'Атака +50% на 3 хода.' },
  { id: 'cs_potion_defense',  name: 'Зелье щита',         type: 'consumable', tier: 2, price: 55,
    defenseBuff: { value: 0.5, duration: 3 }, desc: 'Защита +50% на 3 хода.' },
  { id: 'cs_scroll_lightning',name: 'Свиток молнии',      type: 'consumable', tier: 2, price: 80,
    damage: { amount: 80, target: 'single', canStun: true }, desc: 'Наносит 80 урона и оглушает врага.' },
  { id: 'cs_scroll_ice',      name: 'Свиток льда',        type: 'consumable', tier: 2, price: 75,
    damage: { amount: 50, target: 'all_enemies' }, desc: 'Наносит 50 урона всем врагам.' },

  // ── TIER 3 WEAPONS ──────────────────────────────────────────────────────────
  { id: 'ws_enchanted_blade', name: 'Зачарованный клинок', type: 'weapon', slot: 'mainHand', tier: 3, price: 150,
    attackBonus: 18, desc: '+18 к атаке.' },
  { id: 'ws_fire_sword',      name: 'Пылающий меч',        type: 'weapon', slot: 'mainHand', tier: 3, price: 185,
    attackBonus: 21, desc: '+21 к атаке.' },
  { id: 'ws_cursed_blade',    name: 'Проклятый клинок',    type: 'weapon', slot: 'mainHand', tier: 3, price: 210,
    attackBonus: 25, desc: '+25 к атаке.' },
  { id: 'ws_dragon_fang',     name: 'Клык дракона',        type: 'weapon', slot: 'mainHand', tier: 3, price: 290,
    attackBonus: 32, desc: '+32 к атаке.' },
  // ── TIER 3 ARMOR ────────────────────────────────────────────────────────────
  { id: 'as_battle_plate',    name: 'Боевые латы',         type: 'armor',  slot: 'armor',    tier: 3, price: 155,
    defenseBonus: 18, desc: '+18 к защите.' },
  { id: 'as_dragon_scale',    name: 'Чешуя дракона',       type: 'armor',  slot: 'armor',    tier: 3, price: 240,
    defenseBonus: 25, desc: '+25 к защите.' },
  { id: 'as_guardian_plate',  name: 'Доспех стражника',    type: 'armor',  slot: 'armor',    tier: 3, price: 200,
    defenseBonus: 20, maxHpBonus: 40, desc: '+20 защ, +40 HP.' },
  // ── TIER 3 ACCESSORIES ──────────────────────────────────────────────────────
  { id: 'ac_storm_ring',      name: 'Кольцо бури',         type: 'ring',   slot: 'ring1',    tier: 3, price: 160,
    attackBonus: 10, defenseBonus: 6, desc: '+10 атк, +6 защ.' },
  { id: 'ac_ancient_talisman',name: 'Древний талисман',    type: 'ring',   slot: 'ring1',    tier: 3, price: 200,
    attackBonus: 9, defenseBonus: 9, maxHpBonus: 25, desc: '+9 атк, +9 защ, +25 HP.' },
  // ── TIER 3 CONSUMABLES ──────────────────────────────────────────────────────
  { id: 'cs_elixir_life',     name: 'Эликсир жизни',      type: 'consumable', tier: 3, price: 120,
    healAmount: 250, desc: 'Восстанавливает 250 HP.' },
  { id: 'cs_potion_rejuv',    name: 'Зелье омоложения',   type: 'consumable', tier: 3, price: 200,
    effect: 'full_heal', desc: 'Полное восстановление HP.' },
  { id: 'cs_potion_berserker',name: 'Зелье берсерка',     type: 'consumable', tier: 3, price: 85,
    attackBuff: { value: 1.0, duration: 2 }, desc: 'Атака +100% на 2 хода.' },
  { id: 'cs_war_paint',       name: 'Боевая раскраска',   type: 'consumable', tier: 3, price: 95,
    attackBuff: { value: 0.4, duration: 3 }, defenseBuff: { value: 0.3, duration: 3 },
    desc: 'Атака +40%, защита +30% на 3 хода.' },
  { id: 'cs_bomb',            name: 'Взрывная граната',   type: 'consumable', tier: 3, price: 120,
    damage: { amount: 110, target: 'all_enemies' }, desc: 'Взрыв наносит 110 урона всем.' },
  { id: 'cs_scroll_revival',  name: 'Свиток воскрешения', type: 'consumable', tier: 3, price: 220,
    reviveEffect: true, desc: 'Воскрешает павшего союзника с 30% HP.' },
  { id: 'cs_elixir_wisdom',   name: 'Эликсир мудреца',    type: 'consumable', tier: 3, price: 230,
    effect: 'full_mana', desc: 'Полностью восстанавливает ману.' },
  // ── ARTIFACTS ───────────────────────────────────────────────────────────────
  { id: 'art_shadow_essence',    name: 'Эссенция тени',       type: 'ring', slot: 'ring1', tier: 2, price: 280,
    attackBonus: 20, defenseBonus: 8, desc: '+20 атк, +8 защ.' },
  { id: 'art_death_mask',        name: 'Маска смерти',         type: 'ring', slot: 'ring1', tier: 3, price: 300,
    attackBonus: 28, defenseBonus: -5, desc: '+28 атк, -5 защ.' },
  { id: 'art_blood_chalice',     name: 'Чаша крови',           type: 'ring', slot: 'ring1', tier: 3, price: 260,
    attackBonus: 32, maxHpBonus: -20, desc: '+32 атк, -20 HP.' },
  { id: 'art_void_crystal',      name: 'Кристалл пустоты',     type: 'ring', slot: 'ring1', tier: 3, price: 390,
    attackBonus: 15, defenseBonus: 15, maxHpBonus: 35, desc: '+15 атк, +15 защ, +35 HP.' },
  { id: 'art_heart_of_dungeon',  name: 'Сердце подземелья',    type: 'ring', slot: 'ring1', tier: 3, price: 500,
    attackBonus: 22, defenseBonus: 22, maxHpBonus: 50, desc: '+22 атк, +22 защ, +50 HP.' },
  { id: 'art_philosophers_stone',name: 'Камень мудреца',       type: 'ring', slot: 'ring1', tier: 3, price: 450,
    attackBonus: 18, defenseBonus: 18, maxHpBonus: 50, desc: '+18 атк, +18 защ, +50 HP.' }
];

const RIDDLES = [
  {
    question: 'У меня нет ног, но я хожу. У меня нет рта, но когда я останавливаюсь — все умирают. Что я такое?',
    answer: 'время',
    hint: 'Подсказка: нечто неумолимое...',
    reward: { gold: 50, exp: 30 }
  },
  {
    question: 'Чем больше берёшь — тем больше становится. Что это?',
    answer: 'яма',
    hint: 'Подсказка: копайте глубже...',
    reward: { gold: 50, exp: 30 }
  },
  {
    question: 'Говорит без языка, слышит без ушей, не имеет тела, но оживает от ветра. Что это?',
    answer: 'эхо',
    hint: 'Подсказка: повторяющееся...',
    reward: { gold: 50, exp: 30 }
  },
  {
    question: 'Всегда впереди тебя, но никогда не поймать. Что это?',
    answer: 'будущее',
    hint: 'Подсказка: темпоральное...',
    reward: { gold: 50, exp: 30 }
  },
  {
    question: 'Живёт без тела, слышно без ушей, в воздухе рождается. Что это?',
    answer: 'звук',
    hint: 'Подсказка: ты сейчас его создаёшь...',
    reward: { gold: 60, exp: 40 }
  },
  {
    question: 'Что можно поймать, но нельзя бросить?',
    answer: 'простуда',
    hint: 'Подсказка: приходит зимой и мешает дышать...',
    reward: { gold: 50, exp: 30 }
  },
  {
    question: 'Чем больше сушишь — тем мокрее становится. Что это?',
    answer: 'полотенце',
    hint: 'Подсказка: висит в ванной...',
    reward: { gold: 50, exp: 30 }
  },
  {
    question: 'Без рук, без ног, а в окно стучит. Что это?',
    answer: 'ветер',
    hint: 'Подсказка: невидим и силён...',
    reward: { gold: 55, exp: 35 }
  },
  {
    question: 'Я лёгкое как перо, но никто не удержит меня дольше минуты. Что я?',
    answer: 'дыхание',
    hint: 'Подсказка: нужно каждую секунду...',
    reward: { gold: 60, exp: 40 }
  },
  {
    question: 'Что идёт, но с места не сдвигается?',
    answer: 'часы',
    hint: 'Подсказка: тикает на стене...',
    reward: { gold: 50, exp: 30 }
  },
  {
    question: 'Я туча и не туча, птица без крыл, огонь без пламени. Что я?',
    answer: 'туман',
    hint: 'Подсказка: утром в низинах...',
    reward: { gold: 55, exp: 35 }
  },
  {
    question: 'У неё есть зубы, но она не кусает. У неё есть спинка, но она не спит. Что это?',
    answer: 'расчёска',
    hint: 'Подсказка: нужна для волос...',
    reward: { gold: 50, exp: 30 }
  },
  {
    question: 'Горит и не сгорает, тает без тепла. Что это?',
    answer: 'свеча',
    hint: 'Подсказка: источник мягкого света...',
    reward: { gold: 55, exp: 35 }
  },
  {
    question: 'У меня есть город без домов, леса без деревьев и горы без земли. Что я?',
    answer: 'карта',
    hint: 'Подсказка: помогает путешественникам...',
    reward: { gold: 65, exp: 45 }
  },
  {
    question: 'Что можно сломать, не трогая руками?',
    answer: 'обещание',
    hint: 'Подсказка: данное слово...',
    reward: { gold: 60, exp: 40 }
  },
  {
    question: 'Я живу в темноте, ем камень и ненавижу свет. Что я?',
    answer: 'крот',
    hint: 'Подсказка: роет подземные норы...',
    reward: { gold: 50, exp: 30 }
  },
  {
    question: 'Какой зверь имеет одну голову и четыре ноги, но не животное?',
    answer: 'стол',
    hint: 'Подсказка: стоит в комнате, на нём едят...',
    reward: { gold: 50, exp: 30 }
  },
  {
    question: 'Чем холоднее я — тем теплее вам. Что я?',
    answer: 'шуба',
    hint: 'Подсказка: одежда для зимы...',
    reward: { gold: 50, exp: 30 }
  },
  {
    question: 'Есть у каждого дважды в году, один раз в месяц и ни разу в неделю. Что это?',
    answer: 'буква',
    hint: 'Подсказка: считайте буквы в словах...',
    reward: { gold: 60, exp: 40 }
  },
  {
    question: 'Чем больше я высыхаю — тем я мокрее. Чем больше я мокну — тем я суше. Что я?',
    answer: 'губка',
    hint: 'Подсказка: помогает при уборке...',
    reward: { gold: 55, exp: 35 }
  },
  {
    question: 'Я могу бежать без ног и течь без воды. Что я?',
    answer: 'время',
    hint: 'Подсказка: его нельзя вернуть...',
    reward: { gold: 50, exp: 30 }
  },
  {
    question: 'Я всегда один, но меня становится двое, когда смотришь в воду или зеркало. Что я?',
    answer: 'отражение',
    hint: 'Подсказка: смотри в воду...',
    reward: { gold: 65, exp: 45 }
  },
  {
    question: 'Чем больше стен — тем больше свободы. Что это?',
    answer: 'окно',
    hint: 'Подсказка: пропускает свет...',
    reward: { gold: 55, exp: 35 }
  }
];

const TREASURE_ITEMS = [
  { id: 'iron_sword',         name: 'Железный меч',       type: 'weapon', slot: 'mainHand', attackBonus: 5 },
  { id: 'steel_sword',        name: 'Стальной меч',        type: 'weapon', slot: 'mainHand', attackBonus: 10 },
  { id: 'enchanted_blade',    name: 'Зачарованный клинок', type: 'weapon', slot: 'mainHand', attackBonus: 15 },
  { id: 'leather_armor',      name: 'Кожаная броня',       type: 'armor',  slot: 'armor',    defenseBonus: 5 },
  { id: 'chain_mail',         name: 'Кольчуга',            type: 'armor',  slot: 'armor',    defenseBonus: 10 },
  { id: 'plate_armor',        name: 'Латные доспехи',      type: 'armor',  slot: 'armor',    defenseBonus: 15 },
  { id: 'health_potion',      name: 'Зелье лечения',       type: 'consumable', healAmount: 40 },
  { id: 'greater_potion',     name: 'Большое зелье',       type: 'consumable', healAmount: 80 },
  { id: 'elixir',             name: 'Эликсир жизни',       type: 'consumable', healAmount: 150 },
  { id: 'amulet_protection',  name: 'Амулет защиты',       type: 'ring',   slot: 'ring1',    defenseBonus: 7 },
  { id: 'ring_power',         name: 'Кольцо силы',         type: 'ring',   slot: 'ring1',    attackBonus: 6 },
  { id: 'mana_potion',        name: 'Зелье маны',          type: 'consumable', manaAmount: 50 },
  { id: 'greater_mana_potion',name: 'Большое зелье маны',  type: 'consumable', manaAmount: 100 }
];

const ROOM_DESCRIPTIONS = {
  merchant: [
    'Странная фигура в плаще раскладывает товары при свете магического кристалла.',
    'Торговец с горящими глазами ухмыляется: "Для вас — только лучшее!"',
    'Запах дыма и денег. Таинственный продавец ждёт покупателей.',
    'Стол завален диковинными артефактами. Торговец кивает в знак приветствия.',
    'Из темноты появляется фигура с сумкой: "Нужны хорошие вещи?"'
  ],
  combat: [
    'Затхлый воздух пахнет кровью. Тени движутся по углам...',
    'Стены испещрены следами когтей. Что-то здесь обитает.',
    'Кости хрустят под ногами. Вы не первые, кто здесь побывал.',
    'Факелы отбрасывают жуткие тени. Враги уже заметили вас.',
    'Ржавые клетки свисают с потолка. Кто-то вырвался на волю.'
  ],
  treasure: [
    'Золото блестит в свете факела. Это сокровищница!',
    'Сундуки и мешки с добычей ждут своих новых владельцев.',
    'Слой пыли покрывает богатства. Давно никто не заходил.',
    'Запах старого золота щекочет ноздри. Удача улыбается.',
    'Драгоценные камни разбросаны по полу. Истинное богатство!'
  ],
  rest: [
    'Тихое место среди хаоса. Можно перевести дух.',
    'Потухший костёр, старые одеяла. Кто-то уже отдыхал здесь.',
    'Журчащий родник у стены. Вода чистая и холодная.',
    'Заброшенный лагерь авантюристов. Их судьба неизвестна.',
    'Защитные руны на стенах — враги сюда не заходят.'
  ],
  secret: [
    'Странные символы на стенах. Здесь что-то скрыто...',
    'Потайная дверь открылась сама. Это ловушка или удача?',
    'Стены пульсируют тёмной магией. Выбор за вами.',
    'Древние алтари. Риск или награда?',
    'Мерцающий портал. Неизвестно что ждёт по ту сторону.'
  ],
  riddle: [
    'Каменный сфинкс с горящими глазами преграждает путь.',
    'Надпись на стене: "Ответь верно — пройдёшь. Ошибёшься — умрёшь."',
    'Механизм с символами. Загадка открывает сокровища.',
    'Дух хранителя требует ответа на вопрос.',
    'Книга загадок открыта на случайной странице.'
  ],
  boss: [
    'ЛОГОВО БОССА. Земля дрожит от дыхания чудовища...',
    'Тёмная энергия сгущается. Здесь обитает нечто ужасное.',
    'Кости прошлых авантюристов устилают пол. Вы следующие?',
    'Древние цепи разорваны. Босс свободен и голоден.'
  ]
};

function generateShopInventory(floorNumber) {
  const available = SHOP_ITEMS.filter(item => item.tier <= floorNumber);
  const pool = available.length > 0 ? available : SHOP_ITEMS;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  const itemCount = 4 + Math.floor(Math.random() * 3);
  const selected = [];
  const usedBaseIds = new Set();

  for (const item of shuffled) {
    if (selected.length >= itemCount) break;
    if (!usedBaseIds.has(item.id)) {
      usedBaseIds.add(item.id);
      selected.push({ ...item, id: `${item.id}_${Date.now()}_${selected.length}`, iconId: item.id });
    }
  }
  return selected;
}

function weightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item;
  }
  return items[items.length - 1];
}

function assignDirections(count) {
  if (count === 1) return ['straight'];
  if (count === 2) {
    const opts = [['left', 'right'], ['left', 'straight'], ['straight', 'right']];
    return opts[Math.floor(Math.random() * opts.length)];
  }
  return ['left', 'straight', 'right'];
}

function computeRoomLayout(rooms) {
  const posX = new Array(rooms.length).fill(0);
  const posY = new Array(rooms.length).fill(0);
  const visited = new Set([0]);
  const queue = [{ idx: 0, x: 0, y: 0 }];
  while (queue.length > 0) {
    const { idx, x, y } = queue.shift();
    posX[idx] = x;
    posY[idx] = y;
    for (const conn of rooms[idx].connections) {
      if (!visited.has(conn.to)) {
        visited.add(conn.to);
        const dx = conn.direction === 'left' ? -1 : conn.direction === 'right' ? 1 : 0;
        queue.push({ idx: conn.to, x: x + dx, y: y + 1 });
      }
    }
  }
  for (let i = 0; i < rooms.length; i++) {
    rooms[i].mapX = posX[i];
    rooms[i].mapY = posY[i];
  }
}

// ── Floor-boss reward pool (relic-style choices after boss kill) ─────────────
const FLOOR_BOSS_REWARDS = [
  { id: 'fr_atk',       name: '⚔ Закалённый клинок',     desc: '+5 к атаке навсегда',            icon: '⚔',  apply: { stat: 'attack',    value: 5  } },
  { id: 'fr_def',       name: '🛡 Доспех героя',          desc: '+4 к защите навсегда',           icon: '🛡', apply: { stat: 'defense',   value: 4  } },
  { id: 'fr_hp',        name: '❤ Кровь дракона',          desc: '+30 к максимуму HP навсегда',    icon: '❤',  apply: { stat: 'maxHp',     value: 30 } },
  { id: 'fr_mp',        name: '💧 Кристалл маны',         desc: '+25 к максимуму маны навсегда',  icon: '💧', apply: { stat: 'maxMp',     value: 25 } },
  { id: 'fr_crit',      name: '✦ Глаз убийцы',           desc: '+8% к шансу крита навсегда',     icon: '✦',  apply: { stat: 'critChance',value: 0.08} },
  { id: 'fr_potion',    name: '🧪 Запас алхимика',        desc: '+2 зелья лечения',               icon: '🧪', apply: { stat: 'potions',   value: 2  } },
  { id: 'fr_speed',     name: '💨 Ботинки ветра',         desc: '+3 к скорости навсегда',         icon: '💨', apply: { stat: 'speed',     value: 3  } },
  { id: 'fr_lifesteal', name: '🩸 Жажда крови',           desc: 'Атаки восстанавливают 8% урона', icon: '🩸', apply: { passive: 'lifesteal', value: 0.08 } },
  { id: 'fr_thorns',    name: '🌵 Шипы возмездия',        desc: 'Возврат 15% входящего урона',    icon: '🌵', apply: { passive: 'thorns',    value: 0.15 } }
];

function generateFloorBossReward(count = 3) {
  const pool = [...FLOOR_BOSS_REWARDS].sort(() => Math.random() - 0.5);
  return pool.slice(0, count).map(r => ({ id: r.id, name: r.name, desc: r.desc, icon: r.icon }));
}

function applyFloorBossReward(character, rewardId) {
  const r = FLOOR_BOSS_REWARDS.find(x => x.id === rewardId);
  if (!r) return false;
  const { apply } = r;
  if (!character.levelBonuses) character.levelBonuses = {};
  if (!character.passives)     character.passives     = {};

  if (apply.passive) {
    character.passives[apply.passive] = apply.value;
    return true;
  }
  if (apply.stat === 'potions') {
    character.potions = (character.potions || 2) + apply.value;
    return true;
  }
  if (apply.stat === 'critChance') {
    character.levelBonuses.critChance = Math.min(0.70, (character.levelBonuses.critChance || 0) + apply.value);
  } else {
    character.levelBonuses[apply.stat] = (character.levelBonuses[apply.stat] || 0) + apply.value;
  }
  return true;
}

function generateFloor(floorNumber, playerCount) {
  const roomCount = 20 + Math.floor(Math.random() * 11); // 20-30 rooms
  const scaleFactor = 1 + (floorNumber - 1) * 0.15;
  const rooms = [];
  const bossRoomIndex = roomCount - 1;
  const typePool = Object.values(ROOM_TYPES).filter(t => t.weight > 0);

  for (let i = 0; i < roomCount; i++) {
    const isBoss = (i === bossRoomIndex);
    const isStart = (i === 0);
    const type = isStart ? ROOM_TYPES.start : isBoss ? ROOM_TYPES.boss : weightedRandom(typePool);
    rooms.push(createRoom(type.id, i, floorNumber, scaleFactor, playerCount));
  }

  buildWindingConnections(rooms);
  computeRoomLayout(rooms);

  return { floorNumber, rooms, currentRoomIndex: 0 };
}

function buildWindingConnections(rooms) {
  const n = rooms.length;
  for (const r of rooms) r.connections = [];

  // Divide rooms into depth layers (1-2 rooms per layer) for a winding layout
  const layers = [[0]];
  let idx = 1;
  while (idx < n - 1) {
    const layerSize = Math.min(1 + Math.floor(Math.random() * 2), n - 1 - idx);
    const layer = [];
    for (let j = 0; j < layerSize; j++) layer.push(idx++);
    layers.push(layer);
  }
  layers.push([n - 1]);

  for (let l = 0; l < layers.length - 1; l++) {
    const fromLayer = layers[l];
    const toLayer = layers[l + 1];
    const reached = new Set();

    for (let fi = 0; fi < fromLayer.length; fi++) {
      const from = fromLayer[fi];
      const connCount = Math.min(1 + (toLayer.length > 1 && Math.random() < 0.4 ? 1 : 0), toLayer.length);
      const targets = [...toLayer].sort(() => Math.random() - 0.5).slice(0, connCount);

      targets.forEach(to => {
        reached.add(to);
        //вероятность нахождения закрытой комнаты
        const locked = from > 0 && rooms[to].type !== 'boss' && Math.random() < 0.15;
        rooms[from].connections.push({ to, direction: 'straight', locked });
      });
    }

    // Ensure every room in toLayer is reachable
    for (const to of toLayer) {
      if (!reached.has(to)) {
        const src = fromLayer[Math.floor(Math.random() * fromLayer.length)];
        const locked = src > 0 && rooms[to].type !== 'boss' && Math.random() < 0.15;
        rooms[src].connections.push({ to, direction: 'straight', locked });
        reached.add(to);
      }
    }

    // Ensure each room in fromLayer has at least 2 connections when the layer allows it
    if (toLayer.length >= 2) {
      for (const from of fromLayer) {
        if (rooms[from].connections.length < 2) {
          const alreadyConnected = new Set(rooms[from].connections.map(c => c.to));
          for (const to of toLayer) {
            if (!alreadyConnected.has(to)) {
              const locked = from > 0 && rooms[to].type !== 'boss' && Math.random() < 0.15;
              rooms[from].connections.push({ to, direction: 'straight', locked });
              break;
            }
          }
        }
      }
    }
  }

  // For rooms still with only 1 connection, add a shortcut into the next-next layer
  for (let l = 0; l < layers.length - 2; l++) {
    for (const from of layers[l]) {
      if (rooms[from].connections.length < 2 && l + 2 < layers.length) {
        const skipLayer = layers[l + 2];
        const alreadyConnected = new Set(rooms[from].connections.map(c => c.to));
        for (const to of skipLayer) {
          if (!alreadyConnected.has(to) && rooms[to].type !== 'boss') {
            const locked = from > 0 && Math.random() < 0.30;
            rooms[from].connections.push({ to, direction: 'straight', locked });
            break;
          }
        }
      }
    }
  }

  // Reassign all directions so each room's choices are unique and varied
  for (let i = 0; i < n - 1; i++) {
    const conns = rooms[i].connections;
    if (conns.length === 0) continue;
    conns.sort(() => Math.random() - 0.5);
    const dirs = assignDirections(Math.min(conns.length, 3));
    conns.forEach((conn, j) => { conn.direction = dirs[Math.min(j, dirs.length - 1)]; });
  }

  rooms[n - 1].connections = [];
}

function createRoom(typeId, index, floorNumber, scaleFactor, playerCount) {
  const type = ROOM_TYPES[typeId];
  const descriptions = ROOM_DESCRIPTIONS[typeId] || ROOM_DESCRIPTIONS.combat;
  const description = descriptions[Math.floor(Math.random() * descriptions.length)];

  const room = {
    id: index,
    type: typeId,
    name: type.name,
    symbol: type.symbol,
    description,
    isCleared: typeId === 'start' || typeId === 'merchant',
    isVisited: typeId === 'start',
    connections: [],
    enemies: [],
    loot: [],
    riddle: null,
    restBonus: null,
    secretRevealed: false,
    shopItems: null
  };

  if (typeId === 'combat') {
    room.enemies = generateEnemies(floorNumber, scaleFactor, playerCount, false);
  } else if (typeId === 'boss') {
    room.enemies = generateEnemies(floorNumber, scaleFactor, playerCount, true);
  } else if (typeId === 'treasure') {
    room.loot = generateTreasure(floorNumber, 2 + Math.floor(Math.random() * 3));
    room.isCleared = true;
  } else if (typeId === 'rest') {
    room.restBonus = { hpPercent: 0.3 + Math.random() * 0.2 };
    room.isCleared = true;
  } else if (typeId === 'riddle') {
    room.riddle = { ...RIDDLES[Math.floor(Math.random() * RIDDLES.length)], solved: false, attempts: 0 };
    room.isCleared = false;
  } else if (typeId === 'secret') {
    room.secretRevealed = false;
    room.secretLoot = generateTreasure(floorNumber, 3 + Math.floor(Math.random() * 3));
    room.secretTrap = { damage: Math.floor(20 * scaleFactor), chance: (10 + Math.floor(Math.random() * 13) * 5) / 100 };
    room.isCleared = false;
  } else if (typeId === 'merchant') {
    room.shopItems = generateShopInventory(floorNumber);
  } else if (typeId === 'start') {
    room.isCleared = true;
    room.isVisited = true;
  }

  return room;
}

function getPlayerScaling(playerCount) {
  const pc = Math.max(1, Math.min(4, playerCount));
  return {
    1: { minEnemies: 1, maxEnemies: 2, statMult: 0.85, bossMult: 0.90, label: 'Одиночный поход' },
    2: { minEnemies: 2, maxEnemies: 3, statMult: 0.95, bossMult: 1.10, label: 'Пара авантюристов' },
    3: { minEnemies: 3, maxEnemies: 4, statMult: 1.05, bossMult: 1.25, label: 'Отряд приключенцев' },
    4: { minEnemies: 4, maxEnemies: 5, statMult: 1.15, bossMult: 1.40, label: 'Полный отряд' }
  }[pc];
}

function generateEnemies(floorNumber, scaleFactor, playerCount, isBoss) {
  const scaling = getPlayerScaling(playerCount);

  // Floor 1 "tutorial" scaling: boss is gentler, rooms have fewer, weaker enemies
  const isFloor1 = floorNumber === 1;
  const floor1StatMult = isFloor1 ? 0.65 : 1;
  const floor1BossMult = isFloor1 ? 0.70 : 1;

  if (isBoss) {
    const bossType = getBossForFloor(floorNumber);
    return [createEnemy(bossType, scaleFactor * scaling.bossMult * floor1BossMult)];
  }

  const enemyPool = getEnemiesForFloor(floorNumber);
  // Floor 1: always spawn 1 fewer enemy than normal (minimum 1)
  const range = scaling.maxEnemies - scaling.minEnemies;
  const rawCount = scaling.minEnemies + Math.floor(Math.random() * (range + 1));
  const count = isFloor1 ? Math.max(1, rawCount - 1) : rawCount;
  const enemies = [];

  for (let i = 0; i < count; i++) {
    const typeId = enemyPool[Math.floor(Math.random() * enemyPool.length)];
    enemies.push(createEnemy(typeId, scaleFactor * scaling.statMult * floor1StatMult));
  }

  return enemies;
}

function generateTreasure(floorNumber, count) {
  const loot = [];
  const tierItems = TREASURE_ITEMS.filter((_, idx) => {
    const tier = Math.floor(idx / 3);
    return tier <= Math.floor(floorNumber / 3);
  });

  const available = tierItems.length > 0 ? tierItems : TREASURE_ITEMS;

  for (let i = 0; i < count; i++) {
    const item = available[Math.floor(Math.random() * available.length)];
    loot.push({ ...item, id: `${item.id}_${Date.now()}_${i}` });
  }

  const gold = 10 + floorNumber * 5 + Math.floor(Math.random() * 20);
  loot.push({ id: 'gold', name: `${gold} золота`, type: 'gold', amount: gold });

  return loot;
}

function getAvailableRooms(floor) {
  const current = floor.rooms[floor.currentRoomIndex];
  return current.connections
    .filter(c => !floor.rooms[c.to].isVisited)
    .map(c => ({ ...floor.rooms[c.to], direction: c.direction, locked: !!c.locked }));
}

module.exports = {
  generateFloor, getAvailableRooms, getPlayerScaling,
  ROOM_TYPES, TREASURE_ITEMS, SHOP_ITEMS,
  FLOOR_BOSS_REWARDS, generateFloorBossReward, applyFloorBossReward
};
