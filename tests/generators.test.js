// Independent-evaluation test suite over generateProblem() + wrongAnswers().
//
// Per AUDIT.md, for every topic across levels 1-20:
//   - answer is a non-negative integer (fracCompare: a valid code 0/1/2)
//   - the option set is exactly 4 distinct values incl. the answer
//     (fracCompare is the one 3-option topic)
//   - text and hint are non-empty and contain no "undefined"/"NaN"
//   - an INDEPENDENT evaluation of the visible `text` equals `answer`
//
// The last check re-derives the answer by parsing the problem text the child
// sees — never by mirroring generateProblem()'s internals — so a wrong-answer
// bug in the generator is caught instead of reproduced.

const { createGame } = require("./harness");
const { check } = require("./lib");

const { run, setLang, setLevel } = createGame();

// ── a tiny arithmetic-expression evaluator (·, ÷, +, -, parens, precedence) ──
// Used for every topic whose visible text is a pure arithmetic expression.
function evalExpr(src) {
  const s = src.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/\s+/g, "");
  let i = 0;
  const peek = () => s[i];
  function number() {
    let start = i;
    while (i < s.length && /[0-9.]/.test(s[i])) i++;
    return parseFloat(s.slice(start, i));
  }
  function factor() {
    if (peek() === "(") { i++; const v = expr(); if (peek() === ")") i++; return v; }
    if (peek() === "-") { i++; return -factor(); }
    return number();
  }
  function term() {
    let v = factor();
    while (peek() === "*" || peek() === "/") {
      const op = s[i++];
      const r = factor();
      v = op === "*" ? v * r : v / r;
    }
    return v;
  }
  function expr() {
    let v = term();
    while (peek() === "+" || peek() === "-") {
      const op = s[i++];
      const r = term();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }
  return expr();
}

const nums = t => (t.match(/\d+/g) || []).map(Number);

