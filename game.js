// ═══════════════════════════════════════════════════════════════
// SPRINT 3 — PROFILE SYSTEM + LEARNING MODE
// ═══════════════════════════════════════════════════════════════
const SAVE_KEY        = "sausage-arctic-math-save-v1";  // legacy (migration)
const PROFILES_KEY    = "sausage-profiles-v1";
const ACTIVE_KEY      = "sausage-active-profile";
const MAX_PROFILES    = 20;

const PROFILE_EMOJIS  = ["🦭","🐧","🐻","🦊","🐳","🦁","🐼","🦋","🐸","🦄",
                          "🐨","🐯","🦀","🦆","🐬","🦭","🐺","🦝","🦥","🐙"];

const GAME_VERSION = "1.0.0";

// ─── Learning Mode (lang = "learn") ─────────────────────────────────────────
// Shows English + Russian translation below every string.
// Stored per-profile in profile.lang.

const todayKey = () => new Date().toISOString().slice(0, 10);

const worlds = [
  { name: "Snow Beach",      topics: ["add10","add20","sub20"],                          subtitle: "Find warm shells after the storm",        subtitleRu: "Найди тёплые ракушки после бури",         palette: ["#fff7cf","#9eeeff"],   character: "Pip",           animal: 1, music: "bright bells" },
  { name: "Fish Bay",        topics: ["add100","sub100","carryBorrow"],                  subtitle: "Repair the fish docks",                  subtitleRu: "Отремонтируй рыбные пристани",            palette: ["#d8fff1","#24bdd2"],   character: "Nori",          animal: 0, music: "bouncy marimba" },
  { name: "Whale Coast",     topics: ["multiply","divide","reverseMul"],                 subtitle: "Follow Bluebell's song",                 subtitleRu: "Следуй за песней Блюбелл",                palette: ["#e3f0ff","#5ca6e8"],   character: "Bluebell",      animal: 5, music: "slow ocean chimes" },
  { name: "Penguin Islands", topics: ["mixed","add3","twoStep"],                         subtitle: "Guide the penguin parade",               subtitleRu: "Проведи парад пингвинов",                 palette: ["#f7f7ff","#7c8fe8"],   character: "Pebble",        animal: 2, music: "tap-dance drums" },
  { name: "Octopus Cave",    topics: ["missing","patterns","brackets","logic"],          subtitle: "Solve Professor Octo's riddles",         subtitleRu: "Разгадай загадки Профессора Окто",        palette: ["#f4e8ff","#35c9c0"],   character: "Professor Octo",animal: 9, music: "mysterious bubbles" },
  { name: "Polar Academy",   topics: ["equations","advEquations","orderOfOps"],          subtitle: "Train with Miska",                       subtitleRu: "Тренируйся с Миской",                     palette: ["#ffffff","#8bd5ff"],   character: "Miska",         animal: 3, music: "sparkly classroom" },
  { name: "Northern Kingdom",topics: ["word","fractions","fracCompare"],                 subtitle: "Carry supplies to the castle",           subtitleRu: "Доставь припасы в замок",                 palette: ["#ffe5ee","#b78cff"],   character: "Nova",          animal: 6, music: "royal horns" },
  { name: "Arctic Champion", topics: ["adaptive"],                                       subtitle: "Become Guardian of the Arctic",          subtitleRu: "Стань Хранителем Арктики",                palette: ["#fff8b8","#2dd6a6"],   character: "Tumble",        animal: 8, music: "victory fanfare" }
].map((w, i) => ({ ...w, id: i }));

const miniGames      = ["Catch Fish","Treasure Hunt","Find Hidden Penguins","Ice Slide","Feed Baby Seals"];
const recommendedLevels = [1,3,6,8,10,12,15,18];
const missionDetails = [
  { title:"Scout the Shore",   objective:"Find storm clues",            reward:"12 fish, 6 coins, 3 stars",    story:"Sausage checks the snow for friendly footprints." },
  { title:"Rescue a Friend",   objective:"Reach the stranded friend",   reward:"new friend, fish, stars",      story:"A tiny voice calls from a drifting ice floe." },
  { title:"Build a Helper",    objective:"Gather town supplies",        reward:"building progress",             story:"The town needs lights, warm homes, and busy docks." },
  { title:"Open the Treasure", objective:"Unlock a frozen chest",       reward:"rare treasure chance",         story:"Something shiny is trapped under blue ice." },
  { title:"Calm the Storm",    objective:"Finish the island rescue",    reward:"next island path",              story:"The last gust fades when friends work together." }
];
// S8: RU mirror of missionDetails — same shape/order, picked via md(i).
const missionDetailsRu = [
  { title:"Разведать берег",      objective:"Найти следы бури",            reward:"12 рыбок, 6 монет, 3 звезды", story:"Тюлень ищет на снегу следы друзей." },
  { title:"Спасти друга",         objective:"Добраться до друга на льдине",reward:"новый друг, рыбки, звёзды",   story:"Тихий голосок зовёт с дрейфующей льдины." },
  { title:"Построить помощника",  objective:"Собрать припасы для города",  reward:"прогресс города",             story:"Городу нужен свет, тёплые дома и оживлённые пристани." },
  { title:"Открыть сокровище",    objective:"Открыть замёрзший сундук",    reward:"шанс редкого сокровища",      story:"Что-то блестящее вмёрзло в синий лёд." },
  { title:"Успокоить бурю",       objective:"Завершить спасение острова",  reward:"путь к следующему острову",   story:"Последний порыв ветра стихает, когда друзья работают вместе." }
];
function md(i) { return (currentLang === "ru" ? missionDetailsRu : missionDetails)[i] || missionDetails[i]; }

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
  reward: [
    "Treasure feels better when friends are safe.",
    "That chest was waiting for a clever explorer.",
    "A new sparkle for the town!",
    "Rewards earned by kindness are the best kind.",
    "Sausage earned this. Every answer counted.",
    "Look what bravery and thinking can do!",
    "The Arctic is a little brighter now.",
    "A reward well deserved. On to the next one!"
  ]
};
// S9: RU mirror of dialogueBank — same keys/order, picked via speak() below.
const dialogueBankRu = {
  before: [
    "Я взял с собой смелость и закуски. Чаще закуски.",
    "Этот остров сегодня кажется другим. Давай осмотримся.",
    "Если ветер расшумится, мы ответим смелостью.",
    "Даже маленькая подсказка — это подсказка. За мной!",
    "Сегодня ветер пахнет приключениями.",
    "Три вопроса — и мы герои.",
    "Готов? Остров наблюдает.",
    "Тюлень взволнованно ёрзает. Идём!",
    "Я слышу, как где-то там зовёт друг.",
    "Каждый верный ответ приближает спасательную лодку.",
    "Глубокий вдох. Мы справимся вместе.",
    "Буря оставила загадку — давай разгадаем её.",
    "Тёплые ласты, тёплое сердце. Спасём кого-нибудь!",
    "Сегодня похоже на день золотой звезды."
  ],
  correct: [
    "От этого снег засверкал!",
    "Тюлень радостно проскользил на животе!",
    "Спасательные нарты рванули вперёд.",
    "Отличная мысль. Остров заметил.",
    "Лёд засветился — отличный ответ!",
    "Рыбка подпрыгнула от радости!",
    "Тюлень хлопнул ластом! Превосходно.",
    "Вот это ответ. Идеально!",
    "Спасательная лодка стала ближе. Продолжай!",
    "Блестяще! Даже облака зааплодировали.",
    "Этот ответ согрел весь айсберг.",
    "Тюлень кружится от радости!",
    "Ещё один шаг к тому, чтобы вернуть друга домой.",
    "Звёзды засияли ярче. Потрясающе!"
  ],
  wrong: [
    "Не переживай. Даже путешественники скользят на льду.",
    "Попробуем другой путь. Я верю в нас.",
    "Было близко. Подсказка может помочь.",
    "Тюлень отряхивается и продолжает улыбаться.",
    "Посмотри ещё раз — ответ прячется рядом.",
    "Всё в порядке. Мы учимся каждый раз.",
    "Ответ ближе, чем ты думаешь.",
    "Каждый путешественник иногда сворачивает не туда. Попробуй снова!",
    "Не совсем, но приключение продолжается!",
    "Лёд бывает хитрым. Посмотри подсказку.",
    "Тюлень кивает — это случается со всеми.",
    "Подумай немного — ты сможешь разобраться.",
    "Смелая попытка! Посмотри на правильный ответ.",
    "Ошибки — это то, как мы учимся. У тебя получится."
  ],
  town: [
    "Сегодня в городе слышно больше шума.",
    "Кто-то заглянул на Рыбный рынок.",
    "Я услышал всплеск возле гавани.",
    "Спасённые друзья делают это место своим домом.",
    "Смотри — Пип играет у маяка!",
    "Сегодня утром Блюбелл заметили у гавани.",
    "Новые друзья делают город живым.",
    "На рынке пахнет свежей рыбой и приключениями."
  ],
  reward: [
    "Сокровище приятнее, когда друзья в безопасности.",
    "Этот сундук ждал умного путешественника.",
    "Городу досталась новая искра!",
    "Награды, заработанные доброй душой, — самые лучшие.",
    "Тюлень заслужил это. Каждый ответ был важен.",
    "Смотри, на что способны смелость и ум!",
    "Арктика теперь стала чуточку светлее.",
    "Заслуженная награда. Идём за следующей!"
  ]
};

const rescueLines = [
  "Thank you, Sausage! I thought I would never get off that ice floe!",
  "You found me! I saved this treasure just for you.",
  "That was brave and clever. I am moving to Arctic Town!",
  "I was chilly, but now I feel safe. Let's celebrate!"
];
const rescueLinesRu = [
  "Спасибо, Тюлень! Я думал, что никогда не выберусь с этой льдины!",
  "Ты нашёл меня! Я сохранил это сокровище специально для тебя.",
  "Это было храбро и умно. Я переезжаю в Арктический город!",
  "Мне было холодно, но теперь я в безопасности. Давай праздновать!"
];
function rescueLine() { const arr = currentLang === "ru" ? rescueLinesRu : rescueLines; return arr[Math.floor(Math.random()*arr.length)]; }

const animals = [
  ["Baby seal","Nori","Seal pups can recognize their mother's call."],
  ["Penguin","Pip","Penguins are excellent swimmers."],
  ["Puffin","Pebble","Puffins can hold many little fish at once."],
  ["Polar bear","Miska","Polar bears have wide paws for snow and ice."],
  ["Walrus","Wally","Walruses use their tusks to rest on ice."],
  ["Whale","Bluebell","Some whales sing songs that travel for miles."],
  ["Narwhal","Nova","A narwhal's tusk is a long tooth."],
  ["Arctic fox","Frost","Arctic foxes change coat color with the seasons."],
  ["Sea otter","Tumble","Sea otters often float on their backs."],
  ["Octopus","Octo","Octopuses have three hearts and can change color."]
].map((a,i) => ({ id:i, species:a[0], name:a[1], fact:a[2] }));

const buildings = ["Fish Market","Lighthouse","Aquarium","Seal House","Penguin Village","Harbor","Arctic Museum","Ice Castle"]
  .map((name,i) => ({ id:i, name, cost:(i+1)*3 }));
// S13: RU names — were never translated; the ghost-silhouette badge in Town
// and now the Build-mission goal icon both show this name to the player.
const buildingNamesRu = ["Рыбный рынок","Маяк","Океанариум","Дом тюленей","Деревня пингвинов","Гавань","Арктический музей","Ледяной замок"];

const shop = [
  ["Pirate Seal",   20,"costume","pirate"],
  ["Astronaut Seal",30,"costume","astronaut"],
  ["King Seal",     40,"costume","king"],
  ["Superhero Seal",45,"costume","superhero"],
  ["Sunny Hat",     12,"accessory","sunny"],
  ["Star Scarf",    16,"accessory","scarf"],
  ["Snow Goggles",  18,"accessory","goggles"],
  ["Tiny Fish Pet", 25,"pet","pet"],
  ["Guardian Cape", 0, "costume","guardiancape", true],
  // P9: economy expansion — 3 new buyable items, one per equip type, priced
  // above the existing top tier in their type so there's always a next
  // thing to save for even after owning everything above.
  ["Wizard Seal",   55,"costume","wizard"],
  ["Bow Tie",       14,"accessory","bowtie"],
  ["Snow Owl Pet",  32,"pet","owlpet"]
].map((s,i) => ({ id:i, name:s[0], cost:s[1], type:s[2], className:s[3], earnedOnly:!!s[4] }));

// P9: economy expansion — Town Decorations, a second coin sink alongside
// the costume shop. Purely cosmetic, no zone-collision logic needed (unlike
// costumes you simply collect them all). Anchored to the scene edges
// (bottom for ground props, top for the garland) rather than the building
// cluster — the buildings/friends overlap each other so densely (by
// design, resolved via z-index/DOM order) that there's no clean gap inside
// that area to anchor a new prop to without it disappearing behind one.
const decorations = [
  ["Snowman",        10, 6,  3, "bottom"],
  ["Ice Lantern",      8, 88, 4, "bottom"],
  ["Park Bench",      12, 27, 2, "bottom"],
  ["Ice Sculpture",   16, 51, 3, "bottom"],
  ["Garland Flags",   20, 38, 6, "top"],
].map((d,i) => ({ id:i, name:d[0], cost:d[1], left:d[2], pos:d[3], anchor:d[4] }));
const decorationNamesRu = ["Снеговик","Ледяной фонарь","Скамейка","Ледяная скульптура","Гирлянда флажков"];
function decorName(i) { return currentLang === "ru" ? (decorationNamesRu[i] || decorations[i].name) : decorations[i].name; }

const achievementNames = [
  "First Fish","First Correct Answer","10 Correct Answers","25 Correct Answers","50 Correct Answers",
  "100 Correct Answers","First Building","Town Starter","Busy Builder","First Rescue","Five Friends",
  "Animal Hero","First Star","Coin Collector","Treasure Keeper","Hint Helper","Brave Retry",
  "Snow Beach Scout","Fish Bay Sailor","Whale Coast Wonder","Penguin Island Pal","Octopus Cave Thinker",
  "Polar Academy Scholar","Northern Kingdom Knight","Arctic Champion","Master of Addition",
  "Master of Subtraction","Master of Multiplication","Division Diver","Pattern Finder","Equation Explorer",
  "Word Problem Wizard","Perfect Trip","Fast Flipper","Daily Visitor","Three Day Streak","Seven Day Streak",
  "Costume Collector","Pet Pal","Coin Spender","Star Saver","Fish Feast","Level 5","Level 10",
  "No Mistake Run","Comeback Kid","Super Solver","Guardian Helper","Town Complete","Guardian of the Arctic",
  "Two Week Streak","One Month Streak","Animal's Best Friend"
];

// P16: one emoji badge per achievement instead of a generic ⭐ for all 53 —
// cheap (no new SVG art), but gives each one a distinct, recognizable
// identity. Same order/index as achievementNames; streak-family badges
// intentionally share 🔥 (consistent iconography for one category, same
// idea as Duolingo reusing one streak icon across all its milestones).
const ACHIEVEMENT_ICONS = [
  "🐟","✅","🔟","🎯","🌟","💯","🏠","🏘️","🔨","🧡","👥",
  "🦸","⭐","🪙","💰","💡","💪","🏖️","⛵","🐳","🐧","🐙",
  "🎓","🏰","🏆","➕","➖","✖️","➗","🔮","🧮","📖","💎",
  "⚡","📅","🔥","🔥","👒","🐠","🛍️","✨","🍽️","5️⃣","🔝",
  "🥇","🔁","🧠","🛡️","🏙️","👑","🔥","🔥","🐾"
];

// ─── Daily special names ─────────────────────────────────────────────────────
const dailySpecialNames = [
  "Glitter Shell","Aurora Scarf Pin","Crystal Fish Badge","Snowflake Sticker",
  "Tiny Crown Charm","Moonlit Pebble","Golden Flipper Token"
];

// P16: one icon per daily-special instead of a generic ✨ for all of them.
const DAILY_SPECIAL_ICONS = {
  "Glitter Shell":"🐚", "Aurora Scarf Pin":"🧣", "Crystal Fish Badge":"💎",
  "Snowflake Sticker":"❄️", "Tiny Crown Charm":"👑", "Moonlit Pebble":"🌙",
  "Golden Flipper Token":"🏅"
};

// ─── Daily challenge narratives ──────────────────────────────────────────────
const dailyNarratives = [
  { who:"Pip",     text:"Pip needs help finding breakfast today. Answer 5 questions to fill the fish bowl!" },
  { who:"Nori",    text:"Nori spotted a storm cloud heading for the docks. Help secure everything in time!" },
  { who:"Bluebell",text:"Bluebell wants to teach you a new song. Solve 5 puzzles and learn the first verse!" },
  { who:"Pebble",  text:"Pebble lost their favourite pebble in the snow. Can you help find it in 5 answers?" },
  { who:"Miska",   text:"Miska set up an extra training session at the Academy. Show off your skills today!" },
  { who:"Nova",    text:"Nova is delivering supplies to the castle. Answer 5 questions and help carry the load!" },
  { who:"Tumble",  text:"Tumble is practising for the Arctic Games. Be their training partner for 5 rounds!" }
];

// ─── Word problem templates (P4) ─────────────────────────────────────────────
// Each entry: { make(a,b,char) → { text, answer, hint } }
// S9: RU name forms for the 9 mascots that can appear as `ch` in word
// problems. Nominative form is used as a sentence subject; genitive is
// used after "у" (possessive "X has..."), matching the declension style
// already established for these characters elsewhere in the game (e.g.
// "у Колбаски", "у Пипа", "у Нори" in the logic topic). Names that read
// as foreign loanwords in Russian (Nori, Bluebell, Pebble, Nova) stay
// indeclinable, same as already done for Nori/Pebble; native-sounding
// names (Колбаска, Пип, Миска, Тамбл) take regular Russian declension.
const NAME_RU = {
  Sausage:          { nom:"Колбаска",      gen:"Колбаски" },
  Pip:              { nom:"Пип",           gen:"Пипа" },
  Nori:             { nom:"Нори",          gen:"Нори" },
  Bluebell:         { nom:"Блюбелл",       gen:"Блюбелл" },
  Pebble:           { nom:"Пебл",          gen:"Пебл" },
  "Professor Octo": { nom:"Профессор Окто",gen:"Профессора Окто" },
  Miska:            { nom:"Миска",         gen:"Миски" },
  Nova:             { nom:"Нова",          gen:"Нова" },
  Tumble:           { nom:"Тамбл",         gen:"Тамбла" },
};
function ruCh(ch, grammaticalCase) {
  const forms = NAME_RU[ch];
  return forms ? forms[grammaticalCase] : ch;
}

const wordTemplates = [
  // Addition
  { op:"add", make:(a,b,ch,isRu) => isRu
      ? { text:`У Колбаски было ${a} рыбок, а у ${ruCh(ch,"gen")} было ${b}. Сколько рыбок всего?`, answer:a+b, hint:"Слово «вместе» значит сложить." }
      : { text:`Sausage caught ${a} fish and ${ch} caught ${b}. How many fish together?`, answer:a+b, hint:"Together means add." } },
  { op:"add", make:(a,b,ch,isRu) => isRu
      ? { text:`На одной льдине ${a} пингвинов, а на другой ${b}. Сколько пингвинов всего?`, answer:a+b, hint:"Сосчитай обе группы вместе." }
      : { text:`There are ${a} penguins on one iceberg and ${b} on another. How many penguins in total?`, answer:a+b, hint:"Count both groups together." } },
  { op:"add", make:(a,b,ch,isRu) => isRu
      ? { text:`У ${ruCh(ch,"gen")} было ${a} снежков на левом холме и ${b} на правом. Сколько снежков всего?`, answer:a+b, hint:"Сложи обе группы." }
      : { text:`${ch} found ${a} snowballs on the left hill and ${b} on the right hill. How many altogether?`, answer:a+b, hint:"Add the two groups." } },
  { op:"add", make:(a,b,ch,isRu) => isRu
      ? { text:`В воде плавает ${a} тюленей, и ещё ${b} прыгают в воду. Сколько тюленей в воде теперь?`, answer:a+b, hint:"Прибавь тех, кто прыгнул в воду." }
      : { text:`${a} seals are swimming and ${b} more jump in. How many seals are in the water now?`, answer:a+b, hint:"Add the ones that jumped in." } },
  { op:"add", make:(a,b,ch,isRu) => isRu
      ? { text:`На лодке ${a} ящиков, и ещё ${b} грузят у пристани. Сколько ящиков теперь на лодке?`, answer:a+b, hint:"Прибавь новые ящики к старым." }
      : { text:`The boat carries ${a} crates and picks up ${b} more at the dock. How many crates on board?`, answer:a+b, hint:"Add the new crates to the old ones." } },
  { op:"add", make:(a,b,ch,isRu) => isRu
      ? { text:`В понедельник нашли ${a} сокровищ, а во вторник ${b}. Сколько сокровищ нашли всего?`, answer:a+b, hint:"Сложи количество за оба дня." }
      : { text:`${a} treasures were found on Monday and ${b} on Tuesday. How many treasures found in total?`, answer:a+b, hint:"Add both days' totals." } },
  // Subtraction
  { op:"sub", make:(a,b,ch,isRu) => isRu
      ? { text:`У ${ruCh(ch,"gen")} было ${a} рыбок, и ${b} из них достались друзьям. Сколько рыбок осталось у ${ruCh(ch,"gen")}?`, answer:a-b, hint:"Поделиться значит отнять." }
      : { text:`${ch} had ${a} fish but shared ${b} with friends. How many fish does ${ch} have left?`, answer:a-b, hint:"Sharing means taking away." } },
  { op:"sub", make:(a,b,ch,isRu) => isRu
      ? { text:`На льду было ${a} пингвинов. ${b} из них нырнули в океан. Сколько пингвинов осталось на льду?`, answer:a-b, hint:"Отними тех, кто нырнул." }
      : { text:`There were ${a} penguins on the ice. ${b} dived into the ocean. How many are left on the ice?`, answer:a-b, hint:"Subtract the ones that dived away." } },
  { op:"sub", make:(a,b,ch,isRu) => isRu
      ? { text:`У Колбаски было ${a} снежков. Ветер унёс ${b} из них. Сколько снежков осталось?`, answer:a-b, hint:"Отними то, что унёс ветер." }
      : { text:`Sausage had ${a} snowballs. A gust of wind blew away ${b}. How many snowballs are left?`, answer:a-b, hint:"Take away what the wind stole." } },
  { op:"sub", make:(a,b,ch,isRu) => isRu
      ? { text:`На маяке было ${a} свечей. ${b} из них погасли во время бури. Сколько свечей всё ещё горит?`, answer:a-b, hint:"Отними погасшие свечи." }
      : { text:`The lighthouse had ${a} candles. ${b} burned out during the storm. How many are still lit?`, answer:a-b, hint:"Subtract the candles that went out." } },
  { op:"sub", make:(a,b,ch,isRu) => isRu
      ? { text:`На этой неделе кита «видели» ${a} раз, но ${b} из этих раз оказались просто облаками. Сколько раз видели настоящего кита?`, answer:a-b, hint:"Отними ложные наблюдения." }
      : { text:`A whale was spotted ${a} times this week, but ${b} sightings were just clouds. Real sightings?`, answer:a-b, hint:"Take away the false sightings." } },
  // Multiplication
  { op:"mul", make:(a,b,ch,isRu) => isRu
      ? { text:`У ${ruCh(ch,"gen")} есть ${a} корзин, и в каждой по ${b} рыбок. Сколько рыбок всего?`, answer:a*b, hint:"Равные группы — умножай!" }
      : { text:`${ch} has ${a} baskets with ${b} fish in each basket. How many fish altogether?`, answer:a*b, hint:"Equal groups — multiply!" } },
  { op:"mul", make:(a,b,ch,isRu) => isRu
      ? { text:`${a} лодок, и в каждой по ${b} пингвинов. Сколько пингвинов на всех лодках?`, answer:a*b, hint:"В каждой лодке одинаковое количество." }
      : { text:`${a} boats each carry ${b} penguins. How many penguins are on the boats in total?`, answer:a*b, hint:"Each boat has the same number." } },
  { op:"mul", make:(a,b,ch,isRu) => isRu
      ? { text:`Колбаска съезжает с горки ${a} раз в день, и так ${b} дней подряд. Сколько всего раз она съехала?`, answer:a*b, hint:"Каждый день одинаковое количество." }
      : { text:`Sausage slides down the hill ${a} times a day for ${b} days. How many slides total?`, answer:a*b, hint:"Same amount each day." } },
  { op:"mul", make:(a,b,ch,isRu) => isRu
      ? { text:`Есть ${a} иглу, и в каждом живёт по ${b} тюленей. Сколько тюленей всего?`, answer:a*b, hint:"Умножь, чтобы сосчитать равные группы." }
      : { text:`There are ${a} igloos with ${b} seals living in each one. How many seals in total?`, answer:a*b, hint:"Multiply to count equal groups." } },
  // Division
  { op:"div", make:(a,b,ch,isRu) => isRu
      ? { text:`У ${ruCh(ch,"gen")} есть ${a*b} рыбок, чтобы поровну разделить между ${b} друзьями. Сколько рыбок получит каждый друг?`, answer:a, hint:"Разделить значит поделить поровну." }
      : { text:`${ch} has ${a*b} fish to share equally among ${b} friends. How many fish does each friend get?`, answer:a, hint:"Divide means sharing equally." } },
  { op:"div", make:(a,b,ch,isRu) => isRu
      ? { text:`${a*b} пингвинов встают в ряды по ${b}. Сколько получилось рядов?`, answer:a, hint:`Подумай, сколько групп по ${b} получится.` }
      : { text:`${a*b} penguins march into rows of ${b}. How many rows are there?`, answer:a, hint:`Think how many groups of ${b} fit.` } },
  { op:"div", make:(a,b,ch,isRu) => isRu
      ? { text:`Колбаска испекла ${a*b} снежных угощений и разложила по ${b} штук на каждую тарелку. Сколько получилось тарелок?`, answer:a, hint:"Раздели угощения на количество на тарелке." }
      : { text:`Sausage baked ${a*b} snowball treats and put ${b} on each plate. How many plates?`, answer:a, hint:"Divide the treats by the plate size." } }
];

function generateWordProblem(level) {
  const isRu = currentLang === "ru";
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

  const prob = tpl.make(a, b, char, isRu);
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
  try { localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)); } catch {}
}

function getActiveProfileId() {
  try { return localStorage.getItem(ACTIVE_KEY) || null; } catch { return null; }
}

function setActiveProfileId(id) {
  try { localStorage.setItem(ACTIVE_KEY, id); } catch {}
}

function createProfile(name, emoji) {
  return {
    id:        Date.now().toString(36) + Math.random().toString(36).slice(2,6),
    name:      name || "Player",
    emoji:     emoji || "🦭",
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
    merged.startedAt = Date.now();
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
  parentGateVerified = false; // re-lock the Parent tab for the newly active player
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
  // P13: startedAt is a runtime checkpoint ("when did THIS session begin"),
  // not something meant to survive a save/reload. Without this reset, a
  // profile reopened a day later would compute its first elapsed-time as
  // the entire gap since it was last closed, and silently fold that whole
  // gap into Time Played — this, not just backgrounded tabs, is the main
  // reason that stat could read in the thousands of minutes.
  merged.startedAt = Date.now();
  return merged;
}

// ─── State ───────────────────────────────────────────────────────────────────
let state = defaultState();
let selectedWorld = 0;
let currentProblem = null;
let trip = { active:false, world:0, mission:0, solved:0, needed:3, correct:0, daily:false, mistakes:0, stormIntensity:100, combo:0 };
let audioReady = false;
let audioCtx = null;
let miniGameTimer = null;
let parentGateVerified = false; // re-armed each app load and on profile switch
let parentGateAnswer = null;
let _pageActive = true; // P13: tracks whether the tab/window is actually in front of the player

function $(id) { return document.getElementById(id); }
// Escapes user-typed text (currently: profile names) before it's interpolated
// into an innerHTML template, so a name containing "<" or "&" can't break the
// markup or inject elements. Developer-authored strings (animal/building/
// shop names etc.) come from constant arrays, not player input, so they
// don't need this.
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[ch]));
}

function defaultState() {
  const topics = {};
  ["add10","add20","sub20","add100","sub100","carryBorrow","multiply","divide","mixed","missing","patterns","logic","equations","word","adaptive","add3","brackets","orderOfOps","fractions",
   "twoStep","advEquations","reverseMul","fracCompare"]
    .forEach(t => topics[t] = { correct:0, wrong:0, time:0, fast:0 });
  return {
    fish:0, coins:0, stars:0, xp:0, level:1, unlockedWorld:0,
    solved:0, correct:0, wrong:0, timePlayed:0, startedAt:Date.now(),
    topics, buildings:[], animals:[], shop:[], achievements:[], decorations:[],
    muted:false, volume:1.0, streak:{ count:0, last:"", days:[], freezeTokens:1, longestStreak:0 }, daily:{ date:"", solved:0, claimed:false },
    hintsUsed:0, perfectTrips:0, missions:{}, equipped:{ costume:null, accessory:null, pet:null },
    miniGamesPlayed:0, rareTreasures:0, visitors:[], specialCosmetics:[],
    dialogueHistory:{}, dailySpecial:"", doubleRewardsUntil:0, mysteryVisits:0, animalFeeds:{},
    onboarded: false, gameVersion: GAME_VERSION, guardianCrowned:false
  };
}

function loadState() { return defaultState(); } // legacy shim — not used after profile init

