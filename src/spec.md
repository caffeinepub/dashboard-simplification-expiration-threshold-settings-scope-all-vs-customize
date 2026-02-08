# Specification

## Summary
**Goal:** Apply a user’s saved Profile language selection immediately across the entire app UI (without reload) and persist/restore it via the backend user profile.

**Planned changes:**
- Update the Profile “Save” flow so the newly selected language is applied instantly to all currently visible UI text (navigation, pages, sections, tabs, buttons, dialogs, placeholders, toasts, footer) without requiring a refresh.
- Audit the protected app shell and main pages (Dashboard, Benches, Bench Details, Profile, Admin) to replace remaining hard-coded user-facing strings with i18n translation keys so runtime language switching updates all text consistently.
- Persist the selected language to the backend user profile `languageTag` and restore it on sign-in; default to `en-US` when no stored `languageTag` exists.

**User-visible outcome:** After selecting a language in Profile and clicking Save, the whole app immediately switches to that language (including toasts), stays consistent when navigating, and loads in the last saved language after signing out/in.
