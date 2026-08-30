# Sausage the Seal — Arctic Math Rescue

Educational math game for children aged 6–11. Plain HTML/CSS/JS, no framework,
no build step. Ships two ways: as a PWA on GitHub Pages, and as an Android app
via Capacitor.

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | Every screen's markup. All views/modals live here and are shown/hidden. |
| `game.js` | The whole game: state, generators, rendering, island scene SVGs, i18n. ~8.7k lines. |
| `styles.css` | Main stylesheet. |
| `styles-mobile.css` | Loaded *after* styles.css — phone overrides win on source order. |
| `sw.js` | Service worker. Network-first for code/markup, HTTP cache for images. |
| `tests/` | Node test suite, no DOM. `npm test`. |
| `scripts/build-www.mjs` | Assembles `www/` for Capacitor. |
| `android/` | Capacitor Android project. |
| `AUDIT.md`, `FIXES.md` | Pre-publish audit and the fixes that answered it. |

There is no bundler and no transpile step. What you edit is what ships.

## Running it

```bash
python3 -m http.server 8777     # then open http://localhost:8777/index.html
npm test                         # ~84k assertions, must be 0 failed
```

State lives in `localStorage` under `sausage-profiles-v1` /
`sausage-active-profile` / `sausage-app-lang`. To test a specific situation,
seed a profile there and reload rather than playing through.

## Release checklist

The web build and the Android build are **not** the same thing. Pushing to
`main` updates GitHub Pages only; Play testers stay on the old APK until a new
AAB is uploaded.

1. `npm test` — must pass.
2. Bump all four versions together (they are checked against each other by eye,
   nothing enforces it):
   - `GAME_VERSION` in `game.js`
   - `#aboutVersion` in `index.html` (shown in About — the only way a tester can
     tell which build they are on)
   - `versionCode` + `versionName` in `android/app/build.gradle`
   - `CACHE_VERSION` in `sw.js` — **required whenever any cached asset changes**,
     or players keep the old copies; the `activate` handler only evicts caches
     whose name differs.
3. `npm run release:android` — tests, rebuilds `www/`, then `cap sync android`
   in one step. Use this rather than the three commands separately: `www/` is
   gitignored, so a `cap sync` that skips the rebuild silently ships the
   *previous* bundle, and the resulting APK looks exactly like "the fix did
   not work". (`npm run build:www` + `npx cap sync android` still work if you
   need them apart.)
4. Android Studio → Build → Generate Signed Bundle / APK → **Android App Bundle**.
5. Upload the AAB to Play Console.

Play rejects an AAB whose `versionCode` already exists, so step 2 is not
optional even for a rebuild of otherwise identical code.

### Android toolchain — do not let the IDE upgrade it

The project is pinned to **AGP 8.13.0** (`android/build.gradle`) and **Gradle
8.14.3** (`gradle/wrapper/gradle-wrapper.properties`). Android Studio offers an
"AGP Upgrade Assistant" on open; accepting it once silently rewrote three files
to AGP 9.3.1 / Gradle 9.5.0 and added a block of compatibility flags to
`gradle.properties`. Nothing about that combination has been tested against
Capacitor 8.4.2, and it is not worth finding out mid-release.

Dismiss the prompt with **"Don't ask for this project"**. If it has already run,
the fix is to revert only those files — the change is local, never push it:

```bash
git checkout -- android/build.gradle android/gradle.properties \
  android/gradle/wrapper/gradle-wrapper.properties
```

Related: `getDefaultProguardFile('proguard-android.txt')` throws under AGP 8.13
("no longer supported"), which is why `android/app/build.gradle` references
`proguard-android-optimize.txt`. `minifyEnabled` is false either way.

### Windows / PowerShell

`npm` and `npx` resolve to `.ps1` shims that the default execution policy
blocks (`PSSecurityException`). Either call `npm.cmd` / `npx.cmd`, or set the
policy once:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## Conventions that are load-bearing

