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
}
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

/** One writer per drawer. Pending values survive errors and responses from older generations. */
export class ActionSaveCoordinator {
  private key: string;
  private initialAction: Action | null;
  private confirmedAction: Action | null;
  private pendingPatch: Record<string, unknown> = {};
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
  getState(): CoordinatorState {
    return {
      key: this.key,
      status: this.status,
      errorMessage: this.errorMessage,
      savedTitle: this.confirmedAction?.title || "",
      confirmedAction: this.confirmedAction,
      pendingPatch: { ...this.pendingPatch },
      isDirty: this.isDirty(),
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
  /** Called only after the user compares the latest server version and keeps their edits. */
  rebase(latest: Action) {
    if (latest.id !== this.confirmedAction?.id || this.inFlightPromise) return;
    this.confirmedAction = latest;
    this.status = "saved";
    this.errorMessage = null;
    this.emit();
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
    this.inFlightPromise = null;
    this.status = this.confirmedAction ? "saved" : "draft";
    this.errorMessage = null;
    this.emit();
  }
}
