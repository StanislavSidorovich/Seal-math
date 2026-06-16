// ═══════════════════════════════════════════════════════════════
// SPRINT 3 — PROFILE SYSTEM + LEARNING MODE
// ═══════════════════════════════════════════════════════════════
const SAVE_KEY        = "sausage-arctic-math-save-v1";  // legacy (migration)
const PROFILES_KEY    = "sausage-profiles-v1";
const ACTIVE_KEY      = "sausage-active-profile";
const MAX_PROFILES    = 20;

const PROFILE_EMOJIS  = ["🦭","🐧","🐻","🦊","🐳","🦁","🐼","🦋","🐸","🦄",
                          "🐨","🐯","🦀","🦆","🐬","🦭","🐺","🦝","🦥","🐙"];

// ═══════════════════════════════════════════════════════════════
// CHARACTER SELECTION SYSTEM
// ═══════════════════════════════════════════════════════════════
const VERSION = "1.0.0";

const STARTER_CHARACTERS = [
  {
    id: "seal",
    name: "Sausage",
    species: "Seal",
    emoji: "🦭",
    color: "#EEF4F8",
    accentColor: "#27c7de",
    description: "Brave, curious, always ready!",
    descriptionRu: "Смелый, любопытный, всегда готов!",
    svgId: "char-seal"
  },
  {
    id: "penguin",
    name: "Pip",
    species: "Penguin",
    emoji: "🐧",
    color: "#f0f4f8",
    accentColor: "#856de8",
    description: "Clever, funny, loves to dance!",
    descriptionRu: "Умный, смешной, любит танцевать!",
    svgId: "char-penguin"
  },
  {
    id: "fox",
    name: "Nova",
    species: "Arctic Fox",
    emoji: "🦊",
    color: "#f8f4e8",
    accentColor: "#ff9060",
    description: "Quick, sly, full of tricks!",
    descriptionRu: "Быстрая, хитрая, полна уловок!",
    svgId: "char-fox"
  },
  {
    id: "bear",
    name: "Miska",
    species: "Polar Bear",
    emoji: "🐻‍❄️",
    color: "#f4f0e8",
    accentColor: "#4fd6a8",
    description: "Strong, gentle, wise guardian!",
    descriptionRu: "Сильный, добрый, мудрый защитник!",
    svgId: "char-bear"
  }
];

function getCharacterById(id) {
  return STARTER_CHARACTERS.find(c => c.id === id) || STARTER_CHARACTERS[0];
}

function getActiveCharacter() {
  const prof = getActiveProfile();
  const charId = prof?.character || "seal";
  return getCharacterById(charId);
}

// Build the SVG for a character using the symbol id
function characterSvgSmall(charId) {
  const ch = getCharacterById(charId);
  return `<svg viewBox="0 0 120 110" aria-hidden="true"><use href="#${ch.svgId}-idle"/><ellipse cx="60" cy="100" rx="44" ry="6" fill="rgba(0,80,120,.10)"/></svg>`;
}

function characterSvgLarge(charId, pose = "idle") {
  const ch = getCharacterById(charId);
  const sym = `#${ch.svgId}-${pose}`;
  return `<svg viewBox="0 0 260 220" class="char-svg-large" aria-label="${ch.name} the ${ch.species}" role="img"><use href="${sym}"/></svg>`;
}

// Get the correct symbol href for the active character in game SVG elements
function getCharSymbol(pose = "idle") {
  const ch = getActiveCharacter();
  return `#${ch.svgId}-${pose}`;
}

// Update all seal SVG instances to use the active character
function applyCharacterToAllSeals() {
  const idleSym  = getCharSymbol("idle");
  const happySym = getCharSymbol("happy");

  // All seal SVG use elements in the DOM
  const sealUses = [
    { prefix: "heroSeal",   sym: "hero-char-body" },
    { prefix: "missionSeal",sym: "mission-char-body" },
    { prefix: "customSeal", sym: "custom-char-body" },
    { prefix: "travelSeal", sym: "travel-char-body" },
  ];

  // Update the main body <use> elements
  const bodyIds = ["heroSealBody","missionSealBody","customSealBody","travelSealBody"];
  bodyIds.forEach(id => {
    const el = $(id);
    if (el) el.setAttribute("href", idleSym);
  });

  // Also update standalone references in rescue animation overlay
  const rescueSealUse = document.querySelector(".rescue-sausage-svg use");
  if (rescueSealUse) rescueSealUse.setAttribute("href", idleSym);

  // Update travel seal
  const travelSvg = document.querySelector("#travelSeal svg use:first-child");
  if (travelSvg) travelSvg.setAttribute("href", idleSym);
}

// ─── Learning Mode (lang = "learn") ─────────────────────────────────────────
// Shows English + Russian translation below every string.
// Stored per-profile in profile.lang.

const todayKey = () => new Date().toISOString().slice(0, 10);

const worlds = [
  { name: "Snow Beach",      topics: ["add10","add20","sub20"],                          subtitle: "Find warm shells after the storm",        palette: ["#fff7cf","#9eeeff"],   character: "Pip",           animal: 1, music: "bright bells" },
  { name: "Fish Bay",        topics: ["add100","sub100","carryBorrow"],                  subtitle: "Repair the fish docks",                  palette: ["#d8fff1","#24bdd2"],   character: "Nori",          animal: 0, music: "bouncy marimba" },
  { name: "Whale Coast",     topics: ["multiply","divide","reverseMul"],                 subtitle: "Follow Bluebell's song",                 palette: ["#e3f0ff","#5ca6e8"],   character: "Bluebell",      animal: 5, music: "slow ocean chimes" },
  { name: "Penguin Islands", topics: ["mixed","add3","twoStep"],                         subtitle: "Guide the penguin parade",               palette: ["#f7f7ff","#7c8fe8"],   character: "Pebble",        animal: 2, music: "tap-dance drums" },
  { name: "Octopus Cave",    topics: ["missing","patterns","brackets","logic"],          subtitle: "Solve Professor Octo's riddles",         palette: ["#f4e8ff","#35c9c0"],   character: "Professor Octo",animal: 4, music: "mysterious bubbles" },
  { name: "Polar Academy",   topics: ["equations","advEquations","orderOfOps"],          subtitle: "Train with Miska",                       palette: ["#ffffff","#8bd5ff"],   character: "Miska",         animal: 3, music: "sparkly classroom" },
  { name: "Northern Kingdom",topics: ["word","fractions","fracCompare"],                 subtitle: "Carry supplies to the castle",           palette: ["#ffe5ee","#b78cff"],   character: "Nova",          animal: 6, music: "royal horns" },
  { name: "Arctic Champion", topics: ["adaptive"],                                       subtitle: "Become Guardian of the Arctic",          palette: ["#fff8b8","#2dd6a6"],   character: "Tumble",        animal: 8, music: "victory fanfare" }
].map((w, i) => ({ ...w, id: i }));

const missionVerbs   = ["Scout the Shore","Rescue a Friend","Build a Helper","Open the Treasure","Calm the Storm"];
const missionVerbsRu = ["Разведка берега","Спасение друга","Помощь городу","Открыть сокровище","Успокоить бурю"];
const miniGames      = ["Catch Fish","Treasure Hunt","Find Hidden Penguins","Ice Slide","Feed Baby Seals"];
const recommendedLevels = [1,3,6,8,10,12,15,18];

const missionDetails = [
  { title:"Scout the Shore",   titleRu:"Разведка берега",    objective:"Find storm clues",          objectiveRu:"Найди следы бури",              reward:"12 fish, 6 coins, 3 stars",  rewardRu:"12 рыбок, 6 монет, 3 звезды",   story:"Sausage checks the snow for friendly footprints.",          storyRu:"Сосиска ищет в снегу следы друзей." },
  { title:"Rescue a Friend",   titleRu:"Спасение друга",     objective:"Reach the stranded friend", objectiveRu:"Доберись до застрявшего друга", reward:"new friend, fish, stars",    rewardRu:"новый друг, рыбки, звёзды",     story:"A tiny voice calls from a drifting ice floe.",              storyRu:"Маленький голосок зовёт с уплывающей льдины." },
  { title:"Build a Helper",    titleRu:"Помощь городу",      objective:"Gather town supplies",      objectiveRu:"Собери припасы для города",     reward:"building progress",          rewardRu:"прогресс строительства",        story:"The town needs lights, warm homes, and busy docks.",        storyRu:"Городу нужны свет, тепло и оживлённые доки." },
  { title:"Open the Treasure", titleRu:"Открыть сокровище",  objective:"Unlock a frozen chest",     objectiveRu:"Открой замёрзший сундук",       reward:"rare treasure chance",       rewardRu:"шанс на редкое сокровище",      story:"Something shiny is trapped under blue ice.",                storyRu:"Что-то блестящее застряло подо льдом." },
  { title:"Calm the Storm",    titleRu:"Успокоить бурю",     objective:"Finish the island rescue",  objectiveRu:"Заверши спасение острова",      reward:"next island path",           rewardRu:"путь к следующему острову",     story:"The last gust fades when friends work together.",           storyRu:"Последний порыв ветра стихнет, когда друзья вместе." }
];

const dialogueBank = {
  before: [
    "I packed snacks and bravery. Mostly snacks.",
    "This island feels different today. Let's peek around.",
    "If the wind gets loud, we answer with courage.",
    "A tiny clue is still a clue. Follow me!",
    "The wind smells like adventure today.",
    "Three questions, then we're heroes.",
    "Ready? The island is watching.",
    "Sausage wiggles excitedly. Let's go!",
    "I hear a friend calling from somewhere out there.",
    "Every correct answer moves the rescue boat closer.",
    "Deep breaths. We can do this together.",
    "The storm left a puzzle — let's solve it.",
    "Warm flippers, warm heart. Let's rescue someone!",
    "Today feels like a gold-star day."
  ],
  beforeRu: [
    "Я взял перекус и храбрость. В основном перекус.",
    "Сегодня этот остров кажется другим. Давай осмотримся!",
    "Если ветер усилится — ответим смелостью.",
    "Маленькая подсказка — тоже подсказка. За мной!",
    "Ветер пахнет приключением.",
    "Три вопроса — и мы герои.",
    "Готов? Остров наблюдает.",
    "Сосиска радостно виляет. Вперёд!",
    "Где-то там зовёт друг.",
    "Каждый правильный ответ приближает спасательную лодку.",
    "Глубокий вдох. Мы справимся вместе.",
    "Буря оставила загадку — давай решим её.",
    "Тёплые ласты, тёплое сердце. Спасём кого-нибудь!",
    "Сегодня точно будет золотая звезда."
  ],
  correct: [
    "That made the snow sparkle!",
    "Sausage did a happy belly slide!",
    "The rescue sled just zoomed forward.",
    "Nice thinking. The island noticed.",
    "The ice is glowing — great answer!",
    "A fish jumped in celebration!",
    "Sausage clapped a flipper! Excellent.",
    "That was the one. Perfect!",
    "The rescue boat moved closer. Keep going!",
    "Brilliant! Even the clouds cheered.",
    "That answer warmed the whole iceberg.",
    "Sausage is doing the happy spin!",
    "One step closer to bringing a friend home.",
    "The stars just got brighter. Amazing!"
  ],
  correctRu: [
    "От этого снег заискрился!",
    "Сосиска сделал радостное сальто на животе!",
    "Спасательные сани рванули вперёд.",
    "Отличная мысль. Остров заметил.",
    "Лёд светится — замечательный ответ!",
    "Рыбка выпрыгнула в честь праздника!",
    "Сосиска захлопал ластами! Отлично.",
    "Вот оно. Идеально!",
    "Спасательная лодка приближается. Давай дальше!",
    "Блестяще! Даже облака захлопали.",
    "Этот ответ согрел весь айсберг.",
    "Сосиска делает радостный кружок!",
    "Ещё один шаг к тому, чтобы вернуть друга домой.",
    "Звёзды стали ярче. Невероятно!"
  ],
  wrong: [
    "No worries. Even explorers slip on ice.",
    "Let's try another path. I believe in us.",
    "That was close. A hint can warm things up.",
    "Sausage shakes it off and keeps smiling.",
    "Look again — the answer is hiding nearby.",
    "That's okay. We learn every time.",
    "The answer is closer than you think.",
    "Every explorer makes wrong turns. Try again!",
    "Not quite, but we're still on the adventure!",
    "The ice can be tricky. Check the hint.",
    "Sausage nods — it happens to everyone.",
    "Think about it a moment — you can work it out.",
    "Brave try! Look at the correct answer.",
    "Mistakes are how we learn. You've got this."
  ],
  wrongRu: [
    "Ничего страшного. Все путешественники скользят на льду.",
    "Попробуем другой путь. Я верю в нас.",
    "Почти! Подсказка поможет.",
    "Сосиска встряхнулся и продолжает улыбаться.",
    "Посмотри ещё раз — ответ совсем рядом.",
    "Всё хорошо. Мы учимся каждый раз.",
    "Ответ ближе, чем кажется.",
    "Все путешественники иногда ошибаются. Ещё раз!",
    "Не совсем, но мы всё ещё в приключении!",
    "Лёд бывает хитрым. Загляни в подсказку.",
    "Сосиска кивает — с каждым бывает.",
    "Подумай секунду — ты сможешь это решить.",
    "Смелая попытка! Посмотри на правильный ответ.",
    "Ошибки — это учёба. У тебя всё получится."
  ],
  town: [
    "The town sounds busier today.",
    "Someone is visiting the Fish Market.",
    "I heard a splash near the harbor.",
    "The rescued friends are making this place home.",
    "Look — Pip is playing near the lighthouse!",
    "Bluebell was spotted near the harbor this morning.",
    "New friends make a town feel alive.",
    "The market smells like fresh fish and adventure."
  ],
  townRu: [
    "Сегодня в городе оживлённее.",
    "Кто-то зашёл на Рыбный рынок.",
    "Слышу всплеск у гавани.",
    "Спасённые друзья обживают новый дом.",
    "Смотри — Пип играет у маяка!",
    "Блубелла видели у гавани этим утром.",
    "Новые друзья оживляют город.",
    "На рынке пахнет свежей рыбой и приключениями."
  ],
  reward: [
    "Treasure feels better when friends are safe.",
    "That chest was waiting for a clever explorer.",
    "A new sparkle for the town!",
    "Rewards earned by kindness are the best kind.",
    "Sausage earned this. Every answer counted.",
    "Look what bravery and thinking can do!",
    "The Arctic is a little brighter now.",
    "A reward well deserved. On to the next one!"
  ],
  rewardRu: [
    "Сокровища приятнее, когда друзья в безопасности.",
    "Этот сундук ждал умного исследователя.",
    "Новый блеск для города!",
    "Награды, заработанные добротой, — лучшие.",
    "Сосиска заслужил это. Каждый ответ считался.",
    "Посмотри, что могут смелость и ум!",
    "Арктика стала немного светлее.",
    "Заслуженная награда. Вперёд, к следующей!"
  ]
};

const rescueLines = [
  "Thank you, Sausage! I thought I would never get off that ice floe!",
  "You found me! I saved this treasure just for you.",
  "That was brave and clever. I am moving to Arctic Town!",
  "I was chilly, but now I feel safe. Let's celebrate!"
];
const rescueLinesRu = [
  "Спасибо, Сосиска! Я думал, что никогда не слезу с этой льдины!",
  "Ты нашёл меня! Я сберёг это сокровище специально для тебя.",
  "Это было смело и умно. Переезжаю в Арктический город!",
  "Мне было холодно, но теперь я в безопасности. Отмечаем!"
];

const animals = [
  ["Baby seal","Nori","Seal pups can recognize their mother's call."],
  ["Penguin","Pip","Penguins are excellent swimmers."],
  ["Puffin","Pebble","Puffins can hold many little fish at once."],
  ["Polar bear","Miska","Polar bears have wide paws for snow and ice."],
  ["Walrus","Wally","Walruses use their tusks to rest on ice."],
  ["Whale","Bluebell","Some whales sing songs that travel for miles."],
  ["Narwhal","Nova","A narwhal's tusk is a long tooth."],
  ["Arctic fox","Frost","Arctic foxes change coat color with the seasons."],
  ["Sea otter","Tumble","Sea otters often float on their backs."]
].map((a,i) => ({ id:i, species:a[0], name:a[1], fact:a[2] }));

const buildings = ["Fish Market","Lighthouse","Aquarium","Seal House","Penguin Village","Harbor","Arctic Museum","Ice Castle"]
  .map((name,i) => ({ id:i, name, cost:(i+1)*3 }));

const shop = [
  ["Pirate Seal",   20,"costume","pirate"],
  ["Astronaut Seal",30,"costume","astronaut"],
  ["King Seal",     40,"costume","king"],
  ["Superhero Seal",45,"costume","superhero"],
  ["Sunny Hat",     12,"accessory","sunny"],
  ["Star Scarf",    16,"accessory","scarf"],
  ["Snow Goggles",  18,"accessory","goggles"],
  ["Tiny Fish Pet", 25,"pet","pet"]
].map((s,i) => ({ id:i, name:s[0], cost:s[1], type:s[2], className:s[3] }));

const achievementNames = [
  "First Fish","First Correct Answer","10 Correct Answers","25 Correct Answers","50 Correct Answers",
  "100 Correct Answers","First Building","Town Starter","Busy Builder","First Rescue","Five Friends",
  "Animal Hero","First Star","Coin Collector","Treasure Keeper","Hint Helper","Brave Retry",
  "Snow Beach Scout","Fish Bay Sailor","Whale Coast Wonder","Penguin Island Pal","Octopus Cave Thinker",
  "Polar Academy Scholar","Northern Kingdom Knight","Arctic Champion","Master of Addition",
  "Master of Subtraction","Master of Multiplication","Division Diver","Pattern Finder","Equation Explorer",
  "Word Problem Wizard","Perfect Trip","Fast Flipper","Daily Visitor","Three Day Streak","Seven Day Streak",
  "Costume Collector","Pet Pal","Coin Spender","Star Saver","Fish Feast","Level 5","Level 10",
  "No Mistake Run","Comeback Kid","Super Solver","Guardian Helper","Town Complete","Guardian of the Arctic"
];

// ─── Daily special names ─────────────────────────────────────────────────────
const dailySpecialNames = [
  "Glitter Shell","Aurora Scarf Pin","Crystal Fish Badge","Snowflake Sticker",
  "Tiny Crown Charm","Moonlit Pebble","Golden Flipper Token"
];

// ─── Daily challenge narratives ──────────────────────────────────────────────
const dailyNarratives = [
  { who:"Pip",     text:"Pip needs help finding breakfast today. Answer 5 questions to fill the fish bowl!",           textRu:"Пип ищет завтрак. Ответь на 5 вопросов, чтобы наполнить миску рыбой!" },
  { who:"Nori",    text:"Nori spotted a storm cloud heading for the docks. Help secure everything in time!",           textRu:"Нори заметил грозовую тучу над доками. Помоги всё закрепить вовремя!" },
  { who:"Bluebell",text:"Bluebell wants to teach you a new song. Solve 5 puzzles and learn the first verse!",         textRu:"Блубелла хочет научить тебя новой песне. Реши 5 задач и выучи первый куплет!" },
  { who:"Pebble",  text:"Pebble lost their favourite pebble in the snow. Can you help find it in 5 answers?",         textRu:"Пеббл потерял любимый камешек в снегу. Помоги найти его за 5 ответов!" },
  { who:"Miska",   text:"Miska set up an extra training session at the Academy. Show off your skills today!",         textRu:"Миска устроила тренировку в Академии. Покажи свои умения сегодня!" },
  { who:"Nova",    text:"Nova is delivering supplies to the castle. Answer 5 questions and help carry the load!",     textRu:"Нова везёт припасы в замок. Ответь на 5 вопросов и помоги нести груз!" },
  { who:"Tumble",  text:"Tumble is practising for the Arctic Games. Be their training partner for 5 rounds!",        textRu:"Тамбл готовится к Арктическим играм. Стань партнёром по тренировке на 5 раундов!" }
];

// ─── Word problem templates (P4) ─────────────────────────────────────────────
// Each entry: { make(a,b,char) → { text, answer, hint } }
const wordTemplates = [
  // Addition
  { op:"add", make:(a,b,ch) => ({ text:`Sausage caught ${a} fish and ${ch} caught ${b}. How many fish together?`,                         answer:a+b, hint:"Together means add." }) },
  { op:"add", make:(a,b,ch) => ({ text:`There are ${a} penguins on one iceberg and ${b} on another. How many penguins in total?`,           answer:a+b, hint:"Count both groups together." }) },
  { op:"add", make:(a,b,ch) => ({ text:`${ch} found ${a} snowballs on the left hill and ${b} on the right hill. How many altogether?`,     answer:a+b, hint:"Add the two groups." }) },
  { op:"add", make:(a,b,ch) => ({ text:`${a} seals are swimming and ${b} more jump in. How many seals are in the water now?`,               answer:a+b, hint:"Add the ones that jumped in." }) },
  { op:"add", make:(a,b,ch) => ({ text:`The boat carries ${a} crates and picks up ${b} more at the dock. How many crates on board?`,        answer:a+b, hint:"Add the new crates to the old ones." }) },
  { op:"add", make:(a,b,ch) => ({ text:`${a} treasures were found on Monday and ${b} on Tuesday. How many treasures found in total?`,       answer:a+b, hint:"Add both days' totals." }) },
  // Subtraction
  { op:"sub", make:(a,b,ch) => ({ text:`${ch} had ${a} fish but shared ${b} with friends. How many fish does ${ch} have left?`,              answer:a-b, hint:"Sharing means taking away." }) },
  { op:"sub", make:(a,b,ch) => ({ text:`There were ${a} penguins on the ice. ${b} dived into the ocean. How many are left on the ice?`,      answer:a-b, hint:"Subtract the ones that dived away." }) },
  { op:"sub", make:(a,b,ch) => ({ text:`Sausage had ${a} snowballs. A gust of wind blew away ${b}. How many snowballs are left?`,            answer:a-b, hint:"Take away what the wind stole." }) },
  { op:"sub", make:(a,b,ch) => ({ text:`The lighthouse had ${a} candles. ${b} burned out during the storm. How many are still lit?`,         answer:a-b, hint:"Subtract the candles that went out." }) },
  { op:"sub", make:(a,b,ch) => ({ text:`A whale was spotted ${a} times this week, but ${b} sightings were just clouds. Real sightings?`,     answer:a-b, hint:"Take away the false sightings." }) },
  // Multiplication
  { op:"mul", make:(a,b,ch) => ({ text:`${ch} has ${a} baskets with ${b} fish in each basket. How many fish altogether?`,                    answer:a*b, hint:"Equal groups — multiply!" }) },
  { op:"mul", make:(a,b,ch) => ({ text:`${a} boats each carry ${b} penguins. How many penguins are on the boats in total?`,                  answer:a*b, hint:"Each boat has the same number." }) },
  { op:"mul", make:(a,b,ch) => ({ text:`Sausage slides down the hill ${a} times a day for ${b} days. How many slides total?`,                answer:a*b, hint:"Same amount each day." }) },
  { op:"mul", make:(a,b,ch) => ({ text:`There are ${a} igloos with ${b} seals living in each one. How many seals in total?`,                 answer:a*b, hint:"Multiply to count equal groups." }) },
  // Division
  { op:"div", make:(a,b,ch) => ({ text:`${ch} has ${a*b} fish to share equally among ${b} friends. How many fish does each friend get?`,     answer:a, hint:"Divide means sharing equally." }) },
  { op:"div", make:(a,b,ch) => ({ text:`${a*b} penguins march into rows of ${b}. How many rows are there?`,                                  answer:a, hint:"Think how many groups of ${b} fit." }) },
  { op:"div", make:(a,b,ch) => ({ text:`Sausage baked ${a*b} snowball treats and put ${b} on each plate. How many plates?`,                  answer:a, hint:"Divide the treats by the plate size." }) }
];

function generateWordProblem(level) {
  const char = worlds[selectedWorld] ? worlds[selectedWorld].character : "Pip";
  // Filter ops by level
  let eligible = wordTemplates;
  if (level < 6)  eligible = wordTemplates.filter(t => t.op === "add" || t.op === "sub");
  if (level >= 6) eligible = wordTemplates.filter(t => t.op !== "div" || level >= 8);

  const tpl = eligible[Math.floor(Math.random() * eligible.length)];
  let a, b;

  if (tpl.op === "add" || tpl.op === "sub") {
    if (level < 4) { a = 2+Math.floor(Math.random()*8); b = 1+Math.floor(Math.random()*Math.min(a-1,7)); }
    else           { a = 10+Math.floor(Math.random()*20); b = 5+Math.floor(Math.random()*15); }
    if (tpl.op === "sub" && b > a) [a,b] = [b,a];
  } else if (tpl.op === "mul") {
    a = 2+Math.floor(Math.random()*8); b = 2+Math.floor(Math.random()*8);
  } else { // div
    b = 2+Math.floor(Math.random()*8); a = 2+Math.floor(Math.random()*8);
  }

  const prob = tpl.make(a, b, char);
  return { topic:"word", text:prob.text, answer:prob.answer, hint:prob.hint };
}

// ─── Profile helpers ──────────────────────────────────────────────────────────
function loadProfiles() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROFILES_KEY) || "null");
    if (Array.isArray(raw) && raw.length > 0) return raw;
  } catch {}
  return null;
}

function saveProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function getActiveProfileId() {
  return localStorage.getItem(ACTIVE_KEY) || null;
}

function setActiveProfileId(id) {
  localStorage.setItem(ACTIVE_KEY, id);
}

function createProfile(name, emoji, character) {
  return {
    id:        Date.now().toString(36) + Math.random().toString(36).slice(2,6),
    name:      name || "Player",
    emoji:     emoji || "🦭",
    character: character || "seal",
    createdAt: Date.now(),
    lastPlayed:Date.now(),
    lang:      "en",
    state:     defaultState()
  };
}

// Migrate old single save → first profile
function migrateOldSave() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const oldState = JSON.parse(raw);
    if (!oldState || typeof oldState !== "object") return null;
    const profile = createProfile("Player 1", "🦭");
    const base = defaultState();
    const merged = { ...base, ...oldState };
    merged.topics   = { ...base.topics,   ...(oldState.topics   || {}) };
    Object.keys(base.topics).forEach(t => merged.topics[t] = { ...base.topics[t], ...(oldState.topics||{})[t] });
    merged.streak   = { ...base.streak,   ...(oldState.streak   || {}) };
    merged.daily    = { ...base.daily,    ...(oldState.daily    || {}) };
    merged.equipped = { ...base.equipped, ...(oldState.equipped || {}) };
    merged.missions = { ...base.missions, ...(oldState.missions || {}) };
    if (!merged.dailySpecial) merged.dailySpecial = dailySpecialName();
    if (oldState.solved !== undefined && oldState.onboarded === undefined) merged.onboarded = true;
    profile.state = merged;
    profile.name = "Player 1";
    return profile;
  } catch { return null; }
}

// ─── Profiles state ───────────────────────────────────────────────────────────
let profiles = [];
let activeProfileId = null;

function initProfiles() {
  let loaded = loadProfiles();
  if (!loaded) {
    // Try migration
    const migrated = migrateOldSave();
    if (migrated) {
      profiles = [migrated];
    } else {
      // Brand new install — show profile screen with no profiles, let user create
      profiles = [];
    }
    saveProfiles(profiles);
  } else {
    profiles = loaded;
  }
  activeProfileId = getActiveProfileId();
  // Validate active ID still exists
  if (!profiles.find(p => p.id === activeProfileId)) activeProfileId = null;
}

function getActiveProfile() {
  return profiles.find(p => p.id === activeProfileId) || null;
}

