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

v1.9. In closed testing on Google Play. Everything through PR #6 is merged.

Known open items:

- **Final screen** after completing the game — waiting on artwork from the
  owner (`finalvert.jpeg` ~700×1550 and `finalhor.jpeg` ~1300×820, matching the
  title screen; keep the vertical middle clear for the heading and button).
- **Store screenshots** in `screenshots/` are 720×1600 — that is 2.22:1 and
  Google Play's limit is 2:1, so they are out of spec. They also show the old
  town, old islands and old name. Need regenerating at 1080×1920.
- **`manifest.json`** still says `"version": "1.0.0"` and `"lang": "en"`, and
  declares `"orientation": "portrait"` although mini-games are played landscape.
- **Header subtitle** still reads "Arctic Math Adventure" while the title screen
  now says "Seal Adventure".
- The four `*-scene.svg` files in the repo root are unused leftovers — the
  scenes moved inline into `game.js`.
