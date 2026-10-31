# Global header alignment — clarified 2026-10-31

After accepting14/19 (commit `53508d2`), the owner clarified that “top” in `UZZINA 9.png` means the global logo/notification/profile header. The initial Today-heading interpretation was withdrawn before commit: Today/HomeToday source and spacing remain as accepted in14. This report supersedes the earlier local Today-alignment measurements.

## Reproduction and correction

The real-route checker `scripts/check-mobile-spacing-browser.cjs` supports `GLOBAL_HEADER_ALIGNMENT_ONLY=true` at320/390/430/1440px. Before correction, four new assertions failed: logo/menu aligned with the outer frame edge rather than its inner border (one pixel). WebKit also reserves8px for the app scrollbar, so the header must account for its actual gutter.

Header uses the same responsive outer margins as the app frame, a transparent one-pixel side border, and right padding measured from the app scroller's offset/client widths. A passive effect observes the mounted scroller and window resize, with cleanup; Header receives the existing app-scroll ref. At390px Chromium the logo/menu edges are9/381px; WebKit uses9/373px, matching each engine's actual inner frame. Desktop retains its32px outer margin. Page titles, body gutters, typography, button sizes and account/navigation behavior are preserved.

## Verification and limits

Before the final tab integration, Chromium36 and WebKit36 bounded assertions passed. The complete layout checker additionally covers accepted Today/Home/Profile geometry, retained edits, native invalid-field handling, resizing and manual save with controlled HTTP. See the [shared-tabs report](2026-10-31-shared-tabs.md) for final integrated results/checks.

Local source only. Automated WebKit does not certify native iPhone browser chrome or keyboard. No production/database/provider writes, SQL, push or deploy. Owner's5176/cache and external inline-title/documentation work are preserved.14/19's earlier device acceptance is separate from this clarified correction.

## Owner acceptance — 2026-10-31

Owner confirmed “Header global ok” and requested a commit. Header implementation already belongs to local commit `566cbbe`; this update records its acceptance only. Shared-tabs ticket15 retains separate visual acceptance. No new functional changes, test execution, push or deployment in this acceptance round.