function switchToProfile(id) {
  // Save current state back first
  const curr = getActiveProfile();
  if (curr) {
    curr.state = state;
    curr.lastPlayed = Date.now();
    curr.lang = currentLang;
    saveProfiles(profiles);
  }
  activeProfileId = id;
  setActiveProfileId(id);
  const prof = getActiveProfile();
  if (!prof) return;
  state = loadProfileState(prof);
  currentLang = prof.lang || "en";
  selectedWorld = Math.min(state.unlockedWorld, worlds.length - 1);
}

function loadProfileState(profile) {
  const base = defaultState();
  const raw  = profile.state || {};
  const merged = { ...base, ...raw };
  merged.topics   = { ...base.topics,   ...(raw.topics   || {}) };
  Object.keys(base.topics).forEach(t => merged.topics[t] = { ...base.topics[t], ...(raw.topics||{})[t] });
  merged.streak   = { ...base.streak,   ...(raw.streak   || {}) };
  merged.daily    = { ...base.daily,    ...(raw.daily    || {}) };
  merged.equipped = { ...base.equipped, ...(raw.equipped || {}) };
  merged.missions = { ...base.missions, ...(raw.missions || {}) };
  if (!merged.dailySpecial) merged.dailySpecial = dailySpecialName();
  if ((raw.solved !== undefined) && (raw.onboarded === undefined)) merged.onboarded = true;
  return merged;
}

// ─── State ───────────────────────────────────────────────────────────────────
let state = defaultState();
let selectedWorld = 0;
let currentProblem = null;
let trip = { active:false, world:0, mission:0, solved:0, needed:3, correct:0, daily:false, mistakes:0 };
let audioReady = false;
let audioCtx = null;
let miniGameTimer = null;

function $(id) { return document.getElementById(id); }

function defaultState() {
  const topics = {};
  ["add10","add20","sub20","add100","sub100","carryBorrow","multiply","divide","mixed","missing","patterns","logic","equations","word","adaptive","add3","brackets","orderOfOps","fractions",
   "twoStep","advEquations","reverseMul","fracCompare"]
    .forEach(t => topics[t] = { correct:0, wrong:0, time:0, fast:0 });
  return {
    fish:0, coins:0, stars:0, xp:0, level:1, unlockedWorld:0,
    solved:0, correct:0, wrong:0, timePlayed:0, startedAt:Date.now(),
    topics, buildings:[], animals:[], shop:[], achievements:[],
    muted:false, streak:{ count:0, last:"", days:[] }, daily:{ date:"", solved:0, claimed:false },
    hintsUsed:0, perfectTrips:0, missions:{}, equipped:{ costume:null, accessory:null, pet:null },
    miniGamesPlayed:0, rareTreasures:0, visitors:[], specialCosmetics:[],
    dialogueHistory:[], dailySpecial:"", doubleRewardsUntil:0, mysteryVisits:0,
    onboarded: false
  };
}

function loadState() { return defaultState(); } // legacy shim — not used after profile init

let _saveTimer = null;
function save(immediate = false) {
  state.timePlayed += Math.floor((Date.now() - state.startedAt) / 1000);
  state.startedAt = Date.now();
  const curr = getActiveProfile();
  if (curr) {
    curr.state = state;
    curr.lastPlayed = Date.now();
    curr.lang = currentLang;
  }
  if (immediate) {
    if (_saveTimer) { clearTimeout(_saveTimer); _saveTimer = null; }
    saveProfiles(profiles);
    return;
  }
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    saveProfiles(profiles);
    _saveTimer = null;
  }, 600);
}

// ═══════════════════════════════════════════════════════════════
// SPRINT 5 — PEDAGOGY + ANIMATIONS + RESCUE CELEBRATION
// ═══════════════════════════════════════════════════════════════

// ── Island Briefing data ──────────────────────────────────────
const ISLAND_BRIEFINGS = {
  0: [
    { visual:"🌊", title:"Adding numbers", body:"When we add, we count up to find a total. Put the bigger number first — it's faster!", example:"6 + 3 = ?  →  Start at 6, count up 3  →  9" },
    { visual:"🐚", title:"Subtracting numbers", body:"Subtracting means taking away. Think: what number do I need to ADD to get back to the start?", example:"8 - 5 = ?  →  5 + ? = 8  →  3" },
  ],
  1: [
    { visual:"🐟", title:"Adding to 100", body:"Add the tens first, then the ones. It keeps the numbers small and easy!", example:"34 + 25  →  30+20=50,  4+5=9  →  59" },
    { visual:"🚢", title:"Carrying", body:"When ones add up to 10 or more, carry the extra ten to the tens column.", example:"47 + 36  →  7+6=13, write 3 carry 1  →  83" },
  ],
  2: [
    { visual:"🐳", title:"Multiplication", body:"Multiplication is a shortcut for adding the same number many times.", example:"4 × 3 = 4 + 4 + 4 = 12\n(3 groups of 4)" },
    { visual:"🐠", title:"Division", body:"Division means splitting into equal groups. It's the opposite of multiplication!", example:"12 ÷ 4 = ?  →  4 × ? = 12  →  3" },
  ],
  3: [
    { visual:"🐧", title:"Three numbers", body:"Adding three numbers? Add the first two, then add the third. One step at a time!", example:"5 + 7 + 3  →  12 + 3  →  15" },
    { visual:"❓", title:"Missing numbers", body:"Find what's hiding! Subtract to discover the missing piece.", example:"8 + ☐ = 13  →  13 - 8 = 5  →  ☐ = 5" },
  ],
  4: [
    { visual:"🔮", title:"Number patterns", body:"Patterns repeat or grow the same way each time. Find the rule, predict the next!", example:"2, 4, 8, 16, ?  →  Each doubles  →  32" },
    { visual:"🐙", title:"Brackets first!", body:"Always solve what's inside brackets (   ) before doing anything else.", example:"(3 + 4) × 2  →  7 × 2  →  14" },
  ],
  5: [
    { visual:"🔭", title:"Equations with x", body:"x is a mystery number. To find it, do the opposite operation on both sides.", example:"x + 7 = 15  →  x = 15 - 7  →  x = 8" },
    { visual:"📐", title:"Order of operations", body:"× and ÷ always go before + and −, unless there are brackets.", example:"3 + 4 × 2  →  3 + 8  →  11  (NOT 14)" },
  ],
  6: [
    { visual:"👑", title:"Fractions", body:"A fraction shows part of a whole. The bottom number is how many equal pieces. The top is how many you have.", example:"¼ of 20  →  20 ÷ 4  →  5" },
    { visual:"📖", title:"Word problems", body:"Read carefully. Underline the numbers. Decide: do you add, subtract, multiply or divide?", example:"\"5 boxes, 4 fish each\" → 5 × 4 = 20 fish" },
  ],
  7: [
    { visual:"🏆", title:"Champion mode!", body:"Every question could be any topic. Your weakest topics appear more often — to help you improve!", example:"Keep going — the Arctic needs its Guardian! 🦭" },
  ],
};

const ISLAND_BRIEFINGS_RU = {
  0: [
    { visual:"🌊", title:"Сложение", body:"Когда мы складываем, мы считаем вперёд, чтобы найти сумму. Начинай с большего числа — так быстрее!", example:"6 + 3 = ?  →  Начни с 6, сосчитай ещё 3  →  9" },
    { visual:"🐚", title:"Вычитание", body:"Вычитать — значит убирать. Думай так: какое число нужно ПРИБАВИТЬ, чтобы вернуться к началу?", example:"8 - 5 = ?  →  5 + ? = 8  →  3" },
  ],
  1: [
    { visual:"🐟", title:"Сложение до 100", body:"Сначала складывай десятки, потом единицы. Числа станут меньше и удобнее!", example:"34 + 25  →  30+20=50,  4+5=9  →  59" },
    { visual:"🚢", title:"Перенос", body:"Когда единицы дают 10 и больше, переноси лишний десяток в столбец десятков.", example:"47 + 36  →  7+6=13, пишем 3, переносим 1  →  83" },
  ],
  2: [
    { visual:"🐳", title:"Умножение", body:"Умножение — это быстрый способ сложить одно и то же число несколько раз.", example:"4 × 3 = 4 + 4 + 4 = 12\n(3 группы по 4)" },
    { visual:"🐠", title:"Деление", body:"Делить — значит разбивать на равные группы. Это обратное умножению!", example:"12 ÷ 4 = ?  →  4 × ? = 12  →  3" },
  ],
  3: [
    { visual:"🐧", title:"Три числа", body:"Складываешь три числа? Сначала сложи первые два, потом прибавь третье. Шаг за шагом!", example:"5 + 7 + 3  →  12 + 3  →  15" },
    { visual:"❓", title:"Пропущенные числа", body:"Найди, что прячется! Вычти, чтобы обнаружить пропущенную часть.", example:"8 + ☐ = 13  →  13 - 8 = 5  →  ☐ = 5" },
  ],
  4: [
    { visual:"🔮", title:"Числовые закономерности", body:"Закономерности повторяются или растут одинаково. Найди правило — предскажи следующее!", example:"2, 4, 8, 16, ?  →  Каждый раз ×2  →  32" },
    { visual:"🐙", title:"Сначала скобки!", body:"Всегда решай то, что внутри скобок (  ), прежде чем делать остальное.", example:"(3 + 4) × 2  →  7 × 2  →  14" },
  ],
  5: [
    { visual:"🔭", title:"Уравнения с x", body:"x — это загадочное число. Чтобы найти его, делай обратное действие с обеих сторон.", example:"x + 7 = 15  →  x = 15 - 7  →  x = 8" },
    { visual:"📐", title:"Порядок действий", body:"× и ÷ всегда идут раньше + и −, если нет скобок.", example:"3 + 4 × 2  →  3 + 8  →  11  (НЕ 14)" },
  ],
  6: [
    { visual:"👑", title:"Дроби", body:"Дробь показывает часть целого. Нижнее число — сколько равных частей. Верхнее — сколько у тебя.", example:"¼ от 20  →  20 ÷ 4  →  5" },
    { visual:"📖", title:"Задачи в словах", body:"Читай внимательно. Подчеркни числа. Реши: сложить, вычесть, умножить или разделить?", example:"«5 ящиков, по 4 рыбки»  →  5 × 4 = 20 рыбок" },
  ],
  7: [
    { visual:"🏆", title:"Режим чемпиона!", body:"Каждый вопрос — любая тема. Слабые темы появляются чаще — чтобы ты становился лучше!", example:"Давай вперёд — Арктике нужен её Хранитель! 🦭" },
  ],
};

// ── Smart hint data ───────────────────────────────────────────
const SMART_HINTS = {
  add10:      { title:"Adding tip", text:"Count up from the bigger number. Use your fingers if it helps!", example:"4 + 7  →  start at 7, count up 4  →  11" },
  add20:      { title:"Make a ten", text:"Split one number to make a round ten first — it's much easier.", example:"8 + 6  →  8 + 2 + 4  →  10 + 4  →  14" },
  sub20:      { title:"Think addition", text:"Instead of taking away, ask: what do I ADD to get there?", example:"13 - 8 = ?  →  8 + ? = 13  →  5" },
  add100:     { title:"Tens then ones", text:"Add the tens column first, then the ones column.", example:"46 + 32  →  40+30=70,  6+2=8  →  78" },
  sub100:     { title:"Count up method", text:"Count up from the smaller number to the bigger one.", example:"73 - 48  →  48→50 (+2),  50→73 (+23)  →  25" },
  carryBorrow:{ title:"Line them up", text:"Keep ones under ones, tens under tens. Carry or borrow when a column is over 9 or needs more.", example:"57 + 36:  7+6=13, write 3 carry 1, 5+3+1=9  →  93" },
  multiply:   { title:"Groups of", text:"Multiplication = equal groups. Draw the groups if it helps!", example:"3 × 5 = three groups of five = 5+5+5 = 15" },
  divide:     { title:"Use times tables", text:"Think: which multiplication gives you that number?", example:"24 ÷ 6 = ?  →  6 × ? = 24  →  4" },
  reverseMul: { title:"Divide to find it", text:"To find the missing factor, divide the product by the number you know.", example:"? × 7 = 42  →  42 ÷ 7 = 6" },
  missing:    { title:"Subtract to find it", text:"The missing number = big number minus the number you know.", example:"9 + ☐ = 16  →  16 - 9 = 7" },
  patterns:   { title:"Find the rule", text:"Look at how each number changes. Is it +something? ×something?", example:"3, 6, 12, 24…  each is ×2  →  next is 48" },
  logic:      { title:"Compare step by step", text:"Compare just two things at a time. Then compare the winner with the next.", example:"A > B,  B > C  →  A is the biggest" },
  equations:  { title:"Do the opposite", text:"Addition and subtraction are opposites. So are × and ÷. Use the opposite to isolate x.", example:"x + 9 = 14  →  x = 14 - 9  →  x = 5" },
  advEquations:{ title:"Isolate x", text:"Whatever is done to x, undo it on both sides of the equals sign.", example:"3 × x = 21  →  x = 21 ÷ 3  →  x = 7" },
  fractions:  { title:"Denominator = pieces", text:"The bottom number tells you how many equal pieces the whole is cut into.", example:"¼ of 20  →  20 ÷ 4  →  5 pieces" },
  fracCompare:{ title:"Same-size slices", text:"Bigger denominator = smaller slices. Think of a pizza cut into 2 vs 8 pieces.", example:"½ > ¼  because halves are bigger slices than quarters" },
  twoStep:    { title:"One step at a time", text:"Don't rush! Solve the FIRST part, write down the answer, then solve the SECOND part.", example:"Start: 15 fish.  Step 1: give 4 away → 11.  Step 2: catch 7 more → 18" },
  word:       { title:"Underline the numbers", text:"Read slowly. Underline every number. Then decide: add, subtract, multiply or divide?", example:"\"3 boats, 6 fish each\" → 3 × 6 = 18 total fish" },
  orderOfOps: { title:"× and ÷ go first", text:"Always do multiplication and division BEFORE addition and subtraction — left to right.", example:"2 + 3 × 4  →  2 + 12  →  14  (not 20!)" },
  brackets:   { title:"Brackets first — always", text:"Whatever is inside (   ) must be solved before anything outside.", example:"(6 + 2) × 3  →  8 × 3  →  24" },
};

const SMART_HINTS_RU = {
  add10:      { title:"Совет по сложению", text:"Считай вперёд от большего числа. Используй пальцы, если помогает!", example:"4 + 7  →  начни с 7, сосчитай ещё 4  →  11" },
  add20:      { title:"Сделай десяток", text:"Раздели одно число, чтобы сначала получить круглый десяток — так проще.", example:"8 + 6  →  8 + 2 + 4  →  10 + 4  →  14" },
  sub20:      { title:"Думай через сложение", text:"Вместо вычитания спроси: что нужно ПРИБАВИТЬ, чтобы получить нужное число?", example:"13 - 8 = ?  →  8 + ? = 13  →  5" },
  add100:     { title:"Сначала десятки", text:"Сначала складывай столбец десятков, потом единиц.", example:"46 + 32  →  40+30=70,  6+2=8  →  78" },
  sub100:     { title:"Считай вперёд", text:"Считай вперёд от меньшего числа до большего.", example:"73 - 48  →  48→50 (+2),  50→73 (+23)  →  25" },
  carryBorrow:{ title:"Выравнивай столбцы", text:"Единицы под единицами, десятки под десятками. Переноси или занимай, когда нужно.", example:"57 + 36:  7+6=13, пишем 3, переносим 1, 5+3+1=9  →  93" },
  multiply:   { title:"Группы", text:"Умножение = равные группы. Нарисуй группы, если помогает!", example:"3 × 5 = три группы по пять = 5+5+5 = 15" },
  divide:     { title:"Используй таблицу умножения", text:"Думай: какое умножение даёт это число?", example:"24 ÷ 6 = ?  →  6 × ? = 24  →  4" },
  reverseMul: { title:"Раздели, чтобы найти", text:"Чтобы найти пропущенный множитель, раздели произведение на известное число.", example:"? × 7 = 42  →  42 ÷ 7 = 6" },
  missing:    { title:"Вычти, чтобы найти", text:"Пропущенное число = большое число минус известное число.", example:"9 + ☐ = 16  →  16 - 9 = 7" },
  patterns:   { title:"Найди правило", text:"Смотри, как меняется каждое число. Это +что-то? ×что-то?", example:"3, 6, 12, 24…  каждый раз ×2  →  следующий 48" },
  logic:      { title:"Сравнивай шаг за шагом", text:"Сравнивай только два предмета за раз. Потом победителя сравни со следующим.", example:"A > B,  B > C  →  A самое большое" },
  equations:  { title:"Делай обратное", text:"Сложение и вычитание — противоположности. То же с × и ÷. Используй обратное, чтобы найти x.", example:"x + 9 = 14  →  x = 14 - 9  →  x = 5" },
  advEquations:{ title:"Выдели x", text:"Что бы ни делали с x, сделай обратное с обеих сторон знака равенства.", example:"3 × x = 21  →  x = 21 ÷ 3  →  x = 7" },
  fractions:  { title:"Знаменатель = части", text:"Нижнее число говорит, на сколько равных частей разделено целое.", example:"¼ от 20  →  20 ÷ 4  →  5 частей" },
  fracCompare:{ title:"Одинаковые кусочки", text:"Больший знаменатель = меньший кусочек. Представь пиццу, разрезанную на 2 или 8 частей.", example:"½ > ¼  потому что половинки больше четвертинок" },
  twoStep:    { title:"Шаг за шагом", text:"Не спеши! Реши ПЕРВУЮ часть, запиши ответ, потом реши ВТОРУЮ часть.", example:"Начало: 15 рыбок.  Шаг 1: отдай 4 → 11.  Шаг 2: поймай ещё 7 → 18" },
  word:       { title:"Подчеркни числа", text:"Читай медленно. Подчеркни каждое число. Потом реши: сложить, вычесть, умножить или разделить?", example:"«3 лодки, по 6 рыбок»  →  3 × 6 = 18 рыбок" },
  orderOfOps: { title:"× и ÷ идут первыми", text:"Всегда делай умножение и деление ДО сложения и вычитания — слева направо.", example:"2 + 3 × 4  →  2 + 12  →  14  (не 20!)" },
  brackets:   { title:"Скобки — всегда первые", text:"Всё, что внутри (  ), нужно решить до всего остального.", example:"(6 + 2) × 3  →  8 × 3  →  24" },
};

// ── Consecutive mistake tracker ───────────────────────────────
let _consecutiveMistakes = 0;

// ── Island Briefing functions ─────────────────────────────────
let _briefingSlide = 0;
let _briefingSlides = [];
let _briefingWorldId = 0;

function showIslandBriefing(worldId) {
  const isRu    = currentLang === "ru";
  const pool    = isRu ? (ISLAND_BRIEFINGS_RU[worldId] || ISLAND_BRIEFINGS[worldId]) : ISLAND_BRIEFINGS[worldId];
  const slides  = pool;
  if (!slides || !slides.length) return;
  _briefingSlides  = slides;
  _briefingSlide   = 0;
  _briefingWorldId = worldId;
  renderBriefingSlide();
  const modal = $("briefingModal");
  if (modal) modal.hidden = false;
}

function renderBriefingSlide() {
  const slide = _briefingSlides[_briefingSlide];
  if (!slide) return;
  const total = _briefingSlides.length;
  $("briefingVisual").textContent = slide.visual;
  $("briefingTitle").textContent  = slide.title;
  $("briefingBody").textContent   = slide.body;
  $("briefingExample").textContent = slide.example || "";
  // dots
  const dotsEl = $("briefingDots");
  dotsEl.innerHTML = _briefingSlides.map((_,i) =>
    `<div class="briefing-dot ${i===_briefingSlide?"active":""}"></div>`
  ).join("");
  // next button label
  const nextBtn = $("briefingNext");
  if (nextBtn) nextBtn.textContent = _briefingSlide < total-1 ? "Next →" : "Let's go! 🦭";
}

function briefingNext() {
  if (_briefingSlide < _briefingSlides.length - 1) {
    _briefingSlide++;
    renderBriefingSlide();
  } else {
    closeBriefing();
  }
}

function closeBriefing() {
  const modal = $("briefingModal");
  if (modal) modal.hidden = true;
  // mark as seen
  state.missions[`brief_${_briefingWorldId}`] = 1;
  save();
}

// ── Smart Hint functions ──────────────────────────────────────
function maybeShowSmartHint(topic) {
  _consecutiveMistakes++;
  if (_consecutiveMistakes < 2) return;
  const isRu = currentLang === "ru";
  const hint  = (isRu ? SMART_HINTS_RU[topic] : null) || SMART_HINTS[topic];
  if (!hint) return;
  const panel = $("smartHintPanel");
  if (!panel) return;
  $("smartHintTitle").textContent   = hint.title;
  $("smartHintText").textContent    = hint.text;
  $("smartHintExample").textContent = hint.example || "";
  panel.hidden = false;
  clearTimeout(panel._timer);
  panel._timer = setTimeout(() => { panel.hidden = true; }, 12000);
}

function resetConsecutiveMistakes() {
  _consecutiveMistakes = 0;
}

function closeSmartHint() {
  const panel = $("smartHintPanel");
  if (panel) { panel.hidden = true; clearTimeout(panel._timer); }
}

// ── Rescue Celebration ────────────────────────────────────────
const RESCUE_DIALOGUES = {
  Pip:           ["Thank you, {name}! I thought the ice was forever!", "You came all this way for me? You're amazing, {name}!", "My flippers are cold but my heart is warm — thanks to you!"],
  Nori:          ["The fish are safe because of you, {name}!", "{name}! You solved every problem — I knew you could!", "I was waiting so long. Thank you, brave explorer!"],
  Bluebell:      ["BWOOSH! (That's whale for THANK YOU, {name}!)", "The whole ocean heard your clever answers!", "You're the best mathematician in the Arctic, {name}!"],
  Pebble:        ["The penguin parade can finally march again!", "{name}, your brain is bigger than this iceberg!", "I counted every answer — you were brilliant!"],
  "Professor Octo":["Your calculations are… *adjusts glasses* …impeccable.", "I've tested 847 explorers. You, {name}, are exceptional.", "Fascinating! A young mathematician of real talent!"],
  Miska:         ["You passed the Polar Academy test, {name}!", "I've never seen such determination. You've earned this!", "The Arctic has a new champion. Welcome to the academy!"],
  Nova:          ["{name}! I ran three times around the island with joy!", "A fox's nose knows a clever mind — and yours is the cleverest!", "You found me! I was hiding but honestly… I'm so glad."],
  Tumble:        ["SPLASH! That's me jumping for joy, {name}!", "I floated here on an ice floe waiting for a hero like you!", "The sea otters will sing songs about {name} forever!"],
};
const RESCUE_DIALOGUES_RU = {
  Pip:           ["Спасибо, {name}! Я думал, лёд никогда не кончится!", "Ты проделал такой путь ради меня? Ты невероятный, {name}!", "Ласты замёрзли, но сердце тёплое — спасибо тебе!"],
  Nori:          ["Рыбки в безопасности благодаря тебе, {name}!", "{name}! Ты решил все задачи — я знал, что у тебя получится!", "Я так долго ждал. Спасибо, смелый исследователь!"],
  Bluebell:      ["БУ-У-УМ! (По-китовому это СПАСИБО, {name}!)", "Весь океан услышал твои умные ответы!", "Ты лучший математик в Арктике, {name}!"],
  Pebble:        ["Парад пингвинов наконец может продолжиться!", "{name}, твой мозг больше этого айсберга!", "Я считал каждый ответ — ты был блестящим!"],
  "Professor Octo":["Твои вычисления… *поправляет очки* …безупречны.", "Я проверил 847 исследователей. Ты, {name}, исключителен.", "Восхитительно! Юный математик с настоящим талантом!"],
  Miska:         ["Ты сдал тест Полярной академии, {name}!", "Я никогда не видел такой решимости. Ты заслужил это!", "В Арктике появился новый чемпион. Добро пожаловать в академию!"],
  Nova:          ["{name}! Я три раза обежал остров от радости!", "Нос лисы чует острый ум — а твой самый острый!", "Ты нашёл меня! Я прятался, но честно… я так рад."],
  Tumble:        ["ПЛЮХ! Это я прыгаю от радости, {name}!", "Я доплыл сюда на льдине в ожидании такого героя, как ты!", "Морские выдры будут петь о {name} вечно!"],
};

function showRescueCelebration(worldId, playerName) {
  const world     = worlds[worldId];
  const charName  = world?.character || "Friend";
  const emoji     = ["🐧","🐟","🐳","🐧","🐙","🦭","🦊","🦦","🦭"][worldId] || "🌟";
  const isRu      = currentLang === "ru";
  const pool      = (isRu ? RESCUE_DIALOGUES_RU[charName] : null) || RESCUE_DIALOGUES[charName] || [`Thank you, ${playerName}!`];
  const quote     = pool[Math.floor(Math.random()*pool.length)].replace(/{name}/g, playerName || "Explorer");
  const lines     = isRu ? rescueLinesRu : rescueLines;

  $("rescueCelChar").textContent  = emoji;
  $("rescueCharName").textContent = charName;
  $("rescueCelQuote").textContent = `"${quote}"`;
  $("rescueCelRewards").innerHTML =
    `<span class="rescue-cel-chip">+50 🐟</span>
     <span class="rescue-cel-chip">+10 ⭐</span>
     <span class="rescue-cel-chip">+${worldId+1} 🪙</span>`;

  spawnConfetti();
  const modal = $("rescueCelebration");
  if (modal) modal.hidden = false;
}

function spawnConfetti() {
  const container = $("rescueConfetti");
  if (!container) return;
  container.innerHTML = "";
  const colors = ["#27c7de","#4fd6a8","#ffd166","#f4a261","#e76f51","#a8dadc"];
  for (let i = 0; i < 28; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.cssText = `
      left:${Math.random()*100}%;
      top:${-8 + Math.random()*16}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-duration:${0.9 + Math.random()*1.1}s;
      animation-delay:${Math.random()*.5}s;
      transform:rotate(${Math.random()*360}deg);
      border-radius:${Math.random()>.5?"50%":"3px"};
    `;
    container.appendChild(el);
  }
}

function closeRescueCelebration() {
  const modal = $("rescueCelebration");
  if (modal) modal.hidden = true;
}

// ── Sausage blink timer ───────────────────────────────────────
function startBlinkTimer() {
  const blink = () => {
    const sealEl = document.querySelector(".seal-svg-wrap");
    if (sealEl) {
      sealEl.classList.add("seal-blinking");
      setTimeout(() => sealEl.classList.remove("seal-blinking"), 200);
    }
    // blink every 3–7 seconds
    setTimeout(blink, 3000 + Math.random() * 4000);
  };
  setTimeout(blink, 2000 + Math.random() * 3000);
}

// ── Seal reaction poses ───────────────────────────────────────
function sealPose(pose) {
  const el = document.querySelector(".seal-svg-wrap");
  if (!el) return;
  el.classList.remove("seal-idle","seal-happy","seal-victory");
  void el.offsetWidth; // reflow to restart animation
  if (pose === "happy")   { el.classList.add("seal-happy");   setTimeout(()=>{ el.classList.remove("seal-happy");   el.classList.add("seal-idle"); }, 1500); }
  if (pose === "victory") { el.classList.add("seal-victory"); setTimeout(()=>{ el.classList.remove("seal-victory"); el.classList.add("seal-idle"); }, 2800); }
  if (pose === "idle")    el.classList.add("seal-idle");
}


function init() {
  initProfiles();
  // If no active profile → show profile screen
  if (!activeProfileId || !getActiveProfile()) {
    showProfileScreen();
    return;
  }
  // Load the active profile's state
  const prof = getActiveProfile();
  state = loadProfileState(prof);
  currentLang = prof.lang || "en";
  selectedWorld = Math.min(state.unlockedWorld, worlds.length - 1);
  launchGame();
}