- **Town layout** (`renderTown`): objects are positioned by *centre* + *ground
  line* (`left` + `bottom`), and every width is a **percentage of the scene**
  with a matching negative `margin-left`. Widths in `vw` or px drift against the
  percentage positions and the rows collide at other viewport widths — this has
  already happened once. Centring uses `margin-left`, not `transform`, because
  these elements animate `transform`.
- **Island scene SVGs** live inline in `game.js`, keyed by world id in
  `ISLAND_SCENES`. Canvas is `0 0 800 500`, `preserveAspectRatio="xMidYMid slice"`.
  Put the animated class on an **inner** `<g>` with no `transform` attribute: a
  CSS `transform` animation overwrites the SVG `transform` presentation
  attribute on the same element.
- **Friends in scenes** must match their `ANIMAL_SVGS[id]` silhouette and
  colours — that is the picture the child already met on the rescue card, and
  deviating from it makes them unrecognisable at phone scale.
- **i18n**: `t(key)` + `STRINGS.en` / `STRINGS.ru`; static markup uses
  `data-i18n`. Every new user-facing string needs both languages.
- **Back navigation**: one shared `handleBackRequest()` drives both the
  Capacitor hardware button and the browser's `popstate`. Add new modals to its
  `modalCloses` list, not to a separate handler.
- **The two quest buttons are a fixed bar on phones.** `.quest-actions` wraps
  Start Mission + Bonus Game and is `position: fixed; bottom: 0` under 768px.
  It deliberately lives inside `.quest-panel`, so it inherits both ways the
  adventure screen disappears — the view losing `.active`, and `.hero` being
  hidden during a mission or mini-game — and needs no JS to show or hide.
  Its clearance (`padding-bottom`) belongs on `.hero` for the same reason;
  putting it on `#adventure` also padded the mission screen, which is a
  different child of the same view.
- **Nothing the child must tap may sit below the fold.** The mission screen is
  the tight one: topbar + scene + strip + question + four answers on a 360px
  phone. Answers are a 2x2 grid on phones (a single column ran 270px and hid
  the bottom two), and `@media (max-width:768px) and (max-height:720px)` in
  `styles-mobile.css` trims the scene and the island eyebrow so a 360x640
  phone still shows every answer. Check the **worst case** — the longest word
  problem, in Russian — not a `3 + 4 = ?`, and measure at 640/720/800 tall.
- **Equipment slots are body zones, not item types.** `state.equipped` is keyed
  by `EQUIP_ZONES` (`head` / `face` / `neck` / `back` / `pet`), so a hat,
  goggles, a scarf, a cape and a pet are all worn at once and only genuine
  overlaps swap. A new shop item needs an `ITEM_ZONES` entry listing **every**
  zone its art covers — the Guardian Cape is `["head","back"]`, the astronaut
  helmet `["head","face"]` because its visor rules out goggles. Get that array
  wrong and two pieces of art draw on top of each other. Read/write it through
  `isEquipped()` / `equipWithZoneCheck()` / `unequipItem()`, never by poking
  `state.equipped[item.type]` — that shape is gone, and `normalizeEquipped()`
  is what rewrites pre-v2.1 saves onto the zones.

## Current state

**v2.3** (`versionCode 16`, `CACHE_VERSION v13`, `manifest.json` 2.3). In
**open testing** on Google Play, latest uploaded release 2.0 (13). The web
build on GitHub Pages is updated by pushing to `main`; testers only see a
change once a new AAB is uploaded.

Three owner-reported fixes are stacked in this branch, none released yet:

- **v2.1 — multi-clothing.** The owner's daughter asked why the seal could
  only wear one thing. It could in fact wear three (one per type slot), but
  the slots cut across the art — Snow Goggles and the Star Scarf knocked each
  other off despite sitting on different parts of the seal. Slots are now body
  zones; see the equipment convention above.
- **v2.2 — answers above the fold.** On her phone only two of the four answer
  buttons were visible; the child had no way to know the other two existed.
  Answers are 2x2 on phones now, the eyebrow no longer repeats the mission
  name the strip already shows, and short screens trim the scene.
