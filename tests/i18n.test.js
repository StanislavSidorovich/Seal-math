// Translation-coverage suite — the structural guard that makes "shipped an
// untranslated string" a test failure instead of a screenshot from a tester.
//
// Covers three failure modes that actually happened during development:
//   1. a STRINGS.en key with no STRINGS.ru counterpart
//   2. a RU data array (shop/daily/achievements/…) that drifted out of sync
//      with its EN source
//   3. code that hardcodes English literals in a place that should use t()
//      (spot-checked via the reward modal + language-aware topicLabel)

const { createGame, makeElement } = require("./harness");
const { check } = require("./lib");

const { sandbox, run, setLang, documentStub } = createGame();

const CYR = s => /[А-Яа-яЁё]/.test(s);
const LAT = s => /[A-Za-z]/.test(s);

// ── 1. STRINGS key coverage: every en key exists in ru ──────────────────────
{
  const enKeys = run("Object.keys(STRINGS.en)");
  const ruHas = run("(function(){const o={};for(const k of Object.keys(STRINGS.ru))o[k]=true;return o;})()");
  const missing = enKeys.filter(k => !ruHas[k]);
  check("STRINGS coverage: every en key exists in ru", missing.length === 0, `missing in ru: ${missing.join(", ")}`);
}

// ── 2. RU data-array coverage ───────────────────────────────────────────────
{
  const pairs = [
    ["shopNamesRu", "shop.length"],
    ["dailyNarrativesRu", "dailyNarratives.length"],
    ["achievementNamesRu", "achievementNames.length"],
    ["animalSpeciesRu", "animals.length"],
    ["animalFactRu", "animals.length"],
  ];
  for (const [ruArr, enLenExpr] of pairs) {
    const ruLen = run(`${ruArr}.length`);
    const enLen = run(enLenExpr);
    check(`${ruArr} covers its EN source`, ruLen === enLen, `${ruLen} vs ${enLen}`);
    check(`${ruArr} all Cyrillic`, run(`${ruArr}.every(s=>/[А-Яа-яЁё]/.test(s))`) === true);
  }
  const specialsCovered = run("dailySpecialNames.every(n => DAILY_SPECIAL_NAMES_RU[n] && /[А-Яа-яЁё]/.test(DAILY_SPECIAL_NAMES_RU[n]) && DAILY_SPECIAL_ICONS[n])");
  check("every daily special has RU name + icon", specialsCovered === true);
}

// ── 3. topicLabel is language-aware ─────────────────────────────────────────
{
  const topics = ["add10", "add20", "sub20", "add100", "sub100", "carryBorrow", "multiply", "divide",
    "missing", "patterns", "logic", "equations", "word", "add3", "brackets", "orderOfOps", "fractions",
    "twoStep", "advEquations", "reverseMul", "fracCompare"];
  for (const tp of topics) {
    setLang("ru");
    check(`topicLabel RU "${tp}" is Cyrillic`, CYR(run(`topicLabel(${JSON.stringify(tp)})`)));
    setLang("en");
    const en = run(`topicLabel(${JSON.stringify(tp)})`);
    check(`topicLabel EN "${tp}" is Latin only`, LAT(en) && !CYR(en), en);
  }
}

// ── 4. RU generator output carries no leftover English words ────────────────
{
  setLang("ru");
  // "x" is a legit algebra variable; check for whole English *words* only.
  const EN_WORDS = /\b(Count|Make|Add|Subtract|Multiply|Divide|Line|Find|Work|Brackets|Half|quarter|third|means|then|first|groups|equal|number|adds|forward|back|Think|Together|Total|Each|Sausage|penguins|fish|snowballs|crates|coins)\b/i;
  const topics = ["add10", "add20", "sub20", "multiply", "divide", "twoStep", "fracCompare", "advEquations", "reverseMul", "word", "patterns", "logic", "fractions"];
  for (const tp of topics) {
    run("state.level = 8;");
    let leaked = null;
    for (let i = 0; i < 60 && !leaked; i++) {
      const p = run(`generateProblem(${JSON.stringify(tp)})`);
      if (EN_WORDS.test(p.text) || EN_WORDS.test(p.hint)) leaked = `${p.text} | ${p.hint}`;
    }
    check(`RU ${tp}: no leftover English words`, !leaked, leaked || "");
  }
}

// ── 5. Reward modal is fully localized (spot check of a t()-driven surface) ─
{
  run("trip = trip || {}; trip.needed = 5; trip.daily = false;");
  run("playRescueAnimation = (animal, onDone) => onDone();");
  const building = run("buildings[1]"); // Маяк / Lighthouse
  const animal = run("animals[0]");     // Тюленёнок / Baby seal

  const captured = {};
  documentStub.getElementById = () => {
    const el = makeElement();
    Object.defineProperty(el, "textContent", { set(v) { captured.title = v; }, get() { return captured.title || ""; } });
    Object.defineProperty(el, "innerHTML", { set(v) { captured.body = v; }, get() { return captured.body || ""; } });
    return el;
  };
  const grab = (lang, kind) => {
    setLang(lang);
    captured.title = ""; captured.body = "";
    if (kind === "building") sandbox.showReward(null, building, false);
    else if (kind === "animal") sandbox.showReward(animal, null, false);
    else sandbox.showReward(null, null, true);
    return { title: captured.title, body: captured.body };
  };

  let r = grab("ru", "building");
  check("reward RU building: title 'Миссия выполнена!'", r.title === "Миссия выполнена!", r.title);
  check("reward RU building: рыбок/монет/звёзд", /рыбок/.test(r.body) && /монет/.test(r.body) && /звёзд/.test(r.body), r.body);
  check("reward RU building: no English fish/coins/stars", !/\bfish\b|\bcoins\b|\bstars\b/.test(r.body), r.body);
  check("reward RU building: 'построено: Маяк'", /построено: Маяк/.test(r.body), r.body);

  r = grab("en", "building");
  check("reward EN building: title 'Mission Complete!'", r.title === "Mission Complete!", r.title);
  check("reward EN building: 'built Lighthouse'", /built Lighthouse/.test(r.body), r.body);
}

// ── 6. SMART_HINTS_RU covers every SMART_HINTS topic, fully Cyrillic ────────
{
  const topics = run("Object.keys(SMART_HINTS)");
  const ruHas = run("(function(){const o={};for(const k of Object.keys(SMART_HINTS_RU))o[k]=true;return o;})()");
  const missing = topics.filter(k => !ruHas[k]);
  check("SMART_HINTS_RU covers every SMART_HINTS topic", missing.length === 0, `missing: ${missing.join(", ")}`);
  for (const tp of topics) {
    const hint = run(`SMART_HINTS_RU[${JSON.stringify(tp)}]`);
    if (!hint) continue;
    check(`SMART_HINTS_RU "${tp}" title is Cyrillic`, CYR(hint.title), hint.title);
    check(`SMART_HINTS_RU "${tp}" text is Cyrillic`, CYR(hint.text), hint.text);
  }
  setLang("ru");
  check("smartHintsFor('multiply') is RU", run(`smartHintsFor("multiply").title`) === run(`SMART_HINTS_RU.multiply.title`));
  setLang("en");
  check("smartHintsFor('multiply') is EN", run(`smartHintsFor("multiply").title`) === run(`SMART_HINTS.multiply.title`));
}