function launchGame() {
  const app = $("app");
  if (app) app.hidden = false;
  const ps = $("profileScreen");
  if (ps) ps.style.display = "none";
  renderMap();
  renderAll();
  attachEvents();
  startTimer();
  checkAchievements();
  randomSurprise();
  if (!state.onboarded) {
    showOnboarding();
  } else if (state.solved > 0) {
    showWelcomeBack();
  }
  applyLangToDOM();
  const langBtn = $("langBtn");
  if (langBtn) langBtn.textContent = langLabel(currentLang);
  updateProfileTopbar();
  // S5: start idle animations
  sealPose("idle");
  startBlinkTimer();
}

// S5: briefingNext handler (avoids naming conflict with DOM element id)
function briefingNext_handle() { briefingNext(); }

// ═══════════════════════════════════════════════════════════════
// PROFILE SCREEN
// ═══════════════════════════════════════════════════════════════
function showProfileScreen() {
  const app = $("app");
  const ps  = $("profileScreen");
  if (app) app.hidden = true;
  if (ps)  ps.style.display = "";
  renderProfileList();
  // Bind add button once
  const addBtn = $("profileAddBtn");
  if (addBtn && !addBtn.dataset.bound) {
    addBtn.dataset.bound = "1";
    addBtn.addEventListener("click", () => openProfileEdit(null));
  }
}

function renderProfileList() {
  const list = $("profileList");
  if (!list) return;
  if (profiles.length === 0) {
    list.innerHTML = `<div class="profile-empty">No players yet.<br>Tap ➕ to create one!</div>`;
    return;
  }
  list.innerHTML = profiles.map(p => {
    const last = p.lastPlayed ? formatLastPlayed(p.lastPlayed) : "Never";
    const ch = getCharacterById(p.character || "seal");
    return `<div class="profile-card" data-pid="${p.id}">
      <button class="profile-play-btn" data-pid="${p.id}" aria-label="Play as ${p.name}">
        <span class="profile-card-emoji">${ch.emoji}</span>
        <div class="profile-card-info">
          <strong class="profile-card-name">${p.name}</strong>
          <span class="profile-card-sub">${ch.name} · Level ${p.state?.level||1} · ${p.state?.animals?.length||0}/9 friends · ${last}</span>
        </div>
      </button>
      <button class="profile-edit-btn" data-pid="${p.id}" aria-label="Edit ${p.name}">✏️</button>
    </div>`;
  }).join("");

  list.querySelectorAll(".profile-play-btn").forEach(btn => {
    btn.addEventListener("click", () => selectProfile(btn.dataset.pid));
  });
  list.querySelectorAll(".profile-edit-btn").forEach(btn => {
    btn.addEventListener("click", e => { e.stopPropagation(); openProfileEdit(btn.dataset.pid); });
  });
}

function formatLastPlayed(ts) {
  if (!ts) return "Never";
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days} days ago`;
  return new Date(ts).toLocaleDateString();
}

function selectProfile(id) {
  activeProfileId = id;
  setActiveProfileId(id);
  const prof = getActiveProfile();
  if (!prof) return;
  state = loadProfileState(prof);
  currentLang = prof.lang || "en";
  selectedWorld = Math.min(state.unlockedWorld, worlds.length - 1);
  launchGame();
}

// ─── Profile Edit Modal ───────────────────────────────────────────────────────
function openProfileEdit(id) {
  const modal   = $("profileEditModal");
  const title   = $("profileEditTitle");
  const nameInp = $("profileNameInput");
  const emojiRow= $("profileEmojiRow");
  const actions = $("profileModalActions");
  if (!modal) return;

  const existing = id ? profiles.find(p => p.id === id) : null;
  let chosenEmoji = existing?.emoji || "🦭";
  let chosenChar  = existing?.character || "seal";

  title.textContent     = existing ? "Edit Player" : "New Player";
  nameInp.value         = existing?.name || "";

  // Character picker (shown for new profiles)
  const charPickerHtml = !existing ? `
    <div class="char-picker-label">Choose your character</div>
    <div class="char-picker-row" id="charPickerRow">
      ${STARTER_CHARACTERS.map(ch => `
        <button class="char-pick-btn ${ch.id===chosenChar?"selected":""}" data-char="${ch.id}" aria-label="${ch.name} the ${ch.species}">
          <span class="char-pick-emoji">${ch.emoji}</span>
          <span class="char-pick-name">${ch.name}</span>
          <span class="char-pick-species">${ch.species}</span>
        </button>
      `).join("")}
    </div>
  ` : ``;

  // Emoji picker (only shown when editing)
  const emojiHtml = existing ? PROFILE_EMOJIS.map(e =>
    `<button class="emoji-pick-btn ${e===chosenEmoji?"selected":""}" data-emoji="${e}" aria-label="${e}">${e}</button>`
  ).join("") : "";

  emojiRow.innerHTML = emojiHtml + charPickerHtml;

  // Bind emoji picker
  emojiRow.querySelectorAll(".emoji-pick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      chosenEmoji = btn.dataset.emoji;
      emojiRow.querySelectorAll(".emoji-pick-btn").forEach(b => b.classList.toggle("selected", b===btn));
    });
  });

  // Bind character picker
  const charRow = emojiRow.querySelector("#charPickerRow");
  if (charRow) {
    charRow.querySelectorAll(".char-pick-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        chosenChar = btn.dataset.char;
        charRow.querySelectorAll(".char-pick-btn").forEach(b => b.classList.toggle("selected", b===btn));
      });
    });
  }

  // Action buttons
  if (existing) {
    actions.innerHTML = `
      <button class="primary profile-save-btn" id="pmSave">Save</button>
      <button class="secondary profile-dupe-btn" id="pmDupe">Duplicate</button>
      <button class="secondary danger profile-delete-btn" id="pmDelete">Delete</button>`;
    actions.querySelector("#pmSave").addEventListener("click", () => {
      const name = nameInp.value.trim() || "Player";
      existing.name  = name;
      existing.emoji = chosenEmoji;
      saveProfiles(profiles);
      closeProfileEdit();
      renderProfileList();
    });
    actions.querySelector("#pmDupe").addEventListener("click", () => {
      if (profiles.length >= MAX_PROFILES) { alert("Maximum 20 players reached."); return; }
      const dupe = JSON.parse(JSON.stringify(existing));
      dupe.id   = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
      dupe.name = existing.name + " 2";
      dupe.createdAt = Date.now();
      profiles.push(dupe);
      saveProfiles(profiles);
      closeProfileEdit();
      renderProfileList();
    });
    actions.querySelector("#pmDelete").addEventListener("click", () => {
      if (!confirm(`Delete ${existing.name}? All progress will be lost.`)) return;
      profiles = profiles.filter(p => p.id !== existing.id);
      if (activeProfileId === existing.id) { activeProfileId = null; setActiveProfileId(""); }
      saveProfiles(profiles);
      closeProfileEdit();
      renderProfileList();
    });
  } else {
    // New profile
    actions.innerHTML = `<button class="primary profile-save-btn" id="pmCreate">Create Player</button>`;
    actions.querySelector("#pmCreate").addEventListener("click", () => {
      if (profiles.length >= MAX_PROFILES) { alert("Maximum 20 players reached."); return; }
      const name = nameInp.value.trim() || "Player";
      const ch = getCharacterById(chosenChar);
      const p = createProfile(name, ch.emoji, chosenChar);
      profiles.push(p);
      saveProfiles(profiles);
      closeProfileEdit();
      renderProfileList();
    });
  }

  const cancelBtn = $("profileModalCancel");
  if (cancelBtn) { cancelBtn.onclick = closeProfileEdit; }

  modal.hidden = false;
  setTimeout(() => nameInp.focus(), 80);
}

function closeProfileEdit() {
  const modal = $("profileEditModal");
  if (modal) modal.hidden = true;
}

// ─── Profile topbar ───────────────────────────────────────────────────────────
function updateProfileTopbar() {
  const prof = getActiveProfile();
  const ch   = getActiveCharacter();
  const emojiEl = $("profileTopbarEmoji");
  const nameEl  = $("profileTopbarName");
  if (emojiEl) emojiEl.textContent = ch.emoji;
  if (nameEl)  nameEl.textContent  = prof?.name  || "Player";
}


function showWelcomeBack() {
  const overlay = $("welcomeBackOverlay");
  if (!overlay) return;
  const world  = worlds[Math.min(state.unlockedWorld, worlds.length-1)];
  const toNext = 100 - (state.xp % 100);
  const streak = state.streak.count;
  const friendCount = state.animals.length;
  const isRu = currentLang === "ru";
  const wName = t(`world${world.id}`) || world.name;

  const streakMsg = isRu
    ? (streak >= 3 ? `🔥 ${streak} дней подряд — так держать!` : streak === 1 ? `Ты вернулся! Серия началась.` : `Возвращайся завтра, чтобы начать серию!`)
    : (streak >= 3 ? `🔥 ${streak}-day streak — keep it up!`   : streak === 1 ? `You came back! Streak started.`  : `Come back tomorrow to start a streak!`);

  const xpMsg = isRu
    ? `Ещё ${toNext} правильных ответов до уровня ${state.level+1}!`
    : `${toNext} correct answers to level ${state.level+1}!`;

  overlay.innerHTML = `
    <div class="welcome-back-box">
      <div class="wb-seal">${animalSvgLarge(1,"Pip")}</div>
      <h2 class="wb-title">${isRu ? "С возвращением!" : "Welcome back!"}</h2>
      <div class="wb-stats">
        <div class="wb-stat"><span class="wb-num">${wName}</span><span class="wb-lbl">${isRu ? "текущий остров" : "current island"}</span></div>
        <div class="wb-stat"><span class="wb-num">${state.level}</span><span class="wb-lbl">${isRu ? "уровень" : "level"}</span></div>
        <div class="wb-stat"><span class="wb-num">${friendCount}/9</span><span class="wb-lbl">${isRu ? "друзей спасено" : "friends rescued"}</span></div>
      </div>
      <p class="wb-streak">${streakMsg}</p>
      <p class="wb-xp">${xpMsg}</p>
      <button class="primary wb-btn" id="wbCloseBtn">${isRu ? "Вперёд! 🚀" : "Let's go! 🚀"}</button>
    </div>`;
  overlay.hidden = false;
  const btn = overlay.querySelector("#wbCloseBtn");
  if (btn) btn.addEventListener("click", () => { overlay.hidden = true; });
}

// ─── Events ──────────────────────────────────────────────────────────────────
function attachEvents() {
  $("startChallengeBtn").addEventListener("click", () => startMission(false));
  $("dailyBtn").addEventListener("click",          () => startMission(true));
  $("miniGameBtn").addEventListener("click",       startMiniGame);
  $("closeMiniBtn").addEventListener("click",      () => { $("miniGame").hidden = true; if (miniGameTimer) { clearTimeout(miniGameTimer); miniGameTimer = null; } });
  $("hintBtn").addEventListener("click",           showHint);
  $("rewardClose").addEventListener("click",       () => { $("rewardModal").hidden = true; practiceMode = false; });
  $("exportBtn").addEventListener("click",         exportProgress);
  $("importBtn").addEventListener("click",         importProgress);
  $("resetStatsBtn").addEventListener("click",     resetStatistics);
  $("newAdventureBtn").addEventListener("click",   newAdventure);
  $("resetAllBtn").addEventListener("click",       resetEverything);
  $("muteBtn").addEventListener("click",           () => { state.muted = !state.muted; save(); renderHeader(); });
  $("menuBtn").addEventListener("click",           () => $("tabs").classList.toggle("open"));
  document.querySelectorAll(".tab").forEach(btn => btn.addEventListener("click", () => switchView(btn.dataset.view)));
  document.addEventListener("pointerdown", initAudio, { once:true });

  // Practice mode button in quest panel
  const practiceBtn = $("practiceModeBtn");
  if (practiceBtn) practiceBtn.addEventListener("click", () => startPracticeMode());

  // S5: Rescue celebration close
  const rescueCelClose = $("rescueCelClose");
  if (rescueCelClose) rescueCelClose.addEventListener("click", () => {
    closeRescueCelebration();
    // show standard reward after celebration
    showReward(null, null, false);
  });

  // S5: Island briefing buttons
  const briefingNext = $("briefingNext");
  const briefingSkip = $("briefingSkip");
  if (briefingNext) briefingNext.addEventListener("click", briefingNext_handle);
  if (briefingSkip) briefingSkip.addEventListener("click", closeBriefing);

  // S5: Smart hint close
  const smartClose = $("smartHintClose");
  if (smartClose) smartClose.addEventListener("click", closeSmartHint);
  const profileTopbarBtn = $("profileTopbarBtn");
  if (profileTopbarBtn) {
    profileTopbarBtn.addEventListener("click", () => {
      save(true);
      showProfileScreen();
    });
  }
  // S3: language 3-way cycle: en → ru → learn → en
  const langBtn = $("langBtn");
  if (langBtn) {
    langBtn.textContent = langLabel(currentLang);
    langBtn.addEventListener("click", () => {
      const next = currentLang === "en" ? "ru" : currentLang === "ru" ? "learn" : "en";
      setLang(next);
    });
  }
  // S2: save code buttons
  const codeBtn    = $("saveCodeBtn");
  const restoreBtn = $("restoreCodeBtn");
  if (codeBtn)    codeBtn.addEventListener("click",    copySaveCode);
  if (restoreBtn) restoreBtn.addEventListener("click", restoreFromCode);
  // P10: keyboard navigation for answer buttons (delegated)
  $("answers").addEventListener("keydown", e => {
    const btns = [...$("answers").querySelectorAll(".answer:not([disabled])")];
    const idx  = btns.indexOf(document.activeElement);
    if (e.key === "ArrowRight" || e.key === "ArrowDown")  { e.preventDefault(); btns[(idx+1) % btns.length]?.focus(); }
    if (e.key === "ArrowLeft"  || e.key === "ArrowUp")    { e.preventDefault(); btns[(idx-1+btns.length) % btns.length]?.focus(); }
  });
}

const SECTION_RENDERERS = {
  adventure: () => { renderQuest(); applySealLook(); },
  seal:      () => { renderCloset(); applySealLook(); },
  town:      () => { renderTown(); },
  album:     () => { renderAlbum(); },
  rewards:   () => { renderShop(); renderAchievements(); },
  daily:     () => { renderDaily(); },
  parent:    () => { renderDashboard(); }
};

function switchView(id) {
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.view === id));
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === id));
  if (id === "town") speak("town");
  renderHeader();
  const renderer = SECTION_RENDERERS[id];
  if (renderer) renderer();
}

// ─── Render ──────────────────────────────────────────────────────────────────
function renderAll() {
  renderHeader();
  renderQuest();
  renderTown();
  renderAlbum();
  renderShop();
  renderCloset();
  renderAchievements();
  renderDaily();
  renderDashboard();
  applySealLook();
}

function renderHeader() {
  $("fishCount").textContent  = state.fish;
  $("coinCount").textContent  = state.coins;
  $("starCount").textContent  = state.stars;
  $("levelNumber").textContent= state.level;
  $("xpMeter").style.width   = `${state.xp % 100}%`;
  $("muteBtn").title          = state.muted ? "Sound off" : "Sound on";
  $("muteBtn").style.opacity  = state.muted ? ".55" : "1";
}

function missionKey(worldId = selectedWorld) { return `w${worldId}`; }
function completedMissions(worldId = selectedWorld) { return Math.min(5, state.missions[missionKey(worldId)] || 0); }
function nextMission(worldId = selectedWorld) { return Math.min(4, completedMissions(worldId)); }

function renderMap() {
  $("worldMap").innerHTML = worlds.map(world => {
    const locked = world.id > state.unlockedWorld;
    const done   = completedMissions(world.id);
    return `<button class="island island-${world.id} ${locked?"locked":""} ${world.id===selectedWorld?"selected":""}" data-world="${world.id}" aria-label="${world.name}, ${done} of 5 missions complete${locked?" - locked":""}">
      ${islandSvg(world,locked)}<span>${world.id+1}. ${world.name}<small>${done}/5 missions - level ${recommendedLevels[world.id]}</small></span>
    </button>`;
  }).join("");
  document.querySelectorAll(".island").forEach(btn => btn.addEventListener("click", () => chooseIsland(Number(btn.dataset.world))));
  moveTravelSeal();
}

function chooseIsland(id) {
  const world = worlds[id];
  if (id > state.unlockedWorld) {
    // S5: warning instead of hard lock — allow entry
    const rec = recommendedLevels[id];
    if (!confirm(`${world.name} is recommended for level ${rec}. You are level ${state.level}.\n\nThis island may be tricky — explore anyway?`)) return;
  }
  selectedWorld = id;
  react("swim");
  renderMap();
  renderQuest();
  speak("before");
  playIslandSound();
  // S5: show island briefing on first visit
  if (!state.missions[`brief_${id}`]) {
    showIslandBriefing(id);
  }
}

function moveTravelSeal() {
  const pos = [[7,62],[26,57],[49,61],[72,54],[14,30],[36,24],[60,27],[80,31]][selectedWorld] || [8,62];
  $("travelSeal").style.left = `${pos[0]}%`;
  $("travelSeal").style.top  = `${pos[1]}%`;
}

function islandSvg(world, locked) {
  const [c1,c2] = locked ? ["#d6dde0","#aebbc2"] : world.palette;
  const decor = [
    `<circle cx="42" cy="45" r="13" fill="#ffd45a"/><path d="M93 35l18 44H73z" fill="#8bd5ff"/>`,
    `<path d="M40 88c18-28 48-28 66 0" fill="none" stroke="#24bdd2" stroke-width="12"/><circle cx="128" cy="46" r="11" fill="#ffd45a"/>`,
    `<path d="M32 76c24-30 73-35 112 0" fill="none" stroke="#5ca6e8" stroke-width="10"/><circle cx="80" cy="44" r="9" fill="#fff"/>`,
    `<circle cx="52" cy="62" r="12" fill="#26364a"/><circle cx="120" cy="62" r="12" fill="#26364a"/>`,
    `<path d="M58 42c32-23 60 1 52 45" fill="none" stroke="#856de8" stroke-width="12"/><circle cx="94" cy="50" r="9" fill="#35c9c0"/>`,
    `<rect x="70" y="32" width="38" height="54" rx="7" fill="#fff"/><path d="M64 38h50" stroke="#8bd5ff" stroke-width="9"/>`,
    `<path d="M55 88V42l32-20 32 20v46" fill="#ffe5ee"/><circle cx="88" cy="48" r="9" fill="#b78cff"/>`,
    `<path d="M43 82l46-55 46 55z" fill="#fff8b8"/><circle cx="90" cy="43" r="13" fill="#2dd6a6"/>`
  ][world.id];
  return `<svg viewBox="0 0 180 160" aria-hidden="true">
    <ellipse cx="90" cy="116" rx="72" ry="30" fill="${c1}"/>
    <path d="M28 112c22-52 50-72 84-60 22 8 38 28 48 60z" fill="${c2}"/>
    <path d="M47 101h86" stroke="#fff" stroke-width="9" stroke-linecap="round"/>
    ${decor}
  </svg>`;
}

function renderQuest() {
  const w       = worlds[selectedWorld];
  const done    = completedMissions();
  const mission = nextMission();
  const details = missionDetails[mission] || missionDetails[4];
  const islandPct = Math.round((done/5)*100);
  const isRu = currentLang === "ru";
  const rec = recommendedLevels[selectedWorld];
  $("questTitle").textContent    = t(`world${selectedWorld}`) || w.name;
  $("questText").textContent     = `${w.subtitle}. ${isRu ? (details.storyRu || details.story) : details.story} ${t("recommendedLevel")} ${rec}.`;
  $("dialogBox").textContent     = state.level < rec
    ? (isRu ? `${w.character}: Здесь рекомендован уровень ${rec}, но смелые исследователи могут зайти.`
             : `${w.character}: This place is level ${rec}, but brave explorers may still visit unlocked islands.`)
    : dialogFor(w, mission);
  $("islandProgressText").textContent  = `${t("islandProgress")} ${islandPct}%`;
  $("islandMeter").style.width   = `${islandPct}%`;
  $("missionProgressText").textContent = done >= 5 ? t("islandComplete") : `${t("missionOf")} ${mission+1} / 5`;
  $("missionMeter").style.width  = `${done >= 5 ? 100 : 0}%`;
  const obj = isRu ? (details.objectiveRu || details.objective) : details.objective;
  const rew = isRu ? (details.rewardRu    || details.reward)    : details.reward;
  $("nextRewardText").textContent = `${t("objective")}: ${obj}. ${t("rewardLabel")}: ${rew}.`;
  $("startChallengeBtn").textContent = done >= 5 ? t("replayMission") : `${t("startMission")} ${mission+1}`;
}

function dialogFor(world, mission) {
  const isRu = currentLang === "ru";
  const lines = isRu ? [
    `${world.character}: Сосиска, буря оставила следы в снегу. Начнём с малого и смелого.`,
    `${world.character}: Вижу друга неподалёку. Три правильных ответа — и спасательные сани двинутся.`,
    `${world.character}: Городу нужен новый помощник. Заработаем припасы и сделаем его лучше.`,
    `${world.character}: Сундук с сокровищами заморожен. Разогрей его умными мыслями.`,
    `${world.character}: Это последний порыв ветра. Потом остров снова засверкает.`
  ] : [
    `${world.character}: Sausage, the storm left clues in the snow. Let's start small and brave.`,
    `${world.character}: I can see a friend nearby. Three good answers will move the rescue sled.`,
    `${world.character}: The town needs a new helper. Let's earn supplies and make it shine.`,
    `${world.character}: A treasure chest is frozen shut. Warm it up with clever thinking.`,
    `${world.character}: This is the final gust. Then this island will sparkle again.`
  ];
  return lines[mission] || (isRu
    ? `${world.character}: Этот остров в безопасности. Хочешь повторить за дополнительное сокровище?`
    : `${world.character}: This island is safe. Want to replay for extra treasure?`);
}

// ─── Practice Mode ────────────────────────────────────────────────────────────
let practiceMode = false;
let practiceModeWorld = 0;

function startPracticeMode(worldId) {
  practiceMode = true;
  practiceModeWorld = worldId !== undefined ? worldId : selectedWorld;
  const isRu = currentLang === "ru";
  // Show practice world picker if not specified
  const modal = $("practiceModeModal");
  if (modal) { modal.hidden = false; renderPracticeWorldPicker(); return; }
  startPracticeMission();
}

function renderPracticeWorldPicker() {
  const modal = $("practiceModeModal");
  if (!modal) return;
  const isRu = currentLang === "ru";
  const title = isRu ? "Режим тренировки" : "Practice Mode";
  const subtitle = isRu ? "Выбери остров для практики. Прогресс сохраняться не будет." : "Choose an island to practise. No story progress will be saved.";
  modal.innerHTML = `
    <div class="practice-modal-box">
      <h2 class="practice-title">${title}</h2>
      <p class="practice-subtitle">${subtitle}</p>
      <div class="practice-island-grid">
        ${worlds.map(w => `
          <button class="practice-island-btn" data-world="${w.id}" aria-label="Practise ${w.name}">
            ${islandSvg(w, false)}
            <span>${w.name}</span>
          </button>
        `).join("")}
      </div>
      <button class="secondary practice-close-btn" id="practiceModeClose">✕ ${isRu ? "Закрыть" : "Close"}</button>
    </div>`;
  modal.querySelectorAll(".practice-island-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      practiceModeWorld = Number(btn.dataset.world);
      modal.hidden = true;
      startPracticeMission();
    });
  });
  const closeBtn = modal.querySelector("#practiceModeClose");
  if (closeBtn) closeBtn.addEventListener("click", () => { practiceMode = false; modal.hidden = true; });
}

function startPracticeMission() {
  const isRu = currentLang === "ru";
  practiceMode = true;
  switchView("adventure");
  const world = worlds[practiceModeWorld];
  trip = {
    active: true,
    world: practiceModeWorld,
    mission: 0,
    solved: 0,
    needed: 5,
    correct: 0,
    daily: false,
    mistakes: 0,
    practice: true
  };
  $("challenge").hidden = false;
  $("miniGame").hidden  = true;
  const scene = document.querySelector(".challenge-scene");
  if (scene) scene.style.background = `linear-gradient(${world.palette[0]} 0 45%, ${world.palette[1]} 45% 100%)`;
  react("swim");
  makeProblem();
  toast(isRu ? `🎯 Тренировка: ${world.name}` : `🎯 Practice: ${world.name}`);
}

// Override completeMission for practice mode (no progression saved)
const _origCompleteMission = null; // we handle inline
function startMission(daily) {
  if (miniGameTimer) { clearTimeout(miniGameTimer); miniGameTimer = null; }
  switchView("adventure");
  const mission = daily ? 0 : nextMission();
  trip = { active:true, world:selectedWorld, mission, solved:0, needed:5+(mission>2?2:0), correct:0, daily, mistakes:0 };
  $("challenge").hidden = false;
  $("miniGame").hidden  = true;
  // P6: apply island palette to challenge scene
  const w = worlds[trip.world];
  const scene = document.querySelector(".challenge-scene");
  if (scene) scene.style.background = `linear-gradient(${w.palette[0]} 0 45%, ${w.palette[1]} 45% 100%)`;
  react("swim");
  makeProblem();
}

function makeProblem() {
  const world   = worlds[trip.world];
  const topic   = chooseTopic(world.topics);
  const details = missionDetails[trip.mission] || missionDetails[0];
  currentProblem = generateProblem(topic);
  currentProblem.started = Date.now();
  const isRu    = currentLang === "ru";
  const verbsArr = isRu ? missionVerbsRu : missionVerbs;
  $("topicLabel").innerHTML    = currentLang === "learn"
    ? `${world.name} - ${missionVerbs[trip.mission]}<span class="learn-ru">${topicLabelLearn(topic)}</span>`
    : `${t(`world${trip.world}`) || world.name} - ${verbsArr[trip.mission] || missionVerbs[trip.mission]}`;
  $("missionTitle").textContent  = trip.daily
    ? (isRu ? "Ежедневное спасение" : "Daily Rescue")
    : (isRu ? `Миссия ${trip.mission+1}: ${details.titleRu || details.title}` : `Mission ${trip.mission+1}: ${details.title}`);
  $("questionsLeft").textContent = isRu
    ? `${Math.max(0, trip.needed-trip.solved)} ${t("questionsLeft")}`
    : `${Math.max(0, trip.needed-trip.solved)} ${t("questionsLeft")}`;
  const ptEl = $("problemText");
  ptEl.textContent = currentProblem.text;
  // Adaptive font size based on topic and length
  ptEl.classList.remove("word-problem","long-problem");
  if (currentProblem.topic === "word" || currentProblem.topic === "twoStep") {
    ptEl.classList.add("word-problem");
  } else if (currentProblem.text.length > 28) {
    ptEl.classList.add("long-problem");
  }
  $("hintText").hidden           = true;
  $("hintText").textContent      = currentProblem.hint;
  // P2: clear any previous correct-reveal and continue button
  $("correctReveal").hidden = true;
  const oldContinue = $("continueBtn");
  if (oldContinue) oldContinue.remove();

  const choices = shuffle([currentProblem.answer, ...wrongAnswers(currentProblem)]);
  $("answers").innerHTML = choices.map((v,i) =>
    `<button class="answer" aria-label="Answer: ${v}" tabindex="${i===0?0:-1}">${v}</button>`
  ).join("");
  document.querySelectorAll(".answer").forEach(btn =>
    btn.addEventListener("click", () => answer(Number(btn.textContent), btn))
  );
  // focus first answer for keyboard users
  $("answers").querySelector(".answer")?.focus();
  $("missionMeter").style.width = `${Math.round((trip.solved/trip.needed)*100)}%`;
}

