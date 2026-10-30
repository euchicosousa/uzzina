# 05: Make the leads list and detail usable on phones

**Status:** ready-for-agent — ticket preparation authorized 2026-10-29; implementation not started.
**Original proposal:** item 6. **Priority:** high.
**Blocked by:** none.

## Problem

IMG_9857.PNG shows the fixed-width list taking almost the entire phone screen while the detail is clipped to the right. app/routes/app/leads.tsx uses a permanent two-column flex layout with w-80/shrink-0 on the list.

## Acceptance

- [ ] On narrow screens, the initial view is the full-width list. Selecting a lead shows a full-width detail with an accessible “Voltar para leads” control.
- [ ] Returning restores the list search and scroll position during the current page visit. No hidden selected detail must replace the list simply because filteredLeads[0] exists.
- [ ] Preserve deep links through the current id search parameter. Define list versus explicit detail state consistently on reload and Back/Forward.
- [ ] Make mobile selection a navigable history step where appropriate; current replace:true must not prevent the user returning to the list with browser Back.
- [ ] Desktop keeps list/detail side by side. Resize/orientation preserves current selection and data without obscuring controls.
- [ ] Long names, dates, questionnaire answers and contact actions wrap or fit without horizontal page overflow.
- [ ] Loading, empty search, removed/inaccessible selection and errors remain understandable.
- [ ] Each visible scroll region ends with AppBarSpacer and keeps its final content reachable. Preserve authorized lead access and existing contact behavior.
- [ ] No modifications to the separate lead intake repository/API, database authorization or the questionnaire content.

## Verification

Test list→detail→return, direct link/reload, browser Back/Forward, search/scroll restoration, long answers, no leads, deleted/invalid id and orientation/desktop transition using real route/components and controlled data. Update existing flow documentation as required by AGENTS without asserting real-device verification from emulation. Follow ../README.md.