let _saveTimer = null;
function save(immediate = false) {
  // P13: previously this always added wall-clock time since the last save,
  // so "Time Played" kept growing even with the tab backgrounded or the
  // window unfocused (e.g. a phone left on the lock screen with the PWA
  // still "open"). Now it only accumulates while the page is actually the
  // active, visible thing — see pauseTimeTracking()/resumeTimeTracking().
  if (_pageActive) {
    state.timePlayed += Math.floor((Date.now() - state.startedAt) / 1000);
    state.startedAt = Date.now();
  }
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
    { visual:"🧠", title:"Comparing & the middle number", body:"To find the biggest, compare every number and pick the largest. To find the middle (median), line all the numbers up from smallest to biggest — the one in the middle is the median.", example:"8, 20, 12  →  in order: 8, 12, 20  →  middle = 12" },
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
// S8: RU mirror of ISLAND_BRIEFINGS — same keys/order/visuals, math terms kept
// accurate (this is teaching content, not flavour text). Picked via briefingsFor().
const ISLAND_BRIEFINGS_RU = {
  0: [
    { visual:"🌊", title:"Сложение чисел", body:"Когда мы складываем, мы считаем дальше, чтобы найти сумму. Называй большее число первым — так быстрее!", example:"6 + 3 = ?  →  Начни с 6, посчитай дальше на 3  →  9" },
    { visual:"🐚", title:"Вычитание чисел", body:"Вычитание — это когда мы отнимаем. Подумай: какое число нужно ПРИБАВИТЬ, чтобы вернуться к началу?", example:"8 - 5 = ?  →  5 + ? = 8  →  3" },
  ],
  1: [
    { visual:"🐟", title:"Сложение до 100", body:"Сначала складывай десятки, потом единицы. Так числа остаются маленькими и простыми!", example:"34 + 25  →  30+20=50,  4+5=9  →  59" },
    { visual:"🚢", title:"Переход через десяток", body:"Когда единицы в сумме дают 10 или больше, лишний десяток переносится в столбец десятков.", example:"47 + 36  →  7+6=13, пишем 3, переносим 1  →  83" },
  ],
  2: [
    { visual:"🐳", title:"Умножение", body:"Умножение — это короткий способ складывать одно и то же число много раз.", example:"4 × 3 = 4 + 4 + 4 = 12\n(3 группы по 4)" },
    { visual:"🐠", title:"Деление", body:"Деление — это разделение на равные группы. Это противоположность умножению!", example:"12 ÷ 4 = ?  →  4 × ? = 12  →  3" },
  ],
  3: [
    { visual:"🐧", title:"Три числа", body:"Складываешь три числа? Сложи первые два, потом добавь третье. Шаг за шагом!", example:"5 + 7 + 3  →  12 + 3  →  15" },
    { visual:"❓", title:"Найди число", body:"Найди то, что прячется! Вычитай, чтобы найти спрятанное число.", example:"8 + ☐ = 13  →  13 - 8 = 5  →  ☐ = 5" },
  ],
  4: [
    { visual:"🔮", title:"Числовые закономерности", body:"Закономерность повторяется или растёт одинаково каждый раз. Найди правило и угадай следующее число!", example:"2, 4, 8, 16, ?  →  Каждое число удваивается  →  32" },
    { visual:"🐙", title:"Сначала скобки!", body:"Всегда сначала решай то, что внутри скобок (   ), а потом всё остальное.", example:"(3 + 4) × 2  →  7 × 2  →  14" },
    { visual:"🧠", title:"Сравнение и среднее число", body:"Чтобы найти самое большое число, сравни все числа и выбери наибольшее. Чтобы найти середину (медиану), расставь все числа по порядку от меньшего к большему — число посередине и есть медиана.", example:"8, 20, 12  →  по порядку: 8, 12, 20  →  середина = 12" },
  ],
  5: [
    { visual:"🔭", title:"Уравнения с x", body:"x — это таинственное число. Чтобы найти его, сделай противоположное действие с обеих сторон.", example:"x + 7 = 15  →  x = 15 - 7  →  x = 8" },
    { visual:"📐", title:"Порядок действий", body:"× и ÷ всегда выполняются раньше + и −, если нет скобок.", example:"3 + 4 × 2  →  3 + 8  →  11  (а НЕ 14)" },
  ],
  6: [
    { visual:"👑", title:"Дроби", body:"Дробь показывает часть целого. Нижнее число — сколько всего равных частей. Верхнее — сколько частей у тебя есть.", example:"¼ от 20  →  20 ÷ 4  →  5" },
    { visual:"📖", title:"Текстовые задачи", body:"Читай внимательно. Подчеркни числа. Решай: складывать, вычитать, умножать или делить?", example:"«5 коробок, по 4 рыбки» → 5 × 4 = 20 рыбок" },
  ],
  7: [
    { visual:"🏆", title:"Режим чемпиона!", body:"Каждый вопрос может быть на любую тему. Твои самые слабые темы появляются чаще — чтобы помочь тебе стать лучше!", example:"Не останавливайся — Арктике нужен её Хранитель! 🦭" },
  ],
};
function briefingsFor(worldId) { return (currentLang === "ru" ? ISLAND_BRIEFINGS_RU : ISLAND_BRIEFINGS)[worldId]; }

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

// ── Consecutive mistake tracker ───────────────────────────────
let _consecutiveMistakes = 0;

// ── Island Briefing functions ─────────────────────────────────
let _briefingSlide = 0;
let _briefingSlides = [];
let _briefingWorldId = 0;

function showIslandBriefing(worldId) {
  const slides = briefingsFor(worldId);
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
  if (_consecutiveMistakes < 2) return;          // only after 2nd mistake
  const hint = SMART_HINTS[topic];
  if (!hint) return;
  const panel = $("smartHintPanel");
  if (!panel) return;
  $("smartHintTitle").textContent   = hint.title;
  // P12: topics like "logic" bundle several different sub-skills (comparing,
  // adding three groups, finding a median) under one generic hint. The
  // generic text could describe a completely different sub-skill than the
  // one the player actually got wrong, so prefer the hint generated for
  // THIS specific question when available, and keep the curated worked
  // example as supporting context either way.
  $("smartHintText").textContent    = (currentProblem && currentProblem.hint) || hint.text;
  $("smartHintExample").textContent = hint.example || "";
  panel.hidden = false;
  // auto-hide after 12 seconds
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
// S8: RU mirror — same characters/keys/order, picked via rescueDialoguesFor().
const RESCUE_DIALOGUES_RU = {
  Pip:           ["Спасибо, {name}! Я думал, что этот лёд никогда не растает!", "Ты пришёл сюда ради меня? Ты потрясающий, {name}!", "Мои ласты замёрзли, но сердце греется — благодаря тебе!"],
  Nori:          ["Рыбки в безопасности благодаря тебе, {name}!", "{name}! Ты решил все задачи — я знал, что ты справишься!", "Я так долго ждал. Спасибо тебе, смелый путешественник!"],
  Bluebell:      ["БУУУХ! (Это по-китовьи значит СПАСИБО, {name}!)", "Весь океан услышал твои умные ответы!", "Ты лучший математик Арктики, {name}!"],
  Pebble:        ["Парад пингвинов снова может шагать!", "{name}, твой мозг больше этого айсберга!", "Я считал каждый твой ответ — ты был великолепен!"],
  "Professor Octo":["Твои вычисления… *поправляет очки* …безупречны.", "Я проверил 847 путешественников. Ты, {name}, особенный.", "Восхитительно! Юный математик с настоящим талантом!"],
  Miska:         ["Ты прошёл испытание Полярной академии, {name}!", "Я никогда не видел такой решительности. Ты заслужил это!", "У Арктики новый чемпион. Добро пожаловать в академию!"],
  Nova:          ["{name}! Я три раза обежал остров от радости!", "Лисий нюх чувствует умный ум — а твой самый умный!", "Ты нашёл меня! Я прятался, но, честно говоря… я так рад."],
  Tumble:        ["ШЛЁП! Это я прыгаю от радости, {name}!", "Я плыл сюда на льдине, ожидая героя вроде тебя!", "Морские выдры будут вечно петь песни о {name}!"],
};

function showRescueCelebration(worldId, playerName) {
  const world     = worlds[worldId];
  const charName  = world?.character || "Friend";
  const emoji     = ["🐧","🐟","🐳","🐧","🐙","🦭","🦊","🦦","🦭"][worldId] || "🌟";
  const dialogues = (currentLang === "ru" ? RESCUE_DIALOGUES_RU[charName] : RESCUE_DIALOGUES[charName]) || [`Thank you, ${playerName}!`];
  const quote     = dialogues[Math.floor(Math.random()*dialogues.length)]
                      .replace(/{name}/g, playerName || "Explorer");

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
  // Disable snow animation on low-end devices or if user prefers reduced motion
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowEnd = navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 2;
  if (prefersReduced || lowEnd) {
    const snowEl = document.querySelector(".snow");
    if (snowEl) snowEl.remove();
  }
  renderMap();
  renderAll();
  attachEvents();
  startTimer();
  attachTimeTracking();
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
    const safeName = escapeHtml(p.name);
    return `<div class="profile-card" data-pid="${p.id}">
      <button class="profile-play-btn" data-pid="${p.id}" aria-label="Play as ${safeName}">
        <span class="profile-card-emoji">${p.emoji}</span>
        <div class="profile-card-info">
          <strong class="profile-card-name">${safeName}</strong>
          <span class="profile-card-sub">Level ${p.state?.level||1} · ${p.state?.animals?.length||0}/${animals.length} friends · ${last}</span>
        </div>
      </button>
      <button class="profile-edit-btn" data-pid="${p.id}" aria-label="Edit ${safeName}">✏️</button>
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

  title.textContent     = existing ? "Edit Player" : "New Player";
  nameInp.value         = existing?.name || "";

  // Emoji picker
  emojiRow.innerHTML = PROFILE_EMOJIS.map(e =>
    `<button class="emoji-pick-btn ${e===chosenEmoji?"selected":""}" data-emoji="${e}" aria-label="${e}">${e}</button>`
  ).join("");
  emojiRow.querySelectorAll(".emoji-pick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      chosenEmoji = btn.dataset.emoji;
      emojiRow.querySelectorAll(".emoji-pick-btn").forEach(b => b.classList.toggle("selected", b===btn));
    });
  });

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
      const p = createProfile(name, chosenEmoji);
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
  const emojiEl = $("profileTopbarEmoji");
  const nameEl  = $("profileTopbarName");
  if (emojiEl) emojiEl.textContent = prof?.emoji || "🦭";
  if (nameEl)  nameEl.textContent  = prof?.name  || "Player";
}


// ── About / Privacy / Credits modal ──────────────────────────────────────────
function showAboutModal() {
  const modal = $("aboutModal");
  if (!modal) return;
  const vEl = $("aboutVersion");
  if (vEl) vEl.textContent = GAME_VERSION;
  switchAboutTab("about");
  const volSlider = $("volumeSlider");
  if (volSlider) {
    volSlider.value = Math.round((state.volume ?? 1.0) * 100);
    if (!volSlider.dataset.bound) {
      volSlider.dataset.bound = "1";
      volSlider.addEventListener("input", () => {
        state.volume = Number(volSlider.value) / 100;
        save();
      });
    }
  }
  modal.hidden = false;
}

function switchAboutTab(tab) {
  ["about","privacy","credits"].forEach(t => {
    const panel = $("aboutTab" + t.charAt(0).toUpperCase() + t.slice(1));
    if (panel) panel.hidden = (t !== tab);
    const btn = document.querySelector(`.about-tab-btn[data-tab="${t}"]`);
    if (btn) btn.classList.toggle("active", t === tab);
  });
}

function showWelcomeBack() {
  const overlay = $("welcomeBackOverlay");
  if (!overlay) return;
  const world  = worlds[Math.min(state.unlockedWorld, worlds.length-1)];
  const wName  = t(`world${world.id}`) || world.name;
  const toNext = 100 - (state.xp % 100);
  const streak = state.streak.count;
  const friendCount = state.animals.length;
  const ru = currentLang === "ru";
  const streakMsg  = streak >= 3 ? (ru ? `🔥 Серия ${streak} дней — продолжай!` : `🔥 ${streak}-day streak — keep it up!`) :
                     streak === 1 ? (ru ? `Ты вернулся! Серия начата.` : `You came back! Streak started.`) :
                                     (ru ? `Возвращайся завтра, чтобы начать серию!` : `Come back tomorrow to start a streak!`);
  overlay.innerHTML = `
    <div class="welcome-back-box">
      <div class="wb-seal">${animalSvgLarge(1,"Pip")}</div>
      <h2 class="wb-title">${ru ? "С возвращением!" : "Welcome back!"}</h2>
      <div class="wb-stats">
        <div class="wb-stat"><span class="wb-num">${wName}</span><span class="wb-lbl">${ru ? "текущий остров" : "current island"}</span></div>
        <div class="wb-stat"><span class="wb-num">${state.level}</span><span class="wb-lbl">${ru ? "уровень" : "level"}</span></div>
        <div class="wb-stat"><span class="wb-num">${friendCount}/${animals.length}</span><span class="wb-lbl">${ru ? "друзей спасено" : "friends rescued"}</span></div>
      </div>
      <p class="wb-streak">${streakMsg}</p>
      <p class="wb-xp">${ru ? `${toNext} правильных ответов до уровня ${state.level+1}!` : `${toNext} correct answers to level ${state.level+1}!`}</p>
      <button class="primary wb-btn" id="wbCloseBtn">${ru ? "Поехали! 🚀" : "Let's go! 🚀"}</button>
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
  $("rewardClose").addEventListener("click",       () => $("rewardModal").hidden = true);
  $("exportBtn").addEventListener("click",         exportProgress);
  $("importBtn").addEventListener("click",         importProgress);
  $("resetStatsBtn").addEventListener("click",     resetStatistics);
  $("newAdventureBtn").addEventListener("click",   newAdventure);
  $("resetAllBtn").addEventListener("click",       resetEverything);
  $("muteBtn").addEventListener("click",           () => { state.muted = !state.muted; save(); renderHeader(); });
  $("menuBtn").addEventListener("click",           () => $("tabs").classList.toggle("open"));
  // P14: Lucky Catch bonus game
  const luckyCatchEntryBtn = $("luckyCatchEntryBtn");
  const luckyCatchClose    = $("luckyCatchClose");
  if (luckyCatchEntryBtn) luckyCatchEntryBtn.addEventListener("click", openLuckyCatchEntry);
  if (luckyCatchClose)    luckyCatchClose.addEventListener("click", closeLuckyCatch);
  document.querySelectorAll(".tab").forEach(btn => btn.addEventListener("click", () => switchView(btn.dataset.view)));
  document.addEventListener("pointerdown", initAudio, { once:true });
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
  // P11: parental gate (math-problem check before entering Parent dashboard)
  const gateSubmit = $("parentGateSubmit");
  const gateCancel = $("parentGateCancel");
  const gateInput  = $("parentGateInput");
  if (gateSubmit) gateSubmit.addEventListener("click", submitParentGate);
  if (gateCancel) gateCancel.addEventListener("click", closeParentGate);
  if (gateInput)  gateInput.addEventListener("keydown", e => { if (e.key === "Enter") submitParentGate(); });
  // Exit-mission confirmation (custom modal, replaces native confirm())
  const exitConfirmBtn = $("exitMissionConfirmBtn");
  const exitCancelBtn  = $("exitMissionCancelBtn");
  if (exitConfirmBtn) exitConfirmBtn.addEventListener("click", confirmExitMission);
  if (exitCancelBtn)  exitCancelBtn.addEventListener("click", closeExitMissionModal);
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
  // P11: simple parental gate — a quick math problem only an adult/older
  // child could reliably solve, shown once per app session (or until the
  // active profile changes). Keeps curious kids from wandering into the
  // Parent dashboard/reset tools without needing a stored PIN to manage.
  if (id === "parent" && !parentGateVerified) { showParentGate(); return; }
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.view === id));
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === id));
  if (id === "town") speak("town");
  if (id === "adventure") startWorldMusic(selectedWorld);
  else stopWorldMusic();
  renderHeader();
  const renderer = SECTION_RENDERERS[id];
  if (renderer) renderer();
}

function showParentGate() {
  const a = 6 + Math.floor(Math.random()*4);  // 6-9
  const b = 7 + Math.floor(Math.random()*5);  // 7-11
  parentGateAnswer = a * b;
  const q = $("parentGateQuestion");
  if (q) q.textContent = currentLang === "ru"
    ? `Чтобы продолжить, решите: ${a} × ${b} = ?`
    : `To continue, solve: ${a} × ${b} = ?`;
  const input = $("parentGateInput");
  if (input) input.value = "";
  const err = $("parentGateError");
  if (err) err.hidden = true;
  const modal = $("parentGateModal");
  if (modal) modal.hidden = false;
  setTimeout(() => $("parentGateInput")?.focus(), 60);
}

function closeParentGate() {
  const modal = $("parentGateModal");
  if (modal) modal.hidden = true;
}

function submitParentGate() {
  const input = $("parentGateInput");
  const val = Number(input ? input.value : NaN);
  if (val === parentGateAnswer) {
    parentGateVerified = true;
    closeParentGate();
    switchView("parent");
  } else {
    const err = $("parentGateError");
    if (err) err.hidden = false;
    react("sad");
  }
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
  const badge = $("guardianBadge");
  if (badge) badge.hidden = !state.guardianCrowned;
}

function missionKey(worldId = selectedWorld) { return `w${worldId}`; }
function completedMissions(worldId = selectedWorld) { return Math.min(5, state.missions[missionKey(worldId)] || 0); }
function nextMission(worldId = selectedWorld) { return Math.min(4, completedMissions(worldId)); }

function renderMap() {
  $("worldMap").innerHTML = worlds.map(world => {
    const locked   = world.id > state.unlockedWorld;
    const done     = completedMissions(world.id);
    const nameKey  = `world${world.id}`;
    const wName    = t(nameKey) || world.name;
    const levelBadge = locked
      ? `<small>${currentLang === "ru" ? "Ур." : "Lv"} ${recommendedLevels[world.id]}</small>`
      : "";
    return `<button class="island island-${world.id} ${locked?"locked":""} ${world.id===selectedWorld?"selected":""}" data-world="${world.id}" aria-label="${wName}, ${done} of 5 missions complete${locked?" - locked":""}">
      ${islandSvg(world,locked)}<span>${world.id+1}. ${wName}${levelBadge}</span>
    </button>`;
  }).join("");
  document.querySelectorAll(".island").forEach(btn => btn.addEventListener("click", () => chooseIsland(Number(btn.dataset.world))));
  moveTravelSeal();
  drawIslandPath();
}

function chooseIsland(id) {
  const world = worlds[id];
  if (id > state.unlockedWorld) {
    // S5: soft lock — let curious/advanced kids explore ahead of the usual
    // order. Confirming must actually open the island (not just preview it),
    // or the lock icon never goes away and it feels broken on revisit.
    const rec  = recommendedLevels[id];
    const name = t(`world${id}`) || world.name;
    const msg  = t("aheadConfirm")
      .replace("{name}", name).replace("{rec}", rec).replace("{level}", state.level);
    if (!confirm(msg)) return;
    state.unlockedWorld = Math.max(state.unlockedWorld, id);
    save(true);
  }
  selectedWorld = id;
  startWorldMusic(id);
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
  const seal = $("travelSeal");
  const panel = document.querySelector(".map-panel");
  const islandBtn = document.querySelector(`[data-world="${selectedWorld}"]`);
  if (!seal || !panel) return;
  if (!islandBtn) { seal.style.left = "8%"; seal.style.top = "62%"; return; }
  // S9: was a hand-tuned percentage table from an older scattered island
  // layout — never updated when islands moved into a CSS grid, so the seal
  // drifted away from whichever island was actually selected. Now it reads
  // the island's real rendered position, so it can't go stale again.
  const panelRect  = panel.getBoundingClientRect();
  const islandRect = islandBtn.getBoundingClientRect();
  const left = ((islandRect.left + islandRect.width * 0.12 - panelRect.left) / panelRect.width) * 100;
  const top  = ((islandRect.top  + islandRect.height * 0.78 - panelRect.top) / panelRect.height) * 100;
  seal.style.left = `${left}%`;
  seal.style.top  = `${top}%`;
}

// S18: dashed trail connecting the islands in order, like the path on a
// game world-map. Reuses the exact same "read real rendered positions via
// getBoundingClientRect" approach moveTravelSeal() already relies on above,
// so it lines up correctly at any screen size instead of guessing fixed
// percentages. The SVG's own viewBox is set to the panel's actual current
// pixel size, so the stroke never gets stretched/distorted.
function drawIslandPath() {
  const svg   = $("islandPathSvg");
  const panel = document.querySelector(".map-panel");
  if (!svg || !panel) return;
  const panelRect = panel.getBoundingClientRect();
  if (!panelRect.width || !panelRect.height) return;
  svg.setAttribute("viewBox", `0 0 ${panelRect.width} ${panelRect.height}`);
  const points = worlds.map(w => {
    const btn = document.querySelector(`[data-world="${w.id}"]`);
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    const x = r.left + r.width * 0.5 - panelRect.left;
    const y = r.top  + r.height * 0.35 - panelRect.top;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).filter(Boolean);
  svg.innerHTML = points.length < 2 ? "" :
    `<polyline points="${points.join(" ")}" fill="none" stroke="#ffffff" stroke-opacity=".55" stroke-width="4" stroke-dasharray="9 9" stroke-linecap="round"/>`;
}

// S17: every decor shape has a dark outline + a fill that's deliberately
// NOT the same as the hill's own colour, so the icon doesn't blend
// invisibly into its own hill. Hoisted to module scope (was local to
// islandSvg()) so islandWatermarkSvg() can reuse the same per-island
// emblems as a cheap "this screen belongs to this island" accent
// elsewhere, without redrawing anything new.
const ISLAND_DECOR_STROKE = `stroke="#1d3a4a" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
const ISLAND_DECOR = [
  // 0 Snow Beach — sun + scallop shell
  `<circle cx="118" cy="40" r="13" fill="#ffd45a" ${ISLAND_DECOR_STROKE}/>
   <path d="M70 84Q70 56 90 50Q110 56 110 84Z" fill="#fff" ${ISLAND_DECOR_STROKE}/>
   <path d="M90 50V84M80 53V82M100 53V82" stroke="#ffb74d" stroke-width="2.5"/>`,
  // 1 Fish Bay — a little fish (warm orange, pops against the teal hill)
  `<ellipse cx="92" cy="55" rx="26" ry="15" fill="#ff9f4a" ${ISLAND_DECOR_STROKE}/>
   <path d="M66 55 42 40 48 55 42 70Z" fill="#ff9f4a" ${ISLAND_DECOR_STROKE}/>
   <circle cx="110" cy="50" r="3.5" fill="#1d3a4a"/>`,
  // 2 Whale Coast — a dark slate tail fluke, classic whale-against-sky look
  `<path d="M90 88C73 60 53 44 43 24c20 10 35 25 47 41 12-16 27-31 47-41-10 20-30 36-47 64Z" fill="#2c4a63" ${ISLAND_DECOR_STROKE}/>`,
  // 3 Penguin Islands — a standing penguin (already had good contrast)
  `<ellipse cx="90" cy="62" rx="20" ry="28" fill="#26364a" ${ISLAND_DECOR_STROKE}/>
   <ellipse cx="90" cy="66" rx="11" ry="20" fill="#fff"/>
   <path d="M82 38 90 29 98 38Z" fill="#ffb847" ${ISLAND_DECOR_STROKE}/>
   <circle cx="85" cy="42" r="2" fill="#fff"/><circle cx="95" cy="42" r="2" fill="#fff"/>`,
  // 4 Octopus Cave — coral octopus, clearly different from the teal hill
  `<ellipse cx="90" cy="48" rx="24" ry="20" fill="#ff8a73" ${ISLAND_DECOR_STROKE}/>
   <path d="M68 60q-10 10-4 20M79 64q-6 14 2 20M90 66q0 16 0 22M101 64q6 14-2 20M112 60q10 10 4 20"
         fill="none" stroke="#ff8a73" stroke-width="8" stroke-linecap="round"/>
   <circle cx="82" cy="44" r="3" fill="#1d3a4a"/><circle cx="98" cy="44" r="3" fill="#1d3a4a"/>`,
  // 5 Polar Academy — deep navy mortarboard cap, gold tassel
  `<path d="M90 38 130 52 90 66 50 52Z" fill="#274b73" ${ISLAND_DECOR_STROKE}/>
   <rect x="84" y="66" width="12" height="16" rx="2" fill="#fff" ${ISLAND_DECOR_STROKE}/>
   <circle cx="90" cy="38" r="3" fill="#ffd45a"/>
   <path d="M122 54v13q0 5-8 5t-8-5v-9" fill="none" stroke="#ffd45a" stroke-width="2.5"/>`,
  // 6 Northern Kingdom — gold crown (crowns read as crowns when gold, not purple)
  `<path d="M55 80 65 45 80 65 90 35 100 65 115 45 125 80Z" fill="#ffd45a" ${ISLAND_DECOR_STROKE}/>
   <rect x="55" y="78" width="70" height="10" rx="3" fill="#ffd45a" ${ISLAND_DECOR_STROKE}/>
   <circle cx="90" cy="35" r="4" fill="#ff5a7a"/>`,
  // 7 Arctic Champion — gold star (matches the game's own star icon colour)
  `<path d="M90 28 100 52 126 54 106 70 114 96 90 80 66 96 74 70 54 54 80 52Z" fill="#ffd45a" ${ISLAND_DECOR_STROKE}/>`
];

// P5 (lite): small ground-level details for the mission scene, tied to each
// island's theme — the corner watermark above already carries the island's
// "emblem", this is the cheap, low-opacity texture at snow/water level that
// was missing (footprints, bubbles, a wave line...). Same budget as the
// watermark: a handful of simple shapes, no new art assets.
const ISLAND_GROUND_ACCENT = [
  // 0 Snow Beach — a trail of paw prints + a tiny shell
  `<g fill="#d9a35c" opacity=".85">
     <ellipse cx="35" cy="52" rx="7" ry="9"/><circle cx="29" cy="42" r="3"/><circle cx="38" cy="40" r="3"/>
     <ellipse cx="62" cy="38" rx="7" ry="9"/><circle cx="56" cy="28" r="3"/><circle cx="65" cy="26" r="3"/>
     <ellipse cx="89" cy="24" rx="7" ry="9"/><circle cx="83" cy="14" r="3"/><circle cx="92" cy="12" r="3"/>
   </g>
   <path d="M250 56Q250 40 262 36Q274 40 274 56Z" fill="#fff" stroke="#ffb74d" stroke-width="2"/>
   <path d="M262 36V56M256 38V54M268 38V54" stroke="#ffb74d" stroke-width="1.5"/>`,
  // 1 Fish Bay — rising bubbles + a glinting fish
  `<circle cx="60" cy="50" r="5" fill="#fff" opacity=".55"/><circle cx="75" cy="32" r="3.5" fill="#fff" opacity=".5"/><circle cx="50" cy="22" r="2.5" fill="#fff" opacity=".45"/>
   <ellipse cx="240" cy="46" rx="14" ry="8" fill="#ff9f4a" opacity=".75"/><path d="M226 46 214 38 218 46 214 54Z" fill="#ff9f4a" opacity=".75"/>`,
  // 2 Whale Coast — a gentle waterline + a faint spout
  `<path d="M0 58Q20 46 40 58T80 58T120 58T160 58T200 58T240 58T280 58T320 58" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/>
   <circle cx="250" cy="30" r="3" fill="#fff" opacity=".5"/><circle cx="256" cy="20" r="2" fill="#fff" opacity=".4"/>`,
  // 3 Penguin Islands — a trail of webbed footprints
  `<path d="M38 52l-5 9h10z" fill="#274263" opacity=".65"/><path d="M55 42l-5 9h10z" fill="#274263" opacity=".65"/>
   <path d="M72 32l-5 9h10z" fill="#274263" opacity=".65"/><path d="M89 22l-5 9h10z" fill="#274263" opacity=".65"/>`,
  // 4 Octopus Cave — bubbles + a small starfish
  `<circle cx="40" cy="40" r="4" fill="#fff" opacity=".5"/><circle cx="55" cy="24" r="3" fill="#fff" opacity=".45"/>
   <path d="M250 50 255 36 260 50 274 45 262 56 268 70 255 60 242 70 248 56 236 45Z" fill="#ff8a73" opacity=".7"/>`,
  // 5 Polar Academy — drifting snowflakes
  `<g stroke="#fff" stroke-width="2.5" opacity=".75"><path d="M250 28v22M239 39h22M242 32l14 14M256 32l-14 14"/></g>
   <g stroke="#fff" stroke-width="2" opacity=".55"><path d="M55 50v16M47 58h16M50 53l10 10M60 53l-10 10"/></g>`,
  // 6 Northern Kingdom — a string of royal bunting
  `<path d="M20 20h280" stroke="#fff" stroke-width="2" opacity=".45"/>
   <path d="M40 20l10 18 10-18Z" fill="#ff5a7a" opacity=".7"/>
   <path d="M80 20l10 18 10-18Z" fill="#ffd45a" opacity=".7"/>
   <path d="M240 20l10 18 10-18Z" fill="#b78cff" opacity=".7"/>
   <path d="M280 20l10 18 10-18Z" fill="#ffd45a" opacity=".7"/>`,
  // 7 Arctic Champion — aurora ribbon + sparkles
  `<path d="M0 50Q40 20 80 50T160 50T240 50T320 50" fill="none" stroke="#7af0c0" stroke-width="3" opacity=".4"/>
   <path d="M250 26l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="#ffd45a" opacity=".8"/>
   <path d="M50 18l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="#fff" opacity=".7"/>`
];
function islandGroundAccentSvg(worldId) {
  return `<svg viewBox="0 0 320 80" preserveAspectRatio="none" aria-hidden="true">${ISLAND_GROUND_ACCENT[worldId] || ""}</svg>`;
}

// ─── Custom per-island mission scenes ──────────────────────────────────────
// v2 design: the friend (Nori/Pip/Bluebell/Pebble) stays put for the whole
// mission at #islandFriendSpot — their stranded position, baked directly
// into each SVG (no JS positioning needed for them anymore). Sausage
// (#missionSealRig, a separate top-level element — see index.html) is what
// swims toward them as questions are answered. This matches the existing
// rescue dialogue ("...that sled will reach me!") better than the earlier
// version where the friend walked toward a stationary Sausage, and it's
// simpler too: one moving thing instead of two.
//
// To add another island later: build its SVG with the same conventions
// (viewBox 0 0 800 500, the friend drawn directly at their stranded spot,
// no rig needed for them), then add one line to ISLAND_SCENES below.

