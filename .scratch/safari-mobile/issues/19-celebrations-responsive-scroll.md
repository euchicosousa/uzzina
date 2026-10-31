# 19: Use one natural mobile scroll on the celebrations page

**Status:** implemented and owner-approved on2026-10-30 for the reported scenarios; local commit authorized. No push or deploy.

## Authorized scope

Owner's `UZZINA 8.png` shows a large empty gap, a clipped list and two scroll regions on the iPhone. Owner explicitly requested removing the nested/right-list scroll on mobile, keeping independent right-hand scrolling only when desktop columns are side by side. Ticket12's calendar picker appearance is outside this correction.

## Implementation and acceptance

- Below768px: form and list have natural height; the app region is the only vertical scroll owner. No blank full-height left column or nested list offset.
- At/above768px: independent columns retain bounded height and scrolling. Both end with AppBarSpacer so the form and final date remain reachable, including a short desktop window.
- Initial current-month/year positioning belongs only to the desktop list. Mobile does not scroll the page or consume that initialization. Entering desktop after mobile performs it once; later desktop resize preserves manual position.
- Existing administration guard, queries, month grouping, create/edit/delete handlers and error behavior remain unchanged. No calendar styling or shared component changes.

Real-route browser regression failed before correction at320/390/430/767px: root and list were both scroll owners, list pre-scrolled6192px and form/list gap162–190px at phone widths. After correction only the app scrolls, gap32px and inner offset0. Desktop768/1440 retained list scrolling. Wheel ownership, final-date/AppBar reachability, breakpoint transitions and short desktop form/list access are covered.

[Operation and verification report](../../../docs/audits/2026-10-30-celebrations-responsive-scroll.md). HTTP/data controlled; no production writes, SQL, paid generation, commit, push or deploy. Owner's5176 server/cache preserved.
