// Seal rig / costume-retargeting suite.
//
// The costume, accessory and pet overlays are all drawn against the v1 seal's
// anatomy. A second seal pose (v2) reuses that art by retargeting it through
// per-version anchor circles instead of redrawing it, so the things that can
// silently break are structural, not visual:
//
//   - a shop item whose symbols aren't in the rig → part drawn at the wrong
//     spot, or (before the rewrite) simply hidden
//   - a symbol missing from OVERLAY_PARTS → no transform, lands on v1's
//     anatomy over a v2 body
//   - the v1 transform drifting off identity → regresses the shipped seal
//   - two head items stacking → the zone check is what prevents that
//
// All of it is asserted against the real game.js loaded in the vm harness.

const { createGame } = require("./harness");
const { check } = require("./lib");

const { run } = createGame();

const json = expr => JSON.parse(run(`JSON.stringify(${expr})`));

const RIG           = json("SEAL_RIG");
const OVERLAY_PARTS = json("OVERLAY_PARTS");
const COSTUME_SYMS  = json("COSTUME_SYMBOLS");
const ITEM_ZONES    = json("ITEM_ZONES");
const shop          = json("shop");

// ── rig shape ───────────────────────────────────────────────────────────────
const versions = Object.keys(RIG);
check("rig: v1 is present", versions.includes("v1"));
check("rig: v2 is present", versions.includes("v2"));

const anchorNames = Object.keys(RIG.v1);
versions.forEach(v => {
  check(`rig[${v}]: same anchors as v1`,
    JSON.stringify(Object.keys(RIG[v]).sort()) === JSON.stringify(anchorNames.slice().sort()),
    `got ${Object.keys(RIG[v]).join()}`);
  anchorNames.forEach(a => {
    const p = RIG[v][a] || {};
    check(`rig[${v}].${a}: finite x/y/r`,
      [p.x, p.y, p.r].every(n => typeof n === "number" && Number.isFinite(n)),
      JSON.stringify(p));
    check(`rig[${v}].${a}: positive radius`, p.r > 0, String(p.r));
    // Anchors are points on a seal that is drawn inside a 260x220 frame.
    // Outside that box means a typo, not a pose.
    check(`rig[${v}].${a}: inside the 260x220 frame`,
      p.x >= 0 && p.x <= 260 && p.y >= 0 && p.y <= 220,
      `(${p.x}, ${p.y})`);
  });
});

// ── every equippable item resolves to rigged parts ──────────────────────────
const equippable = shop.filter(it => COSTUME_SYMBOLS_HAS(it.className));
function COSTUME_SYMBOLS_HAS(cn) { return Object.prototype.hasOwnProperty.call(COSTUME_SYMS, cn); }

check("shop: every item has a COSTUME_SYMBOLS entry", equippable.length === shop.length,
  `${shop.length - equippable.length} without one: ` +
  shop.filter(it => !COSTUME_SYMBOLS_HAS(it.className)).map(it => it.className).join());

Object.entries(COSTUME_SYMS).forEach(([cn, mapping]) => {
  check(`${cn}: declares a non-empty parts list`,
    Array.isArray(mapping.parts) && mapping.parts.length > 0, JSON.stringify(mapping));
  (mapping.parts || []).forEach(sym => {
    check(`${cn}: part ${sym} is in OVERLAY_PARTS`,
      Object.prototype.hasOwnProperty.call(OVERLAY_PARTS, sym));
    const part = OVERLAY_PARTS[sym] || {};
    check(`${cn}: part ${sym} anchors to a real landmark`,
      anchorNames.includes(part.anchor), String(part.anchor));
    check(`${cn}: part ${sym} has a numeric z`, typeof part.z === "number");
  });
});

// No orphan symbols: anything in the rig should be reachable from some item,
// otherwise it is dead art that SVGO would be right to drop.
const reachable = new Set([].concat(...Object.values(COSTUME_SYMS).map(m => m.parts || [])));
Object.keys(OVERLAY_PARTS).forEach(sym =>
  check(`OVERLAY_PARTS: ${sym} is reachable from a shop item`, reachable.has(sym)));

// The Guardian Cape is the composite case that forced the parts array: its
// crown rides the head and its cape rides the shoulders.
const guardian = COSTUME_SYMS.guardiancape.parts.map(s => OVERLAY_PARTS[s].anchor);
check("guardiancape: spans two different anchors",
  new Set(guardian).size === 2, guardian.join());