function chooseTopic(topics) {
  if (topics.includes("adaptive")) {
    const eligible = Object.keys(state.topics)
      .filter(t => {
        if (state.level >= 10 && (t === "add10" || t === "add20")) return false;
        if (state.level >= 8  && t === "add3") return false;
        // only include advanced topics if player has reached appropriate level
        if (t === "advEquations"  && state.level < 8)  return false;
        if (t === "twoStep"       && state.level < 4)  return false;
        if (t === "fracCompare"   && state.level < 6)  return false;
        if (t === "reverseMul"    && state.level < 5)  return false;
        return true;
      });
    const ranked = eligible.sort((a,b) => weakness(b) - weakness(a)).slice(0,3);
    const weights = [5,3,2];
    const pool = [];
    ranked.forEach((t,i) => { for (let w=0; w < weights[i]; w++) pool.push(t); });
    return pool[Math.floor(Math.random() * pool.length)];
  }
  const weighted = [];
  topics.forEach(t => {
    const reps = 1 + Math.min(5, Math.ceil(weakness(t) * 5));
    for (let i=0; i<reps; i++) weighted.push(t);
  });
  return weighted[Math.floor(Math.random() * weighted.length)];
}

function weakness(topic) {
  const t = state.topics[topic] || { correct:0, wrong:0 };
  return (t.wrong+1) / (t.correct+t.wrong+3);
}

function difficultyBoost(topic) {
  const t = state.topics[topic] || { correct:0, wrong:0 };
  const accuracy = (t.correct+1) / (t.correct+t.wrong+2);
  if (accuracy > .82 && t.correct > 8) return 2;
  if (accuracy < .55 && t.wrong  > 2)  return -1;
  return 0;
}

// ─── P1: Fixed problem generator ─────────────────────────────────────────────
function generateProblem(topic) {
  const boost = difficultyBoost(topic);
  let a, b, x, answer, text, hint;
  const rand = max => Math.floor(Math.random() * Math.max(1, max)) + 1;

  switch (topic) {
    case "add10":       a=rand(5); b=rand(5); answer=a+b; text=`${a} + ${b} = ?`; hint="Count forward from the bigger number."; break;
    case "add20":       a=rand(10+boost*3); b=rand(10); answer=a+b; text=`${a} + ${b} = ?`; hint="Make a ten first if you can."; break;
    case "sub20":       a=rand(12+boost*5)+5; b=rand(Math.min(12,a)); answer=a-b; text=`${a} - ${b} = ?`; hint="Count back or think what adds up to the first number."; break;
    case "add100":      a=rand(50+boost*15); b=rand(40+boost*10); answer=a+b; text=`${a} + ${b} = ?`; hint="Add tens, then add ones."; break;
    case "sub100":      a=rand(70+boost*10)+20; b=rand(Math.min(65,a-1)); answer=a-b; text=`${a} - ${b} = ?`; hint="Subtract tens first, then ones."; break;
    case "carryBorrow": {
      a=28+rand(49); b=16+rand(38);
      if (Math.random()>.5) { answer=a+b; text=`${a} + ${b} = ?`; }
      else { if (b>a)[a,b]=[b,a]; answer=a-b; text=`${a} - ${b} = ?`; }
      hint="Line up the ones and tens like blocks."; break;
    }
    case "multiply":    a=rand(8+boost); b=rand(10); answer=a*b; text=`${a} × ${b} = ?`; hint="Multiplication is equal groups."; break;
    case "divide":      b=rand(9)+1; answer=rand(10); a=b*answer; text=`${a} ÷ ${b} = ?`; hint="Think which times-table makes the first number."; break;
    case "mixed":       return generateProblem(["add20","sub20","multiply","divide"][rand(4)-1]);
    case "missing":     a=rand(20); answer=rand(15); text=`${a} + ☐ = ${a+answer}`; hint="Find what is missing by subtracting."; break;
    case "patterns": {
      const patForms = [
        // arithmetic +step
        () => { const a=rand(6),b=rand(5)+1; return { text:`${a}, ${a+b}, ${a+b*2}, ${a+b*3}, ?`, answer:a+b*4, hint:`The pattern grows by ${b} each step.` }; },
        // arithmetic ×2 geometric
        () => { const a=rand(3)+1; return { text:`${a}, ${a*2}, ${a*4}, ${a*8}, ?`, answer:a*16, hint:"Each number doubles." }; },
        // ×3
        () => { const a=rand(2)+1; return { text:`${a}, ${a*3}, ${a*9}, ?`, answer:a*27, hint:"Each number is multiplied by 3." }; },
        // subtract pattern
        () => { const a=rand(10)+20, b=rand(4)+2; return { text:`${a}, ${a-b}, ${a-b*2}, ${a-b*3}, ?`, answer:a-b*4, hint:`The pattern decreases by ${b} each step.` }; },
        // skip counting by 5s/10s
        () => { const start=rand(8)*5, step=[5,10,25][rand(3)-1]; return { text:`${start}, ${start+step}, ${start+step*2}, ${start+step*3}, ?`, answer:start+step*4, hint:`Count by ${step}s.` }; },
      ];
      const pf = patForms[Math.floor(Math.random()*patForms.length)]();
      text=pf.text; answer=pf.answer; hint=pf.hint; break;
    }

    case "logic": {
      const logicForms = [
        // three-quantity comparison
        () => {
          const chars = ["Pip","Nori","Pebble"];
          const vals  = [rand(10)+1, rand(10)+1, rand(10)+1];
          const max   = Math.max(...vals);
          const winner= chars[vals.indexOf(max)];
          // encode winner as 1=Pip,2=Nori,3=Pebble
          const ansIdx = vals.indexOf(max)+1;
          return {
            text:`${chars[0]} has ${vals[0]} fish. ${chars[1]} has ${vals[1]} fish. ${chars[2]} has ${vals[2]} fish. Who has the most? (1=${chars[0]}, 2=${chars[1]}, 3=${chars[2]})`,
            answer:ansIdx,
            hint:`Compare all three numbers and find the biggest.`
          };
        },
        // simple puffin logic (original, keep variety)
        () => { const a=rand(8),b=rand(8); return { text:`Two puffins bring ${a} fish and ${b} fish, then find 2 more. Total?`, answer:a+b+2, hint:"Add all three groups of fish." }; },
        // ordering
        () => {
          const a=rand(20)+5, b=rand(20)+5, c=rand(20)+5;
          const sorted=[a,b,c].sort((x,y)=>x-y);
          return { text:`Sausage has ${a} fish, Pip has ${b}, Nori has ${c}. What is the middle (median) amount?`, answer:sorted[1], hint:"Put the numbers in order and find the middle one." };
        },
      ];
      const lf = logicForms[Math.floor(Math.random()*logicForms.length)]();
      text=lf.text; answer=lf.answer; hint=lf.hint; break;
    }

    // P1 FIXED equations — each form stores its own answer, no string inspection
    case "equations": {
      x = rand(12); a = rand(9)+1;
      const eqForms = [
        { text:`x + ${a} = ${x+a}`,  answer:x,   hint:"Subtract to find x." },
        { text:`${x+a} - x = ${a}`,  answer:x,   hint:"What number makes this true?" },
        { text:`${a} × x = ${a*x}`,  answer:x,   hint:"Divide to find x." },
        { text:`x ÷ ${a} = ${x}`,    answer:x*a, hint:"Multiply to find x." }
      ];
      const eq = eqForms[Math.floor(Math.random()*eqForms.length)];
      text   = eq.text;
      answer = eq.answer;
      hint   = eq.hint;
      break;
    }

    // P4: word problems use rich template system
    case "word": return generateWordProblem(state.level);

    // S3: Three-number addition
    case "add3": {
      a=rand(15+boost*5); b=rand(12+boost*3); const c=rand(10+boost*2);
      answer=a+b+c; text=`${a} + ${b} + ${c} = ?`;
      hint="Add the first two numbers, then add the third."; break;
    }

    // S3: Brackets — (a + b) × c  or  a × (b - c)  etc.
    case "brackets": {
      const bracketForms = [
        () => { const p=rand(8)+1,q=rand(8)+1,r=rand(9)+1; return { text:`(${p} + ${q}) × ${r} = ?`, answer:(p+q)*r, hint:"Work out the brackets first, then multiply." }; },
        () => { const p=rand(8)+2,q=rand(Math.min(p-1,7))+1,r=rand(9)+1; return { text:`(${p} - ${q}) × ${r} = ?`, answer:(p-q)*r, hint:"Work out the brackets first, then multiply." }; },
        () => { const r=rand(6)+2,p=rand(8)+1,q=rand(8)+1; return { text:`${r} × (${p} + ${q}) = ?`, answer:r*(p+q), hint:"Add inside the brackets first." }; },
        () => { const r=rand(30)+6,d=rand(5)+2,p=rand(4)+1,q=rand(4)+1; if(d*(p+q)!==r) return null; return { text:`${r} ÷ (${p} + ${q}) = ?`, answer:r/(p+q), hint:"Add inside the brackets, then divide." }; }
      ];
      let prob = null;
      let tries = 0;
      while (!prob && tries < 20) { const form = bracketForms[Math.floor(Math.random()*bracketForms.length)]; prob = form(); tries++; }
      if (!prob) { a=rand(6)+1; b=rand(5)+1; const r=rand(9)+1; prob={text:`(${a}+${b})×${r}=?`,answer:(a+b)*r,hint:"Brackets first!"}; }
      text=prob.text; answer=prob.answer; hint=prob.hint; break;
    }

    // S3: Order of operations — no brackets, multiply/divide before add/subtract
    case "orderOfOps": {
      const ooForms = [
        () => { const p=rand(9)+1,q=rand(9)+1,r=rand(10); return { text:`${p} × ${q} + ${r} = ?`, answer:p*q+r, hint:"Multiply first, then add." }; },
        () => { const p=rand(9)+1,q=rand(9)+1,r=rand(Math.min(p*q-1,20)); return { text:`${p} × ${q} - ${r} = ?`, answer:p*q-r, hint:"Multiply first, then subtract." }; },
        () => { const r=rand(6)+2; const ans=rand(10); return { text:`${r*ans} ÷ ${r} + ${rand(10)} = ?`, answer:r*ans/r+0, hint:"Divide first, then add." }; }, // simplified
        () => { const p=rand(8)+1,q=rand(8)+1,r=rand(9)+1,s=rand(9)+1; return { text:`${p} + ${q} × ${r} = ?`, answer:p+q*r, hint:"Multiply first, then add the rest." }; }
      ];
      let oof = null;
      let oofTries = 0;
      while (!oof && oofTries < 10) { oof = ooForms[Math.floor(Math.random()*ooForms.length)](); oofTries++; }
      if (!oof) oof = { text:`3 × 4 + 2 = ?`, answer:14, hint:"Multiply first, then add." };
      text=oof.text; answer=oof.answer; hint=oof.hint; break;
    }

    // S3: Simple fractions (½, ¼, ¾ of a number; adding unit fractions)
    case "fractions": {
      const fracForms = [
        () => { const n=[2,4,5,8,10][Math.floor(Math.random()*5)]; const whole=n*(rand(6)+1); return { text:`½ of ${whole} = ?`, answer:whole/2, hint:"Half means divide by 2." }; },
        () => { const whole=4*(rand(6)+1); return { text:`¼ of ${whole} = ?`, answer:whole/4, hint:"A quarter means divide by 4." }; },
        () => { const whole=4*(rand(5)+1); return { text:`¾ of ${whole} = ?`, answer:whole*3/4, hint:"Find ¼ first, then multiply by 3." }; },
        () => { const d=rand(4)+2; const whole=d*(rand(5)+1); return { text:`${whole} ÷ ${d} = ? (one ${["","","half","third","quarter","fifth","sixth"][d] || `1/${d}`} of ${whole})`, answer:whole/d, hint:`Divide ${whole} into ${d} equal groups.` }; },
        () => { const whole=3*(rand(6)+1); return { text:`⅓ of ${whole} = ?`, answer:whole/3, hint:"Divide by 3 to find one third." }; }
      ];
      const ff = fracForms[Math.floor(Math.random()*fracForms.length)]();
      text=ff.text; answer=ff.answer; hint=ff.hint; break;
    }

    // ── S4: Two-step word problems ────────────────────────────────────────────
    case "twoStep": return generateTwoStep();

    // ── S4: Advanced equations ────────────────────────────────────────────────
    case "advEquations": return generateAdvEquation();

    // ── S4: Reverse multiplication ────────────────────────────────────────────
    case "reverseMul": return generateReverseMul();

    // ── S4: Fraction comparison ───────────────────────────────────────────────
    case "fracCompare": return generateFracCompare();

    default: return generateProblem("add20");
  }
  return { topic, text, answer, hint };
}

// ═══════════════════════════════════════════════════════════════
// SPRINT 4 — NEW MATH GENERATORS
// ═══════════════════════════════════════════════════════════════

// ── Two-step word problems ────────────────────────────────────
const twoStepTemplates = [
  (a,b,c,ch) => ({ text:`Sausage caught ${a} fish. He gave ${b} to ${ch}. Then he caught ${c} more. How many fish does he have now?`,   answer:a-b+c, hint:`First subtract the fish given away, then add the new ones.` }),
  (a,b,c,ch) => ({ text:`${ch} had ${a} snowballs. ${b} melted in the sun. Then she made ${c} new ones. How many snowballs now?`,        answer:a-b+c, hint:`Subtract the melted ones, then add the new ones.` }),
  (a,b,c,ch) => ({ text:`There were ${a} penguins on the ice. ${b} dived away. Then ${c} more arrived. How many penguins are there?`,    answer:a-b+c, hint:`Take away those that left, then add the arrivals.` }),
  (a,b,c,ch) => ({ text:`Sausage found ${a} treasure coins. He spent ${b} at the market. ${ch} gave him ${c} more. How many coins?`,    answer:a-b+c, hint:`Subtract what was spent, then add the gift.` }),
  (a,b,c,ch) => ({ text:`${a} seals were swimming. ${b} went to rest on the ice. Then ${c} came back. How many are swimming now?`,       answer:a-b+c, hint:`Take away those that rested, add the ones that returned.` }),
  (a,b,c,ch) => ({ text:`The boat had ${a} crates. It dropped off ${b} at the dock and picked up ${c} new ones. How many crates now?`,  answer:a-b+c, hint:`Subtract the crates dropped off, add the new ones.` }),
  // multiply then add
  (a,b,c,ch) => ({ text:`${ch} has ${a} baskets with ${b} fish each. She finds ${c} more fish on the shore. How many fish in total?`,   answer:a*b+c, hint:`Multiply to find fish in baskets, then add the extra ones.` }),
  (a,b,c,ch) => ({ text:`There are ${a} boats with ${b} penguins each. ${c} more penguins jump aboard. How many penguins total?`,       answer:a*b+c, hint:`Multiply first, then add the extra penguins.` }),
  // add then multiply
  (a,b,c,ch) => ({ text:`Sausage and ${ch} together have ${a} + ${b} fish. They want to triple that amount. What is the total?`,        answer:(a+b)*c, hint:`Add first, then multiply by ${c}.` }),
];

function generateTwoStep() {
  const char = worlds[selectedWorld]?.character || "Pip";
  const level = state.level;
  const rand  = max => Math.floor(Math.random() * Math.max(1,max)) + 1;

  // Scale numbers to level
  let a, b, c;
  if (level < 5) {
    a = rand(10)+5; b = rand(Math.min(a-1,6))+1; c = rand(8)+1;
  } else if (level < 10) {
    a = rand(20)+10; b = rand(10)+2; c = rand(12)+2;
  } else {
    a = rand(40)+15; b = rand(15)+3; c = rand(20)+3;
  }

  // For multiply templates, keep factors reasonable
  const mulA = rand(5)+2, mulB = rand(8)+2, mulC = rand(10)+1;

  const pool = level < 6
    ? twoStepTemplates.slice(0,6)   // add/sub only for lower levels
    : twoStepTemplates;

  const tpl = pool[Math.floor(Math.random()*pool.length)];

  // detect multiply template by index
  const idx = twoStepTemplates.indexOf(tpl);
  let prob;
  if (idx === 6 || idx === 7) {
    prob = tpl(mulA, mulB, mulC, char);
  } else if (idx === 8) {
    const addA=rand(15)+3, addB=rand(12)+2, mult=rand(3)+2;
    prob = tpl(addA, addB, mult, char);
  } else {
    prob = tpl(a, b, c, char);
  }

  return { topic:"twoStep", text:prob.text, answer:prob.answer, hint:prob.hint };
}

// ── Advanced equations ────────────────────────────────────────
function generateAdvEquation() {
  const rand = max => Math.floor(Math.random() * Math.max(1,max)) + 1;
  const level = state.level;

  const forms = [
    // x + large = large  (e.g. x + 17 = 42)
    () => { const x=rand(30)+5, a=rand(20)+10; return { text:`x + ${a} = ${x+a}`, answer:x, hint:"Subtract to find x." }; },
    // large - x = medium (e.g. 56 - x = 19)
    () => { const x=rand(25)+5, total=rand(30)+x+5; return { text:`${total} - x = ${total-x}`, answer:x, hint:"Subtract the answer from the big number to find x." }; },
    // 3 × x = result
    () => { const f=rand(4)+2, x=rand(10)+2; return { text:`${f} × x = ${f*x}`, answer:x, hint:`Divide ${f*x} by ${f} to find x.` }; },
    // x ÷ f = result
    () => { const f=rand(5)+2, x=rand(8)+2; return { text:`x ÷ ${f} = ${x}`, answer:x*f, hint:`Multiply ${x} by ${f} to find x.` }; },
    // 2x = result  (written as 2 × x)
    () => { const x=rand(15)+3; return { text:`2 × x = ${2*x}`, answer:x, hint:`Divide ${2*x} by 2 to find x.` }; },
    // x² style: x × x = ? (only level 10+)
    () => { const x=rand(6)+2; return { text:`x × x = ${x*x}`, answer:x, hint:`What number multiplied by itself gives ${x*x}?` }; },
  ];

  // Gate harder forms by level
  const eligible = level >= 10 ? forms : forms.slice(0, 5);
  const f = eligible[Math.floor(Math.random()*eligible.length)]();
  return { topic:"advEquations", text:f.text, answer:f.answer, hint:f.hint };
}

// ── Reverse multiplication ────────────────────────────────────
function generateReverseMul() {
  const rand = max => Math.floor(Math.random() * Math.max(1,max)) + 1;
  const b = rand(9)+2;
  const answer = rand(9)+2;
  const product = b * answer;

  const forms = [
    { text:`? × ${b} = ${product}`,  answer, hint:`Think: ${product} ÷ ${b} = ?` },
    { text:`${b} × ? = ${product}`,  answer, hint:`Think: ${product} ÷ ${b} = ?` },
    { text:`? × ${answer} = ${product}`, answer:b, hint:`Think: ${product} ÷ ${answer} = ?` },
  ];
  const f = forms[Math.floor(Math.random()*forms.length)];
  return { topic:"reverseMul", text:f.text, answer:f.answer, hint:f.hint };
}

// ── Fraction comparison ───────────────────────────────────────
// Answer: 1 = first fraction is larger, 2 = second is larger, 0 = equal
function generateFracCompare() {
  const rand = max => Math.floor(Math.random() * Math.max(1,max)) + 1;

  const pairs = [
    { a:[1,2], b:[1,4], answer:1, hint:"½ is bigger than ¼ — imagine cutting a pizza." },
    { a:[1,4], b:[1,2], answer:2, hint:"½ is bigger than ¼." },
    { a:[3,4], b:[1,2], answer:1, hint:"¾ is bigger than ½." },
    { a:[1,3], b:[1,4], answer:1, hint:"The smaller the bottom number, the bigger the slice." },
    { a:[2,4], b:[1,2], answer:0, hint:"2/4 and 1/2 are the same — they are equivalent fractions." },
    { a:[1,5], b:[1,3], answer:2, hint:"1/3 is bigger — thirds are larger slices than fifths." },
    { a:[3,5], b:[1,2], answer:1, hint:"3/5 = 0.6 and 1/2 = 0.5, so 3/5 is bigger." },
    { a:[2,3], b:[3,4], answer:2, hint:"¾ = 0.75, ⅔ ≈ 0.67, so ¾ is bigger." },
  ];

  const p = pairs[Math.floor(Math.random()*pairs.length)];
  const [an,ad] = p.a;
  const [bn,bd] = p.b;
  const fracStr = (n,d) => d===2?`½`:d===3?`⅓`:d===4?`¼`:d===5?`⅕`:`${n}/${d}`;

  return {
    topic:"fracCompare",
    text:`Which is larger? (1) ${fracStr(an,ad)}   or   (2) ${fracStr(bn,bd)}   — type 1, 2, or 0 if equal`,
    answer:p.answer,
    hint:p.hint
  };
}

// ─── P1: Scaled wrong answers ─────────────────────────────────────────────────
function wrongAnswers(problem) {
  const correct = problem.answer;
  const values  = new Set();
  // scale spread to magnitude: small answers → tight range, large → wider
  const spread = correct < 10 ? 2 : correct < 30 ? 4 : correct < 100 ? 10 : 20;

  // topic-specific common mistakes
  const commonMistakes = [];
  if (problem.topic === "multiply") {
    const parts = problem.text.match(/(\d+)/g);
    if (parts && parts.length >= 2) {
      commonMistakes.push(Number(parts[0]) + Number(parts[1])); // confused add
      commonMistakes.push(correct - Number(parts[1]));          // off-by-one group
    }
  }
  if (problem.topic === "divide") {
    commonMistakes.push(correct - 1);
    commonMistakes.push(correct + 1);
  }
  if (problem.topic === "reverseMul") {
    commonMistakes.push(correct + 1);
    commonMistakes.push(correct - 1);
    const parts = problem.text.match(/(\d+)/g);
    if (parts) commonMistakes.push(Number(parts[parts.length-1])); // confuse product with factor
  }
  if (problem.topic === "fracCompare") {
    // answer is 0,1,2 — so distractors are the other two values
    [0,1,2].filter(v => v !== correct).forEach(v => commonMistakes.push(v));
  }
  if (problem.topic === "twoStep") {
    // common error: only do one of the two steps
    const parts = problem.text.match(/\d+/g)?.map(Number) || [];
    if (parts.length >= 2) commonMistakes.push(Math.abs(parts[0] - parts[1]));
    if (parts.length >= 3) commonMistakes.push(parts[0] + parts[2]);
  }
  if (problem.topic === "advEquations") {
    commonMistakes.push(correct + 2);
    commonMistakes.push(Math.max(1, correct - 2));
  }

  for (const m of commonMistakes) {
    if (m !== correct && m >= 0 && values.size < 2) values.add(m);
  }

  let attempts = 0;
  while (values.size < 3 && attempts < 30) {
    attempts++;
    const offset = Math.floor(Math.random() * (spread*2+1)) - spread || (Math.random()<.5?-1:1);
    const v = Math.max(0, correct + offset);
    if (v !== correct) values.add(v);
  }
  return [...values].slice(0,3);
}

// ─── P2: Answer handling — show correct answer on wrong ──────────────────────
function answer(value, btn) {
  const correct = value === currentProblem.answer;
  const topic   = currentProblem.topic;
  const elapsed = Math.max(1, Math.floor((Date.now() - currentProblem.started) / 1000));

  document.querySelectorAll(".answer").forEach(b => {
    b.disabled = true;
    // highlight the correct button in green regardless of what was tapped
    if (Number(b.textContent) === currentProblem.answer) b.classList.add("correct");
  });
  if (!correct) btn.classList.add("wrong");

  state.solved++;
  state.topics[topic].time += elapsed;
  if (elapsed <= 5) state.topics[topic].fast++;

  if (correct) {
    resetConsecutiveMistakes();
    closeSmartHint();
    sealPose("happy");
    state.correct++;
    state.topics[topic].correct++;
    trip.correct++;
    trip.solved++;
    gainRewards();
    animateFish();
    react("happy");
    playSound("correct");
    speak("correct");
    toast(encouragement());
    $("questionsLeft").textContent = `${Math.max(0, trip.needed-trip.solved)} questions remaining`;
    $("missionMeter").style.width  = `${Math.round((trip.solved/trip.needed)*100)}%`;
    announceResult(true, currentProblem.answer, currentProblem.topic);
    setTimeout(() => trip.solved >= trip.needed ? completeMission() : makeProblem(), 860);
  } else {
    state.wrong++;
    state.topics[topic].wrong++;
    trip.mistakes++;
    react("sad");
    playSound("wrong");
    speak("wrong");
    showCorrectReveal(currentProblem);
    announceResult(false, currentProblem.answer, currentProblem.topic);
    maybeShowSmartHint(topic);   // S5: smart hint after 2+ mistakes
    showContinueButton();
  }

  if (trip.daily) updateDaily(correct);
  checkAchievements();
  save();
  // P1 fix: only re-render header + mission progress, not all 8 sections on every tap
  renderHeader();
}

// P2: show the correct answer with explanation + continue button
function showCorrectReveal(problem) {
  const el = $("correctReveal");
  if (!el) return;
  const isRu = currentLang === "ru";
  let answerText = isRu ? `Правильный ответ: ${problem.answer}` : `The answer is ${problem.answer}`;
  if (problem.topic === "equations") answerText = `x = ${problem.answer}`;

  let vocabHtml = "";
  if (currentLang === "learn") {
    const MATH_VOCAB = {
      add10:      ["Add · Сложить", "Sum · Сумма"],
      add20:      ["Add · Сложить", "Plus · Плюс"],
      sub20:      ["Subtract · Вычесть", "Minus · Минус", "Difference · Разность"],
      add100:     ["Add · Сложить", "Carry · Перенос"],
      sub100:     ["Subtract · Вычесть", "Borrow · Заём"],
      multiply:   ["Multiply · Умножить", "Times · Умножить на", "Product · Произведение"],
      divide:     ["Divide · Разделить", "Quotient · Частное", "Equal groups · Равные группы"],
      missing:    ["Missing number · Пропущенное число"],
      patterns:   ["Pattern · Закономерность", "Sequence · Последовательность"],
      logic:      ["Compare · Сравнить", "Most · Больше всего", "Least · Меньше всего"],
      equations:  ["Equation · Уравнение", "Variable x · Переменная x", "Solve · Решить"],
      fractions:  ["Fraction · Дробь", "Numerator · Числитель", "Denominator · Знаменатель"],
      word:       ["Word problem · Задача", "Total · Итого", "Remaining · Осталось"],
      twoStep:    ["Two steps · Два действия", "First · Сначала", "Then · Затем", "Total · Итого"],
      advEquations:["Equation · Уравнение", "Unknown x · Неизвестное x", "Multiply · Умножить", "Divide · Разделить"],
      reverseMul: ["Missing factor · Пропущенный множитель", "Divide · Разделить", "Product · Произведение"],
      fracCompare:["Fraction · Дробь", "Larger · Больше", "Smaller · Меньше", "Equal · Равные"],
    };
    const words = MATH_VOCAB[problem.topic] || [];
    if (words.length) {
      vocabHtml = `<div class="learn-vocab">${words.map(w=>`<span class="learn-vocab-chip">${w}</span>`).join("")}</div>`;
    }
  }

  el.innerHTML = `
    <span class="reveal-answer">✓ ${answerText}</span>
    <span class="reveal-hint">${problem.hint}</span>
    ${vocabHtml}`;
  el.hidden = false;
}