const FISH_BAY_SCENE_SVG        = `<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-label="Fish Bay — a wooden dock with a fishing boat, a jumping fish, a blinking lighthouse, and Nori the baby seal waving from the dock" role="img">

  <!-- ════════════════════════════════════════════════════════════
       FISH BAY — mission scene background (v2: animated + Nori)
       Sausage the Seal: Arctic Math Adventure
       Flat vector, no gradients — tonal depth comes from stacked
       flat-color bands instead. Self-contained: all motion is plain
       CSS @keyframes in the embedded <style> block below, so this
       still animates correctly as a bare <img src="...svg">, a CSS
       background-image, or inline markup — no JS required.

       NOTE ON THE FRIEND CHARACTER: the brief suggested "Pip the
       Penguin," but in the existing game data Pip is already the
       Penguin Islands character (species id 1). Fish Bay's own
       established friend is "Nori," the baby seal (species id 0,
       world.character = "Nori", with rescue dialogue and Russian
       declension already wired up in game.js). Used Nori here so
       this scene stays consistent with the mission dialogue and the
       rescue-card popup the player already sees for this island.

       v3: Nori now stays PUT at #islandFriendSpot — her stranded
       position near the lighthouse — for the whole mission. Sausage
       (a separate element, #missionSealRig in index.html) is what
       swims toward her as questions are answered; see syncMissionSeal()
       in game.js. Matches the rescue dialogue ("...that sled will
       reach me!") better than the earlier version where she walked to
       a stationary Sausage.
       ════════════════════════════════════════════════════════════ -->

  <defs>
    <clipPath id="fb-canvas"><rect x="0" y="0" width="800" height="500"/></clipPath>
  </defs>

  <style>
    /* Clouds drift — gentle horizontal sway, independent timing per cloud */
    .fb-cloud-a { animation: fb-drift-a 15s ease-in-out infinite; }
    .fb-cloud-b { animation: fb-drift-b 12s ease-in-out infinite; }
    .fb-cloud-c { animation: fb-drift-c 10s ease-in-out infinite; }
    .fb-cloud-d { animation: fb-drift-d 8s  ease-in-out infinite; }
    .fb-cloud-e { animation: fb-drift-b 13s ease-in-out infinite; animation-delay: -4s; }
    .fb-cloud-f { animation: fb-drift-c 9s  ease-in-out infinite; animation-delay: -2s; }
    @keyframes fb-drift-a { 0%,100% { transform: translateX(0); } 50% { transform: translateX(20px); } }
    @keyframes fb-drift-b { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-16px); } }
    @keyframes fb-drift-c { 0%,100% { transform: translateX(0); } 50% { transform: translateX(14px); } }
    @keyframes fb-drift-d { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-10px); } }

    /* Lighthouse beacon — bright flash with a soft pulsing glow ring */
    .fb-beacon { transform-origin: 48px 106px; animation: fb-blink 2.6s ease-in-out infinite; }
    .fb-beacon-glow { transform-origin: 48px 106px; animation: fb-glow 2.6s ease-in-out infinite; }
    @keyframes fb-blink { 0%,55%,100% { opacity: .55; } 70% { opacity: 1; } 85% { opacity: .55; } }
    @keyframes fb-glow  { 0%,55%,100% { opacity: 0; transform: scale(1); } 70% { opacity: .55; transform: scale(2.1); } 85% { opacity: 0; transform: scale(1); } }

    /* Boat rocking on the water, slow and easy */
    .fb-boat { transform-origin: 247px 236px; animation: fb-rock 3.6s ease-in-out infinite; }
    @keyframes fb-rock { 0%,100% { transform: rotate(-2.4deg) translateY(0); } 50% { transform: rotate(2.6deg) translateY(-2px); } }

    /* Fish leaping out of the water in a loop, with a synced splash */
    .fb-fish   { transform-origin: 420px 268px; animation: fb-jump 3.2s ease-in-out infinite; }
    .fb-splash { transform-origin: 392px 312px; animation: fb-splash 3.2s ease-in-out infinite; }
    @keyframes fb-jump {
      0%   { transform: translate(0,16px)   rotate(-4deg);  opacity: .9; }
      16%  { transform: translate(-8px,-26px) rotate(-24deg); opacity: 1; }
      30%  { transform: translate(-12px,-38px) rotate(-16deg); opacity: 1; }
      46%  { transform: translate(-4px,-8px)  rotate(-4deg);  opacity: 1; }
      58%  { transform: translate(0,16px)   rotate(-2deg);  opacity: .9; }
      64%  { opacity: 0; }
      96%  { opacity: 0; transform: translate(0,16px) rotate(-2deg); }
      100% { transform: translate(0,16px)   rotate(-4deg);  opacity: .9; }
    }
    @keyframes fb-splash {
      0%, 52%  { transform: scale(.4); opacity: 0; }
      60%      { transform: scale(1);  opacity: .6; }
      72%      { transform: scale(1.5); opacity: 0; }
      100%     { transform: scale(.4); opacity: 0; }
    }

    /* Nori — idle bob on the dock, with a friendly flipper wave */
    .fb-nori     { transform-origin: 231px 330px; animation: fb-bob 3s ease-in-out infinite; }
    .fb-nori-wave{ transform-origin: 257px 326px; animation: fb-wave 1.7s ease-in-out infinite; }
    @keyframes fb-bob  { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
    @keyframes fb-wave { 0%,100% { transform: rotate(-6deg); } 50% { transform: rotate(34deg); } }
  </style>

  <g clip-path="url(#fb-canvas)">

    <!-- ── Sky ─────────────────────────────────────────────── -->
    <rect x="0" y="0" width="800" height="230" fill="#eafdff"/>
    <rect x="0" y="172" width="800" height="58" fill="#d8fff1"/>

    <!-- ── Arctic clouds (now a fuller spread across the whole sky) ── -->
    <g fill="#ffffff" stroke="#cdeef5" stroke-width="2">
      <g class="fb-cloud-a">
        <ellipse cx="95" cy="58" rx="46" ry="20"/>
        <circle cx="64" cy="50" r="20"/><circle cx="96" cy="40" r="24"/><circle cx="128" cy="48" r="18"/>
      </g>
      <g class="fb-cloud-b">
        <ellipse cx="330" cy="40" rx="34" ry="15"/>
        <circle cx="312" cy="34" r="14"/><circle cx="338" cy="28" r="17"/><circle cx="358" cy="35" r="12"/>
      </g>
      <g class="fb-cloud-f">
        <ellipse cx="242" cy="112" rx="22" ry="10"/>
        <circle cx="230" cy="108" r="9"/><circle cx="252" cy="104" r="11"/>
      </g>
      <g class="fb-cloud-c">
        <ellipse cx="560" cy="62" rx="24" ry="11"/>
        <circle cx="548" cy="58" r="10"/><circle cx="568" cy="54" r="12"/>
      </g>
      <g class="fb-cloud-e">
        <ellipse cx="642" cy="34" rx="20" ry="9"/>
        <circle cx="632" cy="30" r="8"/><circle cx="650" cy="27" r="10"/>
      </g>
      <g class="fb-cloud-d">
        <ellipse cx="712" cy="42" rx="16" ry="7"/>
        <circle cx="704" cy="40" r="7"/><circle cx="718" cy="38" r="8"/>
      </g>
    </g>

    <!-- ── Distant icebergs, scattered for a less empty horizon ── -->
    <g stroke="#cfe6ee" stroke-width="2" stroke-linejoin="round" opacity=".9">
      <path d="M150 226 168 158 196 188 214 170 236 226Z" fill="#eef8fb"/>
      <path d="M196 226 210 184 232 226Z" fill="#e3f3f8"/>
    </g>
    <g stroke="#d8eef3" stroke-width="2" stroke-linejoin="round" opacity=".75">
      <path d="M368 226 382 200 404 226Z" fill="#eef8fb"/>
    </g>
    <g stroke="#d8eef3" stroke-width="2" stroke-linejoin="round" opacity=".7">
      <path d="M566 228 580 196 602 228Z" fill="#eef8fb"/>
      <path d="M598 228 608 208 624 228Z" fill="#eef8fb"/>
    </g>
    <g stroke="#dcf0f5" stroke-width="1.8" stroke-linejoin="round" opacity=".55">
      <path d="M732 228 742 210 758 228Z" fill="#eef8fb"/>
    </g>

    <!-- ── Seagulls (more of them, a few different heights) ──── -->
    <g fill="none" stroke="#1d3a4a" stroke-width="2.5" stroke-linecap="round">
      <path d="M292 72q9-10 18 0q9-10 18 0"/>
      <path d="M352 54q7-8 14 0q7-8 14 0"/>
      <path d="M180 42q6-7 12 0q6-7 12 0" stroke-width="2"/>
      <path d="M460 130q11-12 22 0q11-12 22 0" stroke-width="3"/>
      <path d="M584 50q6-6 11 0q6-6 11 0" stroke-width="2" opacity=".85"/>
    </g>

    <!-- ── Ocean: three flat tonal bands instead of one — lighter
         near the horizon, darker toward the bottom, no gradients ── -->
    <rect x="0" y="230" width="800" height="270" fill="#24bdd2"/>
    <path d="M0,300 Q40,283 80,300 T160,300 T240,300 T320,300 T400,300 T480,300 T560,300 T640,300 T720,300 T800,300 L800,230 L0,230 Z" fill="#46d6e8"/>
    <path d="M0,396 Q40,409 80,396 T160,396 T240,396 T320,396 T400,396 T480,396 T560,396 T640,396 T720,396 T800,396 L800,500 L0,500 Z" fill="#117e92"/>

    <!-- Ripple highlight lines, fading with depth -->
    <path d="M0,355 Q40,343 80,355 T160,355 T240,355 T320,355 T400,355 T480,355 T560,355 T640,355 T720,355 T800,355" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity=".4"/>
    <path d="M0,415 Q40,403 80,415 T160,415 T240,415 T320,415 T400,415 T480,415 T560,415 T640,415 T720,415 T800,415" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity=".25"/>
    <path d="M0,470 Q40,460 80,470 T160,470 T240,470 T320,470 T400,470 T480,470 T560,470 T640,470 T720,470 T800,470" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity=".18"/>

    <!-- ── Small school of minnow shadows (right side, subtle) ── -->
    <g fill="#0c5d6d" opacity=".4">
      <ellipse cx="618" cy="362" rx="9" ry="4"/>
      <ellipse cx="642" cy="378" rx="7" ry="3.5"/>
      <ellipse cx="600" cy="388" rx="6" ry="3"/>
      <ellipse cx="660" cy="356" rx="6" ry="3"/>
    </g>

    <!-- ── Lighthouse, on a rocky point at the far left ────── -->
    <g>
      <path d="M6 232 14 196 34 184 58 188 70 206 78 232Z" fill="#9fb3bb" stroke="#748a92" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M14 226 22 206 40 200 30 226Z" fill="#8aa0a8" opacity=".7"/>
      <rect x="33" y="112" width="30" height="84" rx="4" fill="#ffffff" stroke="#1d3a4a" stroke-width="3"/>
      <rect x="33" y="132" width="30" height="13" fill="#ff6f61"/>
      <rect x="33" y="166" width="30" height="13" fill="#ff6f61"/>
      <rect x="30" y="100" width="36" height="14" rx="2" fill="#1d3a4a"/>
      <path d="M30 100 48 80 66 100Z" fill="#ff6f61" stroke="#1d3a4a" stroke-width="2.5" stroke-linejoin="round"/>
      <circle class="fb-beacon-glow" cx="48" cy="106" r="4" fill="#ffe9a0"/>
      <circle class="fb-beacon" cx="48" cy="106" r="4" fill="#ffd45a"/>
    </g>

    <!-- ── Wooden fishing dock ─────────────────────────────── -->
    <g>
      <g fill="#a8703f" stroke="#6e4423" stroke-width="2">
        <rect x="16" y="226" width="11" height="64" rx="2"/>
        <rect x="76" y="226" width="11" height="64" rx="2"/>
        <rect x="136" y="226" width="11" height="64" rx="2"/>
        <rect x="196" y="226" width="11" height="64" rx="2"/>
      </g>
      <g fill="#ffffff" opacity=".35">
        <ellipse cx="21" cy="290" rx="10" ry="3.5"/>
        <ellipse cx="81" cy="290" rx="10" ry="3.5"/>
        <ellipse cx="141" cy="290" rx="10" ry="3.5"/>
        <ellipse cx="201" cy="290" rx="10" ry="3.5"/>
      </g>
      <g stroke="#8a5a30" stroke-width="4" stroke-linecap="round">
        <line x1="34" y1="184" x2="34" y2="206"/>
        <line x1="122" y1="184" x2="122" y2="206"/>
        <line x1="210" y1="184" x2="210" y2="206"/>
        <line x1="34" y1="186" x2="210" y2="186"/>
      </g>
      <rect x="0" y="204" width="215" height="26" fill="#c98c52" stroke="#8a5a30" stroke-width="2.5"/>
      <g stroke="#8a5a30" stroke-width="1.6" opacity=".55">
        <line x1="22" y1="204" x2="22" y2="230"/><line x1="44" y1="204" x2="44" y2="230"/>
        <line x1="66" y1="204" x2="66" y2="230"/><line x1="88" y1="204" x2="88" y2="230"/>
        <line x1="110" y1="204" x2="110" y2="230"/><line x1="132" y1="204" x2="132" y2="230"/>
        <line x1="154" y1="204" x2="154" y2="230"/><line x1="176" y1="204" x2="176" y2="230"/>
        <line x1="198" y1="204" x2="198" y2="230"/>
      </g>
      <!-- tiny crab, peeking out from under the deck's shadow -->
      <g transform="translate(48,222)">
        <ellipse cx="0" cy="0" rx="9" ry="6" fill="#ff8a73" stroke="#1d3a4a" stroke-width="2"/>
        <path d="M-7 -3q-7-5-9-1M7 -3q7-5 9-1" fill="none" stroke="#1d3a4a" stroke-width="2" stroke-linecap="round"/>
        <path d="M-4 6q-2 5-5 6M4 6q2 5 5 6" fill="none" stroke="#1d3a4a" stroke-width="1.6" stroke-linecap="round"/>
        <circle cx="-3" cy="-2" r="1.3" fill="#1d3a4a"/><circle cx="3" cy="-2" r="1.3" fill="#1d3a4a"/>
      </g>
      <!-- tiny starfish resting on the deck edge -->
      <path d="M192 200 195 208 203 208 196 213 199 221 192 216 185 221 188 213 181 208 189 208Z" fill="#ffd45a" stroke="#1d3a4a" stroke-width="1.8" stroke-linejoin="round"/>
    </g>

    <!-- ── Small fishing boat, docked just past the pier's end ── -->
    <!-- v4 fix: the previous translate(0,9) was on the SAME element as
         the .fb-boat CSS animation — and an animated \`transform\` always
         wins over a presentation-attribute \`transform\` on that element,
         so the offset was silently ignored and the boat never actually
         moved. Now the static position lives on this outer, non-animated
         wrapper, and the rocking animation stays on the inner group —
         the two no longer fight over the same property. Also moved right
         so it sits in open water past the dock instead of over the posts. -->
    <g transform="translate(45,9)">
      <g class="fb-boat">
        <path d="M186 224 Q188 244 246 248 Q304 244 308 224 Z" fill="#fef4e3" stroke="#1d3a4a" stroke-width="3" stroke-linejoin="round"/>
        <rect x="188" y="218" width="118" height="9" rx="3" fill="#27c7de" stroke="#1d3a4a" stroke-width="2"/>
        <rect x="222" y="190" width="44" height="30" rx="6" fill="#ffffff" stroke="#1d3a4a" stroke-width="2.5"/>
        <circle cx="244" cy="206" r="6" fill="#27c7de" stroke="#1d3a4a" stroke-width="2"/>
        <line x1="246" y1="190" x2="246" y2="166" stroke="#1d3a4a" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M246 166 268 174 246 182Z" fill="#ff8a73" stroke="#1d3a4a" stroke-width="2" stroke-linejoin="round"/>
        <path d="M306 232 Q322 244 318 262" fill="none" stroke="#5c6b73" stroke-width="1.6"/>
        <circle cx="317" cy="266" r="5" fill="#ff6f61" stroke="#1d3a4a" stroke-width="1.8"/>
        <path d="M312 266h10" stroke="#ffffff" stroke-width="1.6"/>
      </g>
    </g>
    <path d="M225,252 Q255,242 291,249 Q327,242 359,252 L359,262 L225,262 Z" fill="#46d6e8"/>
    <path d="M225,252 Q255,242 291,249 Q327,242 359,252" fill="none" stroke="#ffffff" stroke-width="2" opacity=".4"/>

    <!-- ── Nori the baby seal — swimming toward the boat. This group's
         id is the hook for game.js: it's a plain (non-animated) <g> so
         JS can safely set its transform directly (translateX) to show
         her progress, without fighting the CSS bob/wave animations,
         which live on the nested .fb-nori / .fb-nori-wave groups below.
         Shifted down 20px from the original sketch so her whole swim
         path stays clear of the dock-post bottoms (y226–290) no matter
         what x she's at. Default position here = "arrived" (next to
         the boat); game.js resets her to the "stranded" end at mission
         start and walks her across as questions are answered. ── -->
    <g id="islandFriendSpot" transform="translate(-141,0)">
    <g class="fb-nori">
      <path d="M203 346 C195 328 197 308 215 300 C233 292 253 298 257 316 C261 332 253 344 237 347 C225 349 211 348 203 346 Z" fill="#eef6fa" stroke="#1d3a4a" stroke-width="2.4"/>
      <ellipse cx="231" cy="338" rx="14" ry="8" fill="#c9e4ef"/>
      <ellipse cx="212" cy="322" rx="5" ry="3" fill="#ffb9c4" opacity=".55"/>
      <ellipse cx="248" cy="320" rx="5" ry="3" fill="#ffb9c4" opacity=".55"/>
      <ellipse cx="220" cy="315" rx="4.6" ry="5.6" fill="#1d3a4a"/>
      <ellipse cx="240" cy="313" rx="4.6" ry="5.6" fill="#1d3a4a"/>
      <circle cx="218.4" cy="312.6" r="1.4" fill="#ffffff"/>
      <circle cx="238.4" cy="310.6" r="1.4" fill="#ffffff"/>
      <path d="M225 326 Q231 320 237 326 Q235 332 231 334 Q227 332 225 326Z" fill="#ff8fa1"/>
      <path d="M227 334q4 3 8 0" stroke="#1d3a4a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <g class="fb-nori-wave">
        <ellipse cx="259" cy="308" rx="9" ry="16" fill="#eef6fa" stroke="#1d3a4a" stroke-width="2.2"/>
      </g>
      <g fill="none" stroke="#ffffff" stroke-linecap="round">
        <ellipse cx="231" cy="350" rx="34" ry="7" opacity=".35" stroke-width="2.5"/>
        <ellipse cx="231" cy="350" rx="22" ry="5" opacity=".5" stroke-width="2.5"/>
      </g>
    </g>
    </g>

    <!-- ── Jumping orange fish, leaping in a loop, with a synced splash ── -->
    <!-- v4: nudged right ~35px for clearance from the boat's new spot -->
    <g transform="translate(35,0)">
    <g class="fb-fish">
      <ellipse cx="420" cy="268" rx="34" ry="19" fill="#ff9f4a" stroke="#1d3a4a" stroke-width="3"/>
      <path d="M388 268 358 250 365 268 358 286Z" fill="#ff9f4a" stroke="#1d3a4a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M408 256q10-6 20-2" fill="none" stroke="#e8852e" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="444" cy="261" r="3.4" fill="#1d3a4a"/>
    </g>
    <g class="fb-splash" fill="none" stroke="#ffffff" stroke-linecap="round">
      <ellipse cx="392" cy="312" rx="22" ry="6" opacity=".5" stroke-width="3"/>
      <ellipse cx="392" cy="312" rx="34" ry="9" opacity=".3" stroke-width="2.5"/>
      <circle cx="372" cy="298" r="2.5" fill="#ffffff" opacity=".7" stroke="none"/>
      <circle cx="412" cy="300" r="3" fill="#ffffff" opacity=".6" stroke="none"/>
      <circle cx="402" cy="290" r="2" fill="#ffffff" opacity=".6" stroke="none"/>
    </g>
    </g>

    <!-- ── Floating buoys ───────────────────────────────────── -->
    <g>
      <g transform="translate(126,258)">
        <path d="M0 -16Q9 -22 9 -12" fill="none" stroke="#1d3a4a" stroke-width="2" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="15" fill="#ffffff" stroke="#1d3a4a" stroke-width="2.6"/>
        <rect x="-15" y="-6" width="30" height="6" fill="#ff6f61"/>
        <rect x="-15" y="4" width="30" height="6" fill="#ff6f61"/>
        <ellipse cx="0" cy="17" rx="13" ry="4" fill="#ffffff" opacity=".35"/>
      </g>
      <g transform="translate(548,332) scale(.75)">
        <circle cx="0" cy="0" r="15" fill="#ffffff" stroke="#1d3a4a" stroke-width="2.6"/>
        <rect x="-15" y="-6" width="30" height="6" fill="#ff6f61"/>
        <rect x="-15" y="4" width="30" height="6" fill="#ff6f61"/>
        <ellipse cx="0" cy="17" rx="13" ry="4" fill="#ffffff" opacity=".3"/>
      </g>
    </g>

    <!-- ── Drifting message bottle (right side, a quiet find) ── -->
    <g transform="translate(686,408) rotate(8)">
      <path d="M-7 -22h14v8q7 5 7 16v8q0 6-7 6h-14q-7 0-7-6v-8q0-11 7-16Z" fill="#7fd2a0" stroke="#1d3a4a" stroke-width="2" stroke-linejoin="round" opacity=".92"/>
      <rect x="-4" y="-28" width="8" height="8" rx="1.5" fill="#c98c52" stroke="#1d3a4a" stroke-width="1.8"/>
      <rect x="-4" y="-6" width="8" height="14" rx="1" fill="#fff7e6" opacity=".85"/>
      <ellipse cx="0" cy="20" rx="16" ry="4" fill="#ffffff" opacity=".3"/>
    </g>

  </g>
</svg>`;
const SNOW_BEACH_SCENE_SVG      = `<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-label="Snow Beach — a sunny shoreline scattered with shells and driftwood after a storm, with Pip the penguin waddling toward a cosy driftwood shelter" role="img">

  <!-- ════════════════════════════════════════════════════════════
       SNOW BEACH — mission scene background
       Sausage the Seal: Arctic Math Adventure
       Same conventions as the Fish Bay scene (flat vector, no
       gradients, navy #1d3a4a outlines, viewBox 0 0 800 500) so the
       islands read as one consistent world. Pip's colours are pulled
       directly from the existing ANIMAL_SVGS[1] icon in game.js so
       she matches her own rescue-card/town art exactly.

       FRIEND: #islandFriendSpot is Pip's permanent position for the
       whole mission — she stays put near the driftwood where she
       washed up. Sausage (a separate top-level element,
       #missionSealRig in index.html) is what now waddles/swims in
       toward her as questions are answered; see syncMissionSeal() in
       game.js. Matches the rescue dialogue better than the earlier
       version where she walked toward a stationary Sausage.
       ════════════════════════════════════════════════════════════ -->

  <defs>
    <clipPath id="sb-canvas"><rect x="0" y="0" width="800" height="500"/></clipPath>
  </defs>

  <style>
    .scn-cloud-a { animation: scn-drift-a 15s ease-in-out infinite; }
    .scn-cloud-b { animation: scn-drift-b 12s ease-in-out infinite; }
    .scn-cloud-c { animation: scn-drift-c 10s ease-in-out infinite; }
    .scn-cloud-d { animation: scn-drift-d 8s  ease-in-out infinite; }
    @keyframes scn-drift-a { 0%,100% { transform: translateX(0); } 50% { transform: translateX(18px); } }
    @keyframes scn-drift-b { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-14px); } }
    @keyframes scn-drift-c { 0%,100% { transform: translateX(0); } 50% { transform: translateX(12px); } }
    @keyframes scn-drift-d { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-9px); } }

    /* Lantern at the shelter — warm flicker + soft glow pulse */
    .scn-lantern      { transform-origin: 480px 408px; animation: scn-flicker 2.1s ease-in-out infinite; }
    .scn-lantern-glow { transform-origin: 480px 408px; animation: scn-glow 2.1s ease-in-out infinite; }
    @keyframes scn-flicker { 0%,100% { opacity: .8; } 30% { opacity: 1; } 45% { opacity: .65; } 70% { opacity: 1; } 85% { opacity: .75; } }
    @keyframes scn-glow    { 0%,100% { opacity: .25; transform: scale(1); } 50% { opacity: .55; transform: scale(1.4); } }

    /* A little barrel bobbing in the shallows, just past the shoreline */
    .scn-barrel { transform-origin: 560px 258px; animation: scn-rock 3.4s ease-in-out infinite; }
    @keyframes scn-rock { 0%,100% { transform: rotate(-3deg) translateY(0); } 50% { transform: rotate(3deg) translateY(-2px); } }

    /* A small fish leaping in the shallows, with a synced splash */
    .scn-fish   { transform-origin: 200px 236px; animation: scn-jump 3.2s ease-in-out infinite; }
    .scn-splash { transform-origin: 182px 256px; animation: scn-splash 3.2s ease-in-out infinite; }
    @keyframes scn-jump {
      0%   { transform: translate(0,10px)  rotate(-4deg);  opacity: .9; }
      16%  { transform: translate(-5px,-16px) rotate(-22deg); opacity: 1; }
      30%  { transform: translate(-8px,-24px) rotate(-14deg); opacity: 1; }
      46%  { transform: translate(-3px,-5px)  rotate(-4deg);  opacity: 1; }
      58%  { transform: translate(0,10px)  rotate(-2deg);  opacity: .9; }
      64%  { opacity: 0; }
      96%  { opacity: 0; transform: translate(0,10px) rotate(-2deg); }
      100% { transform: translate(0,10px)  rotate(-4deg);  opacity: .9; }
    }
    @keyframes scn-splash {
      0%, 52% { transform: scale(.4); opacity: 0; }
      60%     { transform: scale(1);  opacity: .6; }
      72%     { transform: scale(1.5); opacity: 0; }
      100%    { transform: scale(.4); opacity: 0; }
    }

    /* Pip — idle waddle + a friendly flipper wave */
    .scn-pip      { transform-origin: 60px 466px; animation: scn-waddle 2.6s ease-in-out infinite; }
    .scn-pip-wave { transform-origin: 84px 432px; animation: scn-wave 1.7s ease-in-out infinite; }
    @keyframes scn-waddle { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
    @keyframes scn-wave   { 0%,100% { transform: rotate(-8deg); } 50% { transform: rotate(30deg); } }
  </style>

  <g clip-path="url(#sb-canvas)">

    <!-- ── Sky ─────────────────────────────────────────────── -->
    <rect x="0" y="0" width="800" height="200" fill="#fff7cf"/>
    <rect x="0" y="150" width="800" height="50" fill="#ffe9a8"/>

    <!-- ── Sun, warm and calm (this island already passed its storm) ── -->
    <circle cx="120" cy="90" r="52" fill="#ffe9a8" opacity=".6"/>
    <g stroke="#ffd45a" stroke-width="4" stroke-linecap="round" opacity=".55">
      <line x1="166" y1="90" x2="180" y2="90"/>
      <line x1="143" y1="50" x2="150" y2="38"/>
      <line x1="97" y1="50" x2="90" y2="38"/>
      <line x1="74" y1="90" x2="60" y2="90"/>
      <line x1="97" y1="130" x2="90" y2="142"/>
      <line x1="143" y1="130" x2="150" y2="142"/>
    </g>
    <circle cx="120" cy="90" r="40" fill="#ffd45a"/>

    <!-- ── Clouds, light and few — sunny after the storm ───── -->
    <g fill="#ffffff" stroke="#ffe9c0" stroke-width="2">
      <g class="scn-cloud-a">
        <ellipse cx="400" cy="52" rx="32" ry="14"/>
        <circle cx="384" cy="46" r="13"/><circle cx="404" cy="40" r="16"/><circle cx="422" cy="48" r="11"/>
      </g>
      <g class="scn-cloud-b">
        <ellipse cx="600" cy="74" rx="26" ry="11"/>
        <circle cx="588" cy="70" r="10"/><circle cx="606" cy="65" r="13"/>
      </g>
      <g class="scn-cloud-c">
        <ellipse cx="684" cy="42" rx="18" ry="8"/>
        <circle cx="676" cy="39" r="8"/><circle cx="692" cy="37" r="9"/>
      </g>
      <g class="scn-cloud-d">
        <ellipse cx="500" cy="112" rx="14" ry="6"/>
        <circle cx="494" cy="110" r="6"/><circle cx="506" cy="108" r="7"/>
      </g>
    </g>

    <!-- ── Distant snow dunes along the horizon ────────────── -->
    <g fill="#ffffff" stroke="#eef0e8" stroke-width="2">
      <ellipse cx="90" cy="200" rx="68" ry="20"/>
      <ellipse cx="150" cy="202" rx="46" ry="16"/>
    </g>
    <g fill="#f4f6ee" stroke="#e6e9dd" stroke-width="2" opacity=".85">
      <ellipse cx="690" cy="200" rx="60" ry="18"/>
      <ellipse cx="745" cy="202" rx="38" ry="14"/>
    </g>

    <!-- ── Seagulls ─────────────────────────────────────────── -->
    <g fill="none" stroke="#1d3a4a" stroke-width="2.5" stroke-linecap="round">
      <path d="M250 62q9-10 18 0q9-10 18 0"/>
      <path d="M330 46q7-8 14 0q7-8 14 0" stroke-width="2"/>
      <path d="M550 72q11-12 22 0q11-12 22 0" stroke-width="3"/>
      <path d="M460 102q6-6 11 0q6-6 11 0" stroke-width="2" opacity=".85"/>
    </g>

    <!-- ── Sea, just a band — this scene is mostly shore ───── -->
    <rect x="0" y="200" width="800" height="80" fill="#9eeeff"/>
    <rect x="0" y="200" width="800" height="28" fill="#c5f3ff"/>
    <path d="M0,228 Q40,220 80,228 T160,228 T240,228 T320,228 T400,228 T480,228 T560,228 T640,228 T720,228 T800,228" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity=".4"/>
    <path d="M0,258 Q40,250 80,258 T160,258 T240,258 T320,258 T400,258 T480,258 T560,258 T640,258 T720,258 T800,258" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity=".3"/>

    <!-- small barrel bobbing in the shallows -->
    <g class="scn-barrel">
      <rect x="546" y="246" width="28" height="24" rx="6" fill="#c98c52" stroke="#1d3a4a" stroke-width="2.4"/>
      <rect x="546" y="251" width="28" height="4" fill="#8a5a30"/>
      <rect x="546" y="262" width="28" height="4" fill="#8a5a30"/>
      <ellipse cx="560" cy="271" rx="17" ry="4" fill="#ffffff" opacity=".3"/>
    </g>

    <!-- small fish leaping in the shallows -->
    <g class="scn-fish">
      <ellipse cx="200" cy="236" rx="20" ry="11" fill="#ff9f4a" stroke="#1d3a4a" stroke-width="2.4"/>
      <path d="M182 236 165 225 169 236 165 247Z" fill="#ff9f4a" stroke="#1d3a4a" stroke-width="2.4" stroke-linejoin="round"/>
      <circle cx="214" cy="232" r="2.2" fill="#1d3a4a"/>
    </g>
    <g class="scn-splash" fill="none" stroke="#ffffff" stroke-linecap="round">
      <ellipse cx="182" cy="256" rx="14" ry="4" opacity=".5" stroke-width="2.4"/>
      <ellipse cx="182" cy="256" rx="22" ry="6" opacity=".3" stroke-width="2"/>
    </g>

    <!-- ── Shoreline: wet sand, then the main beach ─────────── -->
    <rect x="0" y="285" width="800" height="215" fill="#f5ecd6"/>
    <path d="M0,280 Q40,268 80,280 T160,280 T240,280 T320,280 T400,280 T480,280 T560,280 T640,280 T720,280 T800,280 L800,312 L0,312 Z" fill="#fff8ea"/>
    <path d="M0,280 Q40,268 80,280 T160,280 T240,280 T320,280 T400,280 T480,280 T560,280 T640,280 T720,280 T800,280" fill="none" stroke="#ffffff" stroke-width="3" opacity=".55"/>

    <!-- footprint trail, leading toward the shelter -->
    <g fill="#d9a35c" opacity=".65">
      <ellipse cx="172" cy="448" rx="7" ry="9"/><circle cx="166" cy="438" r="3"/><circle cx="176" cy="436" r="3"/>
      <ellipse cx="232" cy="440" rx="7" ry="9"/><circle cx="226" cy="430" r="3"/><circle cx="236" cy="428" r="3"/>
      <ellipse cx="292" cy="434" rx="7" ry="9"/><circle cx="286" cy="424" r="3"/><circle cx="296" cy="422" r="3"/>
      <ellipse cx="352" cy="428" rx="7" ry="9"/><circle cx="346" cy="418" r="3"/><circle cx="356" cy="416" r="3"/>
    </g>

    <!-- driftwood, small (near where Pip washed up) -->
    <g transform="translate(110,463) rotate(8)">
      <rect x="-34" y="-9" width="68" height="18" rx="9" fill="#a8703f" stroke="#1d3a4a" stroke-width="2.2"/>
      <line x1="-18" y1="-9" x2="-18" y2="9" stroke="#6e4423" stroke-width="1.6"/>
      <line x1="6"   y1="-9" x2="6"   y2="9" stroke="#6e4423" stroke-width="1.6"/>
    </g>

    <!-- driftwood, larger (right side, balance) -->
    <g transform="translate(645,432) rotate(-6)">
      <rect x="-46" y="-11" width="92" height="22" rx="11" fill="#a8703f" stroke="#1d3a4a" stroke-width="2.4"/>
      <line x1="-24" y1="-11" x2="-24" y2="11" stroke="#6e4423" stroke-width="1.8"/>
      <line x1="4"   y1="-11" x2="4"   y2="11" stroke="#6e4423" stroke-width="1.8"/>
      <line x1="28"  y1="-11" x2="28"  y2="11" stroke="#6e4423" stroke-width="1.8"/>
    </g>

    <!-- tiny crab on the sand -->
    <g transform="translate(200,438)">
      <ellipse cx="0" cy="0" rx="9" ry="6" fill="#ff8a73" stroke="#1d3a4a" stroke-width="2"/>
      <path d="M-7 -3q-7-5-9-1M7 -3q7-5 9-1" fill="none" stroke="#1d3a4a" stroke-width="2" stroke-linecap="round"/>
      <path d="M-4 6q-2 5-5 6M4 6q2 5 5 6" fill="none" stroke="#1d3a4a" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="-3" cy="-2" r="1.3" fill="#1d3a4a"/><circle cx="3" cy="-2" r="1.3" fill="#1d3a4a"/>
    </g>

    <!-- scattered shells -->
    <g stroke="#1d3a4a" stroke-width="1.8" stroke-linejoin="round">
      <g transform="translate(330,452)">
        <path d="M-16 8Q-16 -10 0 -16Q16 -10 16 8Z" fill="#ffb9c4"/>
        <path d="M0 -16V8M-8 -13V6M8 -13V6" stroke="#ff8fa1" stroke-width="1.6"/>
      </g>
      <g transform="translate(560,440) scale(.8)">
        <path d="M-16 8Q-16 -10 0 -16Q16 -10 16 8Z" fill="#fff0d0"/>
        <path d="M0 -16V8M-8 -13V6M8 -13V6" stroke="#e8c98a" stroke-width="1.6"/>
      </g>
      <g transform="translate(262,468) scale(.55)">
        <path d="M-16 8Q-16 -10 0 -16Q16 -10 16 8Z" fill="#ffd9b0"/>
        <path d="M0 -16V8M-8 -13V6M8 -13V6" stroke="#e8a05a" stroke-width="1.6"/>
      </g>
      <path transform="translate(608,464)" d="M0 10Q-10 8 -9 -2Q-8 -10 1 -9Q9 -8 7 1Q5 9 0 10Z" fill="#ffd9b0"/>
    </g>

    <!-- ── Driftwood shelter with a warm lantern — the "safe spot" ── -->
    <g>
      <path d="M480 372 L432 460 M480 372 L528 460 M480 372 L468 460 M480 372 L492 460" fill="none" stroke="#a8703f" stroke-width="9" stroke-linecap="round"/>
      <path d="M480 372 L432 460 M480 372 L528 460 M480 372 L468 460 M480 372 L492 460" fill="none" stroke="#6e4423" stroke-width="2" stroke-linecap="round" opacity=".5"/>
      <path d="M452 430 L508 430" stroke="#8a5a30" stroke-width="5" stroke-linecap="round"/>
      <circle class="scn-lantern-glow" cx="480" cy="408" r="10" fill="#ffe9a0"/>
      <circle class="scn-lantern" cx="480" cy="408" r="9" fill="#ffb347" stroke="#1d3a4a" stroke-width="1.8"/>
      <path class="scn-lantern" d="M480 401 483 408 480 415 477 408Z" fill="#ff6f1f"/>
    </g>

    <!-- ── Pip the penguin — waddling toward the shelter. Colours
         match ANIMAL_SVGS[1] exactly (dark navy-black #1a2030, belly
         #f0f4f8, beak #f0c060) so she's recognizably "the same Pip"
         seen elsewhere in the game. ── -->
    <g id="islandFriendSpot" transform="translate(60,0)">
    <g class="scn-pip">
      <ellipse cx="60" cy="452" rx="24" ry="11" fill="#f0c060" opacity=".9"/>
      <ellipse cx="60" cy="448" rx="26" ry="30" fill="#1a2030" stroke="#1d3a4a" stroke-width="2.2"/>
      <ellipse cx="60" cy="450" rx="17" ry="23" fill="#f0f4f8"/>
      <ellipse cx="60" cy="420" rx="19" ry="17" fill="#1a2030" stroke="#1d3a4a" stroke-width="2.2"/>
      <ellipse cx="60" cy="418" rx="12" ry="11" fill="#f0c060"/>
      <circle cx="53" cy="416" r="4.6" fill="#1a2030"/><circle cx="67" cy="416" r="4.6" fill="#1a2030"/>
      <circle cx="51.6" cy="414.4" r="1.3" fill="#fff"/><circle cx="65.6" cy="414.4" r="1.3" fill="#fff"/>
      <path d="M55 423q5 4 10 0" fill="none" stroke="#c08020" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="33" cy="438" rx="9" ry="13" fill="#1a2030" stroke="#1d3a4a" stroke-width="2"/>
      <g class="scn-pip-wave">
        <ellipse cx="84" cy="432" rx="9" ry="13" fill="#1a2030" stroke="#1d3a4a" stroke-width="2"/>
      </g>
    </g>
    </g>

  </g>
</svg>`;
const WHALE_COAST_SCENE_SVG     = `<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-label="Whale Coast — a rocky sea arch with kelp and a softly glowing song-rock, with Bluebell the whale swimming in from the open sea" role="img">

  <!-- ════════════════════════════════════════════════════════════
       WHALE COAST — mission scene background
       Sausage the Seal: Arctic Math Adventure
       Same conventions as Fish Bay / Snow Beach (flat vector, no
       gradients, navy #1d3a4a outlines, viewBox 0 0 800 500).
       Bluebell's colours are pulled directly from ANIMAL_SVGS[5] in
       game.js so she matches her own rescue-card/town art exactly.

       FRIEND: #islandFriendSpot is Bluebell's permanent position for
       the whole mission — she stays out in the open sea, away from
       the coast. Sausage (a separate top-level element,
       #missionSealRig in index.html) is what now swims toward her as
       questions are answered; see syncMissionSeal() in game.js.
       ════════════════════════════════════════════════════════════ -->

  <defs>
    <clipPath id="wc-canvas"><rect x="0" y="0" width="800" height="500"/></clipPath>
  </defs>

  <style>
    .scn-cloud-a { animation: scn-drift-a 15s ease-in-out infinite; }
    .scn-cloud-b { animation: scn-drift-b 12s ease-in-out infinite; }
    .scn-cloud-c { animation: scn-drift-c 10s ease-in-out infinite; }
    .scn-cloud-d { animation: scn-drift-d 9s  ease-in-out infinite; }
    @keyframes scn-drift-a { 0%,100% { transform: translateX(0); } 50% { transform: translateX(16px); } }
    @keyframes scn-drift-b { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-13px); } }
    @keyframes scn-drift-c { 0%,100% { transform: translateX(0); } 50% { transform: translateX(11px); } }
    @keyframes scn-drift-d { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-8px); } }

    /* The song-rock at the coast — soft cyan pulse, doubling as the
       "blinking light" beat the other islands have */
    .scn-songrock { transform-origin: 600px 450px; animation: scn-rock-pulse 2.4s ease-in-out infinite; }
    .scn-songrock-glow { transform-origin: 600px 450px; animation: scn-rock-glow 2.4s ease-in-out infinite; }
    @keyframes scn-rock-pulse { 0%,100% { opacity: .8; } 50% { opacity: 1; } }
    @keyframes scn-rock-glow  { 0%,100% { opacity: .2; transform: scale(1); } 50% { opacity: .5; transform: scale(1.5); } }

    /* Music notes drifting up from the song-rock, fading as they rise */
    .scn-note-1 { animation: scn-note-rise 4s  ease-in   infinite; }
    .scn-note-2 { animation: scn-note-rise 4.6s ease-in   infinite; animation-delay: -1.4s; }
    .scn-note-3 { animation: scn-note-rise 3.6s ease-in   infinite; animation-delay: -2.6s; }
    @keyframes scn-note-rise {
      0%   { opacity: 0; transform: translateY(0) scale(.8); }
      15%  { opacity: .85; }
      80%  { opacity: .15; }
      100% { opacity: 0; transform: translateY(-72px) scale(1.05); }
    }

    /* Kelp swaying gently */
    .scn-kelp-1 { transform-origin: 652px 500px; animation: scn-sway 3.4s ease-in-out infinite; }
    .scn-kelp-2 { transform-origin: 670px 500px; animation: scn-sway 3.8s ease-in-out infinite; animation-delay: -1.1s; }
    .scn-kelp-3 { transform-origin: 685px 500px; animation: scn-sway 3s   ease-in-out infinite; animation-delay: -.6s; }
    @keyframes scn-sway { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }

    /* A small fish leaping further out, with a synced splash */
    .scn-fish   { transform-origin: 350px 420px; animation: scn-jump 3.2s ease-in-out infinite; }
    .scn-splash { transform-origin: 332px 440px; animation: scn-splash 3.2s ease-in-out infinite; }
    @keyframes scn-jump {
      0%   { transform: translate(0,10px)  rotate(-4deg);  opacity: .9; }
      16%  { transform: translate(-5px,-16px) rotate(-22deg); opacity: 1; }
      30%  { transform: translate(-8px,-24px) rotate(-14deg); opacity: 1; }
      46%  { transform: translate(-3px,-5px)  rotate(-4deg);  opacity: 1; }
      58%  { transform: translate(0,10px)  rotate(-2deg);  opacity: .9; }
      64%  { opacity: 0; }
      96%  { opacity: 0; transform: translate(0,10px) rotate(-2deg); }
      100% { transform: translate(0,10px)  rotate(-4deg);  opacity: .9; }
    }
    @keyframes scn-splash {
      0%, 52% { transform: scale(.4); opacity: 0; }
      60%     { transform: scale(1);  opacity: .6; }
      72%     { transform: scale(1.5); opacity: 0; }
      100%    { transform: scale(.4); opacity: 0; }
    }

    /* Bluebell — slow idle bob, and an occasional little spout */
    .scn-bluebell { transform-origin: 555px 312px; animation: scn-bob 3.6s ease-in-out infinite; }
    .scn-spout    { transform-origin: 570px 282px; animation: scn-spout-puff 4.2s ease-in-out infinite; }
    @keyframes scn-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
    @keyframes scn-spout-puff {
      0%, 68% { opacity: 0; transform: scale(.6) translateY(0); }
      78%     { opacity: .8; transform: scale(1) translateY(-6px); }
      90%     { opacity: .3; transform: scale(1.3) translateY(-16px); }
      100%    { opacity: 0; transform: scale(1.4) translateY(-20px); }
    }
  </style>

  <g clip-path="url(#wc-canvas)">

    <!-- ── Sky ─────────────────────────────────────────────── -->
    <rect x="0" y="0" width="800" height="200" fill="#e3f0ff"/>
    <rect x="0" y="150" width="800" height="50" fill="#cfe6fb"/>

    <!-- ── Clouds ───────────────────────────────────────────── -->
    <g fill="#ffffff" stroke="#d6ebfa" stroke-width="2">
      <g class="scn-cloud-a">
        <ellipse cx="160" cy="48" rx="30" ry="13"/>
        <circle cx="146" cy="43" r="12"/><circle cx="164" cy="38" r="15"/><circle cx="180" cy="46" r="10"/>
      </g>
      <g class="scn-cloud-b">
        <ellipse cx="380" cy="38" rx="24" ry="10"/>
        <circle cx="370" cy="34" r="9"/><circle cx="386" cy="30" r="12"/>
      </g>
      <g class="scn-cloud-c">
        <ellipse cx="560" cy="62" rx="22" ry="10"/>
        <circle cx="550" cy="58" r="9"/><circle cx="566" cy="54" r="11"/>
      </g>
      <g class="scn-cloud-d">
        <ellipse cx="450" cy="92" rx="14" ry="6"/>
        <circle cx="444" cy="90" r="6"/><circle cx="456" cy="88" r="7"/>
      </g>
    </g>

    <!-- ── A small distant rock with a tail fluke — hints she has
         company out there, classic whale-against-sky silhouette ── -->
    <g opacity=".55">
      <ellipse cx="250" cy="206" rx="16" ry="7" fill="#cfd8df"/>
      <path d="M254 200C247 188 239 180 235 170c10 5 17 12 23 20 6-8 13-15 23-20-5 10-15 18-23 32Z" fill="#2c4a63"/>
    </g>

    <!-- ── Seagulls ─────────────────────────────────────────── -->
    <g fill="none" stroke="#1d3a4a" stroke-width="2.5" stroke-linecap="round">
      <path d="M220 70q9-10 18 0q9-10 18 0"/>
      <path d="M480 52q7-8 14 0q7-8 14 0" stroke-width="2"/>
      <path d="M620 86q11-12 22 0q11-12 22 0" stroke-width="3"/>
      <path d="M300 100q6-6 11 0q6-6 11 0" stroke-width="2" opacity=".85"/>
    </g>

    <!-- ── Sea: three flat tonal bands — lighter near the horizon,
         deeper toward the bottom ── -->
    <rect x="0" y="200" width="800" height="300" fill="#5ca6e8"/>
    <path d="M0,266 Q40,250 80,266 T160,266 T240,266 T320,266 T400,266 T480,266 T560,266 T640,266 T720,266 T800,266 L800,200 L0,200 Z" fill="#8cc6f2"/>
    <path d="M0,398 Q40,412 80,398 T160,398 T240,398 T320,398 T400,398 T480,398 T560,398 T640,398 T720,398 T800,398 L800,500 L0,500 Z" fill="#2f6fa8"/>
    <path d="M0,330 Q40,318 80,330 T160,330 T240,330 T320,330 T400,330 T480,330 T560,330 T640,330 T720,330 T800,330" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity=".35"/>
    <path d="M0,460 Q40,449 80,460 T160,460 T240,460 T320,460 T400,460 T480,460 T560,460 T640,460 T720,460 T800,460" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity=".2"/>

    <!-- small fish leaping further out, with a splash -->
    <g class="scn-fish">
      <ellipse cx="350" cy="420" rx="22" ry="12" fill="#ff9f4a" stroke="#1d3a4a" stroke-width="2.6"/>
      <path d="M330 420 311 408 315 420 311 432Z" fill="#ff9f4a" stroke="#1d3a4a" stroke-width="2.6" stroke-linejoin="round"/>
      <circle cx="365" cy="416" r="2.4" fill="#1d3a4a"/>
    </g>
    <g class="scn-splash" fill="none" stroke="#ffffff" stroke-linecap="round">
      <ellipse cx="332" cy="440" rx="15" ry="4.5" opacity=".5" stroke-width="2.6"/>
      <ellipse cx="332" cy="440" rx="24" ry="6.5" opacity=".3" stroke-width="2.2"/>
    </g>

    <!-- ── Rocky coastal arch, far right ────────────────────── -->
    <g fill="#7d8fa0" stroke="#5c6b78" stroke-width="3" stroke-linejoin="round">
      <path d="M636 500 L644 300 Q650 250 668 232 Q686 248 682 300 L692 500 Z"/>
      <path d="M726 500 L734 260 Q740 170 766 130 Q793 110 800 130 L800 500 Z"/>
      <path d="M655 225 Q710 130 780 140 L788 175 Q725 175 675 250 Z"/>
    </g>
    <g stroke="#5c6b78" stroke-width="2" opacity=".5">
      <line x1="652" y1="340" x2="660" y2="420"/>
      <line x1="672" y1="320" x2="666" y2="400"/>
      <line x1="748" y1="280" x2="756" y2="380"/>
      <line x1="772" y1="220" x2="766" y2="300"/>
    </g>

    <!-- kelp swaying at the foot of the near pillar -->
    <g fill="#2f9c8a" stroke="#1d3a4a" stroke-width="1.8">
      <path class="scn-kelp-1" d="M652 500 Q640 458 656 418 Q668 458 660 500Z"/>
      <path class="scn-kelp-2" d="M670 500 Q662 452 678 412 Q686 456 680 500Z"/>
      <path class="scn-kelp-3" d="M685 500 Q695 460 684 422 Q674 460 680 500Z"/>
    </g>

    <!-- the song-rock — soft glow, music notes drifting up -->
    <circle class="scn-songrock-glow" cx="600" cy="450" r="16" fill="#d9f7ff"/>
    <ellipse class="scn-songrock" cx="600" cy="450" rx="18" ry="14" fill="#eafdff" stroke="#1d3a4a" stroke-width="2.2"/>
    <g fill="#ffffff" opacity=".9">
      <g class="scn-note-1" transform="translate(594,432)">
        <ellipse cx="0" cy="0" rx="4.5" ry="3.6" transform="rotate(-18)"/>
        <line x1="4" y1="-1" x2="4" y2="-15" stroke="#ffffff" stroke-width="2"/>
        <path d="M4 -15q7 1 6 8" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
      </g>
      <g class="scn-note-2" transform="translate(608,436) scale(.85)">
        <ellipse cx="0" cy="0" rx="4.5" ry="3.6" transform="rotate(-18)"/>
        <line x1="4" y1="-1" x2="4" y2="-15" stroke="#ffffff" stroke-width="2"/>
      </g>
      <g class="scn-note-3" transform="translate(600,440) scale(.7)">
        <ellipse cx="0" cy="0" rx="4.5" ry="3.6" transform="rotate(-18)"/>
        <line x1="4" y1="-1" x2="4" y2="-15" stroke="#ffffff" stroke-width="2"/>
        <path d="M4 -15q7 1 6 8" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
      </g>
    </g>

    <!-- ── Bluebell the whale — swimming in toward the coast. Colours
         match ANIMAL_SVGS[5] exactly (body #4a9ecf, fin accent
         #3a8ebf, belly sheen #7fd0f0) so she's recognizably the same
         Bluebell seen elsewhere in the game. ── -->
    <g id="islandFriendSpot" transform="translate(-440,0)">
      <g class="scn-bluebell">
        <path d="M480 322 Q490 292 530 290 Q580 286 620 302 Q630 318 610 326 Q560 338 510 334 Q484 332 480 322Z" fill="#4a9ecf" stroke="#1d3a4a" stroke-width="2.6"/>
        <path d="M500 308 Q540 300 600 310 Q560 316 520 316Z" fill="#7fd0f0" opacity=".5"/>
        <ellipse cx="570" cy="294" rx="5" ry="3" fill="#1a2030"/>
        <g class="scn-spout" fill="none" stroke="#eafdff" stroke-linecap="round">
          <path d="M570 280 Q566 270 570 262" stroke-width="3" opacity=".8"/>
          <path d="M570 280 Q574 268 572 258" stroke-width="2.4" opacity=".6"/>
          <circle cx="568" cy="256" r="2.4" fill="#eafdff" stroke="none" opacity=".7"/>
        </g>
        <circle cx="608" cy="310" r="5" fill="#1a2030"/>
        <circle cx="609.6" cy="308.4" r="1.6" fill="#ffffff"/>
        <path d="M598 318 Q608 323 616 317" fill="none" stroke="#f0f8ff" stroke-width="2.2" stroke-linecap="round"/>
      </g>
    </g>

  </g>
</svg>`;
const PENGUIN_ISLANDS_SCENE_SVG = `<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-label="Penguin Islands — an aurora-lit ice platform with a marching penguin parade and a small drum, with Pebble the puffin waddling along the ice to rejoin the group" role="img">

  <!-- ════════════════════════════════════════════════════════════
       PENGUIN ISLANDS — mission scene background
       Sausage the Seal: Arctic Math Adventure
       Same conventions as the other islands (flat vector, no
       gradients, navy #1d3a4a outlines, viewBox 0 0 800 500).

       A NOTE ON WHO'S WHO: the island's theme/scenery is a penguin
       colony ("Guide the penguin parade"), but the actual named friend
       — world.character "Pebble" — is a PUFFIN (animal id 2 in
       game.js, ANIMAL_SVGS[2]), not one of the penguins. That's not a
       data error like Octopus Cave's was; nothing else in the data
       claims Pebble is a penguin. Read here as: Pebble is a puffin who
       ended up among this penguin colony and is making her way back
       to the group — so the scene shows BOTH: a background "parade"
       of generic colony penguins (colours matching the existing
       ISLAND_DECOR[3] emblem: navy #26364a body, gold #ffb847 beak),
       and Pebble herself drawn in her own established colours
       (ANIMAL_SVGS[2]: near-black #1a1a2a body, bright orange #ff8820
       beak/flippers) so she's clearly a different bird, not a
       recolour of the same one.

       Pebble's whole path stays on solid ice (no swimming partway and
       standing the rest) — the rig only moves her sideways, it can't
       change her pose, so giving her one continuous standing/waddling
       pose for the full distance was the only way to avoid an
       "walking on water" moment partway through.

       FRIEND: #islandFriendSpot is Pebble's permanent position for
       the whole mission — she stays isolated on the ice, away from
       the parade. Sausage (a separate top-level element,
       #missionSealRig in index.html) is what now waddles/swims in
       toward her as questions are answered; see syncMissionSeal() in
       game.js.
       ════════════════════════════════════════════════════════════ -->

  <defs>
    <clipPath id="pi-canvas"><rect x="0" y="0" width="800" height="500"/></clipPath>
  </defs>

  <style>
    .scn-cloud-a { animation: scn-drift-a 15s ease-in-out infinite; }
    .scn-cloud-b { animation: scn-drift-b 12s ease-in-out infinite; }
    @keyframes scn-drift-a { 0%,100% { transform: translateX(0); } 50% { transform: translateX(14px); } }
    @keyframes scn-drift-b { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-12px); } }

    /* Aurora ribbons shimmering — this island's stand-in for the
       lighthouse/lantern/song-rock "blinking light" beat */
    .scn-aurora-1 { animation: scn-shimmer 4.2s ease-in-out infinite; }
    .scn-aurora-2 { animation: scn-shimmer 5s   ease-in-out infinite; animation-delay: -1.6s; }
    .scn-aurora-3 { animation: scn-shimmer 3.6s ease-in-out infinite; animation-delay: -.8s; }
    @keyframes scn-shimmer { 0%,100% { opacity: .22; } 50% { opacity: .45; } }

    /* A little parade drum, bopping to its own beat */
    .scn-drum { transform-origin: 700px 462px; animation: scn-bop 1.1s ease-in-out infinite; }
    @keyframes scn-bop { 0%,100% { transform: scaleY(1); } 40% { transform: scaleY(.88); } 55% { transform: scaleY(1.04); } }

    /* The colony penguins waddling in their parade line */
    .scn-waddle-mini { animation: scn-waddle-mini 1.6s ease-in-out infinite; }
    @keyframes scn-waddle-mini { 0%,100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }

    /* Small fish leaping in the little inlet, with a synced splash */
    .scn-fish   { transform-origin: 750px 452px; animation: scn-jump 3.2s ease-in-out infinite; }
    .scn-splash { transform-origin: 736px 468px; animation: scn-splash 3.2s ease-in-out infinite; }
    @keyframes scn-jump {
      0%   { transform: translate(0,8px)  rotate(-4deg);  opacity: .9; }
      16%  { transform: translate(-4px,-14px) rotate(-22deg); opacity: 1; }
      30%  { transform: translate(-7px,-20px) rotate(-14deg); opacity: 1; }
      46%  { transform: translate(-2px,-4px)  rotate(-4deg);  opacity: 1; }
      58%  { transform: translate(0,8px)  rotate(-2deg);  opacity: .9; }
      64%  { opacity: 0; }
      96%  { opacity: 0; transform: translate(0,8px) rotate(-2deg); }
      100% { transform: translate(0,8px)  rotate(-4deg);  opacity: .9; }
    }
    @keyframes scn-splash {
      0%, 52% { transform: scale(.4); opacity: 0; }
      60%     { transform: scale(1);  opacity: .6; }
      72%     { transform: scale(1.5); opacity: 0; }
      100%    { transform: scale(.4); opacity: 0; }
    }

    /* Pebble — idle waddle + a flipper wave (her flippers are orange,
       unlike the colony penguins', which helps her read as different) */
    .scn-pebble      { transform-origin: 645px 462px; animation: scn-waddle 2.4s ease-in-out infinite; }
    .scn-pebble-wave { transform-origin: 665px 446px; animation: scn-wave 1.7s ease-in-out infinite; }
    @keyframes scn-waddle { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
    @keyframes scn-wave   { 0%,100% { transform: rotate(-8deg); } 50% { transform: rotate(30deg); } }
  </style>

  <g clip-path="url(#pi-canvas)">

    <!-- ── Sky ─────────────────────────────────────────────── -->
    <rect x="0" y="0" width="800" height="190" fill="#f7f7ff"/>
    <rect x="0" y="140" width="800" height="50" fill="#d8dcf7"/>

    <!-- ── Aurora, shimmering softly ────────────────────────── -->
    <path class="scn-aurora-1" d="M0,110 Q100,70 200,100 T400,100 T600,100 T800,100 L800,140 Q600,115 400,135 T200,130 T0,140 Z" fill="#9ce8c8"/>
    <path class="scn-aurora-2" d="M0,95 Q120,60 240,90 T480,88 T720,92 L800,100 L800,130 Q600,100 400,122 T160,118 T0,128 Z" fill="#c9b8f0"/>
    <path class="scn-aurora-3" d="M0,128 Q140,98 280,118 T560,116 T800,120 L800,150 Q600,128 400,146 T200,142 T0,150 Z" fill="#a8c8f0"/>

    <!-- ── Clouds, sparse — aurora is the sky's main event here ── -->
    <g fill="#ffffff" stroke="#e4e6fa" stroke-width="2">
      <g class="scn-cloud-a">
        <ellipse cx="200" cy="50" rx="22" ry="10"/>
        <circle cx="190" cy="46" r="9"/><circle cx="206" cy="42" r="11"/>
      </g>
      <g class="scn-cloud-b">
        <ellipse cx="620" cy="55" rx="20" ry="9"/>
        <circle cx="612" cy="52" r="8"/><circle cx="626" cy="49" r="10"/>
      </g>
    </g>

    <!-- ── Distant ice floes near the horizon — the "Islands" part ── -->
    <g fill="#eef4ff" stroke="#d4dcf2" stroke-width="2">
      <ellipse cx="530" cy="178" rx="38" ry="12"/>
      <ellipse cx="715" cy="182" rx="30" ry="10"/>
    </g>

    <!-- ── Gulls ────────────────────────────────────────────── -->
    <g fill="none" stroke="#1d3a4a" stroke-width="2.5" stroke-linecap="round">
      <path d="M540 90q9-10 18 0q9-10 18 0"/>
      <path d="M295 75q7-8 14 0q7-8 14 0" stroke-width="2"/>
    </g>

    <!-- ── Sea, a band behind the ice platform ─────────────── -->
    <rect x="0" y="190" width="800" height="130" fill="#7c8fe8"/>
    <rect x="0" y="190" width="800" height="40" fill="#a8b8f5"/>
    <path d="M0,280 Q40,268 80,280 T160,280 T240,280 T320,280 T400,280 T480,280 T560,280 T640,280 T720,280 T800,280" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity=".35"/>

    <!-- ── Ice platform — the whole parade ground, so Pebble's
         path is solid the entire way (see header note) ──────── -->
    <path d="M0,500 L0,330 Q100,312 200,326 T400,318 T600,328 T800,316 L800,440 Q760,420 700,440 L700,500 Z" fill="#f7faff" stroke="#dbe4f5" stroke-width="2.5"/>
    <g stroke="#cdd8ec" stroke-width="2" opacity=".6">
      <path d="M120 360 Q180 380 250 364" fill="none"/>
      <path d="M420 340 Q480 360 540 346" fill="none"/>
      <path d="M260 420 Q310 436 360 424" fill="none"/>
    </g>
    <!-- a small open-water inlet at the corner, for the fish to jump in -->
    <path d="M700,440 Q760,420 800,440 L800,500 L700,500 Z" fill="#7c8fe8"/>
    <path d="M700,440 Q760,420 800,440" fill="none" stroke="#ffffff" stroke-width="2.5" opacity=".4"/>

    <!-- footprint trail across the ice -->
    <g fill="#5c6b8a" opacity=".5">
      <ellipse cx="160" cy="468" rx="6" ry="8"/><circle cx="155" cy="459" r="2.6"/><circle cx="164" cy="457" r="2.6"/>
      <ellipse cx="230" cy="464" rx="6" ry="8"/><circle cx="225" cy="455" r="2.6"/><circle cx="234" cy="453" r="2.6"/>
      <ellipse cx="320" cy="460" rx="6" ry="8"/><circle cx="315" cy="451" r="2.6"/><circle cx="324" cy="449" r="2.6"/>
      <ellipse cx="400" cy="458" rx="6" ry="8"/><circle cx="395" cy="449" r="2.6"/><circle cx="404" cy="447" r="2.6"/>
      <ellipse cx="490" cy="460" rx="6" ry="8"/><circle cx="485" cy="451" r="2.6"/><circle cx="494" cy="449" r="2.6"/>
      <ellipse cx="570" cy="462" rx="6" ry="8"/><circle cx="565" cy="453" r="2.6"/><circle cx="574" cy="451" r="2.6"/>
    </g>

    <!-- small fish leaping in the inlet -->
    <g class="scn-fish">
      <ellipse cx="750" cy="452" rx="16" ry="9" fill="#ff9f4a" stroke="#1d3a4a" stroke-width="2.2"/>
      <path d="M735 452 720 443 723 452 720 461Z" fill="#ff9f4a" stroke="#1d3a4a" stroke-width="2.2" stroke-linejoin="round"/>
    </g>
    <g class="scn-splash" fill="none" stroke="#ffffff" stroke-linecap="round">
      <ellipse cx="736" cy="468" rx="11" ry="3.5" opacity=".5" stroke-width="2.2"/>
      <ellipse cx="736" cy="468" rx="18" ry="5" opacity=".3" stroke-width="2"/>
    </g>

    <!-- ── The penguin parade (background colony, generic colours) ── -->
    <g fill="#26364a" stroke="#1d3a4a" stroke-width="1.8">
      <g class="scn-waddle-mini" style="transform-origin:420px 460px; animation-delay:-.1s">
        <ellipse cx="420" cy="460" rx="11" ry="17"/>
        <ellipse cx="420" cy="463" rx="6" ry="11" fill="#ffffff" stroke="none"/>
        <path d="M414 446 420 438 426 446Z" fill="#ffb847" stroke="#1d3a4a" stroke-width="1.4"/>
      </g>
      <g class="scn-waddle-mini" style="transform-origin:465px 463px; animation-delay:-.5s">
        <ellipse cx="465" cy="463" rx="11" ry="17"/>
        <ellipse cx="465" cy="466" rx="6" ry="11" fill="#ffffff" stroke="none"/>
        <path d="M459 449 465 441 471 449Z" fill="#ffb847" stroke="#1d3a4a" stroke-width="1.4"/>
      </g>
      <g class="scn-waddle-mini" style="transform-origin:510px 460px; animation-delay:-.9s">
        <ellipse cx="510" cy="460" rx="11" ry="17"/>
        <ellipse cx="510" cy="463" rx="6" ry="11" fill="#ffffff" stroke="none"/>
        <path d="M504 446 510 438 516 446Z" fill="#ffb847" stroke="#1d3a4a" stroke-width="1.4"/>
      </g>
      <g class="scn-waddle-mini" style="transform-origin:555px 463px; animation-delay:-1.3s">
        <ellipse cx="555" cy="463" rx="11" ry="17"/>
        <ellipse cx="555" cy="466" rx="6" ry="11" fill="#ffffff" stroke="none"/>
        <path d="M549 449 555 441 561 449Z" fill="#ffb847" stroke="#1d3a4a" stroke-width="1.4"/>
      </g>
      <g class="scn-waddle-mini" style="transform-origin:600px 460px; animation-delay:-1.5s">
        <ellipse cx="600" cy="460" rx="11" ry="17"/>
        <ellipse cx="600" cy="463" rx="6" ry="11" fill="#ffffff" stroke="none"/>
        <path d="M594 446 600 438 606 446Z" fill="#ffb847" stroke="#1d3a4a" stroke-width="1.4"/>
      </g>
    </g>

    <!-- small parade drum -->
    <g class="scn-drum">
      <path d="M686 462 L686 478 Q700 486 714 478 L714 462Z" fill="#ff6f61" stroke="#1d3a4a" stroke-width="2.2"/>
      <ellipse cx="700" cy="462" rx="14" ry="7" fill="#fff0d0" stroke="#1d3a4a" stroke-width="2.2"/>
      <path d="M686 462 Q700 468 714 462" fill="none" stroke="#1d3a4a" stroke-width="1.4" opacity=".5"/>
    </g>

    <!-- ── Pebble the puffin — waddling along the ice to rejoin the
         group. Colours match ANIMAL_SVGS[2] exactly (near-black
         #1a1a2a body, bright orange #ff8820 beak AND flippers — the
         orange flippers are the easiest "this isn't a penguin" tell
         next to the colony's navy ones). ── -->
    <g id="islandFriendSpot" transform="translate(-525,0)">
      <g class="scn-pebble">
        <ellipse cx="645" cy="476" rx="22" ry="8" fill="#ff8820" opacity=".85"/>
        <ellipse cx="645" cy="462" rx="22" ry="26" fill="#1a1a2a" stroke="#1d3a4a" stroke-width="2.4"/>
        <ellipse cx="645" cy="465" rx="13" ry="18" fill="#f0f0f0"/>
        <ellipse cx="645" cy="436" rx="16" ry="15" fill="#1a1a2a" stroke="#1d3a4a" stroke-width="2.4"/>
        <circle cx="638" cy="433" r="4.6" fill="#1a1a2a"/><circle cx="652" cy="433" r="4.6" fill="#1a1a2a"/>
        <circle cx="639.6" cy="431.4" r="1.5" fill="#fff"/><circle cx="653.6" cy="431.4" r="1.5" fill="#fff"/>
        <path d="M639 443 Q645 448 651 443 Q649 439 645 437 Q641 439 639 443Z" fill="#ff8820" stroke="#1d3a4a" stroke-width="1.6"/>
        <ellipse cx="623" cy="455" rx="7" ry="10" fill="#ff8820" stroke="#1d3a4a" stroke-width="1.8"/>
        <g class="scn-pebble-wave">
          <ellipse cx="665" cy="448" rx="7" ry="10" fill="#ff8820" stroke="#1d3a4a" stroke-width="1.8"/>
        </g>
      </g>
    </g>

  </g>
</svg>`;