// ── transforms ──────────────────────────────────────────────────────────────
run(`setSealArt("v1")`);
Object.keys(OVERLAY_PARTS).forEach(sym => {
  const t = run(`overlayTransform(${JSON.stringify(sym)})`);
  check(`v1: ${sym} needs no transform (art is authored for v1)`, t === null, String(t));
});

run(`setSealArt("v2")`);
Object.keys(OVERLAY_PARTS).forEach(sym => {
  const t = run(`overlayTransform(${JSON.stringify(sym)})`);
  check(`v2: ${sym} gets a transform`, typeof t === "string" && t.length > 0, String(t));
  check(`v2: ${sym} transform has no NaN`, !/NaN|undefined/.test(String(t)), String(t));
});

// The transform must actually move each anchor's centre onto the v2 landmark:
// translate(to) scale(k) translate(-from) applied to `from` yields `to`.
function applyTransform(t, x, y) {
  const nums = s => s.match(/-?[\d.]+/g).map(Number);
  const m = t.match(/translate\(([^)]*)\)\s*scale\(([^)]*)\)\s*translate\(([^)]*)\)/);
  const [tx, ty] = nums(m[1]);
  const k = Number(m[2]);
  const [px, py] = nums(m[3]);
  return [tx + (x + px) * k, ty + (y + py) * k];
}
Object.entries(OVERLAY_PARTS).forEach(([sym, part]) => {
  const t = run(`overlayTransform(${JSON.stringify(sym)})`);
  const from = RIG.v1[part.anchor], to = RIG.v2[part.anchor];
  const [gx, gy] = applyTransform(t, from.x, from.y);
  check(`v2: ${sym} maps the ${part.anchor} anchor onto v2's`,
    Math.abs(gx - to.x) < 0.05 && Math.abs(gy - to.y) < 0.05,
    `got (${gx.toFixed(2)}, ${gy.toFixed(2)}) want (${to.x}, ${to.y})`);
});

// An unknown symbol must not produce a bogus transform.
check("overlayTransform: unknown symbol yields null",
  run(`overlayTransform("costume-nope")`) === null);

// setSealArt must not be talked into a version that has no rig.
run(`setSealArt("v9")`);
check("setSealArt: unknown version falls back to v1", run("sealArtVersion") === "v1");

// ── draw order ──────────────────────────────────────────────────────────────
run(`setSealArt("v2")`);
run(`state.equipped = {}`);
check("equippedOverlayParts: nothing equipped → no parts",
  json("equippedOverlayParts()").length === 0);

// Equip the composite reward plus a pet and check both parts show up, sorted.
const capeItem = shop.find(it => it.className === "guardiancape");
const petItem  = shop.find(it => it.className === "pet");
run(`state.equipped = { ${JSON.stringify(capeItem.type)}: ${JSON.stringify(capeItem.id)}, ` +
    `${JSON.stringify(petItem.type)}: ${JSON.stringify(petItem.id)} }`);
const drawn = json("equippedOverlayParts()");
check("equipped: guardian cape contributes both of its parts",
  drawn.includes("costume-guardiancape") && drawn.includes("costume-guardiancrown"), drawn.join());
check("equipped: the pet is drawn too", drawn.includes("pet-fish"), drawn.join());
check("equipped: parts come back in ascending z",
  drawn.every((s, i) => i === 0 || OVERLAY_PARTS[drawn[i - 1]].z <= OVERLAY_PARTS[s].z), drawn.join());
check("equipped: cape draws under its crown",
  drawn.indexOf("costume-guardiancape") < drawn.indexOf("costume-guardiancrown"), drawn.join());
check("equipped: the pet draws on top", drawn[drawn.length - 1] === "pet-fish", drawn.join());
check("equipped: no duplicate parts", new Set(drawn).size === drawn.length, drawn.join());

// ── zones still keep two hats off one head ──────────────────────────────────
// Retargeting scales every head item onto the same small v2 skull, so an
// overlap that merely looked crowded on v1 would be a solid blob on v2.
const headItems = shop.filter(it => ITEM_ZONES[it.className] === "head");
check("zones: more than one head item exists to collide", headItems.length > 1);
run(`state.equipped = {}`);
headItems.forEach(it => run(`equipWithZoneCheck(shop.find(s => s.id === ${JSON.stringify(it.id)}))`));
const worn = json("equippedOverlayParts()")
  .filter(s => OVERLAY_PARTS[s].anchor === "head" && OVERLAY_PARTS[s].z === 30);
check("zones: equipping every head item in turn leaves exactly one hat on",
  worn.length === 1, worn.join());
