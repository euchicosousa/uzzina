/** Timing-only helpers: they never throw and never carry prompt text, user data or secrets. */
export function nowMs(): number {
  return performance.now();
}

/** Rounded elapsed ms between two marks, or null when either mark is missing. */
export function elapsedMs(start?: number, end?: number): number | null {
  return start === undefined || end === undefined
    ? null
    : Math.round(end - start);
}

export function logTiming(event: Record<string, unknown>): void {
  try {
    console.info(JSON.stringify(event));
  } catch {
    // Instrumentation must never affect a response.
  }
}