const OCTOPUS_CAVE_SCENE_SVG    = `<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-label="Octopus Cave — an underwater grotto lit by shafts of light from above, with glowing coral, a drifting jellyfish, and Professor Octo the octopus wedged near a carved riddle-stone" role="img">

  <!-- ════════════════════════════════════════════════════════════
       OCTOPUS CAVE — mission scene background
       Sausage the Seal: Arctic Math Adventure
       Same conventions as the other islands (flat vector, no
       gradients, navy #1d3a4a outlines, viewBox 0 0 800 500) — but
       the first fully UNDERWATER scene, since this island is a cave
       grotto rather than a surface/beach/ice location. Depth comes
       from three flat water bands instead of sky+sea, plus a pair of
       translucent light shafts standing in for the "sky" beat.

       DATA FIX: worlds[4].animal now correctly points at id 9
       (Octopus, ANIMAL_SVGS[9]) instead of id 4 (Walrus) — see the
       game.js diff that added the Octopus species. Professor Octo's
       colours here are pulled directly from ANIMAL_SVGS[9] (mantle
       #35c9c0, dark tentacles #2aa89c, highlight #6fe0d4) so he
       matches his own rescue-card/town art exactly, same rule as
       every other friend. The round glasses are new here (not part
       of the small ANIMAL_SVGS icon) — a nod to his "*adjusts
       glasses*" rescue dialogue line, so the visual personality and
       the text personality reinforce each other.

       FRIEND: #islandFriendSpot is Octo's permanent position for the
       whole mission — wedged by the cave wall with one tentacle
       pinned under a fallen rock (why he's stuck, not just resting).
       Sausage (a separate top-level element, #missionSealRig in
       index.html) is what swims toward him as questions are
       answered; see syncMissionSeal() in game.js.
       ════════════════════════════════════════════════════════════ -->

  <defs>
    <clipPath id="oc-canvas"><rect x="0" y="0" width="800" height="500"/></clipPath>
  </defs>

  <style>
    /* Light shafts from the cave opening above — this island's stand-in
       for the other islands' sky/aurora beat, same slow shimmer trick */
    .scn-ray-a { animation: scn-shimmer 7s ease-in-out infinite; }
    .scn-ray-b { animation: scn-shimmer 5.4s ease-in-out infinite; animation-delay: -2s; }
    @keyframes scn-shimmer { 0%,100% { opacity: .8; } 50% { opacity: 1; } }

    /* Small fish school drifting slowly side to side, deeper in the cave */
    .scn-fish-a { animation: scn-fish-drift 5s ease-in-out infinite; }
    .scn-fish-b { animation: scn-fish-drift 4.2s ease-in-out infinite; animation-delay: -1.4s; }
    .scn-fish-c { animation: scn-fish-drift 4.6s ease-in-out infinite; animation-delay: -2.6s; }
    @keyframes scn-fish-drift { 0%,100% { transform: translateX(0); } 50% { transform: translateX(14px); } }

    /* Kelp swaying at the cave floor — same proven sway as Whale Coast */
    .scn-kelp-1 { transform-origin: 178px 500px; animation: scn-sway 3.6s ease-in-out infinite; }
    .scn-kelp-2 { transform-origin: 202px 500px; animation: scn-sway 3.1s ease-in-out infinite; animation-delay: -1s; }
    @keyframes scn-sway { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }

    /* Bioluminescent coral and the carved riddle-stone — same soft
       pulse-glow as the song-rock/aurora beats on other islands */
    .scn-glow-halo { animation: scn-rock-glow 2.6s ease-in-out infinite; }
    .scn-glow-tip  { animation: scn-rock-pulse 2.6s ease-in-out infinite; }
    @keyframes scn-rock-glow  { 0%,100% { opacity: .18; transform: scale(1); } 50% { opacity: .4; transform: scale(1.3); } }
    @keyframes scn-rock-pulse { 0%,100% { opacity: .7; } 50% { opacity: 1; } }

    /* Jellyfish — bell pulses, tentacles trail behind. Origins are in
       the LOCAL coordinate space of each path (this group already
       sits inside its own translate(660,210) wrapper) — each tentacle
       pivots from where it actually meets the bell. */
    .scn-jelly-bell { transform-origin: 0px 0px;   animation: scn-pulse 2.2s ease-in-out infinite; }
    .scn-jelly-t1 { transform-origin: -14px 0px; animation: scn-sway 2.6s ease-in-out infinite; }
    .scn-jelly-t2 { transform-origin: 0px 0px;   animation: scn-sway 2.9s ease-in-out infinite; animation-delay: -.9s; }
    .scn-jelly-t3 { transform-origin: 14px 0px;  animation: scn-sway 2.4s ease-in-out infinite; animation-delay: -.4s; }
    @keyframes scn-pulse { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(.82); } }

    /* Bubbles rising from the cave floor, fading as they go */
    .scn-bubble-1 { animation: scn-bubble-rise 3.6s ease-in infinite; }
    .scn-bubble-2 { animation: scn-bubble-rise 4.2s ease-in infinite; animation-delay: -1.4s; }
    .scn-bubble-3 { animation: scn-bubble-rise 3s   ease-in infinite; animation-delay: -.7s; }
    .scn-bubble-4 { animation: scn-bubble-rise 4.6s ease-in infinite; animation-delay: -2.3s; }
    .scn-bubble-5 { animation: scn-bubble-rise 3.3s ease-in infinite; animation-delay: -1.9s; }
    @keyframes scn-bubble-rise {
      0%   { opacity: 0; transform: translateY(0) scale(.7); }
      12%  { opacity: .6; }
      85%  { opacity: .15; }
      100% { opacity: 0; transform: translateY(-90px) scale(1.1); }
    }

    /* Professor Octo — idle bob, plus one tentacle giving a slow
       thoughtful curl (his "thinking it over" tell) */
    .scn-octo         { transform-origin: 0px 32px;  animation: scn-bob 3.4s ease-in-out infinite; }
    .scn-octo-tentacle{ transform-origin: 26px 52px; animation: scn-think 3.8s ease-in-out infinite; }
    @keyframes scn-bob   { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
    @keyframes scn-think { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(10deg); } }
  </style>

  <g clip-path="url(#oc-canvas)">

    <!-- ── Water depth bands — darkest at the floor, lightest near
         the cave opening, standing in for the sky/sea split the
         surface islands use ── -->
    <rect x="0" y="0"   width="800" height="500" fill="#163f4d"/>
    <rect x="0" y="0"   width="800" height="190" fill="#2f6f7a"/>
    <rect x="0" y="150" width="800" height="170" fill="#225a68"/>

    <!-- ── Light shafts from the cave opening above ─────────────── -->
    <g fill="#f4e8ff">
      <path class="scn-ray-a" d="M460 0 L620 500 L520 500 L420 0Z" opacity=".16"/>
      <path class="scn-ray-b" d="M510 0 L600 500 L530 500 L470 0Z" opacity=".16"/>
    </g>
    <path d="M440 0 L560 500 L500 500 L410 0Z" fill="#ffffff" opacity=".1"/>

    <!-- ── Cave walls framing both sides, plus a few ceiling
         stalactites ── -->
    <g fill="#2c2440" stroke="#1d3a4a" stroke-width="3" stroke-linejoin="round">
      <path d="M0,0 L0,500 L130,500 Q150,360 110,260 Q150,170 95,70 Q120,30 70,0Z"/>
      <path d="M800,0 L800,500 L660,500 Q645,380 690,290 Q650,190 705,90 Q675,40 730,0Z"/>
    </g>
    <g fill="#2c2440" stroke="#1d3a4a" stroke-width="2.5" stroke-linejoin="round">
      <path d="M260,0 L284,0 L272,58Z"/>
      <path d="M340,0 L358,0 L349,40Z"/>
      <path d="M540,0 L562,0 L551,46Z"/>
    </g>

    <!-- ── Small fish school drifting deeper in the cave ────────── -->
    <g fill="#bfe8e0" stroke="#1d3a4a" stroke-width="2">
      <g class="scn-fish-a"><ellipse cx="300" cy="130" rx="11" ry="6"/><path d="M291 130 280 124 283 130 280 136Z"/><circle cx="307" cy="128" r="1.3" fill="#1d3a4a"/></g>
      <g class="scn-fish-b"><ellipse cx="330" cy="148" rx="9" ry="5"/><path d="M323 148 314 143 316 148 314 153Z"/><circle cx="336" cy="146.5" r="1.1" fill="#1d3a4a"/></g>
      <g class="scn-fish-c"><ellipse cx="270" cy="158" rx="8" ry="4.5"/><path d="M264 158 256 154 258 158 256 162Z"/><circle cx="275" cy="157" r="1" fill="#1d3a4a"/></g>
    </g>

    <!-- ── Kelp at the cave floor ────────────────────────────────── -->
    <g fill="#2a9c88" stroke="#1d3a4a" stroke-width="1.8">
      <path class="scn-kelp-1" d="M170 500 Q158 450 178 404 Q192 450 182 500Z"/>
      <path class="scn-kelp-2" d="M190 500 Q182 442 202 398 Q210 446 200 500Z"/>
    </g>

    <!-- ── Bioluminescent coral cluster ──────────────────────────── -->
    <g>
      <circle class="scn-glow-halo" cx="565" cy="438" r="22" fill="#9ce8d8"/>
      <path d="M556 460 Q553 432 565 414 Q577 432 574 460Z" fill="#35c9c0"/>
      <path d="M546 460 Q546 438 556 424 Q564 440 562 460Z" fill="#2aa89c"/>
      <path d="M576 460 Q578 440 569 426 Q561 440 564 460Z" fill="#2aa89c"/>
      <circle class="scn-glow-tip" cx="565" cy="416" r="4" fill="#d8f8f0"/>
    </g>

    <!-- ── Carved riddle-stone, lit by the shaft above — a nod to
         "Solve Professor Octo's riddles" ── -->
    <g>
      <ellipse cx="430" cy="476" rx="60" ry="22" fill="#1a3540" stroke="#1d3a4a" stroke-width="2.6"/>
      <g class="scn-glow-tip" stroke="#bdf6ec" stroke-width="2.4" fill="none" stroke-linecap="round">
        <circle cx="402" cy="470" r="8"/>
        <path d="M425 462 Q436 466 432 476 Q428 484 418 480 Q412 474 420 466"/>
        <path d="M450 478 L458 470 M450 478 L458 486"/>
      </g>
    </g>

    <!-- ── Jellyfish drifting ────────────────────────────────────── -->
    <g transform="translate(660,210)" opacity=".6">
      <path class="scn-jelly-bell" d="M-22 0 Q-22 -20 0 -20 Q22 -20 22 0Z" fill="#d8b8f8"/>
      <path class="scn-jelly-t1" d="M-14 0 Q-12 22 -16 40" fill="none" stroke="#d8b8f8" stroke-width="2.5" stroke-linecap="round"/>
      <path class="scn-jelly-t2" d="M0 0 Q2 24 -2 44" fill="none" stroke="#d8b8f8" stroke-width="2.5" stroke-linecap="round"/>
      <path class="scn-jelly-t3" d="M14 0 Q16 20 12 38" fill="none" stroke="#d8b8f8" stroke-width="2.5" stroke-linecap="round"/>
    </g>

    <!-- ── Bubbles rising from the floor ─────────────────────────── -->
    <g fill="#cdf3ff">
      <circle class="scn-bubble-1" cx="500" cy="420" r="5"/>
      <circle class="scn-bubble-2" cx="515" cy="380" r="3.5"/>
      <circle class="scn-bubble-3" cx="490" cy="340" r="4"/>
      <circle class="scn-bubble-4" cx="160" cy="300" r="4.5"/>
      <circle class="scn-bubble-5" cx="700" cy="350" r="4"/>
    </g>

    <!-- ── Cave floor ────────────────────────────────────────────── -->
    <path d="M0,460 Q120,440 240,458 T480,458 T720,452 L800,460 L800,500 L0,500Z" fill="#10303c"/>

    <!-- ── Professor Octo the octopus — wedged by the wall, colours
         match ANIMAL_SVGS[9] exactly (mantle #35c9c0, dark tentacles
         #2aa89c, highlight #6fe0d4) so he's recognizably the same
         Octo seen on his rescue card. Round glasses are this scene's
         own touch, tying back to his "*adjusts glasses*" line. ── -->
    <g id="islandFriendSpot">
      <g transform="translate(95,330)">
        <g class="scn-octo">
          <path d="M-30 50 Q-44 60 -40 76 Q-32 84 -24 74 Q-18 62 -26 52Z" fill="#2aa89c"/>
          <g class="scn-octo-tentacle">
            <path d="M30 50 Q44 60 40 76 Q32 84 24 74 Q18 62 26 52Z" fill="#2aa89c"/>
          </g>
          <ellipse cx="0" cy="32" rx="34" ry="30" fill="#35c9c0" stroke="#1d3a4a" stroke-width="3"/>
          <ellipse cx="-10" cy="16" rx="17" ry="13" fill="#6fe0d4" opacity=".55"/>
          <path d="M-16 56 Q-24 70 -18 84 Q-10 88 -7 76 Q-6 64 -12 56Z" fill="#35c9c0" stroke="#1d3a4a" stroke-width="2.6"/>
          <path d="M16 56 Q24 70 18 84 Q10 88 7 76 Q6 64 12 56Z" fill="#35c9c0" stroke="#1d3a4a" stroke-width="2.6"/>
          <circle cx="-12" cy="28" r="7.5" fill="#1a2030"/><circle cx="-9.8" cy="25.8" r="2.3" fill="#fff"/>
          <circle cx="12" cy="28" r="7.5" fill="#1a2030"/><circle cx="14.2" cy="25.8" r="2.3" fill="#fff"/>
          <g fill="none" stroke="#eafdff" stroke-width="2.2" opacity=".9">
            <circle cx="-12" cy="28" r="11"/><circle cx="12" cy="28" r="11"/><line x1="-1" y1="28" x2="1" y2="28"/>
          </g>
          <path d="M-9 42 Q0 48 9 42" fill="none" stroke="#1a8a80" stroke-width="2.2" stroke-linecap="round"/>
        </g>
      </g>
      <!-- the rock pinning him, deliberately OUTSIDE .scn-octo so it
           stays put on the floor while he bobs -->
      <g stroke="#1a3540" stroke-width="1.6" opacity=".5">
        <ellipse cx="135" cy="412" rx="16" ry="11" fill="#22404c" stroke="#1d3a4a" stroke-width="2.5"/>
        <line x1="125" y1="408" x2="140" y2="406"/>
      </g>
    </g>

  </g>
</svg>`;

