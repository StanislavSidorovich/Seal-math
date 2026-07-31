// Minimal zero-dependency test helpers. The project ships with no runtime or
// dev test framework on purpose (see AUDIT.md "zero third-party dependencies")
// so the suite stays a plain `node` script.

let pass = 0;
let fail = 0;
const failures = [];

function check(name, cond, detail) {
  if (cond) {
    pass++;
  } else {
    fail++;
    failures.push(`${name}${detail ? " — " + detail : ""}`);
    // Print immediately so a huge run still shows the first failures in context.
    console.log(`FAIL: ${name}${detail ? " — " + detail : ""}`);
  }
}

function summary(label) {
  console.log(`\n[${label}] ${pass} passed, ${fail} failed`);
  return { pass, fail, failures };
}

function reset() {
  pass = 0;
  fail = 0;
  failures.length = 0;
}

module.exports = { check, summary, reset, get counts() { return { pass, fail }; } };
