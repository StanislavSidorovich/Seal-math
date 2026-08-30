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

// The transform must actually seat each part on the v2 landmark. A part with
// no optical correction is a plain fit, so its anchor CENTRE lands on v2's
// centre. A part with `k` is scaled about the top of the anchor circle instead
// — a hat grows without floating off the skull — so the invariant that has to
// hold for every part, corrected or not, is CROWN onto crown.
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

  const [cx, cy] = applyTransform(t, from.x, from.y - from.r);
  check(`v2: ${sym} seats the ${part.anchor} crown on v2's`,
    Math.abs(cx - to.x) < 0.05 && Math.abs(cy - (to.y - to.r)) < 0.05,
    `got (${cx.toFixed(2)}, ${cy.toFixed(2)}) want (${to.x}, ${to.y - to.r})`);

  if (!part.k) {
    const [gx, gy] = applyTransform(t, from.x, from.y);
    check(`v2: ${sym} maps the ${part.anchor} anchor onto v2's`,
      Math.abs(gx - to.x) < 0.05 && Math.abs(gy - to.y) < 0.05,
      `got (${gx.toFixed(2)}, ${gy.toFixed(2)}) want (${to.x}, ${to.y})`);
  }
});

// ── the optical correction ──────────────────────────────────────────────────
// `k` exists to stop v2's much smaller head from shrinking hats out of
// legibility. Anywhere else it is a bug: the other anchors barely changed, so
// a correction there would just push art off the body.
Object.entries(OVERLAY_PARTS).forEach(([sym, part]) => {
  if (!("k" in part)) return;
  check(`${sym}: k only on head-anchored art`, part.anchor === "head", part.anchor);
  check(`${sym}: k is a plausible enlargement`,
    typeof part.k === "number" && part.k > 1 && part.k <= 1.5, String(part.k));
});
check("at least one part carries an optical correction",
  Object.values(OVERLAY_PARTS).some(p => "k" in p));

// A corrected part must come out bigger than the honest fit would give, and
// the honest fit itself must be the v1->v2 head ratio.
(() => {
  const hat = "costume-king";
  const t = run(`overlayTransform(${JSON.stringify(hat)})`);
  const scale = Number(t.match(/scale\(([^)]*)\)/)[1]);
  const fit = RIG.v2.head.r / RIG.v1.head.r;
  check("king: corrected scale is k times the honest fit",
    Math.abs(scale - fit * OVERLAY_PARTS[hat].k) < 0.001,
    `${scale} vs ${fit * OVERLAY_PARTS[hat].k}`);
  check("king: correction makes the hat bigger, not smaller", scale > fit);
})();

// v1 is the pose the art was drawn for, so the correction must stay off there
// even though the same parts carry a k.
run(`setSealArt("v1")`);
Object.keys(OVERLAY_PARTS).forEach(sym => {
  check(`v1: ${sym} still needs no transform despite k`,
    run(`overlayTransform(${JSON.stringify(sym)})`) === null);
});
run(`setSealArt("v2")`);

// An unknown symbol must not produce a bogus transform.
check("overlayTransform: unknown symbol yields null",
  run(`overlayTransform("costume-nope")`) === null);

// setSealArt must not be talked into a version that has no rig.
run(`setSealArt("v9")`);
check("setSealArt: unknown version falls back to v1", run("sealArtVersion") === "v1");

// ── draw order ──────────────────────────────────────────────────────────────
run(`setSealArt("v2")`);
run(`state.equipped = normalizeEquipped({})`);
check("equippedOverlayParts: nothing equipped → no parts",
  json("equippedOverlayParts()").length === 0);

// Equip the composite reward plus a pet and check both parts show up, sorted.
const capeItem = shop.find(it => it.className === "guardiancape");
const petItem  = shop.find(it => it.className === "pet");
run(`state.equipped = normalizeEquipped({})`);
run(`equipWithZoneCheck(shop.find(s => s.id === ${JSON.stringify(capeItem.id)}))`);
run(`equipWithZoneCheck(shop.find(s => s.id === ${JSON.stringify(petItem.id)}))`);
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
const EQUIP_ZONES = json("EQUIP_ZONES");
const zonesOf = it => ITEM_ZONES[it.className] || [];
const headItems = shop.filter(it => zonesOf(it).includes("head"));
check("zones: more than one head item exists to collide", headItems.length > 1);
run(`state.equipped = normalizeEquipped({})`);
headItems.forEach(it => run(`equipWithZoneCheck(shop.find(s => s.id === ${JSON.stringify(it.id)}))`));
const worn = json("equippedOverlayParts()")
  .filter(s => OVERLAY_PARTS[s].anchor === "head" && OVERLAY_PARTS[s].z === 30);
