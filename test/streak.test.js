import test from "node:test";
import assert from "node:assert/strict";
import { threeInARow } from "../src/worker.js";

const COLORS = ["red", "orange", "yellow", "green", "purple", "brown"];
const rainbowDay = (day) => COLORS.map((color) => ({ day, color }));

test("three full-rainbow days back to back counts", () => {
  assert.equal(threeInARow([...rainbowDay("2026-11-23"), ...rainbowDay("2026-11-24"), ...rainbowDay("2026-11-25")]), true);
});

test("a gap between rainbow days does not count", () => {
  assert.equal(threeInARow([...rainbowDay("2026-11-23"), ...rainbowDay("2026-11-24"), ...rainbowDay("2026-11-26")]), false);
});

test("a day missing one color breaks the streak", () => {
  const partial = rainbowDay("2026-11-24").filter((e) => e.color !== "purple");
  assert.equal(threeInARow([...rainbowDay("2026-11-23"), ...partial, ...rainbowDay("2026-11-25")]), false);
});
