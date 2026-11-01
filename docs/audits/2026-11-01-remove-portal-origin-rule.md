# Portal address rule removed — 01/11/2026

The owner explicitly rejected another correction and requested removal of the address restriction after the portal denied access on an iPhone through192.168.0.21. Earlier loopback canonicalization did not cover this access. The screenshot's credentials were neither used nor copied into tests/logs.

Removed Origin/APP_ORIGIN validation from portal login/logout and mutations, the unused shared validator, mandatory local document canonicalization and the address-denial UI message. No replacement address allowlist, environment switch or hostname inference was introduced. Credential validation, opaque sessions, HttpOnly/SameSite cookies, active-account/action authorization and error handling remain existing behavior. Other services such as the separate Leads repository were not changed.

## Verification

- Real local empty login: network Host/Origin returned403 address rejection before removal; after removal network and localhost returned400 for required credentials. Cookie-less logout200, local clear cookie without Secure. No valid credentials/session or database lookup required.
- Permanent HTTP regression against isolated original Git source:2 pass/9 fail; current real adapter/handlers:11 pass. Initial unprivileged server test could not bind its socket and was not counted as a functional red result; isolated socket tests were rerun with appropriate local execution permission.
- Real auth/comment contracts:66 pass, including valid fixture login from network Origin and authorized comments independent of Origin; absent/revoked/out-of-scope sessions remain denied.
- Real production build + controlled browser:6 groups passed for preserving requested hostname, two fixture accounts, cookie/reload/logout and error states. All backend traffic controlled, no production fixtures.
- Format/lint/typecheck/build and9 serverless checks passed. Existing lint informational/chunk warnings remain.

The active local server picked up the source removal; no manual cache cleanup/restart. No SQL, credentials change or real login performed. These checks establish rule removal and controlled session behavior, not acceptance of the owner's actual account credentials or a physical Safari certification.

## Publication

Local source removal is verified. Commit and production Ready details are recorded here on completion; older address-normalization diagnosis remains historical, not a requirement to restore.
