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
3. `npm run build:www` (or `npm run release`, which runs the tests first).
4. `npx cap sync android`
5. Android Studio → Build → Generate Signed Bundle / APK → **Android App Bundle**.
6. Upload the AAB to Play Console.

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

## Current state

**v1.9** (`versionCode 12`, `CACHE_VERSION v7`). Everything through PR #8 is
merged into `main`. In closed testing on Google Play; a v1.9 AAB has been built
locally and is ready to upload.

The eight merged PRs, newest first: Android build fix (AGP proguard), `www`
build step + these notes, dedication in Credits, back button off-native +
device language + support email, town ground/spacing + %-based widths,
island friends redrawn + School centred, service-worker cache busting, and the
original batch of nine gameplay/UI fixes.

## Roadmap

### Blocked on the owner

- **Final screen** after completing the game. Waiting on artwork:
  `finalvert.jpeg` ~700×1550 and `finalhor.jpeg` ~1300×820, matching the title
  screen (`sealvert.jpeg` is 688×1529, `sealhor.jpeg` 1312×816). Keep the
  vertical middle clear — a heading sits at the top and a button at the bottom,
  and only those edges get a scrim. Owner chose a hand-drawn PNG over a
  composed-from-vector-art version.

### Before the production release

- **Store screenshots** in `screenshots/` are 720×1600 = 2.22:1, and Google
  Play's limit is 2:1, so they are out of spec. They also predate the current
  UI (old town, old islands, old name). Regenerate at **1080×1920** — the
  Playwright setup used throughout this session can drive the real app and
  capture the title screen, map, a mission, the town, Sea School and the parent
  dashboard, in both languages.
- **`manifest.json`** still says `"version": "1.0.0"` and `"lang": "en"`, and
  declares `"orientation": "portrait"` although mini-games are played landscape.
- **Header subtitle** still reads "Arctic Math Adventure" while the title screen
  says "Seal Adventure". Owner asked for the title screen only, so this is a
  question to raise, not an assumed fix.
- Confirm **Families policy / target audience / Data Safety** are filled in
  Play Console. Easy case: no ads, no IAP, no analytics, no accounts, nothing
  leaves the device.

### After production, once the build has settled

- **Teacher Approved** (Play Console → Policy and Programmes → *Expert
  Approved*). Opt-in is open to anything meeting Families policy, but selection
  is not guaranteed and teachers rate the **live build** on design, appeal,
  enrichment and age fit. Do not submit while the app is still changing weekly.
  Age bands are 5-and-under / 6–8 / 9–12; this game spans the last two.
- Open testing before production — real users outside the tester circle, and a
  natural pause for the build to stabilise.

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