- **v2.3 — Start Mission above the fold.** Same class of bug on the adventure
  screen: the quest panel ran ~740px, so the button landed at the fold and
  the bonus-game button below it. Both are a fixed bottom bar on phones now.

Shipped before that: v2.0 branding unification on "Arctic Math Rescue",
the `manifest.json` version/orientation fix, and the town ghost-badge overflow
fix in Russian. Earlier: Android build fix (AGP proguard), `www` build step,
dedication in Credits, back button off-native + device language + support
email, town ground/spacing + %-based widths, island friends redrawn, service-
worker cache busting, and the original batch of nine gameplay/UI fixes.

### Verifying which build is actually on the phone

An owner report of "looks the same" is usually a stale build, not a failed
fix: `www/` is gitignored, so `npx cap sync android` without a preceding
`npm run build:www` ships the previous bundle. Two checks, in order:

1. **About (ℹ️) shows the version.** It must match `GAME_VERSION`. If it is
   behind, nothing about the layout is worth debugging yet.
2. Watch for a **known visual marker** of the release. For 2.2+ the mission
   eyebrow reads just the island ("СНЕЖНЫЙ ПЛЯЖ"); through 2.1 it repeated
   the mission ("СНЕЖНЫЙ ПЛЯЖ - РАЗВЕДАТЬ БЕРЕГ").

The fix is `git pull` → `npm run release` → `npx cap sync android` → rebuild.

## Roadmap

### Blocked on the owner

- **Final screen** after completing the game. Waiting on artwork:
  `finalvert.jpeg` ~700×1550 and `finalhor.jpeg` ~1300×820, matching the title
  screen (`sealvert.jpeg` is 688×1529, `sealhor.jpeg` 1312×816). Keep the
  vertical middle clear — a heading sits at the top and a button at the bottom,
  and only those edges get a scrim. Owner chose a hand-drawn PNG over a
  composed-from-vector-art version.

### Before the production release

- **Store screenshots** in `screenshots/` predate the current UI (old town, old
  islands, old name) and the older pack was 720×1600 = 2.22:1 against Google
  Play's 2:1 limit. Regenerate at **1080×1920** — Playwright can drive the real
  app and capture the title screen, map, a mission, the town, Sea School and
  the parent dashboard, in both languages. To seed a state, write
  `sausage-profiles-v1` + `sausage-active-profile` in `localStorage`, reload,
  then click `#titlePlayBtn` and the profile card **via `evaluate`** — both
  animate, so Playwright's stability check never lets a real `.click()` land.
  The bundled Chromium is at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
- Confirm **Families policy / target audience / Data Safety** are filled in
  Play Console. Easy case: no ads, no IAP, no analytics, no accounts, nothing
  leaves the device.
- **Astronaut helmet vs. goggles**: the helmet claims `head` + `face`, so Snow
  Goggles can't go under the visor. That is the art being honest, but if the
  daughter asks for it, the fix is to redraw the visor around the goggles
  rather than to loosen the zones.

### After production, once the build has settled

- **Teacher Approved** (Play Console → Policy and Programmes → *Expert
  Approved*). Opt-in is open to anything meeting Families policy, but selection
  is not guaranteed and teachers rate the **live build** on design, appeal,
  enrichment and age fit. Do not submit while the app is still changing weekly.
  Age bands are 5-and-under / 6–8 / 9–12; this game spans the last two.
- Open testing is now live — real users outside the tester circle, and a
  natural pause for the build to stabilise before production.

### Cleanup, no hurry

- The four `*-scene.svg` files in the repo root are unused leftovers; the scenes
  moved inline into `game.js`. `scripts/build-www.mjs` already excludes them.

## Context worth keeping

- Positioning: the honest niche is a **private, offline, bilingual RU/EN** math
  game — no ads, no purchases, no analytics, no account. Khan Academy Kids and
  Prodigy beat it on content volume and curriculum alignment; competing on
  breadth is not the play.
- The owner reviews on a real Android phone and reports visually. Several bugs
  this session were invisible at desktop width and only showed at 360–412px, so
  check phone widths before calling something done.