const ISLAND_SCENES = {
  0: SNOW_BEACH_SCENE_SVG,      // Snow Beach      — Pip,      stranded near driftwood
  1: FISH_BAY_SCENE_SVG,        // Fish Bay        — Nori,     stranded near the lighthouse
  2: WHALE_COAST_SCENE_SVG,     // Whale Coast     — Bluebell, stranded out in the open sea
  3: PENGUIN_ISLANDS_SCENE_SVG, // Penguin Islands — Pebble,   stranded, isolated on the ice
  4: OCTOPUS_CAVE_SCENE_SVG,    // Octopus Cave    — Professor Octo, wedged by the wall, tentacle pinned under a rock
};

// Mounts/unmounts the bespoke scene in #challengeCustomBg. Islands with no
// entry in ISLAND_SCENES just get the container hidden/cleared — no behavior
// change for them, they keep using the existing gradient + generic watermark.
function setupIslandScene(scene, worldId) {
  const bg = scene.querySelector("#challengeCustomBg");
  if (!bg) return;
  const svg = ISLAND_SCENES[worldId];
  if (svg) {
    if (bg.dataset.world !== String(worldId)) {
      bg.innerHTML = svg;
      bg.dataset.world = String(worldId);
    }
    bg.hidden = false;
  } else {
    bg.hidden = true;
    bg.innerHTML = "";
    delete bg.dataset.world;
  }
  // The generic per-island layers would otherwise sit on top of (and
  // visually clash with) the bespoke art, so hide just those three on
  // islands that have custom art.
  const iceberg = scene.querySelector(".iceberg");
  const wm      = scene.querySelector(".challenge-watermark");
  const ga      = scene.querySelector(".challenge-ground-accent");
  if (iceberg) iceberg.style.display = svg ? "none" : "";
  if (wm)      wm.style.display      = svg ? "none" : "";
  if (ga)      ga.style.display      = svg ? "none" : "";
}

// Sausage swims in from off-screen-left toward his usual spot as
// trip.solved/trip.needed increases — on EVERY island, not just ones with
// bespoke scene art, since this is plain CSS positioning independent of the
// background. Percent-based (not px) so it scales with the actual rendered
// width of .challenge-scene, which varies a lot (mobile full-width vs the
// desktop grid column).
//
// NOTE — this is an approximation, not pixel-perfect alignment: the
// background SVGs use their own internal 0–800 coordinate space (scaled to
// "cover" the container via preserveAspectRatio="...slice", which crops
// rather than fits), while #missionSealRig is positioned in plain CSS
// percent relative to .challenge-scene's actual rendered box. The two
// coordinate systems don't translate 1:1 across every aspect ratio/viewport,
// so Sausage will land "in the right neighborhood" near the friend rather
// than exactly on top of them pixel-for-pixel. Good enough for a charming
// mascot animation; true pixel-perfect sync would need reading the SVG's
// actual on-screen transform at runtime (getScreenCTM() or similar), which
// is a fair bit more work — say if that's worth doing later.
const SEAL_SWIM_START_LEFT_PCT = -12; // just off-screen, about to swim in
const SEAL_SWIM_END_LEFT_PCT   = 14;  // arrived, near the friend
function syncMissionSeal() {
  if (!trip) return;
  const rig = document.querySelector("#missionSealRig");
  if (!rig) return;
  const pct = Math.min(1, trip.solved / trip.needed);
  const left = SEAL_SWIM_START_LEFT_PCT + (SEAL_SWIM_END_LEFT_PCT - SEAL_SWIM_START_LEFT_PCT) * pct;
  rig.style.left = `${left.toFixed(1)}%`;
}

function islandSvg(world, locked) {
  const [c1,c2] = locked ? ["#d6dde0","#aebbc2"] : world.palette;
  const decor = ISLAND_DECOR[world.id];
  return `<svg viewBox="0 0 180 160" aria-hidden="true">
    <ellipse cx="90" cy="116" rx="72" ry="30" fill="${c1}"/>
    <path d="M28 112c22-52 50-72 84-60 22 8 38 28 48 60z" fill="${c2}"/>
    <path d="M47 101h86" stroke="#fff" stroke-width="9" stroke-linecap="round"/>
    ${decor}
  </svg>`;
}

// P15: lightweight per-island accent for the challenge screen — just the
// island's own emblem (sun+shell, fish, whale tail, penguin, octopus,
// mortarboard, crown, star), no hill/ground beneath it, faded into a corner
// watermark. Reuses ISLAND_DECOR directly, so this is zero new art.
function islandWatermarkSvg(worldId) {
  return `<svg viewBox="20 18 140 88" aria-hidden="true">${ISLAND_DECOR[worldId] || ""}</svg>`;
}

function renderQuest() {
  const w       = worlds[selectedWorld];
  const done    = completedMissions();
  const mission = nextMission();
  const details = md(mission) || md(4);
  const islandPct = Math.round((done/5)*100);
  const wName   = t(`world${selectedWorld}`) || w.name;
  $("questTitle").textContent    = wName;
  const rec = recommendedLevels[selectedWorld];
  const wSub = currentLang === "ru" ? (w.subtitleRu || w.subtitle) : w.subtitle;
  $("questText").textContent     = `${wSub}. ${details.story} ${t("recommendedLevel")} ${rec}.`;
  $("dialogBox").textContent     = state.level < rec ? t("underleveledHint").replace("{character}", w.character).replace("{rec}", rec) : dialogFor(w, mission);
  $("islandProgressText").textContent  = `${t("islandProgress")} ${islandPct}%`;
  $("islandMeter").style.width   = `${islandPct}%`;
  $("missionProgressText").textContent = done >= 5 ? t("islandComplete") : `${t("missionOf")} ${mission+1} / 5`;
  $("missionMeter").style.width  = `${done >= 5 ? 100 : 0}%`;
  $("nextRewardText").textContent = `${t("objective")}: ${details.objective}. ${t("rewardLabel")}: ${details.reward}.`;
  $("startChallengeBtn").textContent = done >= 5 ? t("replayMission") : `${t("startMission")} ${mission+1}`;
}

function dialogFor(world, mission) {
  // S12: was generic flavor text where the character narrated about "a
  // friend" in third person while already chatting with you — confusing,
  // since that same character IS the friend you rescue. Now it's a small
  // arc: a faint distant voice, then them speaking for themselves while
  // stranded, then a grateful companion — closing the loop with the
  // "storm scattered everyone" premise from onboarding.
  const nb = nextBuilding();
  const buildLabel = nb ? buildingName(nb) : (currentLang === "ru" ? "город" : "the town");
  const linesEn = [
    `${world.character}: I hear something out there, Sausage — almost like a tiny cry on the wind. Let's follow the clues.`,
    `${world.character}: Over here! I'm stuck and so cold... three good answers and that sled will reach me!`,
    `${world.character}: Phew, thank you! Let's help build the ${buildLabel} for whoever the storm scattered next.`,
    `${world.character}: I spotted something shiny while I was waiting to be found. Let's dig it out together!`,
    `${world.character}: One more push, Sausage. After this, the storm that scattered us all will finally rest.`
  ];
  const linesRu = [
    `${world.character}: Я что-то слышу, Тюлень — будто тихий зов на ветру. Пойдём по следам.`,
    `${world.character}: Я тут! Застрял и так замёрз... три верных ответа — и нарты доберутся до меня!`,
    `${world.character}: Уф, спасибо! Поможем построить «${buildLabel}» для тех, кого буря разбросала вслед за мной.`,
    `${world.character}: Я заметил что-то блестящее, пока ждал спасения. Давай выкопаем это вместе!`,
    `${world.character}: Ещё немного, Тюлень. После этого буря, что разбросала всех нас, наконец утихнет.`
  ];
  const lines = currentLang === "ru" ? linesRu : linesEn;
  return lines[mission] || (currentLang === "ru"
    ? `${world.character}: Теперь этот остров в безопасности благодаря тебе. Хочешь исследовать его снова за дополнительное сокровище?`
    : `${world.character}: This island is safe now, thanks to you. Want to explore it again for extra treasure?`);
}

// ─── Mission ─────────────────────────────────────────────────────────────────
function exitMission() {
  const modal = $("exitMissionModal");
  if (modal) modal.hidden = false;
  else confirmExitMission(); // fallback if the modal markup is ever missing
}

function confirmExitMission() {
  const modal = $("exitMissionModal");
  if (modal) modal.hidden = true;
  trip.active = false;
  $("challenge").hidden = true;
  const old = $("backToMapBtn");
  if (old) old.remove();
  renderQuest();
}

function closeExitMissionModal() {
  const modal = $("exitMissionModal");
  if (modal) modal.hidden = true;
}

function startMission(daily) {
  if (miniGameTimer) { clearTimeout(miniGameTimer); miniGameTimer = null; }
  switchView("adventure");
  const mission = daily ? 0 : nextMission();
  trip = { active:true, world:selectedWorld, mission, solved:0, needed:5+(mission>2?2:0), correct:0, daily, mistakes:0, stormIntensity:100, combo:0 };
  syncMissionSeal();
  $("challenge").hidden = false;
  $("miniGame").hidden  = true;
  $("challenge").scrollIntoView({ behavior: "smooth", block: "start" });
  const stormEl  = $("stormOverlay");
  const cloudsEl = $("stormClouds");
  if (stormEl)  { stormEl.classList.remove("calm-flash"); stormEl.hidden  = mission !== 4; }
  if (cloudsEl) cloudsEl.hidden = mission !== 4;
  if (mission === 4) syncStormVisuals();
  // Back-to-map button — recreate fresh each time, overlay on the scene
  const old = $("backToMapBtn");
  if (old) old.remove();
  const backBtn = document.createElement("button");
  backBtn.id = "backToMapBtn";
  backBtn.className = "back-to-map-btn";
  backBtn.innerHTML = `← ${t("backToMap")}`;
  backBtn.addEventListener("click", exitMission);
  const sceneEl = document.querySelector(".challenge-scene");
  if (sceneEl) sceneEl.prepend(backBtn);
  else $("challenge").prepend(backBtn);
  // P6: apply island palette to challenge scene
  const w = worlds[trip.world];
  const scene = document.querySelector(".challenge-scene");
  if (scene) {
    scene.style.background = `linear-gradient(${w.palette[0]} 0 45%, ${w.palette[1]} 45% 100%)`;
    setupIslandScene(scene, w.id);
    // P15: faint per-island emblem watermark — cheap reuse of the existing
    // map-icon art, just enough to make the challenge screen feel like it
    // belongs to this specific island instead of only the background color.
    let wm = scene.querySelector(".challenge-watermark");
    if (!wm) {
      wm = document.createElement("div");
      wm.className = "challenge-watermark";
      scene.appendChild(wm);
    }
    wm.innerHTML = islandWatermarkSvg(w.id);
    // P5 (lite): ground-level themed accent (footprints, bubbles, etc.) —
    // inserted right after .iceberg in DOM order (not appended at the end)
    // and given no z-index, so it naturally paints above the plain
    // background but below the seal/fish-stream/storm layers that follow it.
    let ga = scene.querySelector(".challenge-ground-accent");
    if (!ga) {
      ga = document.createElement("div");
      ga.className = "challenge-ground-accent";
      const icebergEl = scene.querySelector(".iceberg");
      if (icebergEl) icebergEl.insertAdjacentElement("afterend", ga);
      else scene.prepend(ga);
    }
    ga.innerHTML = islandGroundAccentSvg(w.id);
  }
  react("swim");
  makeProblem();
}

// S11: goal icon for the mission trail — mission 1 (Rescue a Friend) shows
// the actual friend waiting on this island; other mission types get a
// generic icon matching their theme. Same trail/marker works for all of them.
function nextBuilding() { return buildings.find(b => !state.buildings.includes(b.id)); }
function buildingName(b) { return currentLang === "ru" ? (buildingNamesRu[b.id] || b.name) : b.name; }

function missionGoalIcon(world, mission) {
  if (mission === 1) return animalSvg(world.animal);
  if (mission === 2) { const nb = nextBuilding(); if (nb) return buildingSvg(nb.id); }
  // S13: was `["🔍","🏗️","🎁","☀️"][mission]` — a plain index lookup that
  // silently shifted by one for every mission after 1 (which returns above
  // before reaching this array), so Build showed a gift, Treasure showed a
  // sun, and Storm fell through to the "🏁" fallback. Explicit keys instead.
  const icons = { 0:"🔍", 2:"🏗️", 3:"🎁", 4:"☀️" };
  return icons[mission] || "🏁";
}

function missionTrailPos(solved, needed) {
  return 8 + Math.min(1, solved / needed) * 84; // % across the track, clear of start/goal icons
}

// S15/S16: storm boss mode — progress is driven by stormIntensity (clamped
// 0-100), not the usual solved/needed ratio, since mistakes can push it back
// up. syncStormVisuals() is the single place that draws it (tint + clouds +
// trail + label) so init and every answer share the exact same code path —
// no risk of one spot drawing a stale state.
function stormTrailPos() {
  return 8 + Math.min(1, Math.max(0, (100 - trip.stormIntensity) / 100)) * 84;
}
function syncStormVisuals() {
  const pct = trip.stormIntensity / 100;
  const overlayEl = $("stormOverlay");
  if (overlayEl) overlayEl.style.opacity = String(Math.pow(pct, 0.7) * 0.72);
  const cloudsEl = $("stormClouds");
  if (cloudsEl) {
    cloudsEl.style.opacity = String(Math.pow(pct, 0.55) * 0.95); // stays visible longer, only clears near the very end
    cloudsEl.querySelectorAll(".storm-cloud").forEach((c, i) => {
      const drift = (1 - pct) * (45 + i * 20); // each cloud blows away at a slightly different rate
      const dir   = i % 2 === 0 ? -1 : 1;
      c.style.transform = `translateX(${dir * drift}%) scale(${1 - (1-pct)*0.35})`;
    });
  }
  $("missionTrailMarker").style.left = `${stormTrailPos()}%`;
  $("questionsLeft").textContent = currentLang === "ru"
    ? `🌪️ Буря: ${Math.round(trip.stormIntensity)}%`
    : `🌪️ Storm: ${Math.round(trip.stormIntensity)}%`;
}
function adjustStorm(delta) {
  trip.stormIntensity = Math.max(0, Math.min(100, trip.stormIntensity + delta));
  syncStormVisuals();
}

