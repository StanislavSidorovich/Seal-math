// Loads the REAL game.js inside a Node vm with a stubbed browser environment,
// so tests exercise the exact code that ships — not a re-implementation. This
// is the core of the AUDIT.md fix: the generators are pure-ish functions with
// no coverage, and a wrong answer is invisible until a child hits it. We load
// them for real and assert against them.
//
// Why vm-load-the-real-file instead of `require`ing an extracted module:
// game.js is a single vanilla-JS file loaded via a <script> tag with top-level
// globals (no module system, no build step). A real ES-module split would
// change how the app boots and risk breaking the shipping app. Loading the
// real file in a vm gives the same testability with zero risk to production.

const vm = require("vm");
const fs = require("fs");
const path = require("path");

const GAME_JS = path.join(__dirname, "..", "game.js");

function makeElement() {
  const el = {
    style: {}, dataset: {}, children: [],
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener() {}, removeEventListener() {}, setAttribute() {}, getAttribute() { return null; },
    removeAttribute() {}, appendChild(c) { return c; }, removeChild() {}, remove() {}, focus() {}, blur() {}, click() {},
    querySelector() { return makeElement(); }, querySelectorAll() { return []; },
    getBoundingClientRect() { return { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }; },
    cloneNode() { return makeElement(); },
    animate() { return { finished: Promise.resolve(), cancel() {}, onfinish: null }; },
    textContent: "", innerHTML: "", innerText: "",
    disabled: false, hidden: false, value: "", placeholder: "",
  };
  return el;
}

function createGame() {
  const code = fs.readFileSync(GAME_JS, "utf8");

  const lsStore = {};
  const localStorage = {
    getItem: k => (Object.prototype.hasOwnProperty.call(lsStore, k) ? lsStore[k] : null),
    setItem: (k, v) => { lsStore[k] = String(v); },
    removeItem: k => { delete lsStore[k]; },
    clear: () => { Object.keys(lsStore).forEach(k => delete lsStore[k]); },
    key: i => Object.keys(lsStore)[i] || null,
    get length() { return Object.keys(lsStore).length; },
  };

  const documentStub = {
    getElementById: () => makeElement(),
    querySelector: () => makeElement(),
    querySelectorAll: () => [],
    createElement: () => makeElement(),
    addEventListener() {}, removeEventListener() {},
    body: makeElement(), documentElement: makeElement(),
    readyState: "complete", hidden: false, visibilityState: "visible",
  };

  const windowStub = {
    addEventListener() {}, removeEventListener() {}, localStorage,
    innerWidth: 400, innerHeight: 800, devicePixelRatio: 1,
    requestAnimationFrame: cb => setTimeout(cb, 0), cancelAnimationFrame() {},
    navigator: { language: "en", vibrate() {} },
    matchMedia: () => ({ matches: false, addListener() {}, addEventListener() {} }),
    location: { href: "", search: "" },
  };

  const sandbox = {
    window: windowStub, document: documentStub, localStorage,
    navigator: windowStub.navigator, console,
    Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Error, Promise, Set, Map,
    setTimeout, clearTimeout, setInterval, clearInterval,
    requestAnimationFrame: windowStub.requestAnimationFrame, cancelAnimationFrame() {},
    Audio: function () { return { play() { return Promise.resolve(); }, pause() {}, load() {}, addEventListener() {} }; },
    AudioContext: function () {
      return {
        resume() { return Promise.resolve(); },
        createGain() { return { connect() {}, gain: { value: 1 } }; },
        createOscillator() { return { connect() {}, start() {}, stop() {}, frequency: { value: 0 } }; },
        destination: {}, state: "running",
      };
    },
    matchMedia: windowStub.matchMedia,
    alert() {}, confirm() { return true; }, prompt() { return null; },
  };
  sandbox.window.window = sandbox.window;
  sandbox.global = sandbox;
  sandbox.self = sandbox;
  sandbox.documentStub = documentStub;

  vm.createContext(sandbox);

  try {
    vm.runInContext(code, sandbox, { filename: "game.js" });
  } catch (e) {
    // init() runs at the bottom of game.js and touches the DOM; the stub is
    // deliberately shallow, so a throw here is expected and harmless — every
    // top-level function/const we need is already defined by the time it runs.
    if (process.env.HARNESS_DEBUG) console.log("[harness] top-level threw (expected):", e.message);
  }

  const run = expr => vm.runInContext(expr, sandbox);
  const setLang = lang => run(`currentLang = ${JSON.stringify(lang)};`);
  const setLevel = n => run(`state.level = ${Number(n)};`);

  return { sandbox, run, setLang, setLevel, makeElement, documentStub };
}

module.exports = { createGame, makeElement };
