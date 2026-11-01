# Portal login aligned with main login — 01/11/2026

The owner approved portal access and requested a commit. The access rule removal was already committed/published as `a714b2d`; its acceptance is now recorded separately. New request: match portal login appearance to the main login screenshot, especially excess side margins.

Changed only `/dash/login` presentation by copying the existing `/login` markup/classes:28rem frame, logo/gap, React Aria fields/labels, email/lock icons, password ghost button, placeholders, Prism error alert and right-aligned “Fazer Login”. Removed the portal-specific20/30rem widths, introductory text and full-width submit button. Existing portal authentication, cookie flow and address-rule removal were preserved. No new recovery flow, shared component or global visual refactor.

Per the owner's new workflow, no automated test, test suite, typecheck or build was run for this localized visual change. Changed files were formatted and the diff read; existing browser-script button selectors were updated to the new label. Local source is ready for the owner to validate; no new production publication is claimed.

## Owner's short check

1. Reload `/dash/login` on the same phone and compare with `/login`: logo/fields spacing, field width, icons and right-aligned button follow the main design, without the extra portal paragraph.
2. Type a password and toggle the eye: preserve the value and avoid submitting.
3. Use a valid portal account: login still opens the portal. A wrong password should show the existing error, with the new alert presentation.

This is not a new portal-access acceptance requirement; access was approved. The new layout has not been visually/device certified by the agent, and no screenshot credentials were used. Other-agent style-analysis work remains separate.