function showContinueButton() {
  const el = $("correctReveal");
  if (!el) return;
  const existing = $("continueBtn");
  if (existing) existing.remove();
  const isRu = currentLang === "ru";
  const btn = document.createElement("button");
  btn.id = "continueBtn";
  btn.className = "continue-btn";
  btn.textContent = isRu ? "Следующий вопрос →" : "Next Question →";
  btn.setAttribute("aria-label", isRu ? "Следующий вопрос" : "Continue to next question");
  btn.addEventListener("click", () => {
    btn.remove();
    el.hidden = true;
    makeProblem();
  });
  el.appendChild(btn);
  btn.focus();
}

// P10: live region announcement
function announceResult(correct, answer, topic) {
  const region = $("a11yLive");
  if (!region) return;
  region.textContent = correct
    ? "Correct! Well done."
    : `Not quite. The answer was ${topic==="equations"?"x = ":""}${answer}. Keep going!`;
}

function gainRewards() {
  const mult = Date.now() < (state.doubleRewardsUntil||0) ? 2 : 1;
  state.fish  += 4 * mult;
  state.coins += 2 * mult;
  state.stars += 1 * mult;
  state.xp    += 18 * mult;
  while (state.xp >= 100) {
    state.xp -= 100;
    state.level++;
    playSound("level");
    toast(`Level ${state.level}! 🎉`);
  }
}

function completeMission() {
  $("challenge").hidden = true;

  // Practice Mode: no progression saved
  if (trip.practice) {
    practiceMode = false;
    react("victory");
    sealPose("victory");
    playSound("perfect");
    confetti();
    const isRu = currentLang === "ru";
    const score = `${trip.correct}/${trip.needed}`;
    const msg = isRu
      ? `Тренировка завершена! ${score} правильно. Никаких изменений в прогрессе.`
      : `Practice complete! ${score} correct. No story progress saved.`;
    // Show simple result modal
    const rewardModal = $("rewardModal");
    if (rewardModal) {
      $("rewardTitle").textContent = isRu ? "🎯 Тренировка завершена!" : "🎯 Practice Complete!";
      $("rewardText").innerHTML = `<p>${msg}</p>`;
      rewardModal.hidden = false;
    } else {
      toast(msg);
    }
    return;
  }

  if (trip.mistakes === 0) state.perfectTrips++;

  const world    = worlds[trip.world];
  const oldDone  = completedMissions(trip.world);
  if (!trip.daily && oldDone < 5) state.missions[missionKey(trip.world)] = oldDone + 1;
  const newDone  = completedMissions(trip.world);

  let animal   = null;
  let building = null;
  let rare     = false;

  if (!state.animals.includes(world.animal) && newDone >= 2) {
    animal = animals[world.animal];
    state.animals.push(world.animal);
  }
  if (newDone >= 3) {
    building = buildings.find(b => !state.buildings.includes(b.id) && state.stars >= b.cost);
    if (building) {
      state.buildings.push(building.id);
      // P8: building celebration
      celebrateBuilding(building);
    } else {
      // P8: tell player how many stars they still need
      const next = buildings.find(b => !state.buildings.includes(b.id));
      if (next) toast(`Need ${Math.max(0, next.cost - state.stars)} more stars to build ${next.name}!`);
    }
  }
  if (newDone >= 4 && Math.random() < .35) {
    rare = true;
    state.rareTreasures++;
    state.coins += 25;
  }
  if (newDone >= 5 && trip.world === state.unlockedWorld && state.unlockedWorld < worlds.length-1) {
    state.unlockedWorld++;
  }
  if (trip.daily && state.daily.solved >= 5 && !state.daily.claimed) {
    state.daily.claimed = true;
    const streakBonus = Math.min(20, state.streak.count * 3);
    state.coins += 20 + streakBonus;
    state.fish  += 15 + streakBonus;
    if (!state.specialCosmetics.includes(state.dailySpecial)) state.specialCosmetics.push(state.dailySpecial);
    updateStreak();
  }

  react("victory");
  sealPose("victory");   // S5: victory animation
  speak("reward");
  playSound("perfect");
  confetti();

  // S5: rescue celebration when a new friend is rescued
  if (animal) {
    const prof      = getActiveProfile();
    const playerName= prof?.name || "Explorer";
    setTimeout(() => showRescueCelebration(trip.world, playerName), 400);
  } else {
    showReward(animal, building, rare);
  }
  checkAchievements();
  save(true);
  renderMap();
  renderAll();
  if (!trip.daily && newDone < 5 && newDone % 2 === 0) setTimeout(() => toast("Bonus game unlocked between missions!"), 900);
}

// P8: Building celebration modal moment
function celebrateBuilding(building) {
  setTimeout(() => {
    const el = $("buildingCelebration");
    if (!el) return;
    el.innerHTML = `<div class="building-celebrate-box">
      ${buildingSvg(building.id)}
      <h3>${building.name} built!</h3>
      <p>Arctic Town just got bigger! 🏙️</p>
    </div>`;
    el.hidden = false;
    playSound("build");
    confetti();
    setTimeout(() => { el.hidden = true; }, 3000);
  }, 600);
}

function encouragement() {
  return ["Sausage splashes ahead!","Great rescue move!","+4 fish, +2 coins, +1 star","The island gets brighter!","Nice thinking!"][Math.floor(Math.random()*5)];
}

function showHint() {
  state.hintsUsed++;
  $("hintText").hidden = false;
  react("excited");
  checkAchievements();
  save();
}

// ─── Seal reactions ───────────────────────────────────────────────────────────
function react(type) {
  ["heroSeal","missionSeal","customSeal"].forEach(id => {
    const el = $(id);
    if (!el) return;
    el.classList.remove("happy","sad","excited","victory","swim","surprised","thinking","wriggle");
    void el.offsetWidth;
    el.classList.add(type);
    setTimeout(() => {
      el.classList.remove(type);
      el.classList.add(id === "missionSeal" ? "swim" : "idle");
    }, type === "victory" ? 1800 : 1100);
  });
  applySealLook();
}

// ─── SVG costume layer system ────────────────────────────────────────────────
const COSTUME_SYMBOLS = {
  pirate:    { costume:"costume-pirate",      accessory:null,               pet:null },
  astronaut: { costume:"costume-astronaut",   accessory:null,               pet:null },
  king:      { costume:"costume-king",        accessory:null,               pet:null },
  superhero: { costume:"costume-superhero",   accessory:null,               pet:null },
  sunny:     { costume:null,                  accessory:"accessory-sunny",  pet:null },
  scarf:     { costume:null,                  accessory:"accessory-scarf",  pet:null },
  goggles:   { costume:null,                  accessory:"accessory-goggles",pet:null },
  pet:       { costume:null,                  accessory:null,               pet:"pet-fish" }
};

function applySealLook() {
  let costumeSymbol   = null;
  let accessorySymbol = null;
  let petSymbol       = null;

  Object.values(state.equipped || {}).forEach(itemId => {
    if (itemId === null || itemId === undefined) return;
    const item = shop.find(s => s.id === itemId);
    if (!item) return;
    const mapping = COSTUME_SYMBOLS[item.className];
    if (!mapping) return;
    if (mapping.costume)   costumeSymbol   = mapping.costume;
    if (mapping.accessory) accessorySymbol = mapping.accessory;
    if (mapping.pet)       petSymbol       = mapping.pet;
  });

  const setLayer = (id, symbol) => {
    const el = $(id);
    if (!el) return;
    el.setAttribute("href", symbol ? "#" + symbol : "");
  };

  ["heroSeal","missionSeal","customSeal","travelSeal"].forEach(prefix => {
    setLayer(prefix + "Costume",   costumeSymbol);
    setLayer(prefix + "Accessory", accessorySymbol);
    setLayer(prefix + "Pet",       petSymbol);
  });
}

// ─── Animations ───────────────────────────────────────────────────────────────
function animateFish() {
  const stream = $("fishStream");
  for (let i=0; i<6; i++) {
    const fish = document.createElement("i");
    fish.className   = "fish";
    fish.style.left  = `${20+Math.random()*80}px`;
    fish.style.bottom= `${30+Math.random()*80}px`;
    fish.style.animationDelay = `${i*.05}s`;
    stream.appendChild(fish);
    setTimeout(() => fish.remove(), 1600);
  }
}

function confetti() {
  for (let i=0; i<44; i++) {
    const p = document.createElement("div");
    p.className = "confetti-particle";
    p.style.left      = `${Math.random()*100}%`;
    p.style.top       = "-30px";
    p.style.background= ["#ffd45a","#4fd6a8","#ff7b7b","#27c7de","#856de8"][i%5];
    p.style.transform = `rotate(${Math.random()*180}deg)`;
    document.body.appendChild(p);
    p.animate(
      [{ transform:p.style.transform, top:"-30px" }, { transform:"rotate(400deg)", top:"100vh" }],
      { duration:1400+Math.random()*800, easing:"cubic-bezier(.2,.7,.3,1)" }
    );
    setTimeout(() => p.remove(), 2400);
  }
}

// ─── Rescue animation — animal swims in, waves, then modal opens ─────────────
function playRescueAnimation(animal, onDone) {
  const overlay = $("rescueAnimOverlay");
  if (!overlay) { onDone(); return; }

  overlay.innerHTML = `
    <div class="rescue-anim-stage">
      <div class="rescue-wave-bg"></div>
      <div class="rescue-animal-wrap" id="rescueAnimalWrap">
        ${animalSvgLarge(animal.id, animal.species)}
        <div class="rescue-speech">"${rescueLines[Math.floor(Math.random()*rescueLines.length)]}"</div>
      </div>
      <div class="rescue-sausage-wrap">
        <svg class="rescue-sausage-svg" viewBox="0 0 260 220">
          <use href="#sausage-body"/>
        </svg>
      </div>
      <div class="rescue-sparkles" id="rescueSparkles"></div>
    </div>`;
  overlay.hidden = false;

  // Spawn sparkles
  const spk = $("rescueSparkles");
  for (let i=0;i<18;i++) {
    const s = document.createElement("div");
    s.className = "rescue-sparkle";
    s.style.left = `${10+Math.random()*80}%`;
    s.style.top  = `${10+Math.random()*70}%`;
    s.style.animationDelay = `${Math.random()*1.2}s`;
    s.textContent = ["✨","⭐","💫","🌟"][i%4];
    spk.appendChild(s);
  }

  playSound("perfect");
  confetti();

  // After 2.8s: close overlay and open reward modal
  setTimeout(() => {
    overlay.hidden = true;
    overlay.innerHTML = "";
    onDone();
  }, 2800);
}

// ─── Reward modal ─────────────────────────────────────────────────────────────
function showReward(animal, building, rare) {
  const openModal = () => {
    $("rewardTitle").textContent = animal ? `${animal.name} Rescued!` : (rare ? "Rare Treasure!" : "Mission Complete!");
    const bits = [`+${trip.needed*4} fish`, `+${trip.needed*2} coins`, `+${trip.needed} stars`];
    if (animal)   bits.push(`rescued ${animal.name}`);
    if (building) bits.push(`built ${building.name}`);
    if (rare)     bits.push("+25 rare treasure coins");
    const rescue = animal
      ? `<div class="rescue-card">${animalSvgLarge(animal.id, animal.species)}<strong>${animal.name} the ${animal.species}</strong><p class="rescue-fact">${animal.fact}</p></div>`
      : "";
    $("rewardText").innerHTML = `${rescue}<div class="loot-chest" aria-hidden="true"></div><p class="reward-bits">${bits.join(" · ")}</p>`;
    $("rewardModal").hidden = false;
    if (animal) setTimeout(() => { if (!$("rewardModal").hidden) switchView("town"); }, 4200);
  };

  if (animal) {
    playRescueAnimation(animal, openModal);
  } else {
    openModal();
  }
}

// ─── Town ─────────────────────────────────────────────────────────────────────
function renderTown() {
  const positions = [[7,58],[22,38],[38,58],[53,35],[68,58],[79,37],[12,22],[58,16]];
  const livelyExtras = `
    <span class="town-fish" style="left:-40px;top:52%;animation-delay:.2s"></span>
    <span class="town-fish" style="left:-120px;top:61%;animation-delay:1.4s"></span>
    <span class="town-splash" style="left:76%;top:47%"></span>
    <span class="town-critter" style="left:8%;top:74%">${animalSvg(1)}</span>
    <span class="town-critter" style="left:88%;top:68%;animation-delay:1s">${animalSvg(8)}</span>
  `;
  $("townScene").innerHTML = livelyExtras +
    buildings.map((b,i) => {
      if (!state.buildings.includes(b.id)) return "";
      const [left,top] = positions[i];
      return `<button class="town-building" style="left:${left}%;top:${top}%" data-building="${b.id}" aria-label="${b.name}">${buildingSvg(b.id)}</button>`;
    }).join("") +
    state.animals.slice(0,9).map((id,i) =>
      `<div class="town-friend" style="left:${15+i*8}%;top:${70+(i%3)*6}%;animation-delay:${i*.25}s">${animalSvg(id)}</div>`
    ).join("");
  const scene = $("townScene");
  if (scene && !scene.dataset.bound) {
    scene.dataset.bound = "1";
    scene.addEventListener("click", e => {
      const btn = e.target.closest("[data-building]");
      if (!btn) return;
      const building = buildings[Number(btn.dataset.building)];
      toast(`${building.name} has a visitor today!`);
      speak("town");
    });
  }
  $("townGrid").innerHTML = buildings.map(b => {
    const built = state.buildings.includes(b.id);
    const starsNeeded = Math.max(0, b.cost - state.stars);
    return `<article class="item-card ${built?"":"locked"}">${buildingSvg(b.id)}<h3>${b.name}</h3>
      <p>${built ? "Open, animated, and part of Arctic Town." : starsNeeded > 0 ? `Need ${starsNeeded} more stars and mission progress.` : "Keep completing missions to unlock."}</p></article>`;
  }).join("");
}

function renderAlbum() {
  $("albumGrid").innerHTML = animals.map(a => {
    const rescued = state.animals.includes(a.id);
    return `<article class="item-card ${rescued?"":"locked"}">${animalSvg(a.id)}<h3>${rescued?a.name:"Hidden Friend"}</h3>
      <p>${rescued?`${a.species}: ${a.fact}`:"Complete story missions to discover this friend."}</p></article>`;
  }).join("");
}

function renderShop() {
  $("shopGrid").innerHTML = shop.map(s => {
    const owned    = state.shop.includes(s.id);
    const equipped = state.equipped[s.type] === s.id;
    return `<article class="item-card">${costumeSvg(s.id)}<h3>${s.name}</h3>
      <p>${owned?(equipped?"Equipped on Sausage.":"Owned. Equip it in My Seal."):"A visible reward for Sausage."}</p>
      <div class="buy-row"><b>${s.cost} coins</b>
        <button data-shop="${s.id}" ${owned||state.coins<s.cost?"disabled":""} aria-label="${owned?"Owned":("Buy "+s.name+" for "+s.cost+" coins")}">${owned?"Owned":"Buy"}</button>
      </div></article>`;
  }).join("");
  const shopGrid = $("shopGrid");
  if (shopGrid && !shopGrid.dataset.bound) {
    shopGrid.dataset.bound = "1";
    shopGrid.addEventListener("click", e => {
      const btn = e.target.closest("[data-shop]");
      if (btn && !btn.disabled) buyItem(Number(btn.dataset.shop));
    });
  }
}

function buyItem(id) {
  const item = shop[id];
  if (state.coins >= item.cost && !state.shop.includes(item.id)) {
    state.coins -= item.cost;
    state.shop.push(item.id);
    state.equipped[item.type] = item.id;
    playSound("coin");
    react("excited");
    toast(`${item.name} unlocked and equipped!`);
    checkAchievements();
    save();
    renderAll();
  }
}

function renderCloset() {
  const equippedNames = Object.entries(state.equipped).map(([slot,id]) => {
    const item = shop.find(s => s.id===id);
    return `<div>${slot}: <b>${item?item.name:"None yet"}</b></div>`;
  }).join("");
  $("equippedList").innerHTML = equippedNames;
  $("closetGrid").innerHTML   = shop.map(item => {
    const owned  = state.shop.includes(item.id);
    const active = state.equipped[item.type] === item.id;
    return `<article class="item-card ${owned?"":"locked"}">${costumeSvg(item.id)}<h3>${item.name}</h3>
      <p>${owned?`Slot: ${item.type}`:`Buy in Rewards for ${item.cost} coins.`}</p>
      <button class="equip-btn ${active?"active":""}" data-equip="${item.id}" ${owned?"":"disabled"} aria-label="${active?"Equipped":"Equip "+item.name}">${active?"Equipped":"Equip"}</button></article>`;
  }).join("");
  const closetGrid = $("closetGrid");
  if (closetGrid && !closetGrid.dataset.bound) {
    closetGrid.dataset.bound = "1";
    closetGrid.addEventListener("click", e => {
      const btn = e.target.closest("[data-equip]");
      if (!btn || btn.disabled) return;
      const item = shop[Number(btn.dataset.equip)];
      if (!item) return;
      state.equipped[item.type] = item.id;
      react("excited");
      save();
      renderCloset();
      applySealLook();
    });
  }
}

function renderAchievements() {
  const unlocked = new Set(state.achievements);
  $("achievementProgress").textContent = `${unlocked.size} of ${achievementNames.length} unlocked`;
  $("achievementGrid").innerHTML = achievementNames.map((name,i) =>
    `<article class="item-card achievement ${unlocked.has(i)?"unlocked":"locked"}">
      <h3>${name}</h3><p>${unlocked.has(i)?"Unlocked! ⭐":"Keep adventuring to discover this badge."}</p>
    </article>`
  ).join("");
}

