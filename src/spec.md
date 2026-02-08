# Specification

## Summary
**Goal:** Complete i18n coverage for the Admin area and the Bench detail History view, ensuring all user-facing text and timestamps follow the currently selected app language.

**Planned changes:**
- Replace hardcoded Admin page header/title/description and tab labels (Benches, Documents, Users) in `frontend/src/pages/Admin/AdminPage.tsx` with `useI18n().t(...)` translation keys.
- Localize all remaining user-facing strings in `frontend/src/pages/Admin/components/AdminBenchesPanel.tsx` and `frontend/src/pages/Admin/components/AdminDocumentsPanel.tsx`, including loading/empty states, section text, dialogs, fallbacks, and toast messages.
- Localize Bench history action labels in `frontend/src/pages/Benches/components/BenchHistoryList.tsx` by mapping stored `entry.action` values to i18n keys with a safe fallback to the raw string when unknown.
- Format Bench history timestamps using the currently selected app locale (not the browser default) so date/time formatting updates when switching language.
- Extend `frontend/src/i18n/translations.ts` with all required new Admin and history translation keys, providing values for both `fr-FR` and `en-US`.

**User-visible outcome:** Switching between supported languages immediately updates all Admin labels/messages and Bench History action labels and timestamp formatting, without needing a page refresh.
