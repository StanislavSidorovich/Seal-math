# Sausage the Seal — Pre-Publish Audit

Findings from a read of `game.js` (6,523 lines), `styles.css`, `styles-mobile.css`,
`index.html`, `manifest.json`, `sw.js`.

Scope note: bugs are listed in priority order. P0 items are shipping blockers
because they present factually incorrect mathematics to a child.

---

## P0-1 — `generateFracCompare()` presents false statements (4 of 8 pairs wrong)

**Location:** `game.js`, `generateFracCompare()`, ~line 3526

**Cause:** the fraction formatter ignores the numerator and switches only on the
denominator:

```js
const fracStr = (n,d) => d===2?`½`:d===3?`⅓`:d===4?`¼`:d===5?`⅕`:`${n}/${d}`;
```

`fracStr(3,4)` returns `¼`. Verified against the full `pairs` table:

| Intended pair | Displayed as | Stated answer | Correct for what's displayed |
|---|---|---|---|
| 1/2 vs 1/4 | ½ or ¼ | 1 | 1 — ok |
| 1/4 vs 1/2 | ¼ or ½ | 2 | 2 — ok |
| **3/4 vs 1/2** | **¼ or ½** | **1** | **2 — WRONG** |
| 1/3 vs 1/4 | ⅓ or ¼ | 1 | 1 — ok |
| **2/4 vs 1/2** | **¼ or ½** | **0** | **2 — WRONG** |
| 1/5 vs 1/3 | ⅕ or ⅓ | 2 | 2 — ok |
| **3/5 vs 1/2** | **⅕ or ½** | **1** | **2 — WRONG** |
| **2/3 vs 3/4** | **⅓ or ¼** | **2** | **1 — WRONG** |

Net effect: a child shown "which is larger, ¼ or ½?" answers 2 and is marked wrong.

**Fix:**

```js
const VULGAR = {
  "1/2":"½","1/3":"⅓","2/3":"⅔","1/4":"¼","3/4":"¾",
  "1/5":"⅕","2/5":"⅖","3/5":"⅗","4/5":"⅘"
};
const fracStr = (n,d) => VULGAR[`${n}/${d}`] || `${n}/${d}`;
```

**Related, same topic:** the problem text ends with "type 1, 2, or 0 if equal",
but answers are tap buttons, and `wrongAnswers()` injects a meaningless 4th
option (e.g. `3`) via its fallback loop. Special-case `fracCompare` to render
exactly three buttons labelled with the fractions / "equal" rather than the
numeric codes 0/1/2.

---

## P1-1 — `fractions` topic can produce non-integer answers

**Location:** `game.js`, `generateProblem()` → `case "fractions"`, `fracForms[0]`

```js
() => { const n=[2,4,5,8,10][Math.floor(Math.random()*5)];
        const whole=n*(rand(6)+1);
        return { text:`½ of ${whole} = ?`, answer:whole/2, ... }; }
```

When `n === 5`, `whole` ∈ {5,10,15,20,25,30}; halves of 5, 15, 25 give
2.5 / 7.5 / 12.5. Decimals are outside the 6–11 curriculum this game targets.

**Fix:** remove `5` from the multiplier array, or force `whole` even before use.

---

## P1-2 — answers of `0` render only three option buttons

**Location:** `game.js`, `wrongAnswers()`

```js
const v = Math.max(0, correct + offset);   // offset ∈ [-spread, +spread]
if (v !== correct) values.add(v);
```

With `correct === 0` and `spread === 2`, only `{1,2}` are reachable — the
clamp collapses every negative offset to `0`, which the `v !== correct` filter
then rejects. The 30-attempt loop cannot recover. Result: 3 buttons instead of
4, inconsistent layout, and a 1-in-3 guess instead of 1-in-4.

Reachable via `sub20` (e.g. 6 − 6), `fracCompare` (answer 0 = equal), and any
topic where the answer can be zero.

**Fix:** when `correct < spread`, bias the offset range upward so the full
distractor count is always reachable.

---

## P2-1 — `carryBorrow` frequently requires no carrying or borrowing

**Location:** `game.js`, `generateProblem()` → `case "carryBorrow"`

```js
a=28+rand(49); b=16+rand(38);
```

Nothing constrains the ones column, so `30 + 16` (no carry) is a valid output.
Roughly half of generated problems don't exercise the skill the topic name and
the island briefing both promise.

