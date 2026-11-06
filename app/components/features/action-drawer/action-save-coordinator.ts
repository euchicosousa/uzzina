import type { Action } from "~/types";
import { ActionConflictError } from "~/lib/supabase.mutations";
import { INTENT } from "~/lib/CONSTANTS";

export type SaveStatus =
  "draft" | "creating" | "saving" | "saved" | "error" | "conflict";
export interface CoordinatorState {
  key: string;
  status: SaveStatus;
  errorMessage: string | null;
  savedTitle: string;
  confirmedAction: Action | null;
  pendingPatch: Record<string, unknown>;
  isDirty: boolean;
  /** A newer server row found by a read; never the write base until the user resolves it. */
  remoteVersion: Action | null;
  /** The authorized read found no row: writes stop until access is confirmed again. */
  unavailable: boolean;
}
export type RemoteVersionResult =
  "same" | "stale" | "newer" | "known" | "unknown" | "ignored";
export type WriteFn = (
  payload: Record<string, unknown>,
) => Promise<Action | null | undefined>;
const metadata = new Set([
  "id",
  "intent",
  "expectedUpdatedAt",
  "created_at",
  "updated_at",
]);
const same = (a: unknown, b: unknown) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

const VERSION_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,6}))?(Z|[+-]\d{2}(?::?\d{2})?)?$/i;

/**
 * Microseconds since the epoch for an action version. updated_at is a UTC
 * timestamp without time zone, so a value without an offset is read as UTC;
 * the database trigger advances it by at least one microsecond per update.
 */
export function parseActionVersion(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const match = value.trim().match(VERSION_PATTERN);
  if (!match) return null;
  const [, year, month, day, hour, minute, second, fraction = "", zone] = match;
  let milliseconds = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );
  if (zone && zone.toUpperCase() !== "Z") {
    const digits = zone.slice(1).replace(":", "");
    const offset =
      (Number(digits.slice(0, 2)) * 60 + Number(digits.slice(2) || 0)) * 60000;
    milliseconds += zone.startsWith("-") ? offset : -offset;
  }
  if (!Number.isFinite(milliseconds)) return null;
  return milliseconds * 1000 + Number(fraction.padEnd(6, "0"));
}

/** Orders two action versions by time; null when either cannot be read. */
export function compareActionVersions(a: unknown, b: unknown): number | null {
  if (typeof a === "string" && a === b) return 0;
  const left = parseActionVersion(a);
  const right = parseActionVersion(b);
  if (left === null || right === null) return null;
  return Math.sign(left - right);
}

/** One writer per drawer. Pending values survive errors and responses from older generations. */
export class ActionSaveCoordinator {
  private key: string;
  private initialAction: Action | null;
  private confirmedAction: Action | null;
  private pendingPatch: Record<string, unknown> = {};
  private remoteVersion: Action | null = null;
  private unavailable = false;
  private status: SaveStatus;
  private errorMessage: string | null = null;
  private inFlightPromise: Promise<Action | null> | null = null;
  private generation = 0;
  private listeners = new Set<(state: CoordinatorState) => void>();
  private writeFn: WriteFn;

