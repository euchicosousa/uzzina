# Mobile owner feedback — 2026-10-30

Scope: record owner acceptance, inspect the ten supplied screenshots and current source, prepare the requested calendar ticket and propose focused next steps. No functional changes authorized/executed by this documentation round. Existing uncommitted inline-title work preserved; owner's running server not controlled or restarted.

## Acceptance

Owner tested the local version over LAN on an iPhone. Ticket10 explicitly tested/approved;01/02/04/05/11 reported OK. Accept those exercised scopes; do not claim all automated scenarios, upload edge cases or production deployment were verified. Ticket08 palette colors OK; remaining spacing/section-tab presentation has follow-up. Ticket06 date logic acknowledged, presentation revision requested. Ticket03 not approved: redundant media label, Essential toolbar observation and landscape description reachability need separate treatment. Approval of ticket02's compact behavior does not preclude the newly requested footer visual review.

Screenshots remain at the supplied Downloads paths, not copied into Git: `IMG_9903.PNG`, `IMG_9902.PNG`, `UZZINA.png`, `UZZINA 2.png` through `UZZINA 6.png`, `IMG_9910.PNG`, `UZZINA 7.png`.

## Findings and proposed work

### 1. Calendar picker width — ticket12 prepared

`IMG_9903.PNG` shows clipped rightmost column/controls and very large days. Owner reports internal scrolling. Scope is `CalendarToolbar`'s date picker, not the operational action grid. [Ticket12](../../.scratch/safari-mobile/issues/12-compact-date-picker-width.md) requires computed geometry and a real browser regression before selecting a correction. Source combines CalendarCell full width/aspect ratio with minimum cell and icon-button sizes; a sizing interaction is an investigation target, not a confirmed cause.

### 2. Mobile padding and Today heading — revise presentation, keep desktop

`TodayPageView` has outer mx4 plus inner px8 even on mobile; Home's Today block independently has px8. Profile has px4, section py6/gap6, and the footer triggers have still other padding rules. Values accumulate across layers; reducing one shared token indiscriminately would affect unrelated controls. `IMG_9902.PNG` shows Home's Today block, whereas `UZZINA.png` shows the dedicated page; do not mistake the large Home heading/gap for the dedicated date-heading implementation.

Owner's direction: use the complete date string and truncate on one line rather than a special abbreviated string. `TodayPageView` currently switches narrow/wide strings and uses a stacked header below lg, so replacing the string alone will not remove the second controls row. Proposal: allocate the title the remaining width (`min-width:0`, truncation), keep controls available and reduce mobile margins/padding; measure whether a single row fits before promising it at every width. Preserve full accessible date text and selected-date/year behavior. Desktop remains the reference to preserve. Review Home spacing separately; do not automatically copy the page's date title to Home.

Next review should record viewport, nested padding, useful content width and header height for Today, Home, Profile and drawer, then propose local mobile adjustments with touch/keyboard targets preserved. No blanket padding reduction or typography redesign.

### 3. Profile sections versus preference choices

`profile.tsx` uses `PrismToggleGroup` both for mobile personal/preferences navigation and preference values, explaining the same pill appearance. Prism has no exported Tabs primitive in its current index. React Aria `Tabs`/`TabList`/`Tab` are already used in ActionDrawerPanel; no installed shadcn Tabs component was found in app.

Recommendation: use one shared Prism tab presentation backed by the existing React Aria stack for navigation between panels, with an underline/divider to distinguish it from value-choice pills. If implemented as a new reusable primitive, export it and add `/ui` coverage as required. Inventory/adapt existing actual tabs, not every toggle in the app. Preserve arrow-key behavior, focus/selection distinction, mounted profile sections/unsaved values, native validation revealing personal fields and the existing drawer focus contracts. Importing shadcn solely for this adds another stack without solving a missing underlying behavior; no need identified from this inspection.

### 4. Footer visual unification

`ComboboxTrigger` uses custom form-inline (large p6) and form-footer (px6/py5.5); partner defaults to form-footer, phase/category/color use form-inline. Right-hand duplicate/archive use `PrismButton ghost size=icon`; save uses the primary button. The compact strip preserves these existing internals and dividers rather than normalizing their geometry. The icon/avatar differences are meaningful values; the inconsistent frame/padding is avoidable.

Recommend replacing this footer's bespoke left-hand trigger frames with the same existing PrismButton ghost/icon geometry as the secondary actions, retaining avatar/progress/category/color as contents and named accessible controls. Keep save primary, all commands and popover logic, one scrolling strip, edge fades, keyboard-reveal and fixed save. Unify footprint/alignment/interaction, not all semantic emphasis. Do not remove shared trigger variants globally without auditing consumers. This is analysis/proposal, not an implemented API change or approval to rewrite selectors.

### 5. Background movement and landscape description — highest functional priority

`UZZINA 4.png`/`UZZINA 7.png` and the owner's report show a drawer with visible background and apparent page movement; still screenshots do not identify which scroll position changed. `IMG_9910.PNG` plus the owner report establishes an unusable landscape Essential description. Keep both reports open, but do not label them an inevitable iPhone limitation.