**Fix:** validate and regenerate — for addition require `(a%10)+(b%10) >= 10`;
for subtraction require `(a%10) < (b%10)`.

---

## P2-2 — `brackets` division form is unreachable dead code

**Location:** `game.js`, `generateProblem()` → `case "brackets"`, `bracketForms[3]`

```js
const r=rand(30)+6, d=rand(5)+2, p=rand(4)+1, q=rand(4)+1;
if (d*(p+q)!==r) return null;
```

`r` is drawn independently of `d`, `p`, `q`, so the guard almost always fails
and the form returns `null`. Division-with-brackets never appears in play.

**Fix:** derive `r` from the operands — `const r = d*(p+q);` — and drop the guard.

---

## P3-1 — mission seal teleports instead of swimming

**Location:** `styles.css`, `.mission-seal-rig`; `game.js`, `syncMissionSeal()`

`syncMissionSeal()` writes `rig.style.left`, but `.mission-seal-rig` has no
`transition` on `left`. The seal jump-cuts to its new position, and the
`860ms` delay in `answer()` before the next problem is dead air.

Second, smaller issue: CSS declares `left: 75%` while `syncMissionSeal()`
starts at `SEAL_SWIM_START_LEFT_PCT = -12`, so the seal flashes at 75% on
first paint before snapping off-screen.

**Fix — CSS:**

```css
.mission-seal-rig {
  position: absolute;
  left: -12%;                    /* was 75% — match SEAL_SWIM_START_LEFT_PCT */
  bottom: 24px;
  z-index: 1;
  transform: scaleX(-1);
  transition: left 720ms cubic-bezier(.34, .06, .27, 1);
  will-change: left;
}
.mission-seal-rig.swimming .small-seal { animation: swimStroke 360ms ease-in-out 2; }
@keyframes swimStroke { 50% { transform: translateY(-9px) rotate(-6deg) scale(1.03); } }
```

**Fix — JS:**

```js
function syncMissionSeal() {
  // ...existing left calculation...
  const next = `${left.toFixed(1)}%`;
  const moved = rig.style.left !== next;
  rig.style.left = next;
  if (moved) {
    rig.classList.add("swimming");
    setTimeout(() => rig.classList.remove("swimming"), 740);
  }
}
```

Then raise the two `setTimeout(..., 860)` calls in `answer()` to ~1000ms so the
swim completes before the screen changes.

---

## P3-2 — `prefers-reduced-motion` is unhandled globally

`launchGame()` checks the media query but only removes the `.snow` layer.
`styles.css` defines ~90 keyframe animations, none of them gated.

For an app whose declared audience is ages 6–11 this is both an accessibility
gap and a Google Play Families / Teacher Approved consideration.

**Fix — add to `styles.css`:**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
```

---

## Root cause

These are not careless bugs; they are untested bugs. The generators are
effectively pure functions with no test coverage, so a wrong answer is
indistinguishable from a right one until a child hits it.

The fix that changes the failure mode is a test suite over
`generateProblem()` and `wrongAnswers()` — see `TESTING.md` / the extraction
task. Minimum assertions per topic, across levels 1–20:

- `answer` is a non-negative integer
- exactly 4 distinct option values, and `answer` is among them
- `text` and `hint` are non-empty and contain no `undefined` / `NaN`
- **an independent evaluation of `text` equals `answer`**

The last assertion is the one that catches the P0. It must parse the problem
*text the child sees* and evaluate it from scratch — if it is written by
mirroring the logic inside `generateProblem()`, it will reproduce the bugs and
catch nothing.

---

## Confirmed correct (do not "fix")

- `escapeHtml()` on profile names — applied at the right boundary; the comment
  explaining which strings need it is accurate.
- The `P13` `startedAt` reset in `loadProfileState()` — reasoning about
  folding the whole away-period into Time Played is correct.
- The separation of position (`.mission-seal-rig`) from animation
  (`.seal-avatar.swim`) — an animated `transform` does override a JS
  `transform` on the same element; keep the two-element structure.
- Zero third-party dependencies, zero network calls, no analytics SDKs. This
  makes the Play Data Safety declaration "no data collected" truthful. Keep it
  that way.
- `.svg` scene files in the repo are not referenced at runtime (scenes are
  inlined in `game.js`). Confirm they are design sources before bundling.
