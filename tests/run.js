// Zero-dependency test entry point: `npm test` → `node tests/run.js`.
// Each *.test.js runs its assertions at require-time against the real game.js
// loaded in a vm (see harness.js). We collect one shared pass/fail tally and
// exit non-zero if anything failed, so the suite is CI-friendly.

const lib = require("./lib");

console.log("Running Arctic Math Rescue test suite...\n");

require("./generators.test");
require("./i18n.test");
require("./seal-rig.test");

const { pass, fail } = lib.counts;
console.log(`\n─────────────────────────────────────`);
console.log(`TOTAL: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