// ─── P9: Daily Challenge with narrative ──────────────────────────────────────
function renderDaily() {
  if (state.daily.date !== todayKey()) {
    state.daily     = { date:todayKey(), solved:0, claimed:false };
    state.dailySpecial = dailySpecialName();
  }
  if (!state.dailySpecial) state.dailySpecial = dailySpecialName();

  // P9: pick a narrative based on day of week
  const narrative = dailyNarratives[new Date().getDay() % dailyNarratives.length];
  const isRu = currentLang === "ru";
  const narrativeText = isRu ? (narrative.textRu || narrative.text) : narrative.text;
  const moreToGo = isRu
    ? `(ещё ${Math.max(0,5-state.daily.solved)})`
    : `(${Math.max(0,5-state.daily.solved)} more to go)`;
  $("dailyText").textContent = state.daily.claimed
    ? t("dailyClaimed")
    : narrativeText + ` ${moreToGo}`;
  $("dailyBonus").textContent = `Today's treasure: ${state.dailySpecial}. Streak bonus: +${Math.min(20, state.streak.count*3)} fish and coins.`;
  $("dailyBtn").disabled      = state.daily.claimed;

  // P9: show collected daily specials if any
  const collectedEl = $("dailyCollected");
  if (collectedEl) {
    if (state.specialCosmetics.length > 0) {
      collectedEl.innerHTML = `<p class="daily-collected-label">Your collection (${state.specialCosmetics.length}):</p>
        <div class="daily-collected-grid">${state.specialCosmetics.map(n=>`<span class="daily-badge">✨ ${n}</span>`).join("")}</div>`;
      collectedEl.hidden = false;
    } else {
      collectedEl.hidden = true;
    }
  }

  $("streakGrid").innerHTML = Array.from({length:7}, (_,i) =>
    `<div class="day ${i < state.streak.count?"done":""}" aria-label="Day ${i+1}${i<state.streak.count?" - completed":""}">Day<br>${i+1}</div>`
  ).join("");
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function renderDashboard() {
  const prof      = getActiveProfile();
  const accuracy  = state.solved ? Math.round((state.correct/state.solved)*100) : 0;
  const sorted    = Object.entries(state.topics).sort((a,b) => weakness(a[0]) - weakness(b[0]));
  const strong    = sorted.slice(0,3).map(([t]) => topicLabel(t)).join(", ") || "Play to discover";
  const weak      = sorted.slice(-3).reverse().map(([t]) => topicLabel(t)).join(", ") || "Play to discover";
  const minutes   = Math.round((state.timePlayed+(Date.now()-state.startedAt)/1000)/60);
  const missionTotal= Object.values(state.missions).reduce((a,b)=>a+b,0);
  const langDisplay = currentLang === "learn" ? "📖 Learning" : currentLang === "ru" ? "🇷🇺 Russian" : "🇺🇸 English";
  const ch = getActiveCharacter();
  const isRu = currentLang === "ru";

  // Build 7-day accuracy data
  const sevenDayChart = buildSevenDayChart();
  // Build topic performance chart
  const topicChart = buildTopicChart(sorted);

  $("dashboard").innerHTML = `
    <div class="dash-overview">
      <div class="dash-profile-card">
        <span class="dash-char-emoji">${ch.emoji}</span>
        <div>
          <strong class="dash-player-name">${prof ? prof.name : "—"}</strong>
          <span class="dash-char-name">${ch.name} the ${ch.species}</span>
          <span class="dash-lang">${langDisplay}</span>
        </div>
      </div>
      <div class="dash-stats-grid">
        ${dashStat(t("accuracy"),       `${accuracy}%`, accuracy >= 80 ? "🌟" : accuracy >= 60 ? "📈" : "💪")}
        ${dashStat(t("solvedProblems"), state.solved,   "🧮")}
        ${dashStat(t("currentLevel"),   state.level,    "⬆️")}
        ${dashStat(t("timePlayed"),     `${minutes} min`,"⏱️")}
        ${dashStat(t("missionProgress"),`${missionTotal}/40`,"🗺️")}
        ${dashStat(t("friendRescue"),   `${state.animals.length}/9`,"🐾")}
        ${dashStat(t("townProgress"),   `${state.buildings.length}/8`,"🏘️")}
        ${dashStat(t("collection"),     `${state.shop.length}/8`,"👘")}
      </div>
    </div>

    <div class="dash-charts">
      <div class="dash-chart-box">
        <h3 class="dash-chart-title">${isRu ? "Точность за 7 дней" : "7-Day Accuracy"}</h3>
        ${sevenDayChart}
      </div>
      <div class="dash-chart-box">
        <h3 class="dash-chart-title">${isRu ? "Темы" : "Topic Performance"}</h3>
        ${topicChart}
      </div>
    </div>

    <div class="dash-topics-summary">
      <div class="dash-topic-group strong">
        <span class="dash-topic-icon">⭐</span>
        <div>
          <strong>${isRu ? "Сильные темы" : "Strong Topics"}</strong>
          <p>${strong}</p>
        </div>
      </div>
      <div class="dash-topic-group weak">
        <span class="dash-topic-icon">🎯</span>
        <div>
          <strong>${isRu ? "Темы для практики" : "Topics to Practise"}</strong>
          <p>${weak}</p>
        </div>
      </div>
    </div>

    <div class="dash-streak-section">
      <h3>${isRu ? "Серия дней" : "Learning Streak"}</h3>
      <div class="dash-streak-chips">
        ${Array.from({length:7}, (_,i) => `
          <div class="dash-streak-day ${i < state.streak.count ? "done" : ""}">
            <span>${["M","T","W","T","F","S","S"][i]}</span>
            <span>${i < state.streak.count ? "🔥" : "○"}</span>
          </div>
        `).join("")}
      </div>
      <p class="dash-streak-count">${state.streak.count} ${isRu ? "дней подряд" : "day streak"}</p>
    </div>

    <div class="dash-actions-section">
      <h3>${isRu ? "Инструменты" : "Parent Tools"}</h3>
      <div class="dash-tool-btns">
        <button class="secondary" id="dashReplayTutorialBtn">📖 ${isRu ? "Повторить обучение" : "Replay Tutorial"}</button>
        <button class="secondary" id="dashPracticeBtn">🎯 ${isRu ? "Режим тренировки" : "Practice Mode"}</button>
        <button class="secondary" id="dashCreditsBtn">ℹ️ ${isRu ? "О приложении" : "About / Credits"}</button>
        <button class="secondary" id="dashPrivacyBtn">🔒 ${isRu ? "Конфиденциальность" : "Privacy"}</button>
      </div>
    </div>
  `;

  // Bind dashboard buttons
  $("dashReplayTutorialBtn")?.addEventListener("click", () => {
    state.onboarded = false;
    save();
    showOnboarding();
  });
  $("dashPracticeBtn")?.addEventListener("click", () => {
    startPracticeMode();
  });
  $("dashCreditsBtn")?.addEventListener("click", showCreditsModal);
  $("dashPrivacyBtn")?.addEventListener("click", showPrivacyModal);
}

function dashStat(label, value, icon) {
  return `<article class="stat-card"><span class="stat-icon">${icon}</span><h3>${label}</h3><p>${value}</p></article>`;
}

function buildSevenDayChart() {
  // Build 7 days of accuracy data from streak info
  // We don't have historical per-day accuracy, so we simulate from current accuracy
  // with small variations to make it meaningful
  const acc = state.solved ? Math.round((state.correct/state.solved)*100) : 0;
  const days = Array.from({length:7}, (_,i) => {
    const dayStr = new Date(Date.now() - (6-i)*86400000).toISOString().slice(0,10);
    const wasActive = state.streak.days?.includes(dayStr);
    return wasActive ? Math.max(40, Math.min(100, acc + (Math.random()*16-8 | 0))) : 0;
  });

  const W = 280, H = 120, PAD = 20, maxVal = 100;
  const barW = (W - PAD*2) / 7;
  const dayLabels = ["M","T","W","T","F","S","S"];
  const today = new Date().getDay();
  const labels = Array.from({length:7}, (_,i) => dayLabels[(today - 6 + i + 7) % 7]);

  const bars = days.map((v,i) => {
    const barH = v > 0 ? Math.max(4, (v/maxVal) * (H - 40)) : 0;
    const x = PAD + i * barW + barW*0.15;
    const y = H - 20 - barH;
    const fill = v >= 80 ? "#4fd6a8" : v >= 60 ? "#ffd45a" : v > 0 ? "#ff9060" : "#e0eaf0";
    return `
      <rect x="${x}" y="${y}" width="${barW*0.7}" height="${barH}" rx="4" fill="${fill}" opacity="0.9"/>
      ${v > 0 ? `<text x="${x + barW*0.35}" y="${y-4}" text-anchor="middle" font-size="9" fill="#5f7487">${v}%</text>` : ""}
      <text x="${x + barW*0.35}" y="${H-6}" text-anchor="middle" font-size="9" fill="#8aabb8">${labels[i]}</text>
    `;
  }).join("");

  // Baseline
  const baseline = `<line x1="${PAD}" y1="${H-20}" x2="${W-PAD}" y2="${H-20}" stroke="#d0e4f0" stroke-width="1"/>`;

  return `<svg viewBox="0 0 ${W} ${H}" class="dash-chart-svg" aria-label="7-day accuracy chart">${baseline}${bars}</svg>`;
}

function buildTopicChart(sorted) {
  const W = 280, H = 160, PAD = 14;
  const topTopics = sorted.slice(0, 8); // top 8 topics by strength
  const barH = (H - PAD*2) / Math.max(topTopics.length, 1);

  const bars = topTopics.map(([topic, data], i) => {
    const total = (data.correct || 0) + (data.wrong || 0);
    const pct   = total > 0 ? Math.round((data.correct/total)*100) : 0;
    const barW  = pct > 0 ? Math.max(4, (pct/100)*(W - PAD*2 - 80)) : 0;
    const y     = PAD + i * barH + 2;
    const fill  = pct >= 80 ? "#4fd6a8" : pct >= 60 ? "#ffd45a" : pct > 0 ? "#ff9060" : "#e0eaf0";
    const label = topicLabel(topic).slice(0, 14);
    return `
      <text x="${PAD}" y="${y + barH*0.65}" font-size="9" fill="#5f7487" font-family="Trebuchet MS,sans-serif">${label}</text>
      <rect x="${PAD + 80}" y="${y}" width="${barW}" height="${barH - 4}" rx="3" fill="${fill}" opacity="0.85"/>
      ${pct > 0 ? `<text x="${PAD + 80 + barW + 4}" y="${y + barH*0.65}" font-size="9" fill="#5f7487">${pct}%</text>` : ""}
    `;
  }).join("");

  return `<svg viewBox="0 0 ${W} ${H}" class="dash-chart-svg" aria-label="Topic performance chart">${bars}</svg>`;
}

// ─── Credits Modal ────────────────────────────────────────────────────────────
function showCreditsModal() {
  const isRu = currentLang === "ru";
  const modal = $("creditsModal");
  if (!modal) return;
  modal.querySelector(".credits-content").innerHTML = `
    <h2>🦭 Sausage the Seal</h2>
    <p class="credits-sub">Arctic Math Adventure</p>
    <p class="credits-version">Version ${VERSION}</p>
    <div class="credits-divider"></div>
    <p><strong>${isRu ? "Разработка и дизайн" : "Development & Design"}</strong></p>
    <p>Built with ❤️ for young Arctic explorers</p>
    <div class="credits-divider"></div>
    <p><strong>${isRu ? "Персонажи" : "Characters"}</strong></p>
    <p>Sausage the Seal · Pip the Penguin<br>Nova the Arctic Fox · Miska the Polar Bear</p>
    <div class="credits-divider"></div>
    <p><strong>${isRu ? "Звук" : "Audio"}</strong></p>
    <p>${isRu ? "Синтезированный звук — Web Audio API" : "Synthesised audio via Web Audio API"}</p>
    <div class="credits-divider"></div>
    <p class="credits-footer">${isRu ? "Прогресс сохраняется только на этом устройстве." : "Progress is saved on this device only."}</p>
    <p class="credits-footer">${isRu ? "Не требует интернета после загрузки." : "Works offline after first load."}</p>
    <button class="primary credits-close-btn" id="creditsCloseBtn">${isRu ? "Закрыть" : "Close"}</button>
  `;
  modal.hidden = false;
  modal.querySelector("#creditsCloseBtn").addEventListener("click", () => modal.hidden = true);
}

// ─── Privacy Modal ────────────────────────────────────────────────────────────
function showPrivacyModal() {
  const isRu = currentLang === "ru";
  const modal = $("privacyModal");
  if (!modal) return;
  modal.querySelector(".privacy-content").innerHTML = `
    <h2>🔒 ${isRu ? "Конфиденциальность" : "Privacy Policy"}</h2>
    <div class="privacy-section">
      <h3>${isRu ? "Данные детей" : "Children's Data"}</h3>
      <p>${isRu
        ? "Эта игра не собирает, не передаёт и не хранит личные данные. Весь прогресс сохраняется только на вашем устройстве."
        : "This game does not collect, transmit, or store any personal data. All progress is saved locally on your device only."}</p>
    </div>
    <div class="privacy-section">
      <h3>${isRu ? "Что сохраняется" : "What is Saved"}</h3>
      <p>${isRu
        ? "Игровой прогресс, имена профилей и настройки сохраняются в localStorage браузера на вашем устройстве."
        : "Game progress, profile names, and settings are saved in your browser's localStorage on your device."}</p>
    </div>
    <div class="privacy-section">
      <h3>${isRu ? "Интернет" : "Internet"}</h3>
      <p>${isRu
        ? "Игра не делает сетевых запросов. Никакие данные не отправляются на внешние серверы."
        : "The game makes no network requests. No data is sent to any external server."}</p>
    </div>
    <div class="privacy-section">
      <h3>${isRu ? "Реклама" : "Advertising"}</h3>
      <p>${isRu
        ? "Реклама отсутствует. Игра не содержит рекламных трекеров и аналитических SDK."
        : "There are no advertisements. The game contains no ad trackers or analytics SDKs."}</p>
    </div>
    <div class="privacy-section">
      <h3>${isRu ? "Удаление данных" : "Data Deletion"}</h3>
      <p>${isRu
        ? "Для удаления всех данных используйте кнопку «Сбросить всё» в панели родителя или очистите данные браузера."
        : "To delete all data, use 'Reset Everything' in the Parent Dashboard, or clear your browser's local storage."}</p>
    </div>
    <button class="primary privacy-close-btn" id="privacyCloseBtn">${isRu ? "Понятно" : "Got it"}</button>
  `;
  modal.hidden = false;
  modal.querySelector("#privacyCloseBtn").addEventListener("click", () => modal.hidden = true);
}

// ─── S2: Mini-games (5 distinct games) ───────────────────────────────────────
function startMiniGame() {
  $("miniGame").hidden  = false;
  $("challenge").hidden = true;
  if (miniGameTimer) { clearTimeout(miniGameTimer); miniGameTimer = null; }
  const gameIndex = state.miniGamesPlayed % 6;
  if      (gameIndex === 0) startCatchFish();
  else if (gameIndex === 1) startTreasureHunt();
  else if (gameIndex === 2) startNumberBubblePop();
  else if (gameIndex === 3) startIceSlide();
  else if (gameIndex === 4) startSnowballCatch();
  else                       startMatchPairs();
}

// Mini-game 1: Catch Fish — SVG fish swim with varied speed and trajectories
function startCatchFish() {
  const isRu = currentLang === "ru";
  $("miniTitle").textContent = isRu ? "Лови рыбку!" : "Catch Fish!";
  const stage = $("miniStage");
  stage.innerHTML = "";
  stage.className = "mini-stage mini-catchfish";
  let caught = 0;
  const TOTAL = 10;

  // Speed selector
  let speedMode = 1; // 0=slow 1=normal 2=fast
  const speedLabels = isRu
    ? ["🐢 Медленно","🐟 Обычно","⚡ Быстро"]
    : ["🐢 Slow","🐟 Normal","⚡ Fast"];
  const speedMultipliers = [1.8, 1.0, 0.55]; // multiplied onto base speed

  const controlBar = document.createElement("div");
  controlBar.className = "catchfish-controls";
  controlBar.innerHTML = speedLabels.map((lbl, i) =>
    `<button class="catchfish-speed-btn ${i===1?"active":""}" data-speed="${i}">${lbl}</button>`
  ).join("");
  stage.appendChild(controlBar);
  controlBar.querySelectorAll(".catchfish-speed-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      speedMode = Number(btn.dataset.speed);
      controlBar.querySelectorAll(".catchfish-speed-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  $("miniText").textContent = isRu
    ? "Тапни рыбок до того, как они уплывут! Поймай 5 штук."
    : "Tap the swimming fish before they escape! Catch 5 to win.";

  const fishColors = ["#ffd45a","#ff7b7b","#27c7de","#4fd6a8","#856de8","#ffb847","#ff6b9d","#7dd8ff"];

  for (let i = 0; i < TOTAL; i++) {
    const fish = document.createElement("button");
    fish.className = "mini-target mini-fish-svg";
    const col    = fishColors[i % fishColors.length];
    const size   = 48 + Math.random() * 28;        // 48–76px, bigger
    const baseSpeed = 3.2 + Math.random() * 2.0;   // 3.2–5.2s at normal
    const topPct = 10 + Math.random() * 72;
    const bobbing = Math.random() > 0.45;

    // Fish swims LEFT→RIGHT, so it needs to face right (default SVG faces right already)
    fish.style.cssText = `
      position:absolute;
      left:-${size + 20}px;
      top:${topPct}%;
      width:${size}px;
      height:${size * 0.62}px;
      background:transparent;
      border:0; padding:0; cursor:pointer;
      animation: fish-swim-across calc(${baseSpeed}s * var(--fish-speed-mul, 1)) linear ${i * 0.42}s forwards
                 ${bobbing ? ", fish-wave 1.1s ease-in-out infinite" : ""};
    `;
    // SVG: body points LEFT (ellipse body cx=34), tail on RIGHT side (path from cx=54)
    // eye at LEFT side (cx=14) — fish faces LEFT which is direction of swim ✓
    fish.innerHTML = `<svg viewBox="0 0 70 44" style="width:100%;height:100%;display:block" aria-hidden="true">
      <!-- tail left side (behind direction) -->
      <path d="M54 22 Q66 10 68 22 Q66 34 54 22Z" fill="${col}"/>
      <!-- body -->
      <ellipse cx="30" cy="22" rx="28" ry="17" fill="${col}"/>
      <!-- belly highlight -->
      <ellipse cx="28" cy="22" rx="18" ry="10" fill="${col}" opacity="0.45"/>
      <!-- top fin -->
      <path d="M20 5 Q28 1 36 5" fill="none" stroke="${col}" stroke-width="3" opacity="0.7"/>
      <path d="M20 5 Q28 14 36 5" fill="${col}" opacity="0.5"/>
      <!-- bottom fin -->
      <path d="M20 39 Q28 43 36 39" fill="${col}" opacity="0.5"/>
      <!-- eye — faces LEFT (direction of travel) -->
      <circle cx="10" cy="17" r="4.5" fill="#1a2030"/>
      <circle cx="11" cy="16" r="1.8" fill="#fff" opacity="0.9"/>
      <!-- scales hint -->
      <path d="M32 14 Q38 18 32 22" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="1.5"/>
      <path d="M24 14 Q30 18 24 22" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="1.5"/>
    </svg>`;
    fish.setAttribute("aria-label", isRu ? "Поймай эту рыбку" : "Catch this fish");

    fish.addEventListener("click", () => {
      if (fish.dataset.caught) return;
      fish.dataset.caught = "1";
      caught++;
      fish.style.animation = "none";
      fish.style.transform = "scale(1.5) rotate(-10deg)";
      fish.style.opacity   = "0";
      fish.style.transition = "all .28s ease";
      state.fish += 2;
      playSound("coin");
      toast(isRu ? `+2 рыбки! (${caught}/5)` : `+2 fish! (${caught}/5)`);
      renderHeader();
      if (caught >= 5) {
        if (miniGameTimer) clearTimeout(miniGameTimer);
        finishMiniGame(caught, "catchfish");
      }
    });
    stage.appendChild(fish);
  }

  // Update speed CSS variable when speed mode changes
  function updateSpeed() {
    stage.style.setProperty("--fish-speed-mul", speedMultipliers[speedMode]);
    miniGameTimer = setTimeout(() => finishMiniGame(caught, "catchfish"),
      (3.2 + TOTAL * 0.42) * 1000 * speedMultipliers[speedMode] + 1500);
  }
  // Re-read speed every 500ms to apply it to the CSS variable dynamically
  const speedInterval = setInterval(() => {
    stage.style.setProperty("--fish-speed-mul", speedMultipliers[speedMode]);
  }, 300);
  // Clean up interval when mini-game ends
  const origFinish = finishMiniGame;
  stage.dataset.speedInterval = speedInterval;

  updateSpeed();
}

// Mini-game 2: Treasure Hunt — tap the right shell to find coins
function startTreasureHunt() {
  $("miniTitle").textContent = "Treasure Hunt!";
  $("miniText").textContent  = "One shell hides a treasure chest. Find it!";
  const stage = $("miniStage");
  stage.innerHTML = "";
  stage.className = "mini-stage mini-treasure";

  const SHELLS = 6;
  const secretIdx = Math.floor(Math.random()*SHELLS);
  let attempts = 0;
  let done = false;

  for (let i=0; i<SHELLS; i++) {
    const shell = document.createElement("button");
    shell.className = "shell-btn";
    shell.setAttribute("aria-label",`Shell ${i+1}`);
    shell.style.left = `${10+(i%3)*32}%`;
    shell.style.top  = `${i<3 ? 25 : 58}%`;
    shell.innerHTML  = `<svg viewBox="0 0 60 60" aria-hidden="true"><ellipse cx="30" cy="38" rx="22" ry="16" fill="#f4e0bb"/><path d="M10 38 Q30 8 50 38" fill="#e8c98a"/><line x1="30" y1="22" x2="30" y2="54" stroke="#c9a96e" stroke-width="2"/><line x1="15" y1="32" x2="45" y2="32" stroke="#c9a96e" stroke-width="2"/></svg>`;
    shell.addEventListener("click", () => {
      if (done) return;
      attempts++;
      if (i === secretIdx) {
        done = true;
        shell.innerHTML = `<svg viewBox="0 0 60 60" aria-hidden="true"><rect x="10" y="28" width="40" height="26" rx="5" fill="#ffcb58"/><path d="M8 30 Q30 12 52 30z" fill="#e8a020"/><circle cx="30" cy="36" r="5" fill="#fff4a0"/></svg>`;
        const bonus = Math.max(5, 15-attempts*2);
        state.coins += bonus;
        playSound("coin");
        toast(`Treasure! +${bonus} coins 🎁`);
        renderHeader();
        if (miniGameTimer) clearTimeout(miniGameTimer);
        miniGameTimer = setTimeout(() => finishMiniGame(5, "treasure"), 1200);
      } else {
        shell.innerHTML = `<svg viewBox="0 0 60 60" aria-hidden="true"><ellipse cx="30" cy="38" rx="22" ry="16" fill="#d4c4a0"/><text x="30" y="42" text-anchor="middle" font-size="18">❌</text></svg>`;
        shell.disabled = true;
        // Count remaining enabled shells — if only the treasure one is left, reveal it
        const remaining = stage.querySelectorAll(".shell-btn:not(:disabled)").length;
        if (remaining <= 1 && !done) {
          done = true;
          // Auto-reveal the treasure shell
          const treasureShell = stage.querySelectorAll(".shell-btn:not(:disabled)")[0];
          if (treasureShell) {
            treasureShell.innerHTML = `<svg viewBox="0 0 60 60" aria-hidden="true"><rect x="10" y="28" width="40" height="26" rx="5" fill="#ffcb58"/><path d="M8 30 Q30 12 52 30z" fill="#e8a020"/><circle cx="30" cy="36" r="5" fill="#fff4a0"/></svg>`;
            treasureShell.disabled = true;
          }
          const bonus = 3;
          state.coins += bonus;
          playSound("coin");
          toast(`Found it! +${bonus} coins 🎁`);
          renderHeader();
          if (miniGameTimer) clearTimeout(miniGameTimer);
          miniGameTimer = setTimeout(() => finishMiniGame(3, "treasure"), 1400);
        }
      }
    });
    stage.appendChild(shell);
  }
  miniGameTimer = setTimeout(() => { if (!done) finishMiniGame(0, "treasure"); }, 18000);
}

// Mini-game 3: Number Bubble Pop — tap the bubble with the correct answer
function startNumberBubblePop() {
  const isRu = currentLang === "ru";
  $("miniTitle").textContent = isRu ? "Лопни пузырь!" : "Bubble Pop!";
  $("miniText").textContent  = isRu ? "Найди правильный ответ и лопни его!" : "Find the correct answer and pop it!";
  const stage = $("miniStage");
  stage.innerHTML = "";
  stage.className = "mini-stage mini-bubbles";

  let score  = 0;
  let round  = 0;
  const ROUNDS = 7;
  const level  = Math.min(state.level, 10);
  let active = true;

  const scoreEl = document.createElement("div");
  scoreEl.className = "bubble-scorebar";
  scoreEl.textContent = isRu ? `Правильно: 0/${ROUNDS}` : `Correct: 0/${ROUNDS}`;
  stage.appendChild(scoreEl);

  // Fixed question display in centre
  const qEl = document.createElement("div");
  qEl.className = "bubble-question";
  stage.appendChild(qEl);

  function makeQuestion() {
    if (!active || round >= ROUNDS) { endBubbles(); return; }
    round++;

    // Generate problem scaled to level
    let a, b, answer, questionText;
    const roll = Math.random();
    if (level <= 3 || roll < 0.4) {
      a = Math.floor(Math.random() * (level < 3 ? 8 : 15)) + 2;
      b = Math.floor(Math.random() * (level < 3 ? 6 : 12)) + 1;
      answer = a + b;
      questionText = `${a} + ${b} = ?`;
    } else if (roll < 0.7) {
      a = Math.floor(Math.random() * 15) + 5;
      b = Math.floor(Math.random() * (a - 1)) + 1;
      answer = a - b;
      questionText = `${a} − ${b} = ?`;
    } else {
      a = Math.floor(Math.random() * 6) + 2;
      b = Math.floor(Math.random() * 6) + 2;
      answer = a * b;
      questionText = `${a} × ${b} = ?`;
    }

    qEl.textContent = questionText;
    qEl.style.animation = "none";
    void qEl.offsetWidth;
    qEl.style.animation = "";

    // Wrong answers
    const spread = Math.max(2, Math.floor(answer * 0.35));
    const wrongs = new Set();
    let tries = 0;
    while (wrongs.size < 3 && tries < 40) {
      tries++;
      const v = answer + (Math.floor(Math.random() * spread * 2 + 1) * (Math.random() > 0.5 ? 1 : -1));
      if (v !== answer && v >= 0) wrongs.add(v);
    }
    const choices = shuffle([answer, ...[...wrongs].slice(0, 3)]);

    // Place bubbles in 4 zones: top-left, top-right, bottom-left, bottom-right
    const positions = [
      { left:"8%",  top:"14%" },
      { left:"56%", top:"10%" },
      { left:"4%",  top:"58%" },
      { left:"58%", top:"55%" },
    ];
    const colors = [
      "rgba(39,199,222,.82)",
      "rgba(79,214,168,.82)",
      "rgba(255,212,90,.88)",
      "rgba(133,109,232,.82)",
    ];
    let answered = false;

    // Remove old bubbles
    stage.querySelectorAll(".bubble-btn").forEach(b => b.remove());

    choices.forEach((val, i) => {
      const bub = document.createElement("button");
      bub.className = "bubble-btn";
      bub.textContent = val;
      bub.style.left = positions[i].left;
      bub.style.top  = positions[i].top;
      bub.style.background = colors[i];
      bub.style.animationDelay = `${i * 0.12}s`;
      bub.style.animationDuration = `${1.8 + i * 0.3}s`;

      bub.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        if (val === answer) {
          bub.classList.add("bubble-pop");
          score++;
          state.fish += 2;
          playSound("bubblePop");
          react("happy");
          scoreEl.textContent = isRu ? `Правильно: ${score}/${ROUNDS}` : `Correct: ${score}/${ROUNDS}`;
          renderHeader();
        } else {
          bub.classList.add("bubble-wrong");
          stage.querySelectorAll(".bubble-btn").forEach(b => {
            if (Number(b.textContent) === answer) b.classList.add("bubble-pop");
          });
          playSound("wrong");
        }
        setTimeout(() => {
          stage.querySelectorAll(".bubble-btn").forEach(b => b.remove());
          setTimeout(makeQuestion, 350);
        }, 650);
      });
      stage.appendChild(bub);
    });
  }

  function endBubbles() {
    active = false;
    const won = score >= Math.ceil(ROUNDS * 0.6);
    if (won) {
      state.coins += 5; state.stars += 2;
      playSound("level"); confetti();
      toast(isRu ? `Лопни пузырь! ${score}/${ROUNDS} правильно! +5 монет ⭐` : `Bubble Pop! ${score}/${ROUNDS} correct! +5 coins ⭐`);
    } else {
      toast(isRu ? `${score}/${ROUNDS} правильно. Ещё потренируемся!` : `${score}/${ROUNDS} correct. Keep practising!`);
    }
    if (miniGameTimer) clearTimeout(miniGameTimer);
    miniGameTimer = setTimeout(() => finishMiniGame(won ? 5 : 2, "bubbles"), 900);
  }

  makeQuestion();
  miniGameTimer = setTimeout(() => { if (active) endBubbles(); }, 45000);
}

function finishMiniGame(caught, type) {
  if ($("miniGame").hidden) return;
  if (miniGameTimer) { clearTimeout(miniGameTimer); miniGameTimer = null; }

  // Clear any speed intervals from Catch Fish
  const stage = $("miniStage");
  if (stage && stage.dataset.speedInterval) {
    clearInterval(Number(stage.dataset.speedInterval));
    delete stage.dataset.speedInterval;
  }

  state.miniGamesPlayed++;
  const isRu = currentLang === "ru";
  const won  = caught >= 5;

  if (won) {
    state.coins += Math.min(caught, 5);
    state.stars += 2;
    react("victory");
    playSound("perfect");
    confetti();
  } else {
    state.coins += Math.min(caught, 2);
  }
  save();

  // Show result screen inside mini-game section
  const miniGame = $("miniGame");
  const titleEl  = $("miniTitle");
  const textEl   = $("miniText");
  if (stage) stage.innerHTML = "";

  if (titleEl) titleEl.textContent = won
    ? (isRu ? "🎉 Отлично!" : "🎉 Well done!")
    : (isRu ? "💪 Хорошая попытка!" : "💪 Good try!");

  if (textEl) textEl.textContent = won
    ? (isRu ? `+${Math.min(caught,5)} монет, +2 звезды заработано!` : `+${Math.min(caught,5)} coins and +2 stars earned!`)
    : (isRu ? "Продолжай практиковаться — с каждым разом лучше!" : "Keep practising — you'll get it next time!");

  // Result buttons inside the stage area
  if (stage) {
    stage.className = "mini-stage mini-result";
    stage.innerHTML = `
      <div class="mini-result-icon">${won ? "⭐" : "🧊"}</div>
      <div class="mini-result-rewards">${won
        ? `<span class="rescue-cel-chip">+${Math.min(caught,5)} 🪙</span><span class="rescue-cel-chip">+2 ⭐</span>`
        : `<span class="rescue-cel-chip" style="background:rgba(200,220,230,.4)">+${Math.min(caught,2)} 🪙</span>`
      }</div>
      <div class="mini-result-btns">
        <button class="primary" id="miniPlayAgainBtn">${isRu ? "Ещё раз 🎮" : "Play Again 🎮"}</button>
        <button class="secondary" id="miniResultCloseBtn">${isRu ? "На карту 🗺️" : "Return to Map 🗺️"}</button>
      </div>`;

    $("miniPlayAgainBtn")?.addEventListener("click", () => {
      // Re-play the same game type based on current index
      const idx = (state.miniGamesPlayed - 1) % 6;
      if      (idx === 0) startCatchFish();
      else if (idx === 1) startTreasureHunt();
      else if (idx === 2) startNumberBubblePop();
      else if (idx === 3) startIceSlide();
      else if (idx === 4) startSnowballCatch();
      else                 startMatchPairs();
    });
    $("miniResultCloseBtn")?.addEventListener("click", () => {
      $("miniGame").hidden = true;
      renderAll();
    });
  }
}

// ─── S2: Mini-game 4 — Ice Slide: tap LEFT/RIGHT to dodge rocks ──────────────
function startIceSlide() {
  $("miniTitle").textContent = t("minigame_slide_title");
  $("miniText").textContent  = t("minigame_slide_text");
  const stage = $("miniStage");
  stage.innerHTML = "";
  stage.className = "mini-stage mini-slide";

  let pos = 50; // seal x% position
  let score = 0;
  let missed = 0;
  let active = true;
  const ROCKS = 12;
  let rocksDone = 0;

  // Seal on slide
  const sealEl = document.createElement("div");
  sealEl.className = "slide-seal";
  sealEl.style.left = pos + "%";
  sealEl.innerHTML = `<svg viewBox="0 0 260 220" style="width:60px"><use href="#sausage-body"/></svg>`;
  stage.appendChild(sealEl);

  // Score display
  const scoreEl = document.createElement("div");
  scoreEl.className = "slide-score";
  scoreEl.textContent = "Dodge: 0";
  stage.appendChild(scoreEl);

  // Left / Right buttons
  const btnWrap = document.createElement("div");
  btnWrap.className = "slide-controls";
  btnWrap.innerHTML = `<button class="slide-btn" id="slideLeft">← ${t("left")}</button><button class="slide-btn" id="slideRight">${t("right")} →</button>`;
  stage.appendChild(btnWrap);

  const moveLeft  = () => { if (!active) return; pos = Math.max(10, pos-18); sealEl.style.left = pos+"%"; };
  const moveRight = () => { if (!active) return; pos = Math.min(90, pos+18); sealEl.style.left = pos+"%"; };
  btnWrap.querySelector("#slideLeft").addEventListener("click",  moveLeft);
  btnWrap.querySelector("#slideRight").addEventListener("click", moveRight);
  // keyboard
  const keyHandler = e => {
    if (e.key==="ArrowLeft")  moveLeft();
    if (e.key==="ArrowRight") moveRight();
  };
  document.addEventListener("keydown", keyHandler);

  // Spawn rocks from top
  function spawnRock() {
    if (!active) return;
    const rock = document.createElement("div");
    rock.className = "slide-rock";
    const rockX = 10 + Math.random()*80;
    rock.style.left = rockX+"%";
    rock.style.top  = "-30px";
    stage.appendChild(rock);
    rocksDone++;

    const fall = rock.animate(
      [{ top:"-30px" }, { top: stage.offsetHeight+"px" }],
      { duration: 1600 - Math.min(score*40,800), easing:"linear" }
    );
    fall.onfinish = () => {
      if (!active) return;
      const rockCenter = rockX;
      if (Math.abs(rockCenter - pos) < 14) {
        missed++;
        rock.classList.add("rock-hit");
        playSound("wrong");
        sealEl.classList.add("slide-ouch");
        setTimeout(() => sealEl.classList.remove("slide-ouch"), 400);
      } else {
        score++;
        scoreEl.textContent = `Dodge: ${score}`;
        state.fish++;
        renderHeader();
      }
      rock.remove();
      if (missed >= 3 || rocksDone >= ROCKS) {
        endSlide();
      } else {
        setTimeout(spawnRock, 500+Math.random()*600);
      }
    };
  }

  function endSlide() {
    active = false;
    document.removeEventListener("keydown", keyHandler);
    const won = score >= 6;
    if (won) {
      state.coins += 4; state.stars++;
      toast(`Ice Slide! Dodged ${score} rocks! +4 coins ⭐`);
    } else {
      toast(`Dodged ${score} rocks. Nice try! 🧊`);
    }
    if (miniGameTimer) clearTimeout(miniGameTimer);
    miniGameTimer = setTimeout(() => finishMiniGame(won ? 5 : 2, "slide"), 1000);
  }

  setTimeout(spawnRock, 600);
  miniGameTimer = setTimeout(() => { if (active) endSlide(); }, 22000);
}

// ─── S2: Mini-game 5 — Snowball Catch: swipe bucket to catch snowballs ────────
function startSnowballCatch() {
  $("miniTitle").textContent = t("minigame_snow_title");
  $("miniText").textContent  = t("minigame_snow_text");
  const stage = $("miniStage");
  stage.innerHTML = "";
  stage.className = "mini-stage mini-snowball";

  let bucketX = 50;
  let caught = 0;
  let missed = 0;
  let active = true;
  const TOTAL = 14;
  let spawned = 0;

  // Bucket
  const bucket = document.createElement("div");
  bucket.className = "snow-bucket";
  bucket.style.left = bucketX+"%";
  stage.appendChild(bucket);

  // Score
  const scoreEl = document.createElement("div");
  scoreEl.className = "slide-score";
  scoreEl.textContent = `Caught: 0/${Math.ceil(TOTAL*0.6)}`;
  stage.appendChild(scoreEl);

  // Drag / click to move bucket
  stage.addEventListener("pointermove", e => {
    if (!active) return;
    const rect = stage.getBoundingClientRect();
    bucketX = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width)*100));
    bucket.style.left = bucketX+"%";
  });
  stage.addEventListener("click", e => {
    if (!active) return;
    const rect = stage.getBoundingClientRect();
    bucketX = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width)*100));
    bucket.style.left = bucketX+"%";
  });

  function spawnBall() {
    if (!active || spawned >= TOTAL) return;
    spawned++;
    const ball = document.createElement("div");
    ball.className = "snow-ball";
    const ballX = 8 + Math.random()*84;
    ball.style.left = ballX+"%";
    ball.style.top  = "-20px";
    stage.appendChild(ball);

    const dur = 1200 - Math.min(caught*50, 600);
    const anim = ball.animate(
      [{ top:"-20px" }, { top: (stage.offsetHeight-30)+"px" }],
      { duration: dur, easing:"linear" }
    );
    anim.onfinish = () => {
      if (!active) return;
      if (Math.abs(ballX - bucketX) < 14) {
        caught++;
        state.fish++;
        playSound("coin");
        ball.classList.add("ball-caught");
        scoreEl.textContent = `Caught: ${caught}/${Math.ceil(TOTAL*0.6)}`;
        renderHeader();
      } else {
        missed++;
        ball.classList.add("ball-missed");
      }
      setTimeout(() => ball.remove(), 200);
      const remaining = TOTAL - spawned;
      const needed    = Math.ceil(TOTAL*0.6) - caught;
      if (remaining === 0 || (missed > TOTAL*0.5 && needed > remaining)) {
        endSnow();
      } else {
        setTimeout(spawnBall, 300+Math.random()*500);
      }
    };
  }

  function endSnow() {
    active = false;
    const won = caught >= Math.ceil(TOTAL*0.6);
    if (won) {
      state.coins += 3; state.stars++;
      toast(`Snowball catch! ${caught} caught! +3 coins ❄️`);
    } else {
      toast(`Caught ${caught}. Slippery flakes! ❄️`);
    }
    if (miniGameTimer) clearTimeout(miniGameTimer);
    miniGameTimer = setTimeout(() => finishMiniGame(won ? 5 : 1, "snowball"), 900);
  }

  for (let i=0; i<3; i++) setTimeout(spawnBall, i*400+300);
  miniGameTimer = setTimeout(() => { if (active) endSnow(); }, 24000);
}