function makeProblem() {
  const world   = worlds[trip.world];
  const topic   = chooseTopic(world.topics);
  const details = md(trip.mission) || md(0);
  const wName   = t(`world${world.id}`) || world.name;
  currentProblem = generateProblem(topic);
  currentProblem.started = Date.now();
  $("topicLabel").innerHTML    = currentLang === "learn"
    ? `${wName} - ${details.title}<span class="learn-ru">${topicLabelLearn(topic)}</span>`
    : `${wName} - ${details.title}`;
  $("missionTitle").textContent  = trip.daily ? t("dailyRescue") : `${t("missionOf")} ${trip.mission+1}: ${details.title}`;
  if (trip.mission === 4) {
    syncStormVisuals();
  } else {
    $("questionsLeft").textContent = `${Math.max(0, trip.needed-trip.solved)} ${t("questionsLeft")}`;
    $("missionTrailMarker").style.left = `${missionTrailPos(trip.solved, trip.needed)}%`;
  }
  syncMissionSeal();
  $("missionTrailGoal").innerHTML = missionGoalIcon(world, trip.mission);
  $("problemText").textContent   = currentProblem.text;
  $("hintText").hidden           = true;
  $("hintText").textContent      = currentProblem.hint;
  // P2: clear any previous correct-reveal and continue button
  $("correctReveal").hidden = true;
  const oldContinue = $("continueBtn");
  if (oldContinue) oldContinue.remove();
  // P7: clear any previous second-chance nudge
  $("retryNudge").hidden = true;

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
      const isRu = currentLang === "ru";
      // P12: previously this showed only the bare sequence ("15, 20, 25, 30, ?")
      // with no instruction — adults infer "find the next number", but a
      // young child may not. Every form now opens with a short prompt.
      const prefix = isRu ? "Что будет следующим? " : "What comes next? ";
      const patForms = [
        // arithmetic +step
        () => { const a=rand(6),b=rand(5)+1; return { text:`${prefix}${a}, ${a+b}, ${a+b*2}, ${a+b*3}, ?`, answer:a+b*4, hint: isRu?`Закономерность растёт на ${b} каждый шаг.`:`The pattern grows by ${b} each step.` }; },
        // arithmetic ×2 geometric
        () => { const a=rand(3)+1; return { text:`${prefix}${a}, ${a*2}, ${a*4}, ${a*8}, ?`, answer:a*16, hint: isRu?"Каждое число удваивается.":"Each number doubles." }; },
        // ×3
        () => { const a=rand(2)+1; return { text:`${prefix}${a}, ${a*3}, ${a*9}, ?`, answer:a*27, hint: isRu?"Каждое число умножается на 3.":"Each number is multiplied by 3." }; },
        // subtract pattern
        () => { const a=rand(10)+20, b=rand(4)+2; return { text:`${prefix}${a}, ${a-b}, ${a-b*2}, ${a-b*3}, ?`, answer:a-b*4, hint: isRu?`Закономерность уменьшается на ${b} каждый шаг.`:`The pattern decreases by ${b} each step.` }; },
        // skip counting by 5s/10s
        () => { const start=rand(8)*5, step=[5,10,25][rand(3)-1]; return { text:`${prefix}${start}, ${start+step}, ${start+step*2}, ${start+step*3}, ?`, answer:start+step*4, hint: isRu?`Считай по ${step}.`:`Count by ${step}s.` }; },
      ];
      const pf = patForms[Math.floor(Math.random()*patForms.length)]();
      text=pf.text; answer=pf.answer; hint=pf.hint; break;
    }

    case "logic": {
      const isRu = currentLang === "ru";
      const logicForms = [
        // three-quantity comparison — P12: previously asked "who has the
        // most?" with answers encoded as 1=Pip/2=Nori/3=Pebble. That broke
        // whenever two values tied (indexOf silently picked the first one,
        // marking an equally-correct answer wrong) and confused players
        // because the encoded answer (1/2/3) looked like it should be a
        // fish count. Now it just asks for the actual biggest number —
        // always well-defined, even with a tie, and the answer choices are
        // real quantities like every other question in the game.
        () => {
          const chars = isRu ? ["Пип","Нори","Пебл"] : ["Pip","Nori","Pebble"];
          const vals  = [rand(10)+1, rand(10)+1, rand(10)+1];
          const max   = Math.max(...vals);
          return isRu
            ? { text:`У ${chars[0]} ${vals[0]} рыбок. У ${chars[1]} ${vals[1]} рыбок. У ${chars[2]} ${vals[2]} рыбок. Сколько рыбок у того, у кого их больше всех?`,
                answer:max, hint:"Сравни все три числа и найди самое большое." }
            : { text:`${chars[0]} has ${vals[0]} fish. ${chars[1]} has ${vals[1]} fish. ${chars[2]} has ${vals[2]} fish. What is the largest number of fish anyone has?`,
                answer:max, hint:"Compare all three numbers and find the biggest." };
        },
        // simple puffin logic (original, keep variety)
        () => {
          const a=rand(8), b=rand(8);
          return isRu
            ? { text:`Два тупика принесли ${a} рыб и ${b} рыб, а потом нашли ещё 2. Сколько всего?`, answer:a+b+2, hint:"Сложи все три группы рыб." }
            : { text:`Two puffins bring ${a} fish and ${b} fish, then find 2 more. Total?`, answer:a+b+2, hint:"Add all three groups of fish." };
        },
        // ordering / median
        () => {
          const a=rand(20)+5, b=rand(20)+5, c=rand(20)+5;
          const sorted=[a,b,c].sort((x,y)=>x-y);
          return isRu
            ? { text:`У Колбаски ${a} рыб, у Пипа ${b}, у Нори ${c}. Какое число посередине (медиана)?`, answer:sorted[1], hint:"Расставь числа по порядку и найди то, что в середине." }
            : { text:`Sausage has ${a} fish, Pip has ${b}, Nori has ${c}. What is the middle (median) amount?`, answer:sorted[1], hint:"Put the numbers in order and find the middle one." };
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
        () => { const r=rand(6)+2; const q=rand(10); const add=rand(10); return { text:`${r*q} ÷ ${r} + ${add} = ?`, answer:q+add, hint:"Divide first, then add." }; },
        () => { const p=rand(8)+1,q=rand(8)+1,r=rand(9)+1; return { text:`${p} + ${q} × ${r} = ?`, answer:p+q*r, hint:"Multiply first, then add the rest." }; }
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
// P7: the first wrong tap on a given problem is a free, unscored retry — it
// disables just that option and lets the player reconsider, instead of
// immediately disabling everything and revealing the answer. Stats, the
// smart hint, and the full reveal only kick in once the player misses a
// *second* time on the same problem (or gets it right on the retry).
function answer(value, btn) {
  const correct = value === currentProblem.answer;

  if (!correct && !currentProblem.attempts) {
    currentProblem.attempts = 1;
    btn.disabled = true;
    btn.classList.add("wrong");
    showRetryNudge();
    react("thinking");
    playSound("wrong");
    speak("wrong");
    return;
  }
  hideRetryNudge();

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
    trip.combo = (trip.combo || 0) + 1;
    const reward  = gainRewards();
    const comboMsg = comboCelebration(trip.combo);
    animateFish();
    react("happy");
    playSound("correct");
    speak("correct");
    if (comboMsg) { toast(comboMsg); playSound("achievement"); }
    else           toast(encouragement(reward));
    announceResult(true, currentProblem.answer, currentProblem.topic);
    if (trip.mission === 4) {
      adjustStorm(-18);
      setTimeout(() => trip.stormIntensity <= 0 ? clearStorm() : makeProblem(), 860);
    } else {
      $("questionsLeft").textContent = `${Math.max(0, trip.needed-trip.solved)} ${t("questionsLeft")}`;
      $("missionMeter").style.width  = `${Math.round((trip.solved/trip.needed)*100)}%`;
      $("missionTrailMarker").style.left = `${missionTrailPos(trip.solved, trip.needed)}%`;
      syncMissionSeal();
      setTimeout(() => trip.solved >= trip.needed ? completeMission() : makeProblem(), 860);
    }
  } else {
    state.wrong++;
    state.topics[topic].wrong++;
    trip.mistakes++;
    trip.combo = 0;
    if (trip.mission === 4) adjustStorm(9);
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

// P7: soft nudge shown after the first wrong tap — encourages a retry
// without revealing the answer or penalizing stats yet.
function showRetryNudge() {
  const el = $("retryNudge");
  if (!el) return;
  el.textContent = `🤔 ${t("tryAgainNudge")}`;
  el.hidden = false;
}
function hideRetryNudge() {
  const el = $("retryNudge");
  if (el) el.hidden = true;
}

// P2: show the correct answer with explanation + continue button
function showCorrectReveal(problem) {
  const el = $("correctReveal");
  if (!el) return;
  let answerText = `The answer is ${problem.answer}`;
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
  // Add a "Next Question →" button after the reveal panel
  const el = $("correctReveal");
  if (!el) return;
  // Remove any existing continue btn first
  const existing = $("continueBtn");
  if (existing) existing.remove();
  const btn = document.createElement("button");
  btn.id = "continueBtn";
  btn.className = "continue-btn";
  btn.textContent = "Next Question →";
  btn.setAttribute("aria-label", "Continue to next question");
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
  // P11: small randomization (0.8x-1.3x) so identical actions don't pay out
  // identically every time — keeps rewards feeling alive instead of mechanical.
  const vary = base => Math.max(1, Math.round(base * (0.8 + Math.random()*0.5))) * mult;
  const fishGain  = vary(4);
  const coinsGain = vary(2);
  const starsGain = vary(1);
  const xpGain    = vary(18);
  state.fish  += fishGain;
  state.coins += coinsGain;
  state.stars += starsGain;
  state.xp    += xpGain;
  while (state.xp >= 100) {
    state.xp -= 100;
    state.level++;
    playSound("level");
    toast(`Level ${state.level}! 🎉`);
  }
  return { fish:fishGain, coins:coinsGain, stars:starsGain, xp:xpGain };
}

// S15: storm fully calmed — let the flash play, say something fitting,
// then fall through to the exact same completeMission() every other
// mission uses (rewards/unlocks/buildings all stay identical).
function clearStorm() {
  const el = $("stormOverlay");
  const cloudsEl = $("stormClouds");
  if (el) { el.classList.add("calm-flash"); }
  if (cloudsEl) { cloudsEl.style.opacity = "0"; }
  playSound("perfect");
  toast(currentLang === "ru" ? "Буря стихла! ☀️" : "The storm has calmed! ☀️");
  setTimeout(() => {
    if (el)      { el.hidden = true; el.classList.remove("calm-flash"); }
    if (cloudsEl) cloudsEl.hidden = true;
    completeMission();
  }, 1100);
}

function completeMission() {
  $("challenge").hidden = true;
  if (trip.mistakes === 0) state.perfectTrips++;

  const world    = worlds[trip.world];
  const oldDone  = completedMissions(trip.world);
  if (!trip.daily && oldDone < 5) state.missions[missionKey(trip.world)] = oldDone + 1;
  const newDone  = completedMissions(trip.world);

  let animal   = null;
  let building = null;
  let rare     = false;
  const isCampaignFinale = trip.world === 7 && newDone >= 5 && !state.guardianCrowned;

  if (!state.animals.includes(world.animal) && newDone >= 2) {
    animal = animals[world.animal];
    state.animals.push(world.animal);
  }
  if (newDone >= 3) {
    building = buildings.find(b => !state.buildings.includes(b.id) && state.stars >= b.cost);
    if (building) {
      state.buildings.push(building.id);
      // P14: stars are now actually spent on the building, not just checked
      // as a threshold — previously they never decreased, so every building
      // became "affordable" the moment total stars passed 24 and stayed
      // that way forever. Total cost across all 8 buildings is 108, which
      // comfortably matches ~100-110 correct answers across the campaign,
      // so no rebalancing was needed — just removing the bug.
      state.stars -= building.cost;
      // P8: building celebration
      celebrateBuilding(building);
    } else {
      // P8: tell player how many stars they still need
      const next = buildings.find(b => !state.buildings.includes(b.id));
      if (next) {
        const need = Math.max(0, next.cost - state.stars);
        toast(currentLang === "ru"
          ? `Ещё ${need} ⭐ до постройки: ${buildingName(next)}!`
          : `Need ${need} more stars to build ${buildingName(next)}!`);
      }
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
  if (isCampaignFinale) {
    state.guardianCrowned = true;
    const cape = shop.find(s => s.className === "guardiancape");
    if (cape && !state.shop.includes(cape.id)) {
      state.shop.push(cape.id);
      equipWithZoneCheck(cape);
    }
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
  } else if (isCampaignFinale) {
    showGuardianCeremony();
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

function encouragement(reward) {
  const rewardLine = reward
    ? (currentLang === "ru"
        ? `+${reward.fish} рыбок, +${reward.coins} монет, +${reward.stars} ⭐`
        : `+${reward.fish} fish, +${reward.coins} coins, +${reward.stars} star${reward.stars===1?"":"s"}`)
    : (currentLang === "ru" ? "+4 рыбки, +2 монеты, +1 звезда" : "+4 fish, +2 coins, +1 star");
  const lines = currentLang === "ru"
    ? ["Тюлень плывёт вперёд!","Отличный спасательный ход!", rewardLine, "Остров становится светлее!","Отличная мысль!"]
    : ["Sausage splashes ahead!","Great rescue move!", rewardLine, "The island gets brighter!","Nice thinking!"];
  return lines[Math.floor(Math.random()*lines.length)];
}

// P11: in-session combo feedback — separate from the daily/global streak.
// Resets on any wrong answer (see answer()); celebrates at 3/5/8/12, then
// every 5 after that, so a long run keeps getting new feedback instead of
// going silent.
function comboCelebration(n) {
  const tiers = { 3:"🔥", 5:"⭐", 8:"🌟", 12:"💎" };
  let icon = tiers[n];
  if (!icon && n > 12 && n % 5 === 0) icon = "💎";
  if (!icon) return null;
  return currentLang === "ru" ? `${icon} ${n} подряд!` : `${icon} ${n} in a row!`;
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
  guardiancape: { costume:"costume-guardiancape", accessory:null,           pet:null },
  wizard:    { costume:"costume-wizard",      accessory:null,               pet:null },
  sunny:     { costume:null,                  accessory:"accessory-sunny",  pet:null },
  scarf:     { costume:null,                  accessory:"accessory-scarf",  pet:null },
  goggles:   { costume:null,                  accessory:"accessory-goggles",pet:null },
  bowtie:    { costume:null,                  accessory:"accessory-bowtie", pet:null },
  pet:       { costume:null,                  accessory:null,               pet:"pet-fish" },
  owlpet:    { costume:null,                  accessory:null,               pet:"pet-owl" }
};

// P12: each costume/accessory occupies a region of the seal's body. Pirate,
// Astronaut and King are all drawn on the head, same as the Sunny Hat
// accessory — equipping both at once (e.g. Pirate Seal + Sunny Hat) draws
// two hats on top of each other. Goggles (face) and Scarf (neck) sit in
// different regions so they're free to combine with any costume. Tagging
// the zone here means equipWithZoneCheck() automatically keeps this safe
// as new costumes/accessories get added later — no per-pair listing needed.
const ITEM_ZONES = {
  pirate:"head", astronaut:"head", king:"head", superhero:"back",
  sunny:"head",  scarf:"neck",     goggles:"face", pet:null, guardiancape:"head",
  wizard:"head", bowtie:"neck",    owlpet:null
};

// Equip an item, auto-removing anything already worn in the same visual
// zone so costumes/accessories never visually collide. Returns the item
// that got bumped (or null), so callers can let the player know.
function equipWithZoneCheck(item) {
  const zone = ITEM_ZONES[item.className];
  let replaced = null;
  if (zone) {
    Object.keys(state.equipped).forEach(slot => {
      if (slot === item.type) return;
      const otherId = state.equipped[slot];
      if (otherId === null || otherId === undefined) return;
      const otherItem = shop.find(s => s.id === otherId);
      if (otherItem && ITEM_ZONES[otherItem.className] === zone) {
        state.equipped[slot] = null;
        replaced = otherItem;
      }
    });
  }
  state.equipped[item.type] = item.id;
  return replaced;
}

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
        <div class="rescue-speech">"${rescueLine()}"</div>
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

// Campaign finale — reuses the same reward-modal shell as showReward() (no
// new markup needed) but with dedicated content: announces the Guardian
// title and the exclusive Guardian Cape, which was already granted +
// auto-equipped by completeMission() right before this is called.
function showGuardianCeremony() {
  const cape = shop.find(s => s.className === "guardiancape");
  $("rewardTitle").textContent = t("guardianTitle");
  $("rewardText").innerHTML = `<div class="rescue-card">${cape ? costumeSvg(cape.id) : ""}<p class="rescue-fact">${t("guardianBody")}</p></div>`;
  $("rewardModal").hidden = false;
}

// S7: ghost silhouette of the next building Sausage hasn't unlocked yet.
// Shows kids exactly where the town is about to grow and how many stars are
// left, so the scene always promises something instead of just listing it
// in a separate grid below.
function townGhostHtml(positions) {
  const next = nextBuilding();
  if (!next) return "";
  const [left, top] = positions[next.id];
  const finale = next.id === 7 ? " is-finale" : "";
  const need = Math.max(0, next.cost - state.stars);
  const badge = currentLang === "ru"
    ? `⭐ ${need} до постройки: ${buildingName(next)}`
    : `⭐ ${need} to build ${buildingName(next)}`;
  return `<div class="town-ghost-wrap${finale}" style="left:${left}%;top:${top}%" aria-hidden="true">
    <div class="town-building-ghost">${buildingSvg(next.id)}</div>
    <div class="town-ghost-badge">${badge}</div>
  </div>`;
}

// S7: a recognizable little fish for the swimming background decoration —
// was a plain yellow CSS oval+triangle, easy to mistake for a water splash.
// Three real Arctic species as colour variants so it's not one fish on loop.
function townFishSvg(variant = 0) {
  const palettes = [
    { body:"#5fc6e8", belly:"#8fdaf0", fin:"#3aa8cc" }, // 0 Arctic cod
    { body:"#c9d6e0", belly:"#eef3f6", fin:"#9fb0bd" }, // 1 Capelin — paler, silvery
    { body:"#5ca8c2", belly:"#ffb8c4", fin:"#3f8aa0" }, // 2 Arctic char — pink belly
  ];
  const p = palettes[variant] || palettes[0];
  const spots = variant === 2
    ? `<circle cx="24" cy="10" r="1" fill="#ffe1e8"/><circle cx="31" cy="15" r="1" fill="#ffe1e8"/>`
    : "";
  return `<svg viewBox="0 0 48 26" aria-hidden="true">
    <path d="M10 13 0 3 4 13 0 23Z" fill="${p.fin}"/>
    <ellipse cx="28" cy="13" rx="15" ry="9" fill="${p.body}"/>
    <ellipse cx="28" cy="17" rx="11" ry="4" fill="${p.belly}" opacity=".7"/>
    <path d="M20 5Q27-1 32 5Q27 7 20 5Z" fill="${p.fin}"/>
    ${spots}
    <circle cx="36" cy="10" r="2.4" fill="#143247"/>
    <circle cx="36.8" cy="9.2" r=".9" fill="#fff"/>
  </svg>`;
}

// ─── Town ─────────────────────────────────────────────────────────────────────
// S7: positions are clustered onto one shared ground band instead of scattered
// across the whole scene, with Ice Castle (id 7, the priciest/finale building)
// centered, set slightly further back, and rendered larger via .is-finale.
function renderTown() {
  const positions = [
    [6, 56],   // 0 Fish Market
    [18, 48],  // 1 Lighthouse
    [30, 58],  // 2 Aquarium
    [41, 50],  // 3 Seal House
    [60, 50],  // 4 Penguin Village
    [71, 58],  // 5 Harbor
    [84, 48],  // 6 Arctic Museum
    [50, 36],  // 7 Ice Castle — centered, set back, larger (focal point)
  ];

  // S6: Living Town — aurora, stars, snowflakes
  const starCount = 18;
  const stars = Array.from({length:starCount}, (_,i) => {
    const dur  = 1.5 + Math.random()*3;
    const del  = Math.random()*4;
    return `<div class="town-star" style="left:${Math.random()*100}%;top:${Math.random()*40}%;width:${2+Math.random()*3}px;height:${2+Math.random()*3}px;animation-duration:${dur}s;animation-delay:${del}s"></div>`;
  }).join("");

  const flakeEmojis = ["❄","❅","❆","✦"];
  const flakes = Array.from({length:8}, (_,i) => {
    const dur = 4+Math.random()*5;
    const del = Math.random()*6;
    return `<div class="town-flake" style="left:${Math.random()*90}%;animation-duration:${dur}s;animation-delay:${del}s">${flakeEmojis[i%4]}</div>`;
  }).join("");

  const auroraHtml = `<div class="town-aurora"><div class="town-aurora-band"></div><div class="town-aurora-band"></div><div class="town-aurora-band"></div>${stars}${flakes}</div>`;
  const groundHtml = `<div class="town-ground-snow"></div>`;

  const livelyExtras = `
    ${auroraHtml}
    ${groundHtml}
    <span class="town-fish" style="left:-50px;top:50%;animation-delay:0s;animation-duration:17s">${townFishSvg(0)}</span>
    <span class="town-fish" style="left:-130px;top:62%;animation-delay:4s;animation-duration:21s">${townFishSvg(1)}</span>
    <span class="town-fish" style="left:-90px;top:44%;animation-delay:9s;animation-duration:19s">${townFishSvg(2)}</span>
    <span class="town-splash" style="left:76%;top:47%"></span>
    <span class="town-critter" style="left:8%;top:74%">${animalSvg(1)}</span>
    <span class="town-critter" style="left:88%;top:68%;animation-delay:1s">${animalSvg(8)}</span>
  `;
  $("townScene").innerHTML = livelyExtras +
    buildings.map((b,i) => {
      if (!state.buildings.includes(b.id)) return "";
      const [left,top] = positions[i];
      const finale = b.id === 7 ? " is-finale" : "";
      return `<button class="town-building${finale}" style="left:${left}%;top:${top}%" data-building="${b.id}" aria-label="${b.name}">${buildingSvg(b.id)}</button>`;
    }).join("") +
    townGhostHtml(positions) +
    decorations.map(d => {
      if (!state.decorations.includes(d.id)) return "";
      return `<div class="town-decor" style="left:${d.left}%;${d.anchor}:${d.pos}%" data-decor="${d.id}" aria-hidden="true">${decorationSvg(d.id)}</div>`;
    }).join("") +
    state.animals.slice(0,9).map((id,i) => {
      const a       = animals.find(x => x.id === id);
      const feeds   = (state.animalFeeds && state.animalFeeds[id]) || 0;
      const canFeed = state.fish >= FEED_COST;
      const badge   = feeds > 0 ? `❤️${feeds}` : "🐟";
      const label   = currentLang === "ru"
        ? `Покормить ${a ? a.name : "друга"} — ${FEED_COST} рыбки`
        : `Feed ${a ? a.name : "friend"} — ${FEED_COST} fish`;
      return `<button class="town-friend${canFeed?"":" feed-disabled"}" style="left:${15+i*8}%;top:${70+(i%3)*6}%;animation-delay:${i*.25}s" data-feed="${id}" ${canFeed?"":"disabled"} aria-label="${label}">${animalSvg(id)}<span class="town-friend-badge">${badge}</span></button>`;
    }).join("");
  const scene = $("townScene");
  if (scene && !scene.dataset.bound) {
    scene.dataset.bound = "1";
    scene.addEventListener("click", e => {
      const feedBtn = e.target.closest("[data-feed]");
      if (feedBtn) {
        if (!feedBtn.disabled) feedAnimal(Number(feedBtn.dataset.feed));
        return;
      }
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
  // P9: Town Decorations grid — coins-based, same buy-row pattern as the shop
  $("decorGrid").innerHTML = decorations.map(d => {
    const owned = state.decorations.includes(d.id);
    return `<article class="item-card">${decorationSvg(d.id)}<h3>${decorName(d.id)}</h3>
      <p>${owned ? t("decorOwned") : t("decorAvailable")}</p>
      <div class="buy-row"><b>${d.cost} ${t("coins")}</b>
        <button data-decor-buy="${d.id}" ${owned||state.coins<d.cost?"disabled":""} aria-label="${owned?t("owned"):(t("buy")+" "+decorName(d.id)+" — "+d.cost)}">${owned?t("owned"):t("buy")}</button>
      </div></article>`;
  }).join("");
  const decorGrid = $("decorGrid");
  if (decorGrid && !decorGrid.dataset.bound) {
    decorGrid.dataset.bound = "1";
    decorGrid.addEventListener("click", e => {
      const btn = e.target.closest("[data-decor-buy]");
      if (btn && !btn.disabled) buyDecoration(Number(btn.dataset.decorBuy));
    });
  }
  const lcBtn = $("luckyCatchEntryBtn");
  if (lcBtn) {
    lcBtn.disabled = !canAffordLuckyCatch();
    lcBtn.textContent = currentLang === "ru"
      ? `🎣 Рыбалка (${LUCKY_CATCH_COST} 🐟)`
      : `🎣 Go Fishing (${LUCKY_CATCH_COST} 🐟)`;
  }
}

const FEED_COST = 2;
// P14: milestone flavor text shown when a feed count hits a nice round
// number — purely celebratory, nothing is ever required and nothing ever
// decays. Feeding (or never feeding) a friend has zero downside either way.
const FEED_MILESTONES = {
  5:  { en:"loves the snacks!",                 ru:"обожает рыбные перекусы!" },
  10: { en:"is your best friend now!",          ru:"теперь твой лучший друг!" },
  25: { en:"can't imagine the Arctic without you!", ru:"не представляет Арктику без тебя!" },
};

function renderAlbum() {
  $("albumGrid").innerHTML = animals.map(a => {
    const rescued = state.animals.includes(a.id);
    const feeds   = (state.animalFeeds && state.animalFeeds[a.id]) || 0;
    const feedRow = rescued ? `<div class="feed-row">
        <button class="feed-btn" data-feed="${a.id}" ${state.fish<FEED_COST?"disabled":""} aria-label="${currentLang==="ru"?`Покормить ${a.name} — ${FEED_COST} рыбки`:`Feed ${a.name} — ${FEED_COST} fish`}">🐟 ${currentLang==="ru"?"Покормить":"Feed"} (${FEED_COST})</button>
        ${feeds>0 ? `<span class="feed-count">${currentLang==="ru"?"Покормлен":"Fed"} ${feeds}×</span>` : ""}
      </div>` : "";
    return `<article class="item-card ${rescued?"":"locked"}">${animalSvg(a.id)}<h3>${rescued?a.name:"Hidden Friend"}</h3>
      <p>${rescued?`${a.species}: ${a.fact}`:"Complete story missions to discover this friend."}</p>
      ${feedRow}</article>`;
  }).join("");
  const albumGrid = $("albumGrid");
  if (albumGrid && !albumGrid.dataset.bound) {
    albumGrid.dataset.bound = "1";
    albumGrid.addEventListener("click", e => {
      const btn = e.target.closest("[data-feed]");
      if (!btn || btn.disabled) return;
      feedAnimal(Number(btn.dataset.feed));
    });
  }
}

function feedAnimal(id) {
  if (state.fish < FEED_COST) return;
  const a = animals.find(x => x.id === id);
  if (!a) return;
  state.fish -= FEED_COST;
  state.animalFeeds = state.animalFeeds || {};
  state.animalFeeds[id] = (state.animalFeeds[id] || 0) + 1;
  const count     = state.animalFeeds[id];
  const milestone = FEED_MILESTONES[count];
  playSound("coin");
  react("excited");
  toast(milestone
    ? (currentLang === "ru" ? `${a.name} ${milestone.ru}` : `${a.name} ${milestone.en}`)
    : (currentLang === "ru" ? `${a.name} рад рыбке! 🐟` : `${a.name} enjoyed the fish! 🐟`));
  checkAchievements();
  save();
  renderAlbum();
  renderTown();
  renderHeader();
}

function renderShop() {
  $("shopGrid").innerHTML = shop.filter(s => !s.earnedOnly).map(s => {
    const owned    = state.shop.includes(s.id);
    const equipped = state.equipped[s.type] === s.id;
    const statusText = owned ? (equipped ? t("equippedOnSausage") : t("ownedEquipInMySeal")) : t("visibleReward");
    return `<article class="item-card">${costumeSvg(s.id)}<h3>${s.name}</h3>
      <p>${statusText}</p>
      <div class="buy-row"><b>${s.cost} coins</b>
        <button data-shop="${s.id}" ${owned||state.coins<s.cost?"disabled":""} aria-label="${owned?t("owned"):(t("buy")+" "+s.name+" — "+s.cost)}">${owned?t("owned"):t("buy")}</button>
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
    equipWithZoneCheck(item);
    playSound("coin");
    react("excited");
    toast(`${item.name} ${t("unlockedAndEquipped")}`);
    checkAchievements();
    save();
    renderAll();
  }
}

function renderCloset() {
  // S6: Equipment overlay badges
  const equippedItems = Object.entries(state.equipped).map(([slot,id]) => {
    const item = shop.find(s => s.id===id);
    return { slot, item };
  });
  const overlayHtml = `<div class="equipment-overlay">${equippedItems.map(({slot,item}) =>
    item ? `<div class="equip-badge"><span class="equip-slot">${slot}:</span>${item.name}</div>` : ""
  ).join("")}</div>`;

  // S6: Summary chips row
  const summaryHtml = `<div class="equipped-summary">${equippedItems.map(({slot,item}) =>
    item
      ? `<span class="equipped-summary-chip">${slot}: <b>${item.name}</b></span>`
      : `<span class="equipped-summary-chip empty">${slot}: none</span>`
  ).join("")}</div>`;

  // Insert overlay into .seal-preview (needs position:relative via CSS)
  const previewEl = document.querySelector(".seal-preview");
  if (previewEl) {
    const existing = previewEl.querySelector(".equipment-overlay");
    if (existing) existing.remove();
    previewEl.insertAdjacentHTML("beforeend", overlayHtml);
  }

  $("equippedList").innerHTML = summaryHtml;
  $("closetGrid").innerHTML   = shop.map(item => {
    const owned  = state.shop.includes(item.id);
    const active = state.equipped[item.type] === item.id;
    const lockedText = item.earnedOnly ? t("earnedOnlyLocked") : `Buy in Rewards for ${item.cost} coins.`;
    return `<article class="item-card ${owned?"":"locked"}">${costumeSvg(item.id)}<h3>${item.name}</h3>
      <p>${owned?`Slot: ${item.type}`:lockedText}</p>
      <button class="equip-btn ${active?"active":""}" data-equip="${item.id}" ${owned?"":"disabled"} aria-label="${active?t("unequip"):"Equip "+item.name}">${active?t("unequip"):t("equip")}</button></article>`;
  }).join("");
  const closetGrid = $("closetGrid");
  if (closetGrid && !closetGrid.dataset.bound) {
    closetGrid.dataset.bound = "1";
    closetGrid.addEventListener("click", e => {
      const btn = e.target.closest("[data-equip]");
      if (!btn || btn.disabled) return;
      const item = shop[Number(btn.dataset.equip)];
      if (!item) return;
      // S9: clicking an already-equipped item now unequips it (back to bare
      // Sausage for that slot) instead of being a one-way-only action.
      const isActive = state.equipped[item.type] === item.id;
      if (isActive) {
        state.equipped[item.type] = null;
      } else {
        const replaced = equipWithZoneCheck(item);
        if (replaced) {
          toast(currentLang === "ru"
            ? `${item.name} и ${replaced.name} занимают одно место — сейчас надет ${item.name}.`
            : `${item.name} and ${replaced.name} share the same spot — wearing ${item.name} now.`);
        }
      }
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
      <span class="achievement-badge">${ACHIEVEMENT_ICONS[i] || "⭐"}</span>
      <h3>${name}</h3><p>${unlocked.has(i)?"Unlocked!":"Keep adventuring to discover this badge."}</p>
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

  $("dailyText").textContent = state.daily.claimed
    ? t("dailyClaimed")
    : narrative.text + ` (${Math.max(0,5-state.daily.solved)} more to go)`;
  $("dailyBonus").textContent = `Today's treasure: ${DAILY_SPECIAL_ICONS[state.dailySpecial]||"✨"} ${state.dailySpecial}. Streak bonus: +${Math.min(20, state.streak.count*3)} fish and coins.`;
  $("dailyBtn").disabled      = state.daily.claimed;

  // P9: show collected daily specials if any
  const collectedEl = $("dailyCollected");
  if (collectedEl) {
    if (state.specialCosmetics.length > 0) {
      collectedEl.innerHTML = `<p class="daily-collected-label">Your collection (${state.specialCosmetics.length}):</p>
        <div class="daily-collected-grid">${state.specialCosmetics.map(n=>`<span class="daily-badge">${DAILY_SPECIAL_ICONS[n]||"✨"} ${n}</span>`).join("")}</div>`;
      collectedEl.hidden = false;
    } else {
      collectedEl.hidden = true;
    }
  }

  // P11: streak grid shows progress through the *current* 7-day cycle so it
  // stays meaningful past day 7, plus a summary line with the real streak
  // count, next milestone, and any banked freeze tokens.
  const dayInCycle = state.streak.count > 0 ? ((state.streak.count - 1) % 7) + 1 : 0;
  $("streakGrid").innerHTML = Array.from({length:7}, (_,i) =>
    `<div class="day ${i < dayInCycle?"done":""}" aria-label="Day ${i+1}${i<dayInCycle?" - completed":""}">Day<br>${i+1}</div>`
  ).join("");

  const milestones     = [7, 14, 30, 60, 100];
  const nextMilestone  = milestones.find(m => m > state.streak.count);
  const freezeTokens   = state.streak.freezeTokens || 0;
  const streakSummaryEl = $("streakSummary");
  if (streakSummaryEl) {
    streakSummaryEl.innerHTML = currentLang === "ru"
      ? `<p>🔥 Серия: ${state.streak.count} ${state.streak.count===1?"день":"дней"}${nextMilestone?` · значок на ${nextMilestone}-й день`:""}</p>
         <p>❄️ ${freezeTokens} заморозк${freezeTokens===1?"а":"и"} серии в запасе</p>`
      : `<p>🔥 Streak: ${state.streak.count} day${state.streak.count===1?"":"s"}${nextMilestone?` · next badge at day ${nextMilestone}`:""}</p>
         <p>❄️ ${freezeTokens} streak freeze${freezeTokens===1?"":"s"} banked — auto-protects one missed day</p>`;
  }
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
// ─── Dashboard ────────────────────────────────────────────────────────────────
function renderDashboard() {
  const prof        = getActiveProfile();
  const accuracy    = state.solved ? Math.round((state.correct/state.solved)*100) : 0;
  const sorted      = Object.entries(state.topics).sort((a,b) => weakness(a[0]) - weakness(b[0]));
  const strong      = sorted.slice(0,3).map(([tk]) => topicLabel(tk)).join(", ") || t("playToDiscover");
  const weak        = sorted.slice(-3).reverse().map(([tk]) => topicLabel(tk)).join(", ") || t("playToDiscover");
  const minutes     = Math.round((state.timePlayed+(Date.now()-state.startedAt)/1000)/60);
  const missionTotal= Object.values(state.missions).reduce((a,b)=>a+b,0);
  const langDisplay = currentLang === "learn" ? "📖 Learning" : currentLang === "ru" ? "🇷🇺 Russian" : "🇺🇸 English";

  // S6: Accuracy ring
  const circ     = Math.PI * 2 * 34;
  const filled   = circ * (accuracy / 100);
  const ringColor= accuracy >= 80 ? "#4fd6a8" : accuracy >= 55 ? "#ffd45a" : "#ff7b7b";
  const accuracyRingHtml = `
    <div class="parent-chart-area">
      <p class="parent-chart-title">${t("accuracy")}</p>
      <div class="accuracy-ring-wrap">
        <div class="accuracy-ring">
          <svg viewBox="0 0 88 88">
            <circle cx="44" cy="44" r="34" fill="none" stroke="#e0f0f8" stroke-width="9"/>
            <circle cx="44" cy="44" r="34" fill="none" stroke="${ringColor}" stroke-width="9"
              stroke-dasharray="${filled.toFixed(1)} ${(circ-filled).toFixed(1)}"
              stroke-linecap="round"/>
          </svg>
          <div class="accuracy-ring-text">
            <span class="accuracy-ring-pct">${accuracy}%</span>
            <span class="accuracy-ring-lbl">acc</span>
          </div>
        </div>
        <div class="accuracy-stats-list">
          <div class="accuracy-stat-item">${t("solvedProblems")} <span>${state.solved}</span></div>
          <div class="accuracy-stat-item">Correct <span>${state.correct}</span></div>
          <div class="accuracy-stat-item">Wrong <span>${state.wrong}</span></div>
          <div class="accuracy-stat-item">${t("timePlayed")} <span>${minutes} min</span></div>
        </div>
      </div>
    </div>`;

  // S6: Topic performance bars
  const playedTopics = Object.entries(state.topics)
    .map(([key, v]) => ({ key, total: v.correct + v.wrong, acc: v.correct + v.wrong > 0 ? Math.round(v.correct/(v.correct+v.wrong)*100) : null }))
    .filter(x => x.total > 0)
    .sort((a,b) => b.total - a.total)
    .slice(0, 8);
  const topicBarsHtml = playedTopics.length > 0 ? `
    <div class="parent-chart-area">
      <p class="parent-chart-title">Topic Performance</p>
      <div class="topic-bar-chart">
        ${playedTopics.map(({ key, acc }) => {
          const cls = acc === null ? "mid" : acc >= 80 ? "strong" : acc >= 55 ? "mid" : "weak";
          const pct = acc ?? 0;
          return `<div class="topic-bar-row">
            <span class="topic-bar-label">${topicLabel(key)}</span>
            <div class="topic-bar-track"><div class="topic-bar-fill ${cls}" style="width:${pct}%"></div></div>
            <span class="topic-bar-pct">${acc !== null ? acc+"%" : "—"}</span>
          </div>`;
        }).join("")}
      </div>
    </div>` : "";

  // S6: Island progress timeline
  const worldBars   = worlds.map(w => {
    const done = completedMissions(w.id);
    const pct  = done / 5 * 100;
    const wName= t(`world${w.id}`) || w.name;
    return `<div class="timeline-bar" style="height:${Math.max(4,pct*0.54)}px" data-label="${wName}: ${done}/5"></div>`;
  }).join("");
  const worldLabels = worlds.map(w => `<span class="timeline-label">${w.id+1}</span>`).join("");
  const timelineHtml = `
    <div class="parent-chart-area">
      <p class="parent-chart-title">Island Progress</p>
      <div class="progress-timeline">${worldBars}</div>
      <div class="timeline-labels">${worldLabels}</div>
    </div>`;

  // Stat overview cards
  const statCards = [
    [t("playerLabel") || "Player",         prof ? `${prof.emoji} ${escapeHtml(prof.name)}` : "—"],
    [t("languageLabel") || "Language",     langDisplay],
    [t("currentLevel"),                    state.level],
    [t("missionProgress"),                 `${missionTotal}/40`],
    [t("townProgress"),                    `${state.buildings.length}/8`],
    [t("friendRescue"),                    `${state.animals.length}/${animals.length}`],
    [t("collection"),                      `${state.shop.length}/${shop.filter(s=>!s.earnedOnly).length}`],
    [t("strongTopics"),                    strong],
    [t("weakTopics"),                      weak],
  ].map(s => `<article class="stat-card"><h3>${s[0]}</h3><p>${s[1]}</p></article>`).join("");

  $("dashboard").innerHTML = `
    ${accuracyRingHtml}
    ${topicBarsHtml}
    ${timelineHtml}
    <p class="parent-section-title">Overview</p>
    <div style="display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(148px,1fr))">${statCards}</div>
  `;
}


// ─── S2: Mini-games (5 games, Treasure Hunt removed) ─────────────────────────
function startMiniGame() {
  $("miniGame").hidden  = false;
  $("challenge").hidden = true;
  $("miniGame").scrollIntoView({ behavior: "smooth", block: "start" });
  if (miniGameTimer) { clearTimeout(miniGameTimer); miniGameTimer = null; }
  const gameIndex = state.miniGamesPlayed % 5;
  if      (gameIndex === 0) startCatchFish();
  else if (gameIndex === 1) startFindPenguin();
  else if (gameIndex === 2) startIceSlide();
  else if (gameIndex === 3) startSnowballCatch();
  else                       startMatchPairs();
}

// Simple fish icon used by the Catch Fish mini-game — body, tail fork, dorsal fin, eye
const FISH_SVG = `<svg viewBox="0 0 64 34" aria-hidden="true">
  <path d="M6 17 Q1 9 11 5 Q5 12 9 17 Q5 22 11 29 Q1 25 6 17Z" fill="#ff9d2e"/>
  <ellipse cx="36" cy="17" rx="22" ry="12.5" fill="#ffc23c"/>
  <path d="M30 5 Q37 -2 45 4 Q38 8 31 9Z" fill="#ff9d2e"/>
  <path d="M22 25 Q28 31 34 26" fill="none" stroke="#e88018" stroke-width="2" stroke-linecap="round"/>
  <path d="M30 17 h16" stroke="rgba(120,60,0,.18)" stroke-width="3" stroke-linecap="round"/>
  <circle cx="50" cy="14" r="3.4" fill="#1c1c2e"/>
  <circle cx="51" cy="13" r="1.1" fill="#fff"/>
</svg>`;

// Mini-game 1: Catch Fish — fish swim across; catch 5 before they all escape to win
function startCatchFish() {
  $("miniTitle").textContent = t("catchFish_title");
  $("miniText").textContent  = t("catchFish_text");
  const stage = $("miniStage");
  stage.innerHTML = "";
  stage.className = "mini-stage mini-catchfish";

  let fishSpeed = 9000; // ms to cross screen (slow)
  const speedBar = document.createElement("div");
  speedBar.className = "mini-speed-bar";
  speedBar.innerHTML = `
    <button class="speed-btn active" data-speed="9000">🐢 ${t("speedSlow")}</button>
    <button class="speed-btn" data-speed="5500">🐟 ${t("speedNormal")}</button>
    <button class="speed-btn" data-speed="3000">⚡ ${t("speedFast")}</button>`;
  stage.appendChild(speedBar);

  const TOTAL = 9;
  let caught   = 0;
  let resolved = 0;   // caught + escaped off-screen
  let finished = false;
  const fishEls = [];

  function finish() {
    if (finished) return;
    finished = true;
    finishMiniGame(caught, "catchfish");
  }

  function spawnAll(speed) {
    fishEls.forEach(f => f.remove());
    fishEls.length = 0;
    caught = 0; resolved = 0; finished = false;

    const stageW = stage.offsetWidth  || 360;
    const stageH = stage.offsetHeight || 260;
    const topMin = 56; // clears the speed-bar (~8px top + its own height)
    const safeH  = Math.max(30, stageH - topMin - 50);

    for (let i = 0; i < TOTAL; i++) {
      const fish = document.createElement("button");
      fish.className = "mini-target";
      fish.innerHTML = FISH_SVG;
      fish.style.left = `${-90 - i * 80}px`;
      fish.style.top  = `${topMin + Math.random() * safeH}px`;
      fish.style.setProperty("--swim-dist", `${stageW + 140}px`);
      fish.style.setProperty("--swim-dur",  `${speed + i * 200}ms`);
      fish.style.animationDelay = `${i * 0.3}s`;
      fish.setAttribute("aria-label", currentLang === "ru" ? "Поймай эту рыбку" : "Catch this fish");
      // A fish that reaches the far edge without being caught "escapes"
      fish.addEventListener("animationend", () => {
        if (fish.dataset.resolved) return;
        fish.dataset.resolved = "1";
        resolved++;
        if (resolved >= TOTAL) finish();
      });
      fish.addEventListener("click", () => {
        if (fish.dataset.resolved) return;
        fish.dataset.resolved = "1";
        caught++; resolved++;
        fish.style.opacity = "0";
        fish.style.pointerEvents = "none";
        state.fish += 2;
        playSound("coin");
        toast(currentLang === "ru" ? `+2 рыбки! (${caught}/5)` : `+2 fish! (${caught}/5)`);
        renderHeader();
        if (caught >= 5 || resolved >= TOTAL) finish();
      });
      stage.appendChild(fish);
      fishEls.push(fish);
    }
  }

  speedBar.querySelectorAll(".speed-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      speedBar.querySelectorAll(".speed-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      fishSpeed = Number(btn.dataset.speed);
      spawnAll(fishSpeed); // changing speed restarts the round fresh
    });
  });

  // Wait one frame so the stage has real dimensions before placing fish
  requestAnimationFrame(() => spawnAll(fishSpeed));
}

// Mini-game 2: Treasure Hunt — tap the right shell to find coins
function startTreasureHunt() {
  $("miniTitle").textContent = t("treasureHunt_title");
  $("miniText").textContent  = t("treasureHunt_text");
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
    shell.setAttribute("aria-label", currentLang === "ru" ? `Ракушка ${i+1}` : `Shell ${i+1}`);
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
        toast(currentLang === "ru" ? `Сокровище! +${bonus} монет 🎁` : `Treasure! +${bonus} coins 🎁`);
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
          toast(currentLang === "ru" ? `Нашёл! +${bonus} монет 🎁` : `Found it! +${bonus} coins 🎁`);
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

// Mini-game 3: Find the Penguin — solve a problem, tap the iceberg with the right answer
function startFindPenguin() {
  $("miniTitle").textContent = t("findPenguin_title");
  $("miniText").textContent  = t("findPenguin_text");
  const stage = $("miniStage");
  stage.innerHTML = "";
  stage.className = "mini-stage mini-penguin";

  const topic   = chooseTopic(["add10","add20","sub20","multiply","divide"]);
  const problem = generateProblem(topic);

  // Build 4 distinct wrong numbers alongside the correct answer
  let spread  = problem.answer < 10 ? 2 : problem.answer < 30 ? 4 : problem.answer < 100 ? 10 : 20;
  const wrong = [...wrongAnswers(problem)];
  let attempts = 0;
  while (wrong.length < 4 && attempts < 80) {
    attempts++;
    if (attempts % 15 === 0) spread += 3; // widen the search if small numbers run out of room
    const offset = Math.floor(Math.random()*(spread*2+1)) - spread || (Math.random()<.5?-1:1);
    const v = Math.max(0, problem.answer + offset);
    if (v !== problem.answer && !wrong.includes(v)) wrong.push(v);
  }
  const values    = shuffle([problem.answer, ...wrong.slice(0,4)]);
  const secretIdx = values.indexOf(problem.answer);

  const problemEl = document.createElement("div");
  problemEl.className = "penguin-problem";
  problemEl.textContent = problem.text;
  stage.appendChild(problemEl);

  let done  = false;
  let round = 0;

  const colors = ["#e0f7ff","#c8f0ff","#b0e8ff","#d8f4ff","#f0fbff"];
  const finishWith = (berg, bonus, result) => {
    berg.querySelector(".iceberg-number")?.remove();
    berg.innerHTML += `<div class="penguin-found">${animalSvg(1)}</div>`;
    state.coins += bonus; state.fish += bonus;
    playSound("coin");
    react("excited");
    toast(currentLang === "ru" ? `Нашёл Пебла! +${bonus} рыбок и монет 🐧` : `Found Pebble! +${bonus} fish & coins 🐧`);
    renderHeader();
    if (miniGameTimer) clearTimeout(miniGameTimer);
    miniGameTimer = setTimeout(() => finishMiniGame(result, "penguin"), 1400);
  };

  values.forEach((val, i) => {
    const berg = document.createElement("button");
    berg.className = "iceberg-btn";
    berg.setAttribute("aria-label", currentLang === "ru" ? `Айсберг с числом ${val}` : `Iceberg showing ${val}`);
    berg.style.left   = `${8+(i*18)}%`;
    berg.style.bottom = `${25+Math.random()*15}%`;
    berg.innerHTML = `<svg viewBox="0 0 90 80" aria-hidden="true">
      <ellipse cx="45" cy="68" rx="40" ry="14" fill="${colors[i]}"/>
      <path d="M12 65 Q25 20 45 15 Q65 20 78 65z" fill="white"/>
      <path d="M20 65 Q32 35 45 28 Q58 35 70 65z" fill="${colors[i]}"/>
    </svg><span class="iceberg-number">${val}</span>`;
    berg.addEventListener("click", () => {
      if (done) return;
      round++;
      if (i === secretIdx) {
        done = true;
        finishWith(berg, Math.max(3, 10-round), 5);
      } else {
        berg.style.opacity = ".45";
        berg.disabled = true;
        playSound("wrong");
        const remaining = stage.querySelectorAll(".iceberg-btn:not(:disabled)");
        if (remaining.length <= 1 && !done) {
          done = true;
          if (remaining[0]) finishWith(remaining[0], 3, 4);
        }
      }
    });
    stage.appendChild(berg);
  });

  miniGameTimer = setTimeout(() => { if (!done) finishMiniGame(0,"penguin"); }, 30000);
}

// ─── P14: Lucky Catch — fish-gated math bonus game (the main fish sink) ──────
// Distinct from the free 5-game mini-game rotation above: this one costs
// fish to play, so it's the deliberate "save up and spend" loop the
// economy redesign needed. One question per round; 4 fish swim by, one
// carries the correct answer. Tapping the right one starts a brief
// auto-resolving "reeling in" beat (no need to hold a finger down — more
// forgiving for younger/less precise touch input) before paying out.
// Payout is coins/stars-weighted with only a small fish trickle back, so
// each round is a net fish sink even on success.
const LUCKY_CATCH_COST = 15;
let _luckyCatchResolved = false;

function canAffordLuckyCatch() { return state.fish >= LUCKY_CATCH_COST; }

function openLuckyCatchEntry() {
  if (!canAffordLuckyCatch()) {
    toast(currentLang === "ru"
      ? `Нужно ${LUCKY_CATCH_COST} 🐟 — у тебя ${state.fish}.`
      : `You need ${LUCKY_CATCH_COST} 🐟 — you have ${state.fish}.`);
    return;
  }
  state.fish -= LUCKY_CATCH_COST;
  renderHeader();
  renderTown();
  save();
  startLuckyCatch();
}

function startLuckyCatch() {
  const modal = $("luckyCatchModal");
  if (!modal) return;
  modal.hidden = false;
  _luckyCatchResolved = false;

  // Pull the topic from everything unlocked so far, reusing the same
  // weakness-weighted picker the adaptive world already uses, so this
  // bonus round is levelled to where the player actually is.
  const unlockedTopics = [...new Set(worlds.slice(0, state.unlockedWorld+1).flatMap(w => w.topics))]
    .filter(tp => tp !== "adaptive");
  const topic   = chooseTopic(unlockedTopics.length ? unlockedTopics : ["add10"]);
  const problem = generateProblem(topic);

  $("luckyCatchProblem").textContent = problem.text;
  const resultEl = $("luckyCatchResult");
  resultEl.hidden = true;
  resultEl.textContent = "";

  const stage = $("luckyCatchStage");
  stage.innerHTML = "";
  const stageW  = stage.offsetWidth || 320;
  const choices = shuffle([problem.answer, ...wrongAnswers(problem)]);

  choices.forEach((val, i) => {
    const fish = document.createElement("button");
    fish.className = "lucky-fish";
    fish.innerHTML = FISH_SVG + `<span class="lucky-fish-num">${val}</span>`;
    fish.style.top = `${14 + i * 22}%`;
    fish.style.setProperty("--swim-dist", `${stageW + 140}px`);
    fish.style.setProperty("--swim-dur", `${4200 + i * 500}ms`);
    fish.style.animationDelay = `${i * 0.35}s`;
    fish.dataset.correct = (val === problem.answer) ? "1" : "0";
    fish.setAttribute("aria-label", `Catch the fish showing ${val}`);
    fish.addEventListener("animationend", () => {
      if (fish.dataset.resolved) return;
      fish.dataset.resolved = "1";
      fish.remove();
      checkLuckyCatchAllGone();
    });
    fish.addEventListener("click", () => handleLuckyCatchTap(fish));
    stage.appendChild(fish);
  });
}

function handleLuckyCatchTap(fishEl) {
  if (_luckyCatchResolved || fishEl.dataset.resolved) return;
  if (fishEl.dataset.correct === "1") {
    fishEl.dataset.resolved = "1";
    _luckyCatchResolved = true;
    fishEl.classList.add("hooked");
    setTimeout(() => finishLuckyCatch(true), 650);
  } else {
    fishEl.dataset.resolved = "1";
    fishEl.classList.add("escaped");
    react("sad");
    setTimeout(() => { fishEl.remove(); checkLuckyCatchAllGone(); }, 260);
  }
}

function checkLuckyCatchAllGone() {
  if (_luckyCatchResolved) return;
  const stage = $("luckyCatchStage");
  if (stage && stage.children.length === 0) finishLuckyCatch(false);
}

function finishLuckyCatch(success) {
  _luckyCatchResolved = true;
  const resultEl = $("luckyCatchResult");
  if (success) {
    state.coins += 8;
    state.stars += 3;
    state.fish  += 3; // small trickle-back — still a net sink vs the 15-fish entry
    playSound("perfect");
    confetti();
    react("excited");
    resultEl.textContent = currentLang === "ru"
      ? "Отличный улов! +8 монет, +3 ⭐, +3 🐟"
      : "Great catch! +8 coins, +3 ⭐, +3 fish";
  } else {
    playSound("wrong");
    react("sad");
    resultEl.textContent = currentLang === "ru"
      ? "Рыба ушла — повезёт в следующий раз!"
      : "It got away — better luck next time!";
  }
  resultEl.hidden = false;
  checkAchievements();
  save();
  renderAll();
  setTimeout(closeLuckyCatch, 2200);
}

function closeLuckyCatch() {
  const modal = $("luckyCatchModal");
  if (modal) modal.hidden = true;
  const stage = $("luckyCatchStage");
  if (stage) stage.innerHTML = "";
}

function finishMiniGame(caught, type) {
  if ($("miniGame").hidden) return;
  if (miniGameTimer) { clearTimeout(miniGameTimer); miniGameTimer = null; }
  state.miniGamesPlayed++;
  state.coins += Math.min(caught, 5);
  if (caught >= 5) {
    state.stars += 2;
    react("victory");
    playSound("level");
  }
  save();

  // Show result overlay inside mini-game instead of hiding it
  const stage = $("miniStage");
  const isRu = currentLang === "ru";
  const resultMsg = caught >= 5 ? t("miniWellDone") : t("miniGoodEffort");
  const coinsBit  = isRu
    ? `+${Math.min(caught,5)} монет${caught >= 5 ? " и +2 звезды!" : ""}`
    : `+${Math.min(caught,5)} coins${caught >= 5 ? " and +2 stars earned!" : ""}`;
  stage.innerHTML = `
    <div class="mini-result">
      <div class="mini-result-icon">${caught >= 5 ? "🎉" : "💪"}</div>
      <div class="mini-result-msg">${resultMsg}</div>
      <div class="mini-result-sub">${coinsBit}</div>
      <div class="mini-result-btns">
        <button class="secondary mini-retry-btn">🔁 ${t("miniPlayAgain")}</button>
        <button class="primary mini-play-again-btn">${t("miniNextGame")} 🎮</button>
        <button class="secondary mini-map-btn">${t("miniReturnMap")} 🗺️</button>
      </div>
    </div>`;
  stage.querySelector(".mini-retry-btn").addEventListener("click", () => {
    const starters = {
      catchfish: startCatchFish, treasure: startTreasureHunt, penguin: startFindPenguin,
      slide: startIceSlide, snowball: startSnowballCatch, pairs: startMatchPairs
    };
    (starters[type] || startMiniGame)();
  });
  stage.querySelector(".mini-play-again-btn").addEventListener("click", () => {
    startMiniGame();
  });
  stage.querySelector(".mini-map-btn").addEventListener("click", () => {
    $("miniGame").hidden = true;
    renderAll();
  });
  renderHeader();
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
    const scale = 0.9 + Math.random()*0.45; // size variety: some rocks are noticeably bigger
    rock.style.width  = Math.round(46*scale) + "px";
    rock.style.height = Math.round(40*scale) + "px";
    rock.style.left = rockX+"%";
    rock.style.top  = "-40px";
    stage.appendChild(rock);
    rocksDone++;

    const fall = rock.animate(
      [{ top:"-40px" }, { top: stage.offsetHeight+"px" }],
      { duration: 1600 - Math.min(score*40,800), easing:"linear" }
    );
    fall.onfinish = () => {
      if (!active) return;
      const rockCenter  = rockX;
      const stageW       = stage.offsetWidth || 360;
      const sealHalfPct  = (sealEl.offsetWidth/2  / stageW) * 100;
      const rockHalfPct  = (rock.offsetWidth/2    / stageW) * 100;
      if (Math.abs(rockCenter - pos) < sealHalfPct + rockHalfPct) {
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
    const landTop = stage.offsetHeight-30;
    const anim = ball.animate(
      [{ top:"-20px" }, { top: landTop+"px" }],
      { duration: dur, easing:"linear", fill: "forwards" }
    );
    anim.onfinish = () => {
      if (!active) return;
      if (Math.abs(ballX - bucketX) < 14) {
        caught++;
        state.fish++;
        playSound("coin");
        scoreEl.textContent = `Caught: ${caught}/${Math.ceil(TOTAL*0.6)}`;
        renderHeader();
        // Drop the ball into the bucket so the catch is unmistakable
        const bucketTop = stage.offsetHeight - 16 - 26;
        ball.animate(
          [
            { left: ballX+"%", top: landTop+"px", opacity: 1 },
            { left: bucketX+"%", top: bucketTop+"px", opacity: 0.6 }
          ],
          { duration: 160, easing: "ease-in", fill: "forwards" }
        );
        ball.classList.add("ball-caught");
        bucket.classList.add("bucket-catch");
        setTimeout(() => bucket.classList.remove("bucket-catch"), 220);
        setTimeout(() => ball.remove(), 170);
      } else {
        missed++;
        ball.classList.add("ball-missed");
        setTimeout(() => ball.remove(), 200);
      }
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

// ─── S6: Mini-game 6 — Match Pairs: flip cards to find emoji pairs ────────────
function startMatchPairs() {
  $("miniTitle").textContent = t("matchPairs_title") || "Match Pairs!";
  $("miniText").textContent  = t("matchPairs_text")  || "Flip cards and find matching pairs!";
  const stage = $("miniStage");
  stage.innerHTML = "";
  stage.className = "mini-stage mini-pairs";

  const EMOJIS = ["🐧","🐟","🐻","🦊","🐳","🦭","🌟","❄"];
  const GRID_SIZE = EMOJIS.length;  // 8 pairs = 16 cards
  const deck = [...EMOJIS, ...EMOJIS].sort(() => Math.random()-.5);

  let flipped   = [];   // indices of currently face-up (unmatched) cards
  let matched   = 0;
  let moves     = 0;
  let locked    = false;
  const cards   = [];

  const infoEl = document.createElement("p");
  infoEl.className = "pairs-info";
  infoEl.textContent = `${t("matchPairs_moves") || "moves"}: 0`;
  stage.before(infoEl);    // insert before the stage grid

  deck.forEach((emoji, idx) => {
    const card = document.createElement("button");
    card.className = "pairs-card";
    card.dataset.emoji = emoji;
    card.dataset.idx   = idx;
    card.setAttribute("aria-label", `Card ${idx+1}`);
    card.textContent   = emoji;

    card.addEventListener("click", () => {
      if (locked || card.classList.contains("matched") || card.classList.contains("flipped")) return;

      card.classList.add("flipped");
      flipped.push(idx);

      if (flipped.length === 2) {
        moves++;
        infoEl.textContent = `${t("matchPairs_moves") || "moves"}: ${moves}`;
        locked = true;

        const [a, b] = flipped;
        if (cards[a].dataset.emoji === cards[b].dataset.emoji) {
          // Match!
          cards[a].classList.add("matched");
          cards[b].classList.add("matched");
          matched++;
          flipped = [];
          locked  = false;
          playSound("coin");
          state.fish += 2;
          renderHeader();
          if (matched >= GRID_SIZE) {
            // All matched — win!
            const bonus = Math.max(5, 20 - Math.floor(moves * 0.3));
            state.coins += bonus;
            state.stars += 2;
            playSound("level");
            confetti();
            toast(`${t("matchPairs_win") || "All pairs matched!"} +${bonus} coins ⭐`);
            save();
            if (miniGameTimer) clearTimeout(miniGameTimer);
            miniGameTimer = setTimeout(() => finishMiniGame(5, "pairs"), 900);
          }
        } else {
          // No match — flip back after 900ms
          setTimeout(() => {
            cards[a].classList.remove("flipped");
            cards[b].classList.remove("flipped");
            cards[a].classList.add("wrong");
            cards[b].classList.add("wrong");
            setTimeout(() => {
              cards[a].classList.remove("wrong");
              cards[b].classList.remove("wrong");
            }, 400);
            flipped = [];
            locked  = false;
          }, 900);
        }
      }
    });

    cards[idx] = card;
    stage.appendChild(card);
  });

  miniGameTimer = setTimeout(() => finishMiniGame(matched >= 4 ? 3 : 0, "pairs"), 60000);
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
  const bank = currentLang === "ru" ? dialogueBankRu : dialogueBank;
  const lines = bank[kind] || bank.before;
  const world = worlds[selectedWorld] || worlds[0];
  // P11: track recently-shown lines per dialogue kind (not one mixed list)
  // and avoid repeats across roughly half of that kind's bank — previously
  // this only excluded the last 3 lines across ALL kinds combined, which
  // barely reduced repeats for any single bank.
  if (!state.dialogueHistory || Array.isArray(state.dialogueHistory)) state.dialogueHistory = {};
  const recent     = state.dialogueHistory[kind] || [];
  const avoidCount = Math.max(3, Math.floor(lines.length / 2));
  const options = lines.filter(l => !recent.slice(-avoidCount).includes(l));
  const line = (options.length?options:lines)[Math.floor(Math.random()*(options.length?options.length:lines.length))];
  state.dialogueHistory[kind] = [...recent.slice(-(avoidCount+2)), line];
  if ($("dialogBox")) $("dialogBox").textContent = `${world.character}: ${line}`;
}

// ─── Achievements ─────────────────────────────────────────────────────────────
function checkAchievements() {
  const tests = [
    state.fish>=1, state.correct>=1, state.correct>=10, state.correct>=25, state.correct>=50,
    state.correct>=100, state.buildings.length>=1, state.buildings.length>=2, state.buildings.length>=5,
    state.animals.length>=1, state.animals.length>=5, state.animals.length>=animals.length, state.stars>=1,
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
    state.animals.length>=animals.length&&state.unlockedWorld>=7,
    state.streak.longestStreak>=14, state.streak.longestStreak>=30,
    Object.values(state.animalFeeds||{}).some(c => c >= 10)
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

// P11: streak now has one auto-applied "freeze" that bridges a single missed
// day instead of resetting to 1, and the ladder extends past 7 days with
// milestone toasts + a bonus freeze token at each one (capped at 3 banked).
function updateStreak() {
  const today     = todayKey();
  if (state.streak.last === today) return;
  const yesterday  = new Date(Date.now()-86400000).toISOString().slice(0,10);
  const dayBefore  = new Date(Date.now()-2*86400000).toISOString().slice(0,10);
  if (!state.streak.freezeTokens) state.streak.freezeTokens = 0;

  if (state.streak.last === yesterday) {
    state.streak.count++;
  } else if (state.streak.last === dayBefore && state.streak.freezeTokens > 0 && state.streak.count > 0) {
    state.streak.freezeTokens--;
    state.streak.count++;
    toast(currentLang === "ru"
      ? "Заморозка серии спасла твою серию! ❄️"
      : "A streak freeze saved your streak! ❄️");
  } else {
    state.streak.count = 1;
  }
  state.streak.last  = today;
  state.streak.days.push(today);
  state.streak.longestStreak = Math.max(state.streak.longestStreak||0, state.streak.count);

  const milestones = [14, 30, 60, 100];
  if (milestones.includes(state.streak.count)) {
    state.streak.freezeTokens = Math.min(3, state.streak.freezeTokens + 1);
    toast(currentLang === "ru"
      ? `${state.streak.count} дней подряд! +1 заморозка серии ❄️`
      : `${state.streak.count}-day streak! +1 streak freeze ❄️`);
  }
}

// ─── Audio ────────────────────────────────────────────────────────────────────
function initAudio() {
  if (audioReady) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  audioReady = true;
  const adventureView = document.getElementById("adventure");
  if (adventureView && adventureView.classList.contains("active")) startWorldMusic(selectedWorld);
}

function playIslandSound() {
  if (!audioReady || state.muted) return;
  const base = [520,460,390,610,330,700,570,780][selectedWorld];
  [base, base*1.25, base*1.5].forEach((f,i) => setTimeout(()=>tone(f,.07,"sine"),i*80));
}

// P7: varied sounds
function playSound(type) {
  if (state.muted || !audioReady) return;
  const variants = {
    correct: [
      [660,880],
      [740,960,1100],
      [520,700,880,1050]
    ],
    wrong:       [[180,120]],
    coin:        [[760,1040]],
    achievement: [[520,780,1040]],
    build:       [[320,520,720,900]],
    level:       [[440,660,880,1180]],
    // P7: perfect mission fanfare
    perfect:     [[440,550,660,880,1100,1320]]
  };
  const pool  = variants[type] || [[440]];
  const notes = pool[Math.floor(Math.random()*pool.length)];
  const wave  = type === "wrong" ? "sawtooth" : type === "build" ? "square" : "sine";
  notes.forEach((freq,i) => setTimeout(()=>tone(freq,.08+i*.01,wave),i*90));
}

// S14: ambient soundscape — replaces the short melodic loop (at speed it
// read as a tick-tock) with gentle recurring waves plus sparse creature
// calls that vary per world. Timers reschedule themselves with randomized
// jitter rather than a fixed interval, so nothing repeats on a metronome.
function createNoiseBuffer(seconds) {
  const size   = Math.floor(audioCtx.sampleRate * seconds);
  const buffer = audioCtx.createBuffer(1, size, audioCtx.sampleRate);
  const data   = buffer.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function playWaveSound() {
  const now = audioCtx.currentTime;
  const dur = 2 + Math.random() * 1.2;
  const src = audioCtx.createBufferSource();
  src.buffer = createNoiseBuffer(dur);
  const filter = audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 450 + Math.random() * 300;
  const gain = audioCtx.createGain();
  const v = .052 * (state.volume ?? 1.0);
  gain.gain.setValueAtTime(.0001, now);
  gain.gain.exponentialRampToValueAtTime(v, now + dur * 0.4);
  gain.gain.exponentialRampToValueAtTime(.0001, now + dur);
  src.connect(filter).connect(gain).connect(audioCtx.destination);
  src.start(now);
  src.stop(now + dur + .1);
}

const worldAmbience = ["gull","gull","whale","penguin","bubble","chime","horn","fanfare"];

function playCritterCall(kind) {
  const now  = audioCtx.currentTime;
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain).connect(audioCtx.destination);
  const fire = (vol, len) => {
    const v = vol * (state.volume ?? 1.0);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(v, now + .025);
    gain.gain.exponentialRampToValueAtTime(.0001, now + len);
    osc.start(now);
    osc.stop(now + len + .05);
  };
  if (kind === "penguin") {
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + .12);
    osc.frequency.exponentialRampToValueAtTime(300, now + .24);
    fire(.07, .28);
  } else if (kind === "whale") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 1.1);
    fire(.08, 1.3);
  } else if (kind === "bubble") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + .15);
    fire(.065, .18);
  } else if (kind === "chime") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1318, now);
    fire(.07, .5);
  } else if (kind === "horn") {
    osc.type = "square";
    osc.frequency.setValueAtTime(196, now);
    osc.frequency.exponentialRampToValueAtTime(247, now + .3);
    fire(.065, .55);
  } else if (kind === "fanfare") {
    osc.type = "square";
    osc.frequency.setValueAtTime(523, now);
    osc.frequency.exponentialRampToValueAtTime(784, now + .3);
    fire(.07, .4);
  } else { // gull — default
    osc.type = "sine";
    osc.frequency.setValueAtTime(2100, now);
    osc.frequency.exponentialRampToValueAtTime(3000, now + .09);
    osc.frequency.exponentialRampToValueAtTime(1900, now + .2);
    fire(.075, .22);
  }
}

let waveTimer    = null;
let critterTimer = null;
let musicWorld   = null;

function startWorldMusic(worldId) {
  if (musicWorld === worldId && (waveTimer || critterTimer)) return; // already ambient for this island
  stopWorldMusic();
  musicWorld = worldId;
  if (!audioReady) return;
  const scheduleWave = () => {
    if (!state.muted) playWaveSound();
    waveTimer = setTimeout(scheduleWave, 2400 + Math.random() * 1800);
  };
  const scheduleCritter = () => {
    if (!state.muted) playCritterCall(worldAmbience[worldId] || "gull");
    critterTimer = setTimeout(scheduleCritter, 11000 + Math.random() * 9000); // periodic, not frequent
  };
  waveTimer    = setTimeout(scheduleWave, 600);
  critterTimer = setTimeout(scheduleCritter, 4000 + Math.random() * 4000);
}

function stopWorldMusic() {
  if (waveTimer)    { clearTimeout(waveTimer);    waveTimer = null; }
  if (critterTimer) { clearTimeout(critterTimer); critterTimer = null; }
  musicWorld = null;
}

function tone(freq, len, wave="sine", vol=.18) {
  const v = vol * (state.volume ?? 1.0);
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = wave;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(.0001, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(v, audioCtx.currentTime+.02);
  gain.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime+len);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime+len+.03);
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

// P13: pause/resume the "Time Played" clock based on whether the tab is
// actually visible and focused, instead of counting wall-clock time
// unconditionally. Flushes whatever time accrued while active before
// freezing, and restarts the clock fresh on return (the hidden/unfocused
// span itself is never counted).
function pauseTimeTracking() {
  if (!_pageActive) return;
  state.timePlayed += Math.max(0, Math.floor((Date.now() - state.startedAt) / 1000));
  _pageActive = false;
  save(true);
}

function resumeTimeTracking() {
  if (_pageActive) return;
  _pageActive = true;
  state.startedAt = Date.now();
}

let _timeTrackingBound = false;
function attachTimeTracking() {
  if (_timeTrackingBound) return;
  _timeTrackingBound = true;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseTimeTracking(); else resumeTimeTracking();
  });
  window.addEventListener("blur",  pauseTimeTracking);
  window.addEventListener("focus", resumeTimeTracking);
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

// P9: Town Decorations — small cosmetic props, second coin sink alongside
// the costume shop. Same viewBox/shadow convention as buildingSvg above.
function decorationSvg(i) {
  const svgs = [
    // 0: Snowman — three stacked balls, twig arms, top hat
    `<ellipse cx="60" cy="86" rx="22" ry="18" fill="#fff" stroke="#cfe0ea" stroke-width="2"/>
     <ellipse cx="60" cy="56" rx="16" ry="14" fill="#fff" stroke="#cfe0ea" stroke-width="2"/>
     <ellipse cx="60" cy="32" rx="11" ry="10" fill="#fff" stroke="#cfe0ea" stroke-width="2"/>
     <circle cx="56" cy="29" r="1.6" fill="#1a1a2e"/><circle cx="64" cy="29" r="1.6" fill="#1a1a2e"/>
     <path d="M58 34 L62 34 L60 37Z" fill="#ffb840"/>
     <rect x="50" y="18" width="20" height="6" rx="1" fill="#274263"/><rect x="48" y="12" width="24" height="8" rx="1" fill="#274263"/>
     <line x1="44" y1="56" x2="28" y2="48" stroke="#7a5a3a" stroke-width="2" stroke-linecap="round"/>
     <line x1="76" y1="56" x2="92" y2="48" stroke="#7a5a3a" stroke-width="2" stroke-linecap="round"/>
     <circle cx="60" cy="56" r="2" fill="#274263"/><circle cx="60" cy="48" r="2" fill="#274263"/><circle cx="60" cy="64" r="2" fill="#274263"/>`,
    // 1: Ice Lantern — glowing lantern on a short post
    `<rect x="54" y="70" width="12" height="28" rx="2" fill="#a8c8d8"/>
     <path d="M44 40 Q44 28 60 26 Q76 28 76 40 L76 64 L44 64Z" fill="#bdeaff" opacity="0.85"/>
     <rect x="44" y="58" width="32" height="8" rx="2" fill="#8fdaf0"/>
     <ellipse cx="60" cy="46" rx="10" ry="12" fill="#fff7a0" opacity="0.9"/>
     <path d="M56 26 L60 18 L64 26Z" fill="#8fdaf0"/>`,
    // 2: Park Bench
    `<rect x="20" y="64" width="80" height="8" rx="2" fill="#b07a4a"/>
     <rect x="20" y="76" width="80" height="8" rx="2" fill="#9a6a3e"/>
     <rect x="26" y="40" width="8" height="26" rx="2" fill="#b07a4a"/>
     <rect x="46" y="40" width="8" height="26" rx="2" fill="#b07a4a"/>
     <rect x="66" y="40" width="8" height="26" rx="2" fill="#b07a4a"/>
     <rect x="86" y="40" width="8" height="26" rx="2" fill="#b07a4a"/>
     <rect x="22" y="84" width="8" height="16" rx="2" fill="#7a5230"/>
     <rect x="90" y="84" width="8" height="16" rx="2" fill="#7a5230"/>`,
    // 3: Ice Sculpture — little seal carved in ice
    `<path d="M40 96 Q34 60 60 50 Q86 60 80 96Z" fill="#cdf0fb" opacity="0.9" stroke="#8fdaf0" stroke-width="2"/>
     <circle cx="52" cy="60" r="4" fill="#fff" opacity="0.7"/>
     <circle cx="68" cy="66" r="3" fill="#fff" opacity="0.6"/>
     <ellipse cx="60" cy="44" rx="14" ry="12" fill="#dff8ff" stroke="#8fdaf0" stroke-width="2"/>
     <circle cx="55" cy="42" r="2" fill="#274263"/><circle cx="65" cy="42" r="2" fill="#274263"/>`,
    // 4: Garland Flags — bunting strung between two poles
    `<line x1="14" y1="40" x2="106" y2="40" stroke="#8fdaf0" stroke-width="2"/>
     <rect x="10" y="40" width="4" height="50" fill="#8fdaf0"/>
     <rect x="106" y="40" width="4" height="50" fill="#8fdaf0"/>
     <path d="M24 40 l10 16 10-16Z" fill="#ff7b7b"/>
     <path d="M50 40 l10 16 10-16Z" fill="#ffd45a"/>
     <path d="M76 40 l10 16 10-16Z" fill="#4fd6a8"/>`
  ];
  return `<svg viewBox="0 0 120 110" aria-hidden="true">${svgs[i]||svgs[0]}</svg>`;
}

function buyDecoration(id) {
  const d = decorations[id];
  if (!d || state.decorations.includes(id) || state.coins < d.cost) return;
  state.coins -= d.cost;
  state.decorations.push(id);
  playSound("coin");
  react("excited");
  toast(`${decorName(id)} ${t("decorPlaced")}`);
  checkAchievements();
  save();
  renderTown();
  renderHeader();
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
   <rect x="48" y="78" width="24" height="14" rx="7" fill="#e8c070"/>`,

  // 9: Octopus (Octo) — teal mantle, two front tentacles + two back, big curious eyes
  `<path d="M30 70 Q16 80 20 96 Q28 104 36 94 Q42 82 34 72Z" fill="#2aa89c"/>
   <path d="M90 70 Q104 80 100 96 Q92 104 84 94 Q78 82 86 72Z" fill="#2aa89c"/>
   <ellipse cx="60" cy="52" rx="34" ry="30" fill="#35c9c0"/>
   <ellipse cx="50" cy="36" rx="17" ry="13" fill="#6fe0d4" opacity="0.55"/>
   <path d="M44 76 Q36 90 42 104 Q50 108 53 96 Q54 84 48 76Z" fill="#35c9c0"/>
   <path d="M76 76 Q84 90 78 104 Q70 108 67 96 Q66 84 72 76Z" fill="#35c9c0"/>
   <ellipse cx="47" cy="93" rx="3" ry="2" fill="#1a8a80" opacity="0.4"/>
   <ellipse cx="73" cy="93" rx="3" ry="2" fill="#1a8a80" opacity="0.4"/>
   <circle cx="48" cy="48" r="7.5" fill="#1a2030"/><circle cx="50.2" cy="45.8" r="2.3" fill="#fff"/>
   <circle cx="72" cy="48" r="7.5" fill="#1a2030"/><circle cx="74.2" cy="45.8" r="2.3" fill="#fff"/>
   <path d="M51 62 Q60 68 69 62" fill="none" stroke="#1a8a80" stroke-width="2.2" stroke-linecap="round"/>`
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
  const item = shop[i];
  const cls  = item ? item.className : null;

  // Shared seal-face base (head, eyes, mouth, body shadow)
  const face = `<ellipse cx="60" cy="64" rx="40" ry="28" fill="#f8fcff"/><circle cx="48" cy="57" r="5" fill="#26364a"/><circle cx="72" cy="57" r="5" fill="#26364a"/><path d="M54 68c4 4 8 4 12 0" fill="none" stroke="#7890a4" stroke-width="4" stroke-linecap="round"/>`;
  const body = `<ellipse cx="60" cy="96" rx="44" ry="7" fill="#bcecf8"/>`;

  // Item-specific overlay, drawn to match the shape of its real in-game costume/accessory/pet
  let overlay = "";
  switch (cls) {
    case "pirate": // black tricorn hat + skull badge
      overlay = `<path d="M28 38h64l-9 19H38z" fill="#18182a"/><ellipse cx="60" cy="38" rx="34" ry="6" fill="#18182a"/><circle cx="60" cy="27" r="7" fill="#f0ede0"/><circle cx="57" cy="25" r="1.6" fill="#18182a"/><circle cx="63" cy="25" r="1.6" fill="#18182a"/><path d="M56 30h8" stroke="#18182a" stroke-width="1.3" stroke-linecap="round"/>`;
      break;
    case "astronaut": // helmet ring + control buttons
      overlay = `<ellipse cx="60" cy="58" rx="46" ry="38" fill="none" stroke="#d0eeff" stroke-width="6" opacity="0.85"/><ellipse cx="60" cy="58" rx="40" ry="32" fill="rgba(160,220,255,0.18)"/><rect x="98" y="48" width="11" height="8" rx="3" fill="#ff7b7b"/><rect x="98" y="60" width="11" height="8" rx="3" fill="#4fd6a8"/><rect x="11" y="48" width="11" height="8" rx="3" fill="#ffd45a"/>`;
      break;
    case "king": // crown with gems
      overlay = `<rect x="40" y="29" width="40" height="7" rx="2" fill="#e8a820" stroke="#c88010" stroke-width="1"/><polygon points="40,29 46,17 52,29" fill="#ffd45a" stroke="#c88010" stroke-width="1"/><polygon points="54,29 60,15 66,29" fill="#ffd45a" stroke="#c88010" stroke-width="1"/><polygon points="68,29 74,17 80,29" fill="#ffd45a" stroke="#c88010" stroke-width="1"/><circle cx="60" cy="18" r="3" fill="#ff6080"/><circle cx="46" cy="19" r="2" fill="#60c8ff"/><circle cx="74" cy="19" r="2" fill="#80e860"/>`;
      break;
    case "superhero": // cape (drawn behind face) + S badge on chest
      overlay = { before: `<path d="M38 72 Q21 96 25 116 Q46 105 60 109 Q74 105 95 116 Q99 96 82 72 Q71 84 60 86 Q49 84 38 72Z" fill="#e02020"/>`,
                  after:  `<circle cx="60" cy="90" r="9" fill="#ffd45a" stroke="#c8a020" stroke-width="1.4"/><text x="60" y="94" text-anchor="middle" font-size="10" font-weight="900" fill="#c01010">S</text>` };
      break;
    case "guardiancape": // icy crown + cape — exclusive Guardian Cape reward
      overlay = { before: `<path d="M38 72 Q21 96 25 116 Q46 105 60 109 Q74 105 95 116 Q99 96 82 72 Q71 84 60 86 Q49 84 38 72Z" fill="#17869f"/>`,
                  after:  `<rect x="40" y="29" width="40" height="7" rx="2" fill="#bdf3ea" stroke="#1a9b7a" stroke-width="1"/><polygon points="40,29 46,17 52,29" fill="#e8fffb" stroke="#1a9b7a" stroke-width="1"/><polygon points="54,29 60,15 66,29" fill="#e8fffb" stroke="#1a9b7a" stroke-width="1"/><polygon points="68,29 74,17 80,29" fill="#e8fffb" stroke="#1a9b7a" stroke-width="1"/><circle cx="60" cy="18" r="3" fill="#2dd6a6"/><circle cx="46" cy="19" r="2" fill="#60c8ff"/><circle cx="74" cy="19" r="2" fill="#60c8ff"/><circle cx="60" cy="90" r="9" fill="#fff8b8" stroke="#2dd6a6" stroke-width="1.4"/><text x="60" y="94" text-anchor="middle" font-size="10" font-weight="900" fill="#17869f">★</text>` };
      break;
    case "sunny": // wide-brim sun hat
      overlay = `<ellipse cx="60" cy="37" rx="34" ry="6" fill="#ffd45a"/><path d="M46 37 Q47 25 60 23 Q73 25 74 37Z" fill="#ffd45a"/><path d="M48 35 Q49 27 60 26 Q71 27 72 35Z" fill="#ffb820"/><path d="M48 37 Q60 34 72 37" fill="none" stroke="#e84040" stroke-width="2" stroke-linecap="round"/>`;
      break;
    case "scarf": // star scarf around the neck
      overlay = `<path d="M37 85 Q60 79 83 85 Q84 93 83 96 Q60 91 37 96 Q36 93 37 85Z" fill="#7858d8"/><path d="M37 85 Q29 99 34 114" fill="none" stroke="#7858d8" stroke-width="6" stroke-linecap="round"/><text x="50" y="92" font-size="8" fill="#ffd45a">★</text><text x="59" y="89" font-size="7" fill="#ffd45a">★</text><text x="67" y="92" font-size="6" fill="#ffd45a">★</text>`;
      break;
    case "goggles": // snow goggles over the eyes
      overlay = `<path d="M40 53 Q33 49 28 52" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round"/><path d="M80 53 Q87 49 92 52" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round"/><rect x="39" y="49" width="19" height="14" rx="6" fill="#00b8d8" opacity="0.8"/><rect x="62" y="49" width="19" height="14" rx="6" fill="#00b8d8" opacity="0.8"/><rect x="57" y="53" width="6" height="5" rx="2" fill="#335"/>`;
      break;
    case "pet": // tiny fish swimming alongside
      overlay = `<ellipse cx="97" cy="92" rx="14" ry="9" fill="#ffb840"/><path d="M111 92 Q120 86 120 92 Q120 98 111 92Z" fill="#ffb840"/><circle cx="89" cy="89" r="2" fill="#1a1a2e"/><path d="M93 95 Q96 98 99 95" fill="none" stroke="#c07020" stroke-width="1" stroke-linecap="round"/>`;
      break;
    case "wizard": // pointed wizard hat with star
      overlay = `<ellipse cx="60" cy="31" rx="32" ry="6" fill="#3a2270"/><path d="M40 31 Q45 18 60 14 Q75 18 80 31Z" fill="#5b3aa0"/><path d="M43 29 Q48 19 60 16 Q72 19 77 29Z" fill="#6f4bc0"/><path d="M44 30 Q60 27 76 30" fill="none" stroke="#ffd45a" stroke-width="2" stroke-linecap="round"/><text x="55" y="24" font-size="7" fill="#ffd45a">★</text>`;
      break;
    case "bowtie": // bow tie at the neck
      overlay = `<path d="M60 90 L46 84 Q43 90 46 96 L60 90Z" fill="#e0405a"/><path d="M60 90 L74 84 Q77 90 74 96 L60 90Z" fill="#e0405a"/><circle cx="60" cy="90" r="5" fill="#b82c44"/>`;
      break;
    case "owlpet": // tiny snow owl friend
      overlay = `<ellipse cx="98" cy="88" rx="11" ry="13" fill="#f4f8fb" stroke="#cfe0ea" stroke-width="1.5"/><circle cx="94" cy="84" r="3.5" fill="#fff"/><circle cx="102" cy="84" r="3.5" fill="#fff"/><circle cx="94" cy="84" r="1.8" fill="#1a1a2e"/><circle cx="102" cy="84" r="1.8" fill="#1a1a2e"/><path d="M97 88 L100 88 L98.5 90Z" fill="#ffb840"/>`;
      break;
    default:
      overlay = `<ellipse cx="60" cy="30" r="10" fill="#27c7de"/>`;
  }

  const before = typeof overlay === "object" ? overlay.before : "";
  const after  = typeof overlay === "object" ? overlay.after  : overlay;
  return `<svg viewBox="0 0 120 110" aria-hidden="true">${before}${face}${after}${body}</svg>`;
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
    state = { ...defaultState(), ...imported, startedAt: Date.now() };
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

// ─── P3: Onboarding ───────────────────────────────────────────────────────────
const onboardingSteps = [
  {
    titleKey:"onboard1_title",
    textKey:"onboard1_text",
    emoji:"🌊"
  },
  {
    titleKey:"onboard2_title",
    text:"",  // rendered as grade picker
    emoji:"📚",
    gradePickerStep: true
  },
  {
    titleKey:"onboard3_title",
    textKey:"onboard3_text",
    emoji:"🐧"
  },
  {
    titleKey:"onboard4_title",
    textKey:"onboard4_text",
    emoji:"🎁"
  }
];

// Maps grade choice → starting island
const GRADE_STARTS = { "1-2": 0, "3": 1, "4": 2, "5+": 4 };

let onboardStep = 0;

function showOnboarding() {
  const modal = $("onboardingModal");
  if (!modal) return;
  onboardStep = 0;
  renderOnboardStep();
  modal.hidden = false;
}

function renderOnboardStep() {
  const step  = onboardingSteps[onboardStep];
  const total = onboardingSteps.length;
  const modal = $("onboardingModal");
  if (!modal) return;
  modal.querySelector(".onboard-emoji").textContent = step.emoji;
  modal.querySelector(".onboard-title").textContent = t(step.titleKey);
  const textEl = modal.querySelector(".onboard-text");

  if (step.gradePickerStep) {
    textEl.innerHTML = `<p style="margin:0 0 12px;color:var(--muted)">${t("onboard2_intro")}</p>
      <div class="grade-grid">
        <button class="grade-btn" data-grade="1-2">${t("grade1_2")}<small>${t("grade1_2_age")}</small></button>
        <button class="grade-btn" data-grade="3">${t("grade3")}<small>${t("grade3_age")}</small></button>
        <button class="grade-btn selected" data-grade="4">${t("grade4")}<small>${t("grade4_age")} ✓</small></button>
        <button class="grade-btn" data-grade="5+">${t("grade5plus")}<small>${t("grade5plus_age")}</small></button>
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
    textEl.innerHTML = t(step.textKey); // allow emoji
  }

  modal.querySelector(".onboard-dots").innerHTML = onboardingSteps.map((_,i)=>
    `<span class="onboard-dot ${i===onboardStep?"active":""}"></span>`).join("");
  const nextBtn = modal.querySelector(".onboard-next");
  nextBtn.textContent = onboardStep < total-1 ? t("onboardNext") : t("onboardStart");
  const skipBtn = modal.querySelector(".onboard-skip");
  if (skipBtn) skipBtn.textContent = t("onboardSkip");
}

function advanceOnboarding() {
  if (onboardStep < onboardingSteps.length-1) {
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
    tryAgainNudge:"Not quite — give it one more try!",
    // Mini-games
    returnToMap:"Return to Map",
    backToMap:"Map",
    minigame_slide_title:"Ice Slide!", minigame_slide_text:"Tap Left / Right to dodge the rocks!",
    minigame_snow_title:"Snowball Catch!", minigame_snow_text:"Move the bucket to catch falling snowballs!",
    left:"Left", right:"Right",
    catchFish_title:"Catch Fish!", catchFish_text:"Tap the fish before they swim away! Catch 5 to win.",
    speedSlow:"Slow", speedNormal:"Normal", speedFast:"Fast",
    treasureHunt_title:"Treasure Hunt!", treasureHunt_text:"One shell hides a treasure chest. Find it!",
    findPenguin_title:"Find the Penguin!", findPenguin_text:"Solve it, then tap the iceberg with the right answer!",
    miniWellDone:"Well done!", miniGoodEffort:"Good effort!",
    miniPlayAgain:"Play Again", miniNextGame:"Next Mini-game", miniReturnMap:"Return to Map",
    // Rewards / shop
    costumesAndPets:"Costumes and Pets", spendCoins:"Spend coins on playful looks for Sausage.",
    achievements:"Achievements", owned:"Owned", buy:"Buy", equip:"Equip", equipped:"Equipped",
    unequip:"Unequip",
    volumeLabel:"Volume",
    equippedOnSausage:"Equipped on Sausage.", ownedEquipInMySeal:"Owned. Equip it in My Seal.",
    ownedTapToEquip:"Owned. Tap to equip.",
    visibleReward:"A visible reward for Sausage.", unlockedAndEquipped:"unlocked and equipped!",
    earnedOnlyLocked:"🏆 Defeat the Arctic Storm on Arctic Champion to unlock.",
    guardianTitle:"🏆 Guardian of the Arctic!",
    guardianBody:"You braved every island and calmed the Great Arctic Storm. Sausage is now the Guardian of the Arctic — and earned an exclusive Guardian Cape, found only here. Go equip it in My Seal!",
    // Town
    arcticTown:"Arctic Town", townDesc:"Buildings appear as Sausage earns stars and rescues friends.",
    townDecorations:"Town Decorations", townDecorationsDesc:"Spend coins on cosy props for Arctic Town.",
    decorPlaced:"placed in your town!", decorOwned:"Placed in your town.", decorAvailable:"A cosy prop for Arctic Town.", buyFor:"Buy for",
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
    saveCodeLabel:"Quick Code (partial)", saveCodeDesc:"This short code only restores your level and fish count — not your full progress. For a complete backup, use \"Export & Copy\" above.",
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
    saveCodeRestored:"Level and fish restored (partial)!",
    saveCodeInvalid:"Invalid save code. Check all 8 characters.",
    // Levels
    level:"Level",
    // Misc
    islandComplete:"Island complete", missionOf:"Mission",
    dailyRescue:"Daily Rescue",
    objective:"Objective", rewardLabel:"Reward",
    recommendedLevel:"Recommended level",
    aheadConfirm:"You haven't reached {name} yet — Sausage usually visits islands in order. It's tuned for level {rec}, and you're level {level}.\n\nExplore it early anyway?",
    underleveledHint:"{character}: This place is level {rec}, but brave explorers may still visit unlocked islands.",
    exitMissionConfirm:"Exit this mission? Your progress on this question will be lost.",
    exitMissionTitle:"Leave this mission?", exitMissionYes:"Yes, go to map", keepPlaying:"Keep playing",
    stormCovers:"Storm clouds still cover that island.",
    keepExploring:"Keep Exploring",
    missionComplete:"Mission Complete!", rareTreasure:"Rare Treasure!",
    rescued:"Rescued!",
    // Quest panel progress
    islandProgress:"Island Progress",
    missionsLabel:"missions — level",
    // Island world names
    world0:"Snow Beach", world1:"Fish Bay", world2:"Whale Coast",
    world3:"Penguin Islands", world4:"Octopus Cave", world5:"Polar Academy",
    world6:"Northern Kingdom", world7:"Arctic Champion",
    // Parent dashboard labels
    playerLabel:"Player", languageLabel:"Language",
    // Match Pairs mini-game
    matchPairs_title:"Match Pairs!", matchPairs_text:"Flip cards and find matching pairs!",
    matchPairs_win:"All pairs matched! Great job!", matchPairs_moves:"moves",
    // Onboarding
    onboard1_title:"Welcome to Arctic Adventure! 🦭",
    onboard1_text:"Meet Sausage the Seal! A big storm has scattered all friends across the icy ocean. Can you bring them home?",
    onboard2_title:"Which year are you in?",
    onboard2_intro:"Pick your school year so Sausage picks the right islands for you!",
    grade1_2:"Year 1–2", grade1_2_age:"Ages 5–7",
    grade3:"Year 3", grade3_age:"Age 8",
    grade4:"Year 4", grade4_age:"Age 9",
    grade5plus:"Year 5+", grade5plus_age:"Age 10+",
    onboard3_title:"Rescue Friends!",
    onboard3_text:"Sail to each island, answer maths questions, and bring your friends safely back home.",
    onboard4_title:"Earn Rewards!",
    onboard4_text:"Every correct answer earns fish 🐟, coins 💰, and stars ⭐. Use them to unlock costumes and build your Arctic Town!",
    onboardNext:"Next →", onboardStart:"Start Adventure! 🚀", onboardSkip:"Skip",
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
    tryAgainNudge:"Почти! Попробуй ещё раз.",
    // Mini-games
    returnToMap:"На карту",
    backToMap:"Карта",
    minigame_slide_title:"Ледяная горка!", minigame_slide_text:"Нажимай Влево / Вправо, чтобы уклоняться!",
    minigame_snow_title:"Лови снежки!", minigame_snow_text:"Двигай ведро и лови снежки!",
    left:"Влево", right:"Вправо",
    catchFish_title:"Лови рыбу!", catchFish_text:"Тапай по рыбкам, пока они не уплыли! Поймай 5, чтобы выиграть.",
    speedSlow:"Медленно", speedNormal:"Нормально", speedFast:"Быстро",
    treasureHunt_title:"Охота за сокровищем!", treasureHunt_text:"В одной ракушке спрятан сундук с сокровищем. Найди её!",
    findPenguin_title:"Найди пингвина!", findPenguin_text:"Реши задачу, потом нажми на айсберг с правильным ответом!",
    miniWellDone:"Отлично!", miniGoodEffort:"Хорошая попытка!",
    miniPlayAgain:"Играть снова", miniNextGame:"Следующая игра", miniReturnMap:"На карту",
    // Rewards / shop
    costumesAndPets:"Костюмы и питомцы", spendCoins:"Трать монеты на образы для Сосиски.",
    achievements:"Достижения", owned:"Куплено", buy:"Купить", equip:"Надеть", equipped:"Надето",
    unequip:"Снять",
    volumeLabel:"Громкость",
    equippedOnSausage:"Надето на Тюленя.", ownedEquipInMySeal:"Куплено. Надень в разделе «Мой Тюлень».",
    ownedTapToEquip:"Куплено. Нажми, чтобы надеть.",
    visibleReward:"Заметная награда для Тюленя.", unlockedAndEquipped:"открыт и надет!",
    earnedOnlyLocked:"🏆 Открывается за победу над Великой Арктической Бурей на острове Arctic Champion.",
    guardianTitle:"🏆 Хранитель Арктики!",
    guardianBody:"Ты прошёл все острова и успокоил Великую Арктическую Бурю. Колбаска теперь Хранитель Арктики — и получил эксклюзивный Плащ Хранителя, который больше нигде не получить. Надень его в разделе «Мой Тюлень»!",
    // Town
    arcticTown:"Арктический город", townDesc:"Здания появляются по мере зарабатывания звёзд и спасения друзей.",
    townDecorations:"Украшения города", townDecorationsDesc:"Трать монеты на уютные мелочи для Арктического города.",
    decorPlaced:"теперь стоит в твоём городе!", decorOwned:"Стоит в твоём городе.", decorAvailable:"Уютная мелочь для Арктического города.", buyFor:"Купить за",
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
    saveCodeLabel:"Быстрый код (частично)", saveCodeDesc:"Этот короткий код восстанавливает только уровень и рыбу — не весь прогресс. Для полного резервного копирования используй кнопку «Экспорт и копия» выше.",
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
    saveCodeRestored:"Уровень и рыба восстановлены (частично)!",
    saveCodeInvalid:"Неверный код. Проверь все 8 символов.",
    // Levels
    level:"Уровень",
    // Misc
    islandComplete:"Остров пройден", missionOf:"Миссия",
    dailyRescue:"Ежедневное спасение",
    objective:"Задание", rewardLabel:"Награда",
    recommendedLevel:"Рекомендуемый уровень",
    aheadConfirm:"Ты ещё не добрался до острова «{name}» — Тюлень обычно путешествует по порядку. Этот остров рассчитан на уровень {rec}, а у тебя {level}.\n\nИсследовать заранее?",
    underleveledHint:"{character}: Это место для уровня {rec}, но смелые путешественники могут заглянуть и раньше.",
    exitMissionConfirm:"Выйти из миссии? Прогресс по этому вопросу будет потерян.",
    exitMissionTitle:"Покинуть миссию?", exitMissionYes:"Да, на карту", keepPlaying:"Остаться",
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
    // Quest panel progress (previously untranslated)
    islandProgress:"Прогресс острова",
    missionsLabel:"миссий — уровень",
    // Island world names
    world0:"Снежный пляж", world1:"Рыбная бухта", world2:"Китовый берег",
    world3:"Острова пингвинов", world4:"Пещера осьминога", world5:"Полярная академия",
    world6:"Северное королевство", world7:"Арктический чемпион",
    // Parent dashboard labels
    playerLabel:"Игрок", languageLabel:"Язык",
    // Match Pairs mini-game
    matchPairs_title:"Найди пару!", matchPairs_text:"Открывай карточки и находи совпадающие пары!",
    matchPairs_win:"Все пары найдены! Молодец!", matchPairs_moves:"ходов",
    // Onboarding
    onboard1_title:"Добро пожаловать в Арктику! 🦭",
    onboard1_text:"Познакомься с Сосиской Тюленем! Сильный шторм разбросал всех друзей по ледяному океану. Сможешь вернуть их домой?",
    onboard2_title:"В каком ты классе?",
    onboard2_intro:"Выбери свой класс, чтобы Сосиска подобрал подходящие острова!",
    grade1_2:"1–2 класс", grade1_2_age:"5–7 лет",
    grade3:"3 класс", grade3_age:"8 лет",
    grade4:"4 класс", grade4_age:"9 лет",
    grade5plus:"5+ класс", grade5plus_age:"10+ лет",
    onboard3_title:"Спасай друзей!",
    onboard3_text:"Плыви на каждый остров, решай задачки по математике и возвращай друзей домой в целости.",
    onboard4_title:"Получай награды!",
    onboard4_text:"За каждый правильный ответ — рыбки 🐟, монеты 💰 и звёзды ⭐. Используй их, чтобы открыть костюмы и построить свой Арктический Город!",
    onboardNext:"Далее →", onboardStart:"Начать приключение! 🚀", onboardSkip:"Пропустить",
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
    closeMiniBtn:      `← ${t("returnToMap")}`,
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

init();
