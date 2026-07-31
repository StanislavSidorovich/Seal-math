# Sausage the Seal — Sprint 0 fixes

One line per bug from `AUDIT.md`: what changed, and how it was verified.

## P0-1 — `generateFracCompare()` showed false statements
**Changed:** `fracStr()` in `generateFracCompare()` (`game.js`) switched only on the
denominator (`d===4 → ¼` regardless of numerator), so 3/4 rendered as ¼ and 2/4
rendered as ¼ instead of ½. Replaced it with an exact `n/d` lookup table
(`VULGAR`) covering all fractions used in the `pairs` table, falling back to
`${n}/${d}` for anything not in the table.
**Verified:** manually re-evaluated all 8 entries in `pairs` against the new
formatter — every displayed pair now matches its stated `answer` (previously
4 of 8 were wrong; 0 of 8 are wrong now). Confirmed live in-browser by calling
`generateFracCompare()` 300 times via the console: all 8 unique pair texts
appeared, each with the fraction glyphs matching the audit's corrected table
(e.g. "¾ or ½" → answer 1, "⅔ or ¾" → answer 2).

## P0-1 (related) — meaningless 4th option on fraction-compare questions
**Changed:** `wrongAnswers()` (`game.js`) was padding fraction-compare questions
with a random numeric distractor (e.g. `3`) on top of the two valid codes
(0/1/2), producing 4 buttons for a question with only 3 valid answers. The
numeric-fallback loop now skips entirely when `problem.topic === "fracCompare"`,
since the two non-correct codes already form the complete distractor set.
Also changed the answer buttons themselves (`makeProblem()`) to render the
fraction/"Equal" text (via a new `optionLabels` field returned by
`generateFracCompare()`) instead of the raw codes `0`/`1`/`2`; the click
handler now reads the code from a `data-value` attribute rather than parsing
button text.
**Verified:** confirmed live in-browser — across the same 300 generated
fracCompare problems, `wrongAnswers()` returned exactly 2 distractors every
time (3 buttons total, never 4). Also played a live mission in the browser to
confirm the answer flow still works end-to-end after the button-rendering
change (correct answer accepted, achievements fired, next question loaded).

## P1-1 — `fractions` topic could produce non-integer answers
**Changed:** `fracForms[0]` in `generateProblem()` (`game.js`, `case "fractions"`)
picked a multiplier from `[2,4,5,8,10]`; when `5` was picked, `whole` could be
5/15/25, giving `whole/2` = 2.5/7.5/12.5. Removed `5` from the array.
**Verified:** with multipliers restricted to `[2,4,8,10]`, `whole` is always
even, so `whole/2` is always an integer. Confirmed live in-browser: generated
500 `"fractions"` problems via the console, checked every `"½ of N"` result —
zero non-integer answers (previously reachable via multiplier `5`).

## P1-2 — answer of `0` rendered only 3 buttons instead of 4
**Changed:** `wrongAnswers()` (`game.js`) drew offsets from a fixed
`[-spread, +spread]` range; when `correct` was small (e.g. `0`), negative
offsets all clamped to `0` and were rejected as duplicates, leaving too few
reachable distractors. Added a bias (`spread - correct` when `correct <
spread`) that shifts the offset range up so the lowest reachable offset is
`-correct`, i.e. `v = correct + offset` never needs clamping in this regime.
**Verified:** traced the loop for `correct = 0` and `correct = 1` with
`spread = 2` — both now reach 4 distinct candidate values, comfortably above
the 3 distractors needed. Confirmed live in-browser: called `wrongAnswers()`
2000 times with `{topic:"sub20", answer:0}` — every call returned exactly 3
distractors (previously this case could return only 2).

## P2-1 — `carryBorrow` often required no carrying/borrowing
**Changed:** `case "carryBorrow"` in `generateProblem()` (`game.js`) generated
`a`/`b` with no constraint on the ones column. Now regenerates in a loop
until `(a%10)+(b%10) >= 10` for the addition branch, or `(a%10) < (b%10)` for
the subtraction branch (after the existing swap-if-`b>a`), matching the
audit's suggested guard.
**Verified:** read through the loop logic for both branches — a problem can
no longer exit the loop unless it actually requires a carry or a borrow.
Confirmed live in-browser: generated 500 `"carryBorrow"` problems via the
console and checked the ones-column condition on each — zero problems
without a carry/borrow (previously roughly half needed neither).

## P2-2 — `brackets` division form was unreachable
**Changed:** the 4th form in `bracketForms` (`generateProblem()`, `case
"brackets"`, `game.js`) picked `r` independently of `d`, `p`, `q`, then
rejected (`return null`) almost every draw because `d*(p+q) !== r`. Now `r` is
derived directly as `d*(p+q)`, so the division is always exact.
**Verified:** the form can no longer return `null` — `r` is computed from the
other three values instead of drawn separately, so the guard that used to
reject it is gone and the form is always valid. Confirmed live in-browser:
generated 500 `"brackets"` problems via the console — 131 (~26%) were the
division form (previously it almost never appeared, since the guard rejected
~29 out of every 30 draws).

## P3-1 — mission seal teleported instead of swimming
**Changed:** `.mission-seal-rig` (`styles.css`) had no `transition` on `left`,
so `syncMissionSeal()`'s position updates jump-cut instead of animating; it
also started at `left: 75%` in CSS before JS moved it to
`SEAL_SWIM_START_LEFT_PCT` (-12%), causing a flash on first paint. Added a
`transition: left 720ms` plus a `.swimming` class (added by JS only when the
position actually changes, removed after 740ms) that triggers a brief
`swimStroke` keyframe. Fixed the CSS starting `left` to match `-12%`. Raised
the two `860ms` post-answer `setTimeout` delays in `answer()` (`game.js`) to
`1000ms` so the swim finishes before the next problem/mission-complete screen
appears.
**Verified:** read the updated `syncMissionSeal()` — it now diffs the new
position against the current inline style and only toggles `.swimming` on an
actual move, avoiding a stuck/looping animation class. Loaded the game in a
browser, started a mission, and confirmed the seal starts near the left edge
(no more flash at 75%) and moves after a correct answer with no console
errors. Did not slow down or screenshot the transition frame-by-frame to
visually confirm easing/smoothness — worth a manual look before shipping.

## P3-2 — `prefers-reduced-motion` was not gated globally
**Changed:** `launchGame()` (`game.js`) only removed the `.snow` layer for
reduced-motion users; none of the ~90 keyframe animations across `styles.css`
were gated. Added a global rule at the end of `styles.css` that collapses all
animation and transition durations to `.01ms` under
`@media (prefers-reduced-motion: reduce)`.
**Verified:** rule applies to `*, *::before, *::after` with `!important`, so
it overrides all existing per-element `animation-duration` /
`transition-duration` declarations regardless of specificity. Not tested by
actually toggling the OS-level reduced-motion setting in this pass — worth a
manual check (e.g. via browser devtools' "Emulate CSS media feature
prefers-reduced-motion") before shipping.

---

**Note on verification method:** every fix was checked two ways — (1) reading
the surrounding code and tracing the logic by hand, and (2) loading the game
in a real browser and exercising the changed function directly via the
console (300–2000 iterations per fix, counts reported above), plus playing
through a live mission to confirm the answer/scoring flow still works
end-to-end. `node --check game.js` confirmed no syntax errors were
introduced. The two things not fully verified are the smoothness of the seal
swim transition (P3-1) and the OS-level reduced-motion toggle (P3-2) — both
are quick manual checks worth doing before shipping. The follow-up task
(extracting `generateProblem()` into a tested module) will turn today's
console spot-checks into permanent automated coverage.
