// Builds the web-asset folder Capacitor copies into the Android project.
//
// capacitor.config.json points webDir at "www", and www/ is gitignored — so on
// a fresh clone it simply does not exist and `npx cap sync android` fails with
// "Could not find the web assets directory". Before this script the folder was
// assembled by hand, which is exactly how a release ends up shipping a stale
// game.js while the store listing says it is new.
//
// Run it before every `npx cap sync android`:  npm run build:www
//
// Deliberately a copy, not a bundler: the game is plain HTML/CSS/JS with no
// build step, and adding one would buy nothing but a way for the shipped
// bytes to differ from the ones that were tested.

import { rm, mkdir, copyFile, readFile, access } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "www");

// Everything the running app actually loads. Verified against index.html's
// <link>/<script> tags, styles.css url() references and sw.js's cache list —
// the four *-scene.svg files in the repo root are NOT here on purpose: the
// island scenes moved inline into game.js and nothing references them.
const FILES = [
  "index.html",
  "game.js",
  "styles.css",
  "styles-mobile.css",
  "sw.js",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
  "sealvert.jpeg",
  "sealhor.jpeg",
];

const exists = async (p) => access(p).then(() => true, () => false);

async function main() {
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });

  const missing = [];
  for (const f of FILES) {
    if (!(await exists(join(root, f)))) { missing.push(f); continue; }
    await copyFile(join(root, f), join(out, f));
  }
  if (missing.length) {
    console.error(`build:www — these files are listed but not in the repo:\n  ${missing.join("\n  ")}`);
    process.exit(1);
  }

  // sw.js pre-caches with cache.addAll(), which is all-or-nothing: one missing
  // path rejects the whole install and the app silently loses offline support.
  // Catch that here, at build time, rather than on a player's phone.
  const sw = await readFile(join(root, "sw.js"), "utf8");
  const block = sw.match(/ASSETS_TO_CACHE\s*=\s*\[([\s\S]*?)\]/);
  const cached = block
    ? [...block[1].matchAll(/"\.\/([^"]*)"/g)].map((m) => m[1]).filter(Boolean)
    : [];
  const notShipped = cached.filter((f) => !FILES.includes(f));
  if (notShipped.length) {
    console.error(
      `build:www — sw.js pre-caches files this script does not copy:\n  ${notShipped.join("\n  ")}\n` +
      `Add them to FILES in scripts/build-www.mjs, or drop them from ASSETS_TO_CACHE.`
    );
    process.exit(1);
  }

  const version = (await readFile(join(root, "game.js"), "utf8"))
    .match(/GAME_VERSION\s*=\s*"([^"]+)"/)?.[1] ?? "?";
  const cacheVersion = sw.match(/CACHE_VERSION\s*=\s*"([^"]+)"/)?.[1] ?? "?";
  console.log(`build:www — ${FILES.length} files -> www/  (game v${version}, sw cache ${cacheVersion})`);
  console.log(`Next: npx cap sync android`);
}

main().catch((err) => { console.error(err); process.exit(1); });