// Fraction glyph → [numerator, denominator]
const FRAC = { "½": [1, 2], "⅓": [1, 3], "⅔": [2, 3], "¼": [1, 4], "¾": [3, 4], "⅕": [1, 5], "⅖": [2, 5], "⅗": [3, 5], "⅘": [4, 5] };
function parseFrac(tok) {
  if (FRAC[tok]) return FRAC[tok];
  const m = tok.match(/^(\d+)\/(\d+)$/);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

// ── independent answer derivation, per topic. Returns a number, or null when
//    this topic's text isn't meant to be exactly re-derived here. ──
function derive(topic, text, lang) {
  let m;
  const N = nums(text);

  // Pure "EXPR = ?" arithmetic (also handles ☐/x forms below separately).
  const asExprEq = () => {
    const eq = text.match(/^(.+?)=\s*\?\s*$/);
    return eq ? evalExpr(eq[1]) : null;
  };

  switch (topic) {
    case "add10": case "add20": case "add100":
    case "sub20": case "sub100": case "carryBorrow":
    case "add3": case "multiply": case "divide":
    case "brackets": case "orderOfOps": case "mixed":
      return asExprEq();

    case "missing": { // "a + ☐ = c"
      m = text.match(/^(\d+)\s*\+\s*☐\s*=\s*(\d+)/);
      return m ? Number(m[2]) - Number(m[1]) : null;
    }

    case "equations": {
      if ((m = text.match(/^x\s*\+\s*(\d+)\s*=\s*(\d+)/)))  return Number(m[2]) - Number(m[1]);
      if ((m = text.match(/^(\d+)\s*-\s*x\s*=\s*(\d+)/)))   return Number(m[1]) - Number(m[2]);
      if ((m = text.match(/^(\d+)\s*×\s*x\s*=\s*(\d+)/)))   return Number(m[2]) / Number(m[1]);
      if ((m = text.match(/^x\s*÷\s*(\d+)\s*=\s*(\d+)/)))   return Number(m[1]) * Number(m[2]);
      return null;
    }

    case "advEquations": {
      if ((m = text.match(/^x\s*\+\s*(\d+)\s*=\s*(\d+)/)))  return Number(m[2]) - Number(m[1]);
      if ((m = text.match(/^(\d+)\s*-\s*x\s*=\s*(\d+)/)))   return Number(m[1]) - Number(m[2]);
      if ((m = text.match(/^(\d+)\s*×\s*x\s*=\s*(\d+)/)))   return Number(m[2]) / Number(m[1]);
      if ((m = text.match(/^x\s*÷\s*(\d+)\s*=\s*(\d+)/)))   return Number(m[1]) * Number(m[2]);
      if ((m = text.match(/^2\s*×\s*x\s*=\s*(\d+)/)))       return Number(m[1]) / 2;
      if ((m = text.match(/^x\s*×\s*x\s*=\s*(\d+)/)))       return Math.sqrt(Number(m[1]));
      return null;
    }

    case "reverseMul": {
      if ((m = text.match(/^\?\s*×\s*(\d+)\s*=\s*(\d+)/)))  return Number(m[2]) / Number(m[1]);
      if ((m = text.match(/^(\d+)\s*×\s*\?\s*=\s*(\d+)/)))  return Number(m[2]) / Number(m[1]);
      return null;
    }

    case "fractions": {
      const whole = N[N.length - 1] !== undefined ? N[0] : null; // first number is the whole in "½ of N"
      if (/½\s*(of|от)/.test(text))  return N[0] / 2;
      if (/¼\s*(of|от)/.test(text))  return N[0] / 4;
      if (/¾\s*(of|от)/.test(text))  return N[0] * 3 / 4;
      if (/⅓\s*(of|от)/.test(text))  return N[0] / 3;
      if ((m = text.match(/^(\d+)\s*÷\s*(\d+)/))) return Number(m[1]) / Number(m[2]); // "N ÷ d = ? (one ... of N)"
      return null;
    }

    case "patterns": {
      // "...: a, b, c, d, ?" — extrapolate an arithmetic or geometric run.
      const seq = N; // all printed integers, in order; the trailing ? has no number
      if (seq.length < 3) return null;
      const diffs = seq.slice(1).map((v, i) => v - seq[i]);
      const constDiff = diffs.every(d => d === diffs[0]);
      if (constDiff) return seq[seq.length - 1] + diffs[0];
      const ratios = seq.slice(1).map((v, i) => v / seq[i]);
      const constRatio = ratios.every(r => r === ratios[0]);
      if (constRatio) return seq[seq.length - 1] * ratios[0];
      return null;
    }

    case "logic": {
      if (/больше всех|largest/.test(text)) return Math.max(N[0], N[1], N[2]);
      if (/медиана|median/.test(text))      { const s = [N[0], N[1], N[2]].sort((a, b) => a - b); return s[1]; }
      // puffins: "a fish and b fish, then find 2 more" → a + b + 2
      return N[0] + N[1] + N[2];
    }

    case "fracCompare": {
      m = text.match(/\(1\)\s*(\S+)\s+(?:или|or)\s+\(2\)\s*(\S+)/);
      if (!m) return null;
      const fa = parseFrac(m[1]), fb = parseFrac(m[2]);
      if (!fa || !fb) return null;
      const av = fa[0] / fa[1], bv = fb[0] / fb[1];
      return av === bv ? 0 : (av > bv ? 1 : 2);
    }

    case "twoStep": return deriveTwoStep(text, lang);
    case "word":    return deriveWord(text, lang);

    default: return null; // adaptive etc. → structural checks only
  }
}

function deriveTwoStep(text, lang) {
  const n = nums(text);
  // a-b+c templates
  if (/(поймал|caught).*(отдал|gave).*(поймал|caught|поймал)/.test(text) && /(ещё|more)/.test(text)) return n[0] - n[1] + n[2];
  if (/(снежков|snowballs).*(растаяли|melted)/.test(text))                 return n[0] - n[1] + n[2];
  if (/(пингвинов|penguins).*(нырнули|dived).*(приплыло|arrived)/.test(text)) return n[0] - n[1] + n[2];
  if (/(монет|coins).*(потратил|spent)/.test(text))                        return n[0] - n[1] + n[2];
  if (/(тюленей|seals).*(отдохнуть|rest).*(вернулись|came back)/.test(text)) return n[0] - n[1] + n[2];
  if (/(ящиков|crates).*(сгрузила|dropped off)/.test(text))                return n[0] - n[1] + n[2];
  // a*b+c
  if (/(корзин|baskets).*(нашлось|finds|shore|берегу)/.test(text))         return n[0] * n[1] + n[2];
  if (/(лодок|boats).*(запрыгнули|jump aboard)/.test(text))                return n[0] * n[1] + n[2];
  // (a+b)*c — the multiplier is printed after "утроить/triple"? No: c isn't shown.
  if (/(утроить|triple)/.test(text)) return null; // multiplier not in text — skip exact check
  return null;
}

// wordTemplates (topic "word"): op is embedded in language. Match each template
// by a distinctive phrase and apply the matching arithmetic to the printed
// numbers — parsed from the child-visible text, not the generator internals.
function deriveWord(text, lang) {
  const n = nums(text);
  const add = () => n[0] + n[1];
  const sub = () => n[0] - n[1];
  const mul = () => n[0] * n[1];
  // division templates print (a*b) and b; the answer is the quotient a.
  const divAB = () => n[0] / n[1];

  // ── addition (6)
  if (/(caught .* fish and|поймал.*рыбок, а)/.test(text) && /(together|всего)/.test(text)) return add();
  if (/(penguins on one iceberg|льдине.*пингвинов)/.test(text)) return add();
  if (/(snowballs on the left|снежков на левом)/.test(text)) return add();
  if (/(seals are swimming and|плавает.*тюленей, и ещё)/.test(text)) return add();
  if (/(boat carries .* crates|лодке.*ящиков, и ещё)/.test(text)) return add();
  if (/(treasures were found on Monday|понедельник нашли)/.test(text)) return add();
  // ── subtraction (5)
  if (/(shared .* with friends|достались друзьям)/.test(text)) return sub();
  if (/(dived into the ocean|нырнули в океан)/.test(text)) return sub();
  if (/(gust of wind blew away|Ветер унёс)/.test(text)) return sub();
  if (/(candles.*burned out|свечей.*погасли)/.test(text)) return sub();
  if (/(sightings were just clouds|оказались просто облаками)/.test(text)) return sub();
  // ── multiplication (4)
  if (/(baskets with .* fish in each|корзин, и в каждой)/.test(text)) return mul();
  if (/(boats each carry|лодок, и в каждой по)/.test(text)) return mul();
  if (/(slides down the hill|съезжает с горки)/.test(text)) return mul();
  if (/(igloos with .* seals|иглу, и в каждом)/.test(text)) return mul();
  // ── division (3)
  if (/(fish to share equally|поровну разделить между)/.test(text)) return divAB();
  if (/(march into rows of|встают в ряды по)/.test(text)) return divAB();
  if (/(baked .* snowball treats|испекла.*снежных угощений)/.test(text)) return divAB();
  return null;
}

// ── the test run ──────────────────────────────────────────────────────────
const TOPICS = ["add10", "add20", "sub20", "add100", "sub100", "carryBorrow",
  "multiply", "divide", "mixed", "missing", "patterns", "logic", "equations",
  "word", "add3", "brackets", "orderOfOps", "fractions",
  "twoStep", "advEquations", "reverseMul", "fracCompare"];

const SAMPLES_PER_LEVEL = 12;

for (const lang of ["en", "ru"]) {
  setLang(lang);
  for (const topic of TOPICS) {
    let derivedCount = 0;
    for (let level = 1; level <= 20; level++) {
      setLevel(level);
      for (let s = 0; s < SAMPLES_PER_LEVEL; s++) {
        let prob;
        try { prob = run(`generateProblem(${JSON.stringify(topic)})`); }
        catch (e) { check(`${lang} ${topic} L${level}: generateProblem did not throw`, false, e.message); continue; }

        const label = `${lang} ${topic} L${level}`;

        // structural: text/hint present, no NaN/undefined leaks
        check(`${label}: text non-empty`, typeof prob.text === "string" && prob.text.length > 0, JSON.stringify(prob));
        check(`${label}: hint non-empty`, typeof prob.hint === "string" && prob.hint.length > 0, JSON.stringify(prob));
        check(`${label}: no undefined/NaN in text`, !/undefined|NaN/.test(prob.text), prob.text);
        check(`${label}: no undefined/NaN in hint`, !/undefined|NaN/.test(prob.hint), prob.hint);

        // answer is a non-negative integer
        check(`${label}: answer is non-negative integer`, Number.isInteger(prob.answer) && prob.answer >= 0, `answer=${prob.answer}`);

        // options: answer + wrongAnswers() → distinct set; 4 total (fracCompare: 3)
        let wrong;
        try { wrong = run(`wrongAnswers(${JSON.stringify(prob)})`); }
        catch (e) { check(`${label}: wrongAnswers did not throw`, false, e.message); wrong = []; }
        const opts = [prob.answer, ...wrong];
        const distinct = new Set(opts);
        const expectedCount = topic === "fracCompare" ? 3 : 4;
        check(`${label}: ${expectedCount} distinct options incl. answer`,
          distinct.size === expectedCount && distinct.has(prob.answer),
          `opts=${JSON.stringify(opts)}`);
        check(`${label}: no NaN among options`, opts.every(v => Number.isFinite(v)), JSON.stringify(opts));

        // INDEPENDENT re-derivation from the visible text
        const d = derive(topic, prob.text, lang);
        if (d !== null) {
          derivedCount++;
          check(`${label}: independent eval matches answer`, d === prob.answer,
            `text="${prob.text}" derived=${d} answer=${prob.answer}`);
        }
      }
    }
    // guard: each topic that *should* be independently checkable actually was
    const HARD_TO_DERIVE = new Set(["adaptive"]);
    if (!HARD_TO_DERIVE.has(topic)) {
      check(`${lang} ${topic}: independent eval ran on some samples`, derivedCount > 0, `derivedCount=0 — parser missed this topic`);
    }
  }
}

module.exports = { evalExpr, derive };
