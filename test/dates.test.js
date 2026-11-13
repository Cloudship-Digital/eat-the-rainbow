import test from "node:test";
import assert from "node:assert/strict";
import { today, weekStart } from "../src/worker.js";

test("weeks start on Monday", () => {
  assert.equal(weekStart("2026-11-09"), "2026-11-09"); // Monday
  assert.equal(weekStart("2026-11-12"), "2026-11-09"); // Thursday
  assert.equal(weekStart("2026-11-15"), "2026-11-09"); // Sunday is the last day
  assert.equal(weekStart("2026-11-16"), "2026-11-16"); // next Monday starts a new week
});

test("the day is Boise time, so Sunday 11:59 pm is still the old week", () => {
  // Sunday Nov 15, 11:59 pm in Boise (MST, UTC-7) is Monday 06:59 UTC.
  assert.equal(today(new Date("2026-11-16T06:59:00Z")), "2026-11-15");
  assert.equal(weekStart(today(new Date("2026-11-16T06:59:00Z"))), "2026-11-09");
  // One minute later, a new week.
  assert.equal(weekStart(today(new Date("2026-11-16T07:00:00Z"))), "2026-11-16");
});