Source facts: ActionDrawerPanel is a custom fixed overlay/button plus fixed panel, not PrismSheet/React Aria ModalOverlay; it does not itself call a scroll-lock hook. The app behind it has its own overflow-y-auto region. Essential has nested h-full/overflow-hidden containers, a min-h50 editor and non-scrolling title/metadata; it does not use Instagram's short-panel/visual-viewport writing adaptation. At landscape panel width672px the <640px compact rule does not apply, so full metadata is shown, consistent with the screenshot. These are structural observations, not a reproduced causal diagnosis.

Reproduction plan before correction: record document/window scroll, underlying app scroll, drawer/editor scroll, panel bounds and visualViewport height/offset. Exercise touch in panel body, backdrop, header and at scroll boundaries; compare portrait/landscape, bars expanded/collapsed, keyboard open/closed, one/two actions and nested popovers. First distinguish genuine background scroll from visual-viewport pan and content clipped inside the panel. No agent-run iPhone loop executed in this round; the diagnosing skill's causal/fix phases remain pending. The owner screenshots/report are evidence of symptoms, not a passing regression.

Ranked hypotheses for that loop:

1. If the app's underlying scroll region remains active through overlay gestures, locking that exact region while preserving its scroll position should stop background scroll without stopping drawer/editor scrolling.
2. If fixed panel bounds track layout rather than visible area, comparing those bounds through keyboard/bar changes should expose the inaccessible section; a temporary visible-viewport bound should change reachability.
3. If header/metadata plus minimum editor height exceed the landscape surface and ancestors clip overflow, allowing one deliberate drawer scroll region should make the description reachable even before keyboard-specific adjustments.

Candidate direction after measurement: coordinated lock for document AND app scroll region for the lifetime of any open action, compatible with nested overlays and exact restoration on final close; use existing React Aria scroll handling where appropriate. Give Essential a real reachable scrolling region, then adapt to the visible viewport rather than disabling touch globally. Avoid indiscriminate touchmove preventDefault, global focus containment or disabling zoom. Scroll locking and editor reachability must be verified together, because a lock can worsen the clipped-editor problem.

Research: [VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport) distinguishes visible bounds from layout and exposes height/offset/events; a software keyboard can shrink the former without resizing the latter. [overscroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overscroll-behavior) controls boundary scroll propagation, not all possible background scroll or viewport pan. [WebKit report240859](https://bugs.webkit.org/show_bug.cgi?id=240859) documents cases where body overflow hidden alone is insufficient with collapsed Safari chrome; it does not establish this app's root cause. These sources inform the reproduction matrix, not a certified fix.

### 6. Media-type badge and toolbar scope

`ContentFilesManager` renders detected Imagem/Vídeo/Carrossel as informational text. The same badge exists in the parent of commit `ab4ab7e`; it was not introduced by that mobile commit. Previously the upload button hid when files existed; compact mode now keeps it visible, bringing badge/button together. No dependency on the badge for upload/reorder/selection was found. Removal is a reasonable simplification; preserve a useful file count in management if needed. No removal applied in this analysis.

`UZZINA 6.png` shows Essential, identifiable by the date summary and full H1/H2/H3 toolbar. Essential's Tiptap omits compactToolbar, whose default is false; RichTextEditor explicitly uses flex-wrap in that case. Instagram alone passes compactToolbar={writingLayout}. Thus the two-row screenshot does not prove the Instagram compact toolbar failed; Essential was outside the prior compact-toolbar scope. Recommend a consistent single-row/More-formatting policy when writing space is constrained across both editors, while preserving all commands, selection and keyboard toolbar access. Verify Instagram separately before declaring ticket03 approved. No new failure asserted for an unobserved Instagram toolbar scenario.

## Verification and next decision

This is source/screenshot analysis and ticket preparation, not a full runtime diagnosis. No new automated/browser tests, actual iPhone instrumentation, app build, production/database/provider writes, paid generations, SQL, server changes, commit, push or deploy. References/diff checked. Recommended order: reproduce/fix landscape writing and background movement together; compact calendar; mobile header/padding; shared tab presentation and footer frames; simplify badge and extend compact toolbar scope. Existing approved behavior remains accepted within the owner's reported coverage.

## Owner agreement and ticket registration

Owner agreed to this analysis and requested correction tickets plus a separate thorough general style-analysis ticket. Calendar12 reused; new tickets13–18 cover scroll/landscape writing, mobile spacing/full-date truncation, shared tabs, footer button frames, compact toolbars and redundant media badge, respectively. [Queue/index](../../.scratch/safari-mobile/README.md). A separate [style-analysis ticket](../../.scratch/visual-consistency/issues/01-app-style-analysis-and-simplification.md) requires an app-wide inventory, evidence, a smaller role-based component vocabulary and finite simplification proposals. No implementation or execution of the new general audit in this registration; existing accepted scopes and external edits preserved.