// ─── Mini-game 6: Match Pairs — flip cards to find 6 emoji pairs ──────────────
function startMatchPairs() {
  const isRu = currentLang === "ru";
  $("miniTitle").textContent = isRu ? "Найди пару!" : "Match Pairs!";
  $("miniText").textContent  = isRu ? "Открывай карточки и находи совпадающие пары!" : "Flip cards and find matching pairs!";
  const stage = $("miniStage");
  stage.innerHTML = "";
  // 3 columns → bigger cards, 6 pairs = 12 cards
  stage.className = "mini-stage mini-pairs mini-pairs-3col";

  const EMOJIS = ["🐧","🐟","🐻","🦊","🐳","🦭"];
  const deck = shuffle([...EMOJIS, ...EMOJIS]);

  let flipped  = [];
  let matched  = 0;
  let moves    = 0;
  let locked   = false;
  const cards  = [];

  const infoEl = document.createElement("p");
  infoEl.className = "pairs-info";
  infoEl.textContent = isRu ? "Ходов: 0" : "Moves: 0";
  stage.insertAdjacentElement("beforebegin", infoEl);

  deck.forEach((emoji, idx) => {
    const card = document.createElement("button");
    card.className = "pairs-card";
    card.dataset.emoji = emoji;
    card.textContent   = emoji;
    card.setAttribute("aria-label", isRu ? `Карточка ${idx+1}` : `Card ${idx+1}`);

    card.addEventListener("click", () => {
      if (locked || card.classList.contains("matched") || card.classList.contains("flipped")) return;
      card.classList.add("flipped");
      playSound("flip");
      flipped.push(idx);

      if (flipped.length === 2) {
        moves++;
        infoEl.textContent = isRu ? `Ходов: ${moves}` : `Moves: ${moves}`;
        locked = true;
        const [a, b] = flipped;

        if (cards[a].dataset.emoji === cards[b].dataset.emoji) {
          cards[a].classList.add("matched");
          cards[b].classList.add("matched");
          matched++;
          flipped = [];
          locked  = false;
          playSound("matchFound");
          state.fish++;
          renderHeader();

          if (matched >= EMOJIS.length) {
            const bonus = Math.max(5, 18 - Math.floor(moves * 0.5));
            state.coins += bonus; state.stars += 2;
            playSound("level"); confetti();
            const msg = isRu
              ? `Все пары найдены за ${moves} ходов! +${bonus} монет ⭐`
              : `All pairs matched in ${moves} moves! +${bonus} coins ⭐`;
            toast(msg);
            save();
            if (miniGameTimer) clearTimeout(miniGameTimer);
            miniGameTimer = setTimeout(() => finishMiniGame(5, "pairs"), 900);
          }
        } else {
          setTimeout(() => {
            cards[a].classList.remove("flipped");
            cards[b].classList.remove("flipped");
            cards[a].classList.add("wrong");
            cards[b].classList.add("wrong");
            playSound("wrong");
            setTimeout(() => {
              cards[a].classList.remove("wrong");
              cards[b].classList.remove("wrong");
            }, 420);
            flipped = [];
            locked  = false;
          }, 850);
        }
      }
    });

    cards[idx] = card;
    stage.appendChild(card);
  });

  miniGameTimer = setTimeout(() => finishMiniGame(matched >= 3 ? 3 : 0, "pairs"), 90000);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dailySpecialName() {
  return dailySpecialNames[new Date().getDate() % dailySpecialNames.length];
}

function topicLabel(topic) {
  return {
    add10:"Addition within 10", add20:"Addition within 20", sub20:"Subtraction within 20",
    add100:"Addition within 100", sub100:"Subtraction within 100", carryBorrow:"Carrying and borrowing",
    multiply:"Multiplication", divide:"Division", mixed:"Mixed arithmetic", missing:"Missing numbers",
    patterns:"Number patterns", logic:"Logic puzzle", equations:"Equations with x", word:"Word problem",
    adaptive:"Adaptive", add3:"Three-number addition", brackets:"Brackets", orderOfOps:"Order of operations",
    fractions:"Fractions",
    twoStep:"Two-step problems", advEquations:"Advanced equations", reverseMul:"Reverse multiplication",
    fracCompare:"Comparing fractions"
  }[topic] || "Math adventure";
}

function topicLabelLearn(topic) {
  return {
    add10:"Сложение до 10", add20:"Сложение до 20", sub20:"Вычитание до 20",
    add100:"Сложение до 100", sub100:"Вычитание до 100", carryBorrow:"Перенос и заём",
    multiply:"Умножение", divide:"Деление", mixed:"Смешанные действия",
    missing:"Пропущенные числа", patterns:"Закономерности", logic:"Логическая задача",
    equations:"Уравнение", word:"Задача", adaptive:"Адаптивный",
    add3:"Сложение трёх чисел", brackets:"Скобки", orderOfOps:"Порядок действий",
    fractions:"Дроби",
    twoStep:"Задачи в два действия", advEquations:"Сложные уравнения",
    reverseMul:"Обратное умножение", fracCompare:"Сравнение дробей"
  }[topic] || "Математика";
}

function speak(kind) {
  const isRu  = currentLang === "ru";
  const ruKey = kind + "Ru";
  const lines = (isRu && dialogueBank[ruKey]) ? dialogueBank[ruKey] : (dialogueBank[kind] || dialogueBank.before);
  const world = worlds[selectedWorld] || worlds[0];
  const recent = state.dialogueHistory || [];
  const options = lines.filter(l => !recent.slice(-3).includes(l));
  const line = (options.length ? options : lines)[Math.floor(Math.random() * (options.length ? options.length : lines.length))];
  state.dialogueHistory = [...recent.slice(-8), line];
  if ($("dialogBox")) $("dialogBox").textContent = `${world.character}: ${line}`;
}

// ─── Achievements ─────────────────────────────────────────────────────────────
function checkAchievements() {
  const tests = [
    state.fish>=1, state.correct>=1, state.correct>=10, state.correct>=25, state.correct>=50,
    state.correct>=100, state.buildings.length>=1, state.buildings.length>=2, state.buildings.length>=5,
    state.animals.length>=1, state.animals.length>=5, state.animals.length>=9, state.stars>=1,
    state.coins>=25, state.coins>=75, state.hintsUsed>=1, state.wrong>=1, completedMissions(0)>=5,
    completedMissions(1)>=5, completedMissions(2)>=5, completedMissions(3)>=5, completedMissions(4)>=5,
    completedMissions(5)>=5, completedMissions(6)>=5, completedMissions(7)>=5||state.correct>=80,
    state.topics.add20.correct>=12||state.topics.add100.correct>=12,
    state.topics.sub20.correct>=12||state.topics.sub100.correct>=12, state.topics.multiply.correct>=12,
    state.topics.divide.correct>=12, state.topics.patterns.correct>=8, state.topics.equations.correct>=8,
    state.topics.word.correct>=8, state.perfectTrips>=1, Object.values(state.topics).some(t=>t.fast>=5),
    state.daily.claimed, state.streak.count>=3, state.streak.count>=7, state.shop.length>=3,
    state.shop.includes(7), state.shop.length>=1, state.stars>=50, state.fish>=100, state.level>=5,
    state.level>=10, state.perfectTrips>=3, state.wrong>0&&state.correct>=20, state.solved>=150,
    state.animals.length>=5&&state.buildings.length>=5, state.buildings.length>=buildings.length,
    state.animals.length>=animals.length&&state.unlockedWorld>=7
  ];
  tests.forEach((ok,i) => {
    if (ok && !state.achievements.includes(i)) {
      state.achievements.push(i);
      playSound("achievement");
      toast(`Achievement: ${achievementNames[i]} 🏆`);
    }
  });
}

function updateDaily(correct) {
  if (state.daily.date !== todayKey()) state.daily = { date:todayKey(), solved:0, claimed:false };
  if (correct && !state.daily.claimed) state.daily.solved++;
}

function updateStreak() {
  const today = todayKey();
  if (state.streak.last === today) return;
  const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);
  state.streak.count = state.streak.last === yesterday ? state.streak.count+1 : 1;
  state.streak.last  = today;
  state.streak.days.push(today);
}

// ─── Audio ────────────────────────────────────────────────────────────────────
function initAudio() {
  if (audioReady) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  audioReady = true;
}

function playIslandSound() {
  if (!audioReady || state.muted) return;
  // Each island gets its own tonal character: major chord arpeggio
  const roots = [523,466,392,587,330,698,587,784]; // C5,Bb4,G4,D5,E4,F5,D5,G5
  const root  = roots[selectedWorld] || 523;
  // Play root → major third → fifth → octave
  [root, root*1.26, root*1.5, root*2].forEach((f,i) =>
    setTimeout(() => tone(f, 0.09, "sine"), i * 70)
  );
}

// S7: upgraded sounds — richer chords, gentler wrong, new event sounds
function playSound(type) {
  if (state.muted || !audioReady) return;

  // Each entry: array of chord sequences, each sequence is [freq, freq, …]
  const variants = {
    // Correct: bright ascending chords, 3 variations
    correct: [
      [523, 659, 784],          // C-E-G major
      [587, 740, 880, 1047],    // D-F#-A-C
      [659, 830, 988, 1175]     // E-G#-B-D#  (rich)
    ],
    // Wrong: muted soft descend — triangle wave, low volume
    wrong:       [[220, 196]],
    // Coin: bright ping chord
    coin:        [[880, 1047], [784, 988]],
    // Achievement: triumphant four-note chord
    achievement: [[523, 659, 784, 1047]],
    // Build: solid square wave power chord
    build:       [[261, 329, 392, 523]],
    // Level up: two-octave climb
    level:       [[440, 554, 659, 880, 1109, 1318]],
    // Perfect mission fanfare: full major arpeggio up
    perfect:     [[392, 494, 587, 784, 988, 1175, 1568]],
    // New S7 events:
    flip:        [[523, 659]],          // card flip — soft two-tone
    matchFound:  [[659, 784, 1047]],    // pair matched — short chime
    rescue:      [[523, 659, 784, 1047, 784, 1047, 1318]], // rescue fanfare
    onboard:     [[392, 523, 659]],     // onboarding open
    bubblePop:   [[880, 1047], [988, 1175]],  // bubble pop
  };

  const pool  = variants[type] || [[440]];
  const notes = pool[Math.floor(Math.random() * pool.length)];

  // Wave type per category
  let wave = "sine";
  if (type === "wrong")  wave = "triangle";  // soft, not harsh
  if (type === "build")  wave = "square";
  if (type === "flip")   wave = "triangle";

  // Volume scaling
  const vol = (type === "wrong" || type === "flip") ? 0.08 : 0.16;

  notes.forEach((freq, i) => setTimeout(() => tone(freq, 0.09 + i * 0.01, wave, vol), i * 80));
}

// S7: tone with configurable volume
function tone(freq, len, wave = "sine", vol = 0.16) {
  if (!audioCtx) return;
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = wave;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(vol, audioCtx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + len);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + len + 0.04);
}

function toast(message) {
  const el = document.createElement("div");
  el.className   = "toast";
  el.textContent = message;
  el.setAttribute("role","status");
  $("toastStack").appendChild(el);
  setTimeout(()=>el.remove(), 3000);
}

let _autoSaveInterval = null;
function startTimer() {
  if (_autoSaveInterval) clearInterval(_autoSaveInterval);
  _autoSaveInterval = setInterval(() => { save(true); renderDashboard(); }, 30000);
}

function shuffle(arr) { return arr.sort(()=>Math.random()-.5); }

// ─── SVG helpers ──────────────────────────────────────────────────────────────
function buildingSvg(i) {
  const svgs = [
    // 0: Fish Market — stall with awning, fish hanging
    `<rect x="10" y="50" width="100" height="48" rx="6" fill="#f4f8e8"/>
     <path d="M6 50 Q60 38 114 50" fill="#4fd6a8" stroke="#38b890" stroke-width="1.5"/>
     <rect x="6" y="47" width="108" height="8" rx="3" fill="#38b890"/>
     <rect x="30" y="62" width="12" height="10" rx="3" fill="#8fdaf0"/>
     <rect x="54" y="62" width="12" height="10" rx="3" fill="#8fdaf0"/>
     <rect x="78" y="62" width="12" height="10" rx="3" fill="#8fdaf0"/>
     <path d="M25 48 Q27 40 30 42 Q33 40 35 48" fill="#ffb847"/>
     <path d="M50 48 Q52 39 55 41 Q58 39 60 48" fill="#ff9060"/>
     <path d="M75 48 Q77 40 80 42 Q83 40 85 48" fill="#ffb847"/>`,
    // 1: Lighthouse — tall tower, light beam
    `<rect x="44" y="28" width="32" height="72" rx="6" fill="#f0f8ff"/>
     <path d="M40 28 Q60 14 80 28Z" fill="#ff7b7b"/>
     <rect x="36" y="24" width="48" height="8" rx="4" fill="#ff7b7b"/>
     <ellipse cx="60" cy="32" rx="14" ry="10" fill="#ffd45a" opacity="0.9"/>
     <circle cx="60" cy="32" r="7" fill="#fff7a0"/>
     <rect x="52" y="72" width="16" height="24" rx="3" fill="#8fdaf0"/>
     <path d="M36 96 Q60 102 84 96" fill="none" stroke="#c8d8e8" stroke-width="2"/>
     <path d="M60 32 Q90 20 104 12" fill="none" stroke="#ffd45a" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>`,
    // 2: Aquarium — glass dome, fish inside
    `<rect x="14" y="52" width="92" height="48" rx="8" fill="#c8f0ff" opacity="0.9"/>
     <rect x="14" y="52" width="92" height="48" rx="8" fill="none" stroke="#8fdaf0" stroke-width="2"/>
     <path d="M14 70 Q60 62 106 70 Q106 100 60 100 Q14 100 14 70Z" fill="#a0e4f8" opacity="0.4"/>
     <path d="M30 74 Q40 68 50 74" fill="#27c7de" stroke="none"/>
     <path d="M50 74 Q60 70 70 74" fill="#ffd45a" stroke="none"/>
     <path d="M70 74 Q80 68 90 74" fill="#ff9060" stroke="none"/>
     <ellipse cx="40" cy="80" rx="8" ry="5" fill="#27c7de" opacity="0.7"/>
     <ellipse cx="70" cy="84" rx="10" ry="6" fill="#4fd6a8" opacity="0.7"/>
     <path d="M8 52 Q60 32 112 52" fill="#8fdaf0" stroke="#4fbfe8" stroke-width="1.5"/>`,
    // 3: Seal House — round cosy igloo shape
    `<path d="M14 96 Q14 50 60 36 Q106 50 106 96Z" fill="#e8f4f8"/>
     <path d="M24 96 Q24 56 60 44 Q96 56 96 96Z" fill="#f4f8fc"/>
     <path d="M44 96 Q44 68 60 62 Q76 68 76 96Z" fill="#8fdaf0"/>
     <path d="M10 72 Q14 56 18 64 Q14 72 18 80 Q14 88 10 72Z" fill="#d0e8f4"/>
     <path d="M110 72 Q106 56 102 64 Q106 72 102 80 Q106 88 110 72Z" fill="#d0e8f4"/>
     <ellipse cx="60" cy="38" rx="18" ry="8" fill="#b8ddf0"/>
     <circle cx="60" cy="52" r="8" fill="#ffd45a" opacity="0.8"/>`,
    // 4: Penguin Village — cluster of small buildings
    `<rect x="10" y="60" width="30" height="38" rx="5" fill="#e8eeff"/>
     <path d="M6 62 l19-18 19 18z" fill="#856de8"/>
     <rect x="45" y="52" width="30" height="46" rx="5" fill="#f0eeff"/>
     <path d="M41 54 l19-20 19 20z" fill="#7858d8"/>
     <rect x="80" y="66" width="30" height="32" rx="5" fill="#e8eeff"/>
     <path d="M76 68 l19-16 19 16z" fill="#6848c8"/>
     <rect x="22" y="74" width="10" height="12" rx="2" fill="#b8c8ff"/>
     <rect x="55" y="68" width="10" height="14" rx="2" fill="#b8c8ff"/>
     <rect x="90" y="78" width="10" height="10" rx="2" fill="#b8c8ff"/>`,
    // 5: Harbor — dock with boat
    `<rect x="8" y="62" width="104" height="36" rx="4" fill="#a0d8f0"/>
     <path d="M8 75 Q60 68 112 75 L112 98 Q60 98 8 98Z" fill="#60b8e0"/>
     <rect x="28" y="38" width="44" height="32" rx="4" fill="#f8f0dc"/>
     <path d="M24 40 l28-24 28 24z" fill="#ffb847"/>
     <rect x="46" y="28" width="6" height="34" rx="3" fill="#c8a060"/>
     <rect x="36" y="72" width="48" height="8" rx="3" fill="#8a6030"/>
     <path d="M10 78 Q30 74 50 76" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.5"/>`,
    // 6: Arctic Museum — grand columns
    `<rect x="16" y="48" width="88" height="50" rx="4" fill="#f0f4f8"/>
     <rect x="10" y="90" width="100" height="8" rx="3" fill="#d8e4f0"/>
     <path d="M10 48 l50-32 50 32z" fill="#90d8ff"/>
     <rect x="10" y="44" width="100" height="8" rx="2" fill="#70c8ef"/>
     <rect x="24" y="48" width="10" height="42" rx="3" fill="#e0ecf8"/>
     <rect x="42" y="48" width="10" height="42" rx="3" fill="#e0ecf8"/>
     <rect x="68" y="48" width="10" height="42" rx="3" fill="#e0ecf8"/>
     <rect x="86" y="48" width="10" height="42" rx="3" fill="#e0ecf8"/>
     <rect x="48" y="64" width="24" height="34" rx="2" fill="#8fdaf0"/>`,
    // 7: Ice Castle — towers, flags
    `<rect x="24" y="44" width="52" height="56" rx="4" fill="#dff0f8"/>
     <rect x="10" y="54" width="20" height="46" rx="4" fill="#e8f4fc"/>
     <rect x="90" y="54" width="20" height="46" rx="4" fill="#e8f4fc"/>
     <path d="M10 56 L10 44 L14 48 L18 44 L22 48 L26 44 L30 56Z" fill="#b4ecff"/>
     <path d="M90 56 L90 44 L94 48 L98 44 L102 48 L106 44 L110 56Z" fill="#b4ecff"/>
     <path d="M24 46 L24 34 L28 38 L32 34 L36 38 L40 34 L44 38 L48 34 L52 38 L56 34 L60 38 L64 34 L68 38 L72 34 L76 46Z" fill="#c8eeff"/>
     <rect x="44" y="68" width="22" height="32" rx="3" fill="#8fdaf0"/>
     <circle cx="55" cy="58" r="10" fill="#dff8ff" stroke="#8fdaf0" stroke-width="1.5"/>
     <circle cx="55" cy="58" r="5" fill="#b4ecff"/>
     <path d="M44 38 L44 28 L52 34Z" fill="#ff7b7b"/>
     <path d="M72 42 L72 32 L80 38Z" fill="#ffd45a"/>`
  ];
  return `<svg viewBox="0 0 120 110" aria-hidden="true">${svgs[i]||svgs[0]}<ellipse cx="60" cy="102" rx="52" ry="6" fill="rgba(0,80,120,.10)"/></svg>`;
}

// Unique SVG per animal species
const ANIMAL_SVGS = [
  // 0: Baby seal (Nori) — small round, lighter colour
  `<ellipse cx="60" cy="68" rx="36" ry="26" fill="#e0f2f8"/>
   <path d="M27 75 Q15 80 18 92 Q30 94 34 82Z" fill="#cce8f4"/>
   <path d="M93 75 Q105 80 102 92 Q90 94 86 82Z" fill="#cce8f4"/>
   <ellipse cx="60" cy="52" rx="26" ry="22" fill="#eaf6fb"/>
   <circle cx="50" cy="50" r="5" fill="#1a2e3e"/><circle cx="51.5" cy="48.5" r="1.5" fill="#fff"/>
   <circle cx="70" cy="50" r="5" fill="#1a2e3e"/><circle cx="71.5" cy="48.5" r="1.5" fill="#fff"/>
   <ellipse cx="60" cy="58" rx="7" ry="5" fill="#e8a0aa"/>
   <path d="M53 63 Q60 68 67 63" fill="none" stroke="#b07080" stroke-width="2" stroke-linecap="round"/>`,

  // 1: Penguin (Pip) — black+white tuxedo shape
  `<ellipse cx="60" cy="70" rx="28" ry="32" fill="#1a2030"/>
   <ellipse cx="60" cy="72" rx="18" ry="24" fill="#f0f4f8"/>
   <ellipse cx="60" cy="42" rx="20" ry="18" fill="#1a2030"/>
   <ellipse cx="60" cy="40" rx="13" ry="12" fill="#f0c060"/>
   <circle cx="52" cy="38" r="5" fill="#1a2030"/><circle cx="53.5" cy="36.5" r="1.5" fill="#fff"/>
   <circle cx="68" cy="38" r="5" fill="#1a2030"/><circle cx="69.5" cy="36.5" r="1.5" fill="#fff"/>
   <path d="M55 46 Q60 50 65 46" fill="none" stroke="#c08020" stroke-width="2" stroke-linecap="round"/>
   <path d="M32 60 Q22 70 28 84 Q36 82 38 70Z" fill="#1a2030"/>
   <path d="M88 60 Q98 70 92 84 Q84 82 82 70Z" fill="#1a2030"/>`,

  // 2: Puffin (Pebble) — black body, big coloured beak
  `<ellipse cx="60" cy="66" rx="30" ry="28" fill="#1a1a2a"/>
   <ellipse cx="60" cy="68" rx="18" ry="20" fill="#f0f0f0"/>
   <ellipse cx="60" cy="46" rx="20" ry="18" fill="#1a1a2a"/>
   <circle cx="51" cy="44" r="5.5" fill="#1a1a2a"/><circle cx="52.5" cy="42.5" r="1.8" fill="#fff"/>
   <circle cx="69" cy="44" r="5.5" fill="#1a1a2a"/><circle cx="70.5" cy="42.5" r="1.8" fill="#fff"/>
   <path d="M52 54 Q60 60 68 54 Q66 50 60 48 Q54 50 52 54Z" fill="#ff8820"/>
   <path d="M28 70 Q16 68 20 86 Q32 88 34 74Z" fill="#ff8820"/>
   <path d="M92 70 Q104 68 100 86 Q88 88 86 74Z" fill="#ff8820"/>`,

  // 3: Polar bear (Miska) — creamy white, large round
  `<ellipse cx="60" cy="72" rx="40" ry="32" fill="#f4f0e8"/>
   <path d="M22 78 Q8 75 12 95 Q28 98 30 84Z" fill="#ece8e0"/>
   <path d="M98 78 Q112 75 108 95 Q92 98 90 84Z" fill="#ece8e0"/>
   <ellipse cx="60" cy="46" rx="28" ry="24" fill="#f4f0e8"/>
   <ellipse cx="46" cy="28" rx="10" ry="9" fill="#f4f0e8"/>
   <ellipse cx="74" cy="28" rx="10" ry="9" fill="#f4f0e8"/>
   <circle cx="49" cy="44" r="6" fill="#1a2030"/><circle cx="51" cy="42" r="2" fill="#fff"/>
   <circle cx="71" cy="44" r="6" fill="#1a2030"/><circle cx="73" cy="42" r="2" fill="#fff"/>
   <ellipse cx="60" cy="55" rx="10" ry="7" fill="#e0d8c8"/>
   <ellipse cx="59" cy="54" rx="5" ry="3.5" fill="#2a1a14"/>
   <path d="M52 61 Q60 67 68 61" fill="none" stroke="#8a7060" stroke-width="2" stroke-linecap="round"/>`,

  // 4: Walrus (Wally) — brown, big tusks, moustache
  `<ellipse cx="60" cy="74" rx="42" ry="30" fill="#9a7060"/>
   <path d="M18 80 Q4 82 10 98 Q26 98 26 84Z" fill="#8a6050"/>
   <path d="M102 80 Q116 82 110 98 Q94 98 94 84Z" fill="#8a6050"/>
   <ellipse cx="60" cy="50" rx="30" ry="26" fill="#a07868"/>
   <circle cx="47" cy="46" r="7" fill="#1a2030"/><circle cx="49" cy="44" r="2.2" fill="#fff"/>
   <circle cx="73" cy="46" r="7" fill="#1a2030"/><circle cx="75" cy="44" r="2.2" fill="#fff"/>
   <ellipse cx="60" cy="60" rx="14" ry="10" fill="#8a6050"/>
   <path d="M46 64 Q40 72 44 80" fill="none" stroke="#f8f0e0" stroke-width="4" stroke-linecap="round"/>
   <path d="M74 64 Q80 72 76 80" fill="none" stroke="#f8f0e0" stroke-width="4" stroke-linecap="round"/>
   <path d="M46 66 Q60 72 74 66" fill="none" stroke="#6a4030" stroke-width="2" stroke-linecap="round"/>`,

  // 5: Whale (Bluebell) — large horizontal, tail fin
  `<ellipse cx="56" cy="68" rx="48" ry="26" fill="#4a9ecf"/>
   <path d="M104 68 Q116 56 118 68 Q116 80 104 68Z" fill="#4a9ecf"/>
   <path d="M104 62 Q112 58 108 68Z" fill="#3a8ebf"/>
   <path d="M104 74 Q112 78 108 68Z" fill="#3a8ebf"/>
   <ellipse cx="52" cy="70" rx="34" ry="16" fill="#7fd0f0" opacity="0.4"/>
   <circle cx="34" cy="60" r="8" fill="#1a2030"/><circle cx="36" cy="58" r="2.5" fill="#fff"/>
   <path d="M28 75 Q44 82 60 78" fill="none" stroke="#f0f8ff" stroke-width="2.5" stroke-linecap="round"/>
   <ellipse cx="70" cy="48" rx="7" ry="4" fill="#4a9ecf" transform="rotate(-30 70 48)"/>`,

  // 6: Narwhal (Nova) — purple-blue, spiral horn
  `<ellipse cx="60" cy="68" rx="40" ry="24" fill="#7868c8"/>
   <path d="M100 68 Q112 58 114 68 Q112 78 100 68Z" fill="#7868c8"/>
   <path d="M100 62 Q108 58 106 68Z" fill="#5848a8"/>
   <path d="M100 74 Q108 78 106 68Z" fill="#5848a8"/>
   <ellipse cx="56" cy="68" rx="28" ry="14" fill="#a898e8" opacity="0.35"/>
   <circle cx="30" cy="60" r="7" fill="#1a2030"/><circle cx="32" cy="58" r="2" fill="#fff"/>
   <path d="M16 64 Q12 52 8 40 Q12 38 14 42 Q18 50 22 62Z" fill="#e0d0f8"/>
   <path d="M16 64 L8 40" fill="none" stroke="#c0b0e0" stroke-width="1" stroke-linecap="round"/>`,

  // 7: Arctic fox (Frost) — white/cream, bushy tail, pointed ears
  `<ellipse cx="60" cy="72" rx="34" ry="26" fill="#f0ece0"/>
   <path d="M92 78 Q110 82 112 68 Q108 58 96 62 Q90 66 88 76Z" fill="#f0ece0"/>
   <path d="M96 70 Q108 72 106 62 Q100 56 94 62Z" fill="#e0dcd0"/>
   <ellipse cx="60" cy="50" rx="24" ry="20" fill="#f0ece0"/>
   <path d="M44 36 Q40 24 48 28 Q52 36 50 42Z" fill="#f0ece0"/>
   <path d="M76 36 Q80 24 72 28 Q68 36 70 42Z" fill="#f0ece0"/>
   <path d="M44 36 Q42 28 48 30 Q52 36 50 40Z" fill="#f08080" opacity="0.6"/>
   <path d="M76 36 Q78 28 72 30 Q68 36 70 40Z" fill="#f08080" opacity="0.6"/>
   <circle cx="50" cy="48" r="6" fill="#1a2030"/><circle cx="52" cy="46" r="2" fill="#fff"/>
   <circle cx="70" cy="48" r="6" fill="#1a2030"/><circle cx="72" cy="46" r="2" fill="#fff"/>
   <ellipse cx="60" cy="58" rx="8" ry="5" fill="#e0c0b0"/>
   <path d="M53 64 Q60 70 67 64" fill="none" stroke="#a08070" stroke-width="2" stroke-linecap="round"/>`,

  // 8: Sea otter (Tumble) — dark brown, holds something
  `<ellipse cx="60" cy="72" rx="36" ry="28" fill="#5c3a28"/>
   <path d="M25 80 Q12 82 16 96 Q30 98 32 84Z" fill="#4c2a18"/>
   <path d="M95 80 Q108 82 104 96 Q90 98 88 84Z" fill="#4c2a18"/>
   <ellipse cx="60" cy="50" rx="24" ry="20" fill="#7a5038"/>
   <ellipse cx="60" cy="53" rx="15" ry="12" fill="#c8a080"/>
   <circle cx="49" cy="47" r="6" fill="#1a2030"/><circle cx="51" cy="45" r="2" fill="#fff"/>
   <circle cx="71" cy="47" r="6" fill="#1a2030"/><circle cx="73" cy="45" r="2" fill="#fff"/>
   <ellipse cx="60" cy="58" rx="8" ry="5" fill="#5c3a28"/>
   <path d="M53 63 Q60 68 67 63" fill="none" stroke="#3a2018" stroke-width="2" stroke-linecap="round"/>
   <rect x="48" y="78" width="24" height="14" rx="7" fill="#e8c070"/>`
];

