// Drift safeguard: asserts the client-side clinical rules (app/lib/offlineRiskRules.ts) produce the
// exact same condition/risk_level as the real backend for every case in
// ../../../shared/clinical-rules-fixtures.json. The Python side of this same fixture file is checked
// by services/api-gateway/tests/test_clinical_rules_fixtures.py — if you change one implementation,
// change the fixture and the other implementation to match, then re-run both.
//
// Plain Node + assert, run with `node --experimental-strip-types scripts/verify-offline-rules.mjs`
// (Node's native TS stripping) — no test-framework dependency for one script.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { assessOffline } from "../app/lib/offlineRiskRules.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesPath = path.join(__dirname, "..", "..", "..", "shared", "clinical-rules-fixtures.json");
const fixtures = JSON.parse(readFileSync(fixturesPath, "utf-8"));

let failures = 0;
for (const { name, input, expected } of fixtures) {
  const result = assessOffline(input);
  try {
    assert.equal(result.primary_condition, expected.condition, `condition mismatch for "${name}"`);
    assert.equal(result.risk_level, expected.risk_level, `risk_level mismatch for "${name}"`);
    console.log(`ok - ${name}`);
  } catch (err) {
    failures++;
    console.error(`FAIL - ${name}: ${err.message}`);
  }
}

console.log(`\n${fixtures.length - failures}/${fixtures.length} fixture cases matched`);
if (failures > 0) {
  process.exit(1);
}
