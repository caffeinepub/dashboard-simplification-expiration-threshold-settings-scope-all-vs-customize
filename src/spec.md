# Specification

## Summary
**Goal:** Promote the currently deployed Draft Version 51 to Internet Computer mainnet (production) and validate it via production smoke tests.

**Planned changes:**
- Execute the production deployment checklist to deploy against `DFX_NETWORK=ic`.
- Verify required production environment variables prior to deployment (`CANISTER_ID_BACKEND`, `CANISTER_ID_FRONTEND`, `II_URL=https://identity.ic0.app`) per `frontend/README_PRODUCTION_ENV.md`.
- Confirm backend canister health before publishing the frontend (e.g., status/cycles and a basic query call).
- Publish frontend assets to the production frontend canister and confirm the app loads at `https://<CANISTER_ID_FRONTEND>.ic0.app`.
- Run the production smoke test procedure using `frontend/SMOKE_TEST_PRODUCTION_DRAFT_V48.md` as the baseline and record PASS/FAIL + diagnostics in `frontend/SMOKE_TEST_PRODUCTION_RESULTS_V48.md`.

**User-visible outcome:** Draft Version 51 is live on production (IC mainnet) and verified working for authentication and core flows via recorded smoke test results.
