# Specification

## Summary
**Goal:** Deploy the approved Draft Version 36 to production as an Internet Computer canister upgrade, with no additional feature or code changes, then validate key authentication and profile persistence flows.

**Planned changes:**
- Deploy the current approved codebase (Draft Version 36) to production via canister upgrade.
- Perform a basic post-deploy smoke test: Internet Identity login/logout and user profile persistence across refresh and relogin.

**User-visible outcome:** The production site runs Draft Version 36; users can sign in with Internet Identity, access protected areas, and see profile updates persist after refresh and after logging out/in.