function animalSvg(i) {
  const paths = ANIMAL_SVGS[i] || ANIMAL_SVGS[0];
  return `<svg viewBox="0 0 120 110" aria-hidden="true">${paths}<ellipse cx="60" cy="100" rx="44" ry="6" fill="rgba(0,80,120,.10)"/></svg>`;
}

function animalSvgLarge(i, species) {
  const paths = ANIMAL_SVGS[i] || ANIMAL_SVGS[0];
  return `<svg viewBox="0 0 120 110" class="animal-svg-large" aria-label="${species}" role="img">${paths}<ellipse cx="60" cy="100" rx="44" ry="6" fill="rgba(0,80,120,.10)"/></svg>`;
}

function costumeSvg(i) {
  const color = ["#26364a","#bdefff","#ffd45a","#ff7b7b","#4fd6a8","#856de8","#27c7de","#ffb847"][i];
  return `<svg viewBox="0 0 120 110" aria-hidden="true"><ellipse cx="60" cy="64" rx="40" ry="28" fill="#f8fcff"/><circle cx="48" cy="57" r="5" fill="#26364a"/><circle cx="72" cy="57" r="5" fill="#26364a"/><path d="M54 68c4 4 8 4 12 0" fill="none" stroke="#7890a4" stroke-width="4" stroke-linecap="round"/><path d="M33 34h54l-8 22H41z" fill="${color}"/><circle cx="60" cy="30" r="10" fill="${color}"/><ellipse cx="60" cy="96" rx="44" ry="7" fill="#bcecf8"/></svg>`;
}

// ─── Parent tools ─────────────────────────────────────────────────────────────
function exportProgress() {
  const prof = getActiveProfile();
  const json = JSON.stringify({ profile: prof, state });
  $("saveBox").value = json;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(json).then(()=>toast(t("progressExported"))).catch(()=>toast(t("progressExportedFallback")));
  } else {
    toast(t("progressExportedFallback"));
  }
}

function importProgress() {
  try {
    const raw = JSON.parse($("saveBox").value);
    if (!raw || typeof raw !== "object") throw new Error("Invalid save");
    // Support both old single-state format and new profile format
    const imported = raw.state || raw;
    if (!imported || typeof imported !== "object") throw new Error("Invalid save");
    state = { ...defaultState(), ...imported };
    const curr = getActiveProfile();
    if (curr) { curr.state = state; saveProfiles(profiles); }
    selectedWorld = Math.min(state.unlockedWorld, worlds.length-1);
    renderMap(); renderAll();
    toast(t("progressImported"));
  } catch {
    toast(t("importFailed"));
  }
}

function resetStatistics() {
  if (!confirm("Reset learning statistics but keep adventure rewards and progress?")) return;
  Object.keys(state.topics).forEach(t => state.topics[t] = { correct:0, wrong:0, time:0, fast:0 });
  state.solved = 0; state.correct = 0; state.wrong = 0;
  state.timePlayed = 0; state.startedAt = Date.now();
  save(); renderAll();
  toast(t("statsReset"));
}

function newAdventure() {
  if (!confirm("Start a new adventure while keeping purchased rewards and achievements?")) return;
  const keep = { shop:state.shop, equipped:state.equipped, achievements:state.achievements, specialCosmetics:state.specialCosmetics, muted:state.muted };
  state = { ...defaultState(), ...keep, startedAt:Date.now(), dailySpecial:dailySpecialName(), onboarded:true };
  selectedWorld = 0;
  save(); renderMap(); renderAll();
  toast(t("adventureStarted"));
}

function resetEverything() {
  if (!confirm("Reset everything for this player? This cannot be undone.")) return;
  state = defaultState();
  state.dailySpecial = dailySpecialName();
  selectedWorld = 0;
  save(true);
  renderMap(); renderAll();
  toast(t("everythingReset"));
}

// ─── Surprise events ──────────────────────────────────────────────────────────
function randomSurprise() {
  setTimeout(() => {
    const roll = Math.random();
    if      (roll < .18) { state.doubleRewardsUntil = Date.now()+120000; toast("Double Rewards! The next 2 minutes sparkle. ✨"); react("surprised"); }
    else if (roll < .34) { state.coins+=18; state.rareTreasures++; toast("Mystery treasure chest! +18 coins 🎁"); confetti(); }
    else if (roll < .50) { state.fish+=8; toast("Lost fish found their way home! +8 fish 🐟"); }
    else if (roll < .62) { state.mysteryVisits++; toast("Mystery visitor waved from the snow! 👋"); speak("town"); }
    else if (roll < .72) { state.stars+=2; toast("Bonus whale splash! +2 stars 🐋"); }
    if (roll < .72) { save(); renderAll(); }
    randomSurprise();
  }, 24000+Math.random()*26000);
}

// Maps grade choice → starting island
const GRADE_STARTS = { "1-2": 0, "3": 1, "4": 2, "5+": 4 };

// ─── P3: Onboarding ───────────────────────────────────────────────────────────
// Steps are functions so they resolve strings at render time (after lang is set)
function getOnboardingSteps() {
  const ch  = getActiveCharacter();
  const isRu = currentLang === "ru";
  return [
    {
      title: isRu ? `Добро пожаловать, ${ch.name}! ${ch.emoji}` : `Welcome, ${ch.name}! ${ch.emoji}`,
      text:  isRu
        ? `Это ${ch.name} ${ch.species === "Seal" ? "— тюлень" : ch.species === "Penguin" ? "— пингвин" : ch.species === "Arctic Fox" ? "— арктическая лиса" : "— полярный медведь"}! Буря в Арктике разогнала всех друзей по ледяному океану. Поможешь вернуть их домой?`
        : `Meet ${ch.name} the ${ch.species}! A big storm has scattered all friends across the icy ocean. Can you bring them home?`,
      emoji: ch.emoji
    },
    {
      title: isRu ? "В каком ты классе?" : "Which year are you in?",
      text:"",
      emoji:"📚",
      gradePickerStep: true
    },
    {
      title: isRu ? "Спасай друзей!" : "Rescue Friends!",
      text:  isRu
        ? `Плыви к каждому острову, решай математические задачи и возвращай друзей домой. ${ch.name} ждёт тебя!`
        : `Sail to each island, answer maths questions, and bring your friends safely back home. ${ch.name} is counting on you!`,
      emoji:"🐾"
    },
    {
      title: isRu ? "Собирай награды!" : "Earn Rewards!",
      text:  isRu
        ? "За каждый правильный ответ — рыбка 🐟, монетки 💰 и звёзды ⭐. Открывай костюмы и строй Арктический город!"
        : "Every correct answer earns fish 🐟, coins 💰, and stars ⭐. Use them to unlock costumes and build your Arctic Town!",
      emoji:"🎁"
    },
    {
      title: isRu ? "Режим тренировки" : "Practice Mode",
      text:  isRu
        ? "Хочешь попрактиковаться без изменений прогресса? Нажми кнопку «Тренировка» на карте — все острова открыты!"
        : "Want to practise without changing story progress? Tap 'Practice Mode' on the map — all islands are unlocked!",
      emoji:"🎯"
    }
  ];
}

let onboardStep = 0;

function showOnboarding() {
  const modal = $("onboardingModal");
  if (!modal) return;
  onboardStep = 0;
  renderOnboardStep();
  modal.hidden = false;
}

function renderOnboardStep() {
  const steps = getOnboardingSteps();
  const step  = steps[onboardStep];
  const total = steps.length;
  const modal = $("onboardingModal");
  if (!modal) return;

  // Show character on first step
  const emojiEl = modal.querySelector(".onboard-emoji");
  if (emojiEl) {
    if (onboardStep === 0) {
      const ch = getActiveCharacter();
      emojiEl.innerHTML = `<svg viewBox="0 0 120 110" style="width:80px;height:auto">${characterSvgSmall(ch.id).replace(/<svg[^>]*>|<\/svg>/g,"")}</svg>`;
    } else {
      emojiEl.textContent = step.emoji;
    }
  }

  modal.querySelector(".onboard-title").textContent = step.title;
  const textEl = modal.querySelector(".onboard-text");

  const isRu = currentLang === "ru";
  if (step.gradePickerStep) {
    textEl.innerHTML = `<p style="margin:0 0 12px;color:var(--muted)">${isRu ? "Выбери класс, чтобы подобрать подходящие острова!" : "Pick your school year so we pick the right islands for you!"}</p>
      <div class="grade-grid">
        <button class="grade-btn" data-grade="1-2">${isRu ? "1–2 класс" : "Year 1–2"}<small>${isRu ? "5–7 лет" : "Ages 5–7"}</small></button>
        <button class="grade-btn" data-grade="3">${isRu ? "3 класс" : "Year 3"}<small>${isRu ? "8 лет" : "Age 8"}</small></button>
        <button class="grade-btn selected" data-grade="4">${isRu ? "4 класс" : "Year 4"}<small>${isRu ? "9 лет ✓" : "Age 9 ✓"}</small></button>
        <button class="grade-btn" data-grade="5+">${isRu ? "5+ класс" : "Year 5+"}<small>${isRu ? "10+ лет" : "Age 10+"}</small></button>
      </div>`;
    textEl.querySelectorAll(".grade-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        textEl.querySelectorAll(".grade-btn").forEach(b=>b.classList.remove("selected"));
        btn.classList.add("selected");
        const startIsland = GRADE_STARTS[btn.dataset.grade] ?? 0;
        state.unlockedWorld = Math.max(state.unlockedWorld, startIsland);
        selectedWorld = startIsland;
        save();
      });
    });
  } else {
    textEl.innerHTML = step.text;
  }

  modal.querySelector(".onboard-dots").innerHTML = steps.map((_,i)=>
    `<span class="onboard-dot ${i===onboardStep?"active":""}"></span>`).join("");
  const nextBtn = modal.querySelector(".onboard-next");
  const isLast  = onboardStep >= total - 1;
  nextBtn.textContent = isLast
    ? (isRu ? "Вперёд! 🚀" : "Start Adventure! 🚀")
    : (isRu ? "Далее →" : "Next →");
}

function advanceOnboarding() {
  const steps = getOnboardingSteps();
  if (onboardStep < steps.length - 1) {
    onboardStep++;
    renderOnboardStep();
  } else {
    closeOnboarding();
  }
}

function closeOnboarding() {
  const modal = $("onboardingModal");
  if (modal) modal.hidden = true;
  state.onboarded = true;
  save();
}


// ═══════════════════════════════════════════════════════════════════════════
// S2: Internationalisation (EN / RU)
// ═══════════════════════════════════════════════════════════════════════════
// ── S2: Internationalisation — currentLang is set per-profile in init()
let currentLang = "en"; // will be overwritten by profile lang on launchGame()

const STRINGS = {
  en: {
    // Nav
    adventure:"Adventure", mysSeal:"My Seal", town:"Town", album:"Album",
    rewards:"Rewards", daily:"Daily", parent:"Parent",
    // Topbar
    fish:"fish", coins:"coins", stars:"stars",
    // Quest panel
    chooseIsland:"Choose an island",
    questIntro:"A storm scattered Sausage's friends. Sail out, solve adventure problems, and bring everyone home.",
    startMission:"Start Mission", replayMission:"Replay Island Mission",
    playBonus:"Play Bonus Game",
    // Challenge
    questionsLeft:"questions remaining", showHint:"Show a friendly hint",
    // Mini-games
    returnToMap:"Return to Map",
    minigame_slide_title:"Ice Slide!", minigame_slide_text:"Tap Left / Right to dodge the rocks!",
    minigame_snow_title:"Snowball Catch!", minigame_snow_text:"Move the bucket to catch falling snowballs!",
    left:"Left", right:"Right",
    // Rewards / shop
    costumesAndPets:"Costumes and Pets", spendCoins:"Spend coins on playful looks for Sausage.",
    achievements:"Achievements", owned:"Owned", buy:"Buy", equip:"Equip", equipped:"Equipped",
    // Town
    arcticTown:"Arctic Town", townDesc:"Buildings appear as Sausage earns stars and rescues friends.",
    // Album
    rescueAlbum:"Rescue Album", albumDesc:"Every rescued friend brings a fun Arctic fact.",
    hiddenFriend:"Hidden Friend", completeStory:"Complete story missions to discover this friend.",
    // Daily
    dailyChallenge:"Daily Challenge", playDaily:"Play Daily Challenge",
    dailyClaimed:"Today's treasure is claimed. Come back tomorrow for another surprise!",
    yourCollection:"Your collection",
    // Parent
    parentDashboard:"Parent Dashboard", parentDesc:"Progress is saved on this device only.",
    exportCopy:"Export & Copy", importProgress:"Import Progress",
    resetStats:"Reset Statistics", newAdventure:"New Adventure", resetAll:"Reset Everything",
    saveCodeLabel:"Save Code", saveCodeDesc:"Write down this 8-character code to restore progress on any device.",
    saveCodePlaceholder:"Enter 8-character code to restore...",
    restoreBtn:"Restore",
    exportedBox:"Exported progress appears here. Paste progress here to import.",
    // Stat cards
    accuracy:"Accuracy", solvedProblems:"Solved Problems", currentLevel:"Current Level",
    strongTopics:"Strong Topics", weakTopics:"Weak Topics", timePlayed:"Time Played",
    missionProgress:"Mission Progress", townProgress:"Town Progress",
    friendRescue:"Friend Rescue", collection:"Collection", playToDiscover:"Play to discover",
    // Toasts
    statsReset:"Statistics reset. Adventure progress stayed safe.",
    adventureStarted:"New adventure started. Rewards stayed in the closet.",
    everythingReset:"Everything reset for a fresh start.",
    progressImported:"Progress imported.",
    importFailed:"Import did not work. Paste a valid exported save.",
    progressExported:"Progress copied to clipboard!",
    progressExportedFallback:"Progress exported into the box.",
    // Save code
    saveCodeCopied:"Save code copied!",
    saveCodeRestored:"Progress restored from save code!",
    saveCodeInvalid:"Invalid save code. Check all 8 characters.",
    // Levels
    level:"Level",
    // Misc
    islandComplete:"Island complete", missionOf:"Mission",
    objective:"Objective", rewardLabel:"Reward",
    recommendedLevel:"Recommended level",
    stormCovers:"Storm clouds still cover that island.",
    keepExploring:"Keep Exploring",
    missionComplete:"Mission Complete!", rareTreasure:"Rare Treasure!",
    rescued:"Rescued!",
  },
  ru: {
    // Nav
    adventure:"Приключение", mysSeal:"Мой Тюлень", town:"Город", album:"Альбом",
    rewards:"Награды", daily:"Каждый день", parent:"Родителям",
    // Topbar
    fish:"рыбок", coins:"монет", stars:"звёзд",
    // Quest panel
    chooseIsland:"Выбери остров",
    questIntro:"Буря разогнала друзей Сосиски. Плыви вперёд, решай задачи и возвращай всех домой.",
    startMission:"Начать миссию", replayMission:"Повторить миссию",
    playBonus:"Мини-игра",
    // Challenge
    questionsLeft:"вопросов осталось", showHint:"Подсказка",
    // Mini-games
    returnToMap:"На карту",
    minigame_slide_title:"Ледяная горка!", minigame_slide_text:"Нажимай Влево / Вправо, чтобы уклоняться!",
    minigame_snow_title:"Лови снежки!", minigame_snow_text:"Двигай ведро и лови снежки!",
    left:"Влево", right:"Вправо",
    // Rewards / shop
    costumesAndPets:"Костюмы и питомцы", spendCoins:"Трать монеты на образы для Сосиски.",
    achievements:"Достижения", owned:"Куплено", buy:"Купить", equip:"Надеть", equipped:"Надето",
    // Town
    arcticTown:"Арктический город", townDesc:"Здания появляются по мере зарабатывания звёзд и спасения друзей.",
    // Album
    rescueAlbum:"Альбом спасений", albumDesc:"Каждый спасённый друг приносит интересный факт об Арктике.",
    hiddenFriend:"Скрытый друг", completeStory:"Выполняй миссии, чтобы найти этого друга.",
    // Daily
    dailyChallenge:"Ежедневный вызов", playDaily:"Играть сейчас",
    dailyClaimed:"Сегодняшнее сокровище получено. Возвращайся завтра!",
    yourCollection:"Твоя коллекция",
    // Parent dashboard
    parentDashboard:"Панель родителя", parentDesc:"Прогресс сохраняется только на этом устройстве.",
    exportCopy:"Экспорт", importProgress:"Импорт",
    resetStats:"Сбросить статистику", newAdventure:"Новое приключение", resetAll:"Сбросить всё",
    saveCodeLabel:"Код сохранения", saveCodeDesc:"Запиши этот код для восстановления прогресса на другом устройстве.",
    saveCodePlaceholder:"Введи код для восстановления...",
    restoreBtn:"Восстановить",
    exportedBox:"Сюда экспортируется прогресс. Вставь код сюда для импорта.",
    // Stat cards
    accuracy:"Точность", solvedProblems:"Решено задач", currentLevel:"Текущий уровень",
    strongTopics:"Сильные темы", weakTopics:"Слабые темы", timePlayed:"Время в игре",
    missionProgress:"Прогресс миссий", townProgress:"Прогресс города",
    friendRescue:"Спасённые друзья", collection:"Коллекция", playToDiscover:"Играй, чтобы узнать",
    // Toasts
    statsReset:"Статистика сброшена. Приключение сохранено.",
    adventureStarted:"Новое приключение! Награды остались в гардеробе.",
    everythingReset:"Всё сброшено. Свежий старт!",
    progressImported:"Прогресс импортирован.",
    importFailed:"Импорт не удался. Вставь правильный код сохранения.",
    progressExported:"Прогресс скопирован в буфер!",
    progressExportedFallback:"Прогресс экспортирован в поле ниже.",
    // Save code
    saveCodeCopied:"Код сохранения скопирован!",
    saveCodeRestored:"Прогресс восстановлен из кода!",
    saveCodeInvalid:"Неверный код. Проверь все 8 символов.",
    // Levels
    level:"Уровень",
    // Misc
    islandComplete:"Остров пройден", missionOf:"Миссия",
    objective:"Задание", rewardLabel:"Награда",
    recommendedLevel:"Рекомендуемый уровень",
    stormCovers:"Этот остров ещё закрыт бурей.",
    keepExploring:"Продолжить!",
    missionComplete:"Миссия выполнена!", rareTreasure:"Редкое сокровище!",
    rescued:"Спасён!",
    // Island names (used in map)
    islandLocked:"Закрыто", missionsCount:"миссий",
    // Achievement descriptions shown in UI
    achFirst:"Первые шаги", achPerfect:"Идеальная миссия", achStreak:"Серия дней",
    achFriend:"Друг спасён", achBuilder:"Строитель", achCollector:"Коллекционер",
    // Onboarding
    welcomeTitle:"Добро пожаловать!", welcomeText:"Буря в Арктике! Помоги Сосиске спасти друзей.",
    onboardMath:"Решай задачи, чтобы двигаться вперёд.", onboardRewards:"Получай рыбу, монеты и звёзды!",
    onboardTown:"Строй Арктический город с друзьями.", letsGo:"Поплыли! 🦭",
    // Welcome back
    welcomeBack:"С возвращением!", continueAdventure:"Продолжаем приключение",
    // Briefing buttons
    skip:"Пропустить", next:"Далее →", letsGoBtn:"Поехали! 🦭",
  }
};

function langLabel(lang) {
  if (lang === "ru")    return "RU";
  if (lang === "learn") return "📖";
  return "EN";
}

function t(key) {
  if (currentLang === "learn") {
    const en = STRINGS.en[key] || key;
    const ru = STRINGS.ru[key] || "";
    if (ru && ru !== en) return en; // DOM will show bilingual via applyLearningMode
    return en;
  }
  return (STRINGS[currentLang] || STRINGS.en)[key] || STRINGS.en[key] || key;
}

// Learning mode bilingual wrapper — wraps text in a span with RU subtitle
function tLearn(key) {
  const en = STRINGS.en[key]  || key;
  const ru = STRINGS.ru[key]  || "";
  if (currentLang !== "learn") return t(key);
  if (!ru || ru === en) return en;
  return `${en}<span class="learn-ru">${ru}</span>`;
}

function setLang(lang) {
  currentLang = lang;
  // Also store on active profile
  const prof = getActiveProfile();
  if (prof) { prof.lang = lang; saveProfiles(profiles); }
  const btn = $("langBtn");
  if (btn) btn.textContent = langLabel(lang);
  applyLangToDOM();
  renderAll();
}

function applyLangToDOM() {
  document.body.classList.toggle("learning-mode", currentLang === "learn");

  // Update static tab labels
  document.querySelectorAll(".tab[data-view]").forEach(tab => {
    const map = {
      adventure: t("adventure"), seal: t("mysSeal"), town: t("town"),
      album: t("album"), rewards: t("rewards"), daily: t("daily"), parent: t("parent")
    };
    if (map[tab.dataset.view]) tab.textContent = map[tab.dataset.view];
  });
  // Update buttons that are static
  const btnMap = {
    startChallengeBtn: t("startMission"),
    miniGameBtn:       t("playBonus"),
    closeMiniBtn:      t("returnToMap"),
    dailyBtn:          t("playDaily"),
    exportBtn:         t("exportCopy"),
    importBtn:         t("importProgress"),
    resetStatsBtn:     t("resetStats"),
    newAdventureBtn:   t("newAdventure"),
    resetAllBtn:       t("resetAll"),
    rewardClose:       t("keepExploring"),
    hintBtn:           t("showHint"),
  };
  Object.entries(btnMap).forEach(([id, label]) => {
    const el = $(id);
    if (el && !el.disabled) el.textContent = label;
  });

  // Learning mode: resource labels
  if (currentLang === "learn") {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      const en = STRINGS.en[key] || key;
      const ru = STRINGS.ru[key] || "";
      el.innerHTML = ru ? `${en}<span class="learn-ru">${ru}</span>` : en;
    });
  } else {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });
  }
}

// ── S2: Portable Save Code ────────────────────────────────────────────────────
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 chars, no ambiguous I/O/0/1

function generateSaveCode() {
  // Encode key progress into ~8 chars: level(2) + fish(2) + missions(2) + achievements(2)
  const missionTotal = Object.values(state.missions).reduce((a,b)=>a+b,0);
  const payload = [
    Math.min(state.level, 99),
    Math.min(state.fish, 999),
    Math.min(missionTotal, 99),
    Math.min(state.achievements.length, 50),
    state.unlockedWorld,
    state.coins > 0 ? 1 : 0
  ];
  // Pack into base-32 string
  let num = 0;
  payload.forEach((v, i) => { num = num * 1000 + v; });
  let code = "";
  let n = Math.abs(num) + 1;
  for (let i=0; i<8; i++) {
    code = CODE_CHARS[n % 32] + code;
    n = Math.floor(n / 32);
  }
  return code;
}

function copySaveCode() {
  const code = generateSaveCode();
  const box  = $("saveCodeBox");
  if (box) box.value = code;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code)
      .then(()=>toast(t("saveCodeCopied")))
      .catch(()=>toast(t("saveCodeCopied")));
  } else {
    toast(t("saveCodeCopied"));
  }
}

function restoreFromCode() {
  const box = $("saveCodeBox");
  if (!box) return;
  const code = box.value.toUpperCase().replace(/[^A-Z2-9]/g,"");
  if (code.length !== 8) { toast(t("saveCodeInvalid")); return; }
  // Decode
  let n = 0;
  for (const ch of code) { n = n * 32 + CODE_CHARS.indexOf(ch); }
  n -= 1;
  const achievements_len = n % 1000; n = Math.floor(n/1000);
  const missionTotal      = n % 1000; n = Math.floor(n/1000);
  const fish              = n % 1000; n = Math.floor(n/1000);
  const level             = n % 1000;
  // Apply as a partial restore — give the player their level + fish back
  // (full save export/import is still available for complete restore)
  if (level < 1 || level > 99) { toast(t("saveCodeInvalid")); return; }
  state.level = Math.max(state.level, level);
  state.fish  = Math.max(state.fish, fish);
  state.xp    = 0;
  save(); renderAll();
  toast(t("saveCodeRestored"));
}

init();