check("zones: equipping every head item in turn leaves exactly one hat on",
  worn.length === 1, worn.join());

// ── P14: zones are the slots, so non-overlapping items stack ────────────────
// The bug this replaced: Snow Goggles and the Star Scarf are both typed
// "accessory", so wearing one took the other off even though they sit on
// different parts of the seal.
check("zones: every shop item declares at least one zone",
  shop.every(it => zonesOf(it).length > 0),
  shop.filter(it => !zonesOf(it).length).map(it => it.className).join());
check("zones: every declared zone is a real slot",
  shop.every(it => zonesOf(it).every(z => EQUIP_ZONES.includes(z))),
  JSON.stringify(ITEM_ZONES));

const byClass = cn => shop.find(it => it.className === cn);
const stack = ["pirate", "goggles", "scarf", "superhero", "pet"].map(byClass);
run(`state.equipped = normalizeEquipped({})`);
stack.forEach(it => {
  const bumped = json(`equipWithZoneCheck(shop.find(s => s.id === ${JSON.stringify(it.id)}))`);
  check(`zones: ${it.className} goes on without bumping anything`,
    bumped.length === 0, JSON.stringify(bumped));
});
stack.forEach(it =>
  check(`zones: ${it.className} is still worn alongside the rest`,
    run(`isEquipped(shop.find(s => s.id === ${JSON.stringify(it.id)}))`) === true));
const stacked = json("equippedOverlayParts()");
check("zones: five non-overlapping items draw five parts",
  stacked.length === 5, stacked.join());

// A real collision still swaps, and the caller is told what came off.
const sunny = byClass("sunny");
const bumpedByHat = json(`equipWithZoneCheck(shop.find(s => s.id === ${JSON.stringify(sunny.id)}))`);
check("zones: a second hat reports the hat it replaced",
  bumpedByHat.length === 1 && bumpedByHat[0].className === "pirate",
  JSON.stringify(bumpedByHat));
check("zones: the replaced hat is off", run(`isEquipped(shop.find(s => s.className === "pirate"))`) === false);
check("zones: the scarf survived an unrelated swap",
  run(`isEquipped(shop.find(s => s.className === "scarf"))`) === true);

// A two-zone item must free BOTH of its zones when something bumps it.
run(`state.equipped = normalizeEquipped({})`);
run(`equipWithZoneCheck(shop.find(s => s.className === "guardiancape"))`);
run(`equipWithZoneCheck(shop.find(s => s.className === "king"))`);
check("zones: bumping the Guardian Cape's crown takes its cape off too",
  json("equippedOverlayParts()").every(s => !s.startsWith("costume-guardian")),
  json("equippedOverlayParts()").join());

// unequipItem clears every zone the item holds.
run(`state.equipped = normalizeEquipped({})`);
run(`equipWithZoneCheck(shop.find(s => s.className === "guardiancape"))`);
run(`unequipItem(shop.find(s => s.className === "guardiancape"))`);
check("zones: unequipping a two-zone item leaves nothing behind",
  json("equippedOverlayParts()").length === 0);

// ── P14 migration: pre-zone saves keep their outfit ─────────────────────────
const legacy = json(`normalizeEquipped({ costume: ${JSON.stringify(byClass("pirate").id)}, ` +
  `accessory: ${JSON.stringify(byClass("scarf").id)}, pet: ${JSON.stringify(byClass("pet").id)} })`);
check("migration: legacy costume lands on the head zone",
  legacy.head === byClass("pirate").id, JSON.stringify(legacy));
check("migration: legacy accessory lands on the neck zone",
  legacy.neck === byClass("scarf").id, JSON.stringify(legacy));
check("migration: legacy pet is kept", legacy.pet === byClass("pet").id, JSON.stringify(legacy));
check("migration: untouched zones are null",
  legacy.face === null && legacy.back === null, JSON.stringify(legacy));
check("migration: no legacy keys survive",
  JSON.stringify(Object.keys(legacy).sort()) === JSON.stringify(EQUIP_ZONES.slice().sort()),
  Object.keys(legacy).join());

const zoneShaped = json(`normalizeEquipped({ head: ${JSON.stringify(byClass("king").id)}, ` +
  `face: ${JSON.stringify(byClass("goggles").id)} })`);
check("migration: a zone-shaped save passes through unchanged",
  zoneShaped.head === byClass("king").id && zoneShaped.face === byClass("goggles").id,
  JSON.stringify(zoneShaped));

check("migration: junk equipped data yields empty zones",
  EQUIP_ZONES.every(z => json(`normalizeEquipped(null)`)[z] === null));
check("migration: an id the shop no longer has is dropped",
  json(`normalizeEquipped({ costume: 999 })`).head === null);
