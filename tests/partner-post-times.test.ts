import { expect, it } from "bun:test";
import {
  formatPostTime,
  normalizePostTime,
} from "../app/lib/partner-post-times";

it("normalizes database times to HH:mm", () => {
  expect(normalizePostTime("17:00:00")).toBe("17:00");
  expect(normalizePostTime("8:05")).toBe("08:05");
  expect(normalizePostTime("08:00:00.000")).toBe("08:00");
});

it("rejects invalid times", () => {
  expect(normalizePostTime("24:00")).toBeNull();
  expect(normalizePostTime("10:60")).toBeNull();
  expect(normalizePostTime("abc")).toBeNull();
  expect(normalizePostTime(null)).toBeNull();
});

it("formats hour and minute", () => {
  expect(formatPostTime(8, 0)).toBe("08:00");
  expect(formatPostTime(20, 30)).toBe("20:30");
});
