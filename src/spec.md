# Specification

## Summary
**Goal:** Fully localize the “Add bench” modal flow and add Russian, Simplified Chinese, Japanese, and Turkish as selectable UI languages.

**Planned changes:**
- Replace all user-facing strings in `frontend/src/pages/Benches/components/AddBenchModal.tsx` with `useI18n().t(...)` calls and add any missing translation keys for the full Add Bench modal flow (labels, placeholders, helper/validation text, buttons, loading/uploading text, and toast messages).
- Extend `frontend/src/i18n/languages.ts` to include RU/ZH/JA/TR language tags and display names.
- Extend `frontend/src/i18n/translations.ts` to provide complete translation dictionaries for RU/ZH/JA/TR covering all existing `TranslationKey` entries plus any new keys added for the Add Bench modal.

**User-visible outcome:** When a non-English language is selected, the Add Bench modal is fully translated, and users can switch the UI language to Russian, Simplified Chinese, Japanese, or Turkish from the Profile language selector.