  constructor(options: {
    key: string;
    initialAction?: Action | null;
    writeFn: WriteFn;
  }) {
    this.key = options.key;
    this.initialAction = options.initialAction || null;
    this.confirmedAction = options.initialAction?.id
      ? options.initialAction
      : null;
    this.status = this.confirmedAction ? "saved" : "draft";
    this.writeFn = options.writeFn;
  }
  getKey() {
    return this.key;
  }
  getStatus() {
    return this.status;
  }
  /** Identifies the current opening; reads started under another one are ignored. */
  getGeneration() {
    return this.generation;
  }
  getState(): CoordinatorState {
    return {
      key: this.key,
      status: this.status,
      errorMessage: this.errorMessage,
      savedTitle: this.confirmedAction?.title || "",
      confirmedAction: this.confirmedAction,
      pendingPatch: { ...this.pendingPatch },
      isDirty: this.isDirty(),
      remoteVersion: this.remoteVersion,
      unavailable: this.unavailable,
    };
  }
  subscribe(listener: (state: CoordinatorState) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  private emit() {
    for (const listener of this.listeners) listener(this.getState());
  }
  recordLocalChanges(changes: Record<string, unknown>) {
    const baseline = this.confirmedAction as unknown as Record<
      string,
      unknown
    > | null;
    for (const [field, raw] of Object.entries(changes)) {
      if (metadata.has(field) || raw === undefined) continue;
      const value =
        ["description", "content_description", "instagram_caption"].includes(
          field,
        ) && raw === ""
          ? null
          : raw;
      // During a write, a change back to the old value must still undo the value being sent.
      if (!this.inFlightPromise && baseline && same(value, baseline[field]))
        delete this.pendingPatch[field];
      else this.pendingPatch[field] = value;
    }
    this.emit();
  }
  async createAction(payload: Record<string, unknown>) {
    this.recordLocalChanges(payload);
    return this.persist();
  }
  async scheduleUpdate(changes?: Record<string, unknown>) {
    if (changes) this.recordLocalChanges(changes);
    if (!this.confirmedAction && !this.inFlightPromise) return null;
    return this.persist();
  }
  private persist(): Promise<Action | null> {
    if (this.inFlightPromise) return this.inFlightPromise;
    if (this.status === "conflict") return Promise.resolve(null);
    if (this.confirmedAction && !this.isDirty())
      return Promise.resolve(this.confirmedAction);
    // A known newer server version pauses writes until the user resolves it;
    // a row this user can no longer read cannot be written either.
    if (this.remoteVersion || this.unavailable) return Promise.resolve(null);
    const generation = this.generation;
    this.inFlightPromise = this.drain(generation).finally(() => {
      if (generation === this.generation) this.inFlightPromise = null;
    });
    return this.inFlightPromise;
  }
  private async drain(generation: number): Promise<Action | null> {
    try {
      do {
        const creating = !this.confirmedAction;
        const patch = { ...this.pendingPatch };
        const payload: Record<string, unknown> = creating
          ? { ...this.initialAction, ...patch, intent: INTENT.create_action }
          : {
              ...patch,
              intent: INTENT.update_action,
              id: this.confirmedAction?.id,
              expectedUpdatedAt: this.confirmedAction?.updated_at,
            };
        delete payload.created_at;
        delete payload.updated_at;
        if (creating) delete payload.id;
        this.status = creating ? "creating" : "saving";
        this.errorMessage = null;
        this.emit();
        const result = await this.writeFn(payload);
        if (generation !== this.generation) return null;
        if (!result?.id)
          throw new Error("O servidor não confirmou o salvamento da ação.");
        this.confirmedAction = result;
        for (const [field, value] of Object.entries(patch)) {
          if (same(this.pendingPatch[field], value))
            delete this.pendingPatch[field];
        }
        // Drop queued no-ops against the new server confirmation.
        const confirmed = result as unknown as Record<string, unknown>;
        for (const [field, value] of Object.entries(this.pendingPatch)) {
          if (same(value, confirmed[field])) delete this.pendingPatch[field];
        }
        this.emit();
      } while (this.isDirty());
      this.status = "saved";
      this.emit();
      return this.confirmedAction;
    } catch (error) {
      if (generation !== this.generation) return null;
      this.status = error instanceof ActionConflictError ? "conflict" : "error";
      this.errorMessage =
        error instanceof Error
          ? error.message
          : (error as { message?: string })?.message ||
            "Não foi possível salvar a ação.";
      this.emit();
      return null;
    }
  }
  /**
   * Compares an authorized read with the confirmed base. A write already sent
   * is reconciled first, so a read older than its confirmation (including this
   * user's own save) is stale. A newer row is only recorded for comparison:
   * the form and the expected write version stay on the confirmed base.
   */
  async receiveRemoteVersion(
    remote: Action,
    generation: number,
  ): Promise<RemoteVersionResult> {
    if (generation !== this.generation) return "ignored";
    while (this.inFlightPromise) {
      await this.inFlightPromise;
      if (generation !== this.generation) return "ignored";
    }
    const base = this.confirmedAction;
    if (!base?.id || remote.id !== base.id) return "ignored";
    const order = compareActionVersions(remote.updated_at, base.updated_at);
    if (order === null) return "unknown";
    if (order < 0) return "stale";
    if (order === 0) return "same";
    const known = this.remoteVersion;
    if (
      known &&
      (compareActionVersions(remote.updated_at, known.updated_at) ?? 0) <= 0
    )
      return "known";
    this.remoteVersion = remote;
    this.emit();
    return "newer";
  }
  setUnavailable(unavailable: boolean) {
    if (this.unavailable === unavailable) return;
    this.unavailable = unavailable;
    this.emit();
  }
  /** A completed generation may advance only the confirmed strategy fields. */
  adoptGeneratedStrategies(remote: Action) {
    const base = this.confirmedAction;
    if (
      !base ||
      this.isDirty() ||
      compareActionVersions(remote.updated_at, base.updated_at) !== 1
    )
      return false;
    // A known newer row is acceptable only when it is exactly this version.
    if (
      this.remoteVersion &&
      compareActionVersions(
        remote.updated_at,
        this.remoteVersion.updated_at,
      ) !== 0
    )
      return false;
    const {
      strategies: _oldStrategies,
      updated_at: _oldVersion,
      ...oldFields
    } = base;
    const {
      strategies: _newStrategies,
      updated_at: _newVersion,
      ...newFields
    } = remote;
    const keys = Object.keys({ ...oldFields, ...newFields });
    if (
      keys.some(
        (key) =>
          !same(Reflect.get(oldFields, key), Reflect.get(newFields, key)),
      )
    )
      return false;
    return this.adoptRemoteVersion(remote);
  }

  /** Explicitly replaces the base and discards local values with the reviewed server version. */
  adoptRemoteVersion(remote: Action) {
    const base = this.confirmedAction;
    if (this.inFlightPromise || !base?.id || remote.id !== base.id)
      return false;
    if ((compareActionVersions(remote.updated_at, base.updated_at) ?? 0) < 0)
      return false;
    this.confirmedAction = remote;
    this.pendingPatch = {};
    // A version found after the reviewed one still needs its own decision.
    if (
      this.remoteVersion &&
      compareActionVersions(
        this.remoteVersion.updated_at,
        remote.updated_at,
      ) !== 1
    )
      this.remoteVersion = null;
    this.status = "saved";
    this.errorMessage = null;
    this.emit();
    return true;
  }
  /** Called only after the user compares the latest server version and keeps their edits. */
  rebase(latest: Action) {
    if (latest.id !== this.confirmedAction?.id || this.inFlightPromise)
      return false;
    this.confirmedAction = latest;
    // Values equal to the reviewed version are no longer local changes.
    const reviewed = latest as unknown as Record<string, unknown>;
    for (const [field, value] of Object.entries(this.pendingPatch)) {
      if (same(value, reviewed[field])) delete this.pendingPatch[field];
    }
    if (
      this.remoteVersion &&
      compareActionVersions(
        this.remoteVersion.updated_at,
        latest.updated_at,
      ) !== 1
    )
      this.remoteVersion = null;
    this.status = "saved";
    this.errorMessage = null;
    this.emit();
    return true;
  }
  async saveNow(snapshot?: Record<string, unknown>): Promise<boolean> {
    if (snapshot) this.recordLocalChanges(snapshot);
    return !!(await this.persist());
  }
  async safeClose(options?: {
    snapshot?: Record<string, unknown>;
    title?: string;
    description?: string;
    content_description?: string;
  }): Promise<boolean> {
    this.recordLocalChanges({
      ...options?.snapshot,
      title: options?.title,
      description: options?.description,
      content_description: options?.content_description,
    });
    if (this.inFlightPromise) await this.inFlightPromise;
    if (!this.isDirty())
      return this.status !== "error" && this.status !== "conflict";
    const title = String(
      this.pendingPatch.title ??
        this.confirmedAction?.title ??
        this.initialAction?.title ??
        "",
    ).trim();
    if (!this.confirmedAction && title.length < 2) return false;
    return this.saveNow();
  }
  isDirty() {
    return Object.keys(this.pendingPatch).length > 0;
  }
  reset(
    actionOrKey?: Action | string | null,
    initial?: Action | null,
    writeFn?: WriteFn,
  ) {
    this.generation++;
    this.initialAction =
      typeof actionOrKey === "string" ? initial || null : actionOrKey || null;
    this.confirmedAction = this.initialAction?.id ? this.initialAction : null;
    this.key =
      typeof actionOrKey === "string"
        ? actionOrKey
        : actionOrKey?.id || `draft-${this.generation}`;
    if (writeFn) this.writeFn = writeFn;
    this.pendingPatch = {};
    this.remoteVersion = null;
    this.unavailable = false;
    this.inFlightPromise = null;
    this.status = this.confirmedAction ? "saved" : "draft";
    this.errorMessage = null;
    this.emit();
  }
}
