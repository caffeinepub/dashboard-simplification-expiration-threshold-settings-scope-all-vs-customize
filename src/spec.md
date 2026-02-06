# Specification

## Summary
**Goal:** Fully localize the Test Bench UI (English/French) and default first-time users to English (en-US) while preserving any explicitly chosen language preference.

**Planned changes:**
- Replace all hardcoded user-facing strings on the Test Bench list and detail pages (and their subcomponents) with i18n `t(...)` keys.
- Add/complete `en-US` and `fr-FR` entries in `frontend/src/i18n/translations.ts` for every Test Bench-related key used.
- Ensure switching the language selector updates all Test Bench text immediately (no refresh required).
- Update frontend language initialization to default to `en-US` when there is no valid saved preference (localStorage) and no backend preference.
- Update backend language/profile defaults in `backend/main.mo` so callers without an existing stored preference/profile receive `languageTag = "en-US"`, while persisting and reusing any explicit user selection.

**User-visible outcome:** All Test Bench screens are fully translated via the app’s language selector (English/French), and new users see the UI in English by default until they choose a different language, which is then remembered.
