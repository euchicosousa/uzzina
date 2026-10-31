# 11: Compare a newer action version on reopen without replacing local edits

**Status:** implemented-owner-accepted — owner reported OK on iPhone on 2026-10-30 for exercised reopen/comparison behavior; not published.
**Original proposal:** item 5; final owner decision: immediately editable, check in background, automatically show comparison only when a newer version exists.
**Priority:** high.
**Blocked by:** none for implementation; dialog viewport acceptance integrates ticket 01.

## Expected behavior

1. Open an existing action immediately from available data, already editable.
2. Perform one authorized canonical read for that opening in the background.
3. If its version matches the currently confirmed base, do nothing visibly: no modal, toast, form reset or unnecessary write.
4. If a newer version is found, open a comparison dialog showing the actual changed fields. This applies even when the local form is clean. Do not silently adopt the server data.
5. Preserve current edits and let the user decide using the existing version/conflict resolution flow, adapted to this earlier detection.

## Entry points and confirmed gap

Inspect useActionPanels, ActionFormDrawer, ActionSaveCoordinator, conflict-comparison.tsx, action models and relevant cache/media state. The drawer currently initializes from initialAction. ConflictComparison currently displays Object.keys(pending), which alone cannot show remote-only changes when the user has not edited anything. Reuse presentation/formatters, not a fabricated pending write patch.

## Acceptance

- [ ] Compare the read against the canonical base/version tracked by the real coordinator. Keep the opening base snapshot, current local values and newer server snapshot distinct. Do not compare only updated_at strings lexicographically or infer change merely from differences in display formatting.
- [ ] A same-version response must not trigger comparison just because the user typed locally. A response older than the coordinator's latest confirmation is stale and must not roll back state or trigger a false conflict, including after this user's own save.
- [ ] On a newer version, automatically display only meaningful changed fields, including remote-only title, date, partners, responsible, phase/category/color, strategy, archived state and media additions/removals/reordering where changed. If only technical version metadata changed, explain that truthfully without inventing a content change.
- [ ] Show the current server values and the current local values for those fields. Include local pending fields when needed to make the resolution clear, labeled accurately; do not describe a local-only change as a server change. No requirement for word-level rich-text diff or a new field-by-field merge editor.
- [ ] Preserve names/labels, formatted dates, sanitized rich HTML and literal caption from existing comparison. Distinguish display-only comparison fields from the actual pending write patch so accepting local edits does not send untouched old fields over newer server data.
- [ ] Never automatically replace the form or silently advance its expected write version upon receiving a newer row. Capture pending editor refs, IME composition, title, caption and media state without blur-triggered writes or lost keystrokes when opening the modal.
- [ ] Explicitly accepting the server version updates the whole action and all dependent refs/media/coordinator state consistently. If local edits would be discarded, make that consequence clear in the resolution action.
- [ ] Explicitly choosing the existing keep/save-local resolution sends only the true local patch against the reviewed version. No save occurs just from opening, closing or cancelling comparison. With no local changes, do not offer a meaningless overwrite/save operation.
- [ ] Cancelling comparison retains edits and the previous base; unresolved divergence remains guarded by the existing conflict handling. Stop subsequent queued autosaves once the newer version is known until explicit resolution; do not claim already-sent requests can be undone.
- [ ] If a save was already in flight, reconcile its canonical success/conflict before presenting a stale competing modal. A newer change arriving during resolution still receives the normal version check; never force-write through another conflict.
- [ ] Keep one comparison per currently relevant version; repeated callbacks do not stack or repeatedly reopen identical modals. Do not add continuous polling/realtime subscriptions as part of this ticket.
- [ ] Reads failing/network unavailable do not reset or disable the initially editable form, falsely report a newer version or advance its version. Use the established failure/retry feedback; saves retain version checks. Missing/revoked action access follows existing inaccessible-action handling rather than accepting stale access from cache.
- [ ] Validate session generation, action/panel identity and mount before applying reads. New drafts and focus of an already-open edited action do not reset or refetch as a new opening. Principal/secondary remain independent; present comparison for the originating active panel without stealing the other panel's identity or stacking dialogs.
- [ ] Preserve guarded close/navigation/logout and drawer focus restoration. The existing version-change-on-save flow remains effective if the initial read misses a later remote edit.

## Verification

Use the actual opening path, coordinator and comparison components with controlled reads/writes. Cover: same version with/without local edits; newer version with clean form; same-field and different-field edits while read is pending; remote-only media deletion; editor blur/IME; own-save confirmation racing the read; stale read; newer conflict during resolution; cancel/reopen comparison; accepting server; saving only the true local patch; read failure/access revoked; session/panel change and two actions.

No automatic merge, read-only opening gate or silent clean-form replacement is authorized. This is independent of the closed recovery/duplication ticket; do not reopen that work or add duplication safeguards here. Follow ../README.md.

## Owner feedback — 2026-10-30

See the [acceptance and follow-up analysis](../../../docs/audits/2026-10-30-mobile-owner-feedback.md). Acceptance applies to the scenarios the owner reported, not all potential device/database/provider cases. Earlier preparation-only wording describes the historical ticket-creation round; implementation results are recorded in CURRENT.
