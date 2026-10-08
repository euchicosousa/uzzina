import type { UserPreferences } from "./preferences";
import type { Json } from "types/database";

export type PreferencePatch = Partial<UserPreferences>;
export type PreferenceRecord = Record<string, Json | undefined>;
export function preferenceRecord(value: Json | undefined): PreferenceRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? {...value} : {};
}

// One owner, one request at a time; pending fields always override older confirmations.
export function createPreferencePersistence(options: {
  initial: PreferenceRecord;
  save: (patch: PreferencePatch) => Promise<PreferenceRecord>;
  isCurrent: () => boolean;
  onChange: (preferences: PreferenceRecord) => void;
  onError: () => void;
  onSaved: () => void;
}) {
  let confirmed = options.initial;
  let pending: PreferencePatch = {};
  let timer: ReturnType<typeof setTimeout> | undefined;
  let busy = false;
  let stopped = false;
  let failed = false;
  const active = () => !stopped && options.isCurrent();
  const notify = () => options.onChange({...confirmed, ...pending});
  const flush = async () => {
    if (!active() || busy || failed || Object.keys(pending).length === 0) return;
    const patch = pending;
    pending = {};
    busy = true;
    try {
      const result = await options.save(patch);
      if (!active()) return;
      confirmed = result;
      notify();
      options.onSaved();
    } catch {
      if (!active()) return;
      pending = {...patch, ...pending};
      failed = true;
      notify();
      options.onError();
    } finally {
      busy = false;
      if (active() && !failed) void flush();
    }
  };
  return {
    queue(patch: PreferencePatch) {
      if (!active()) return;
      pending = {...pending, ...patch};
      notify();
      clearTimeout(timer);
      timer = setTimeout(() => {void flush();}, 250);
    },
    retry() {
      if (!active()) return;
      failed = false;
      clearTimeout(timer);
      void flush();
    },
    dispose() {
      stopped = true;
      clearTimeout(timer);
    },
  };
}
