# Specification

## Summary
**Goal:** Persist full user profile fields (username, display name, avatar URL, bio) and make language switching apply instantly across the app, with language restored automatically across login/logout.

**Planned changes:**
- Extend the backend `UserProfile` model to store `username`, `displayName`, `avatarUrl`, and `bio`, and update all profile read/update methods so single-field updates preserve all other fields.
- Add a safe Motoko canister state migration to initialize the new `UserProfile` fields for existing stored profiles without losing any prior profile data.
- Update the Profile page UI to view/edit username, display name, email, avatar URL, bio, and language; ensure saving persists these fields and restores them after logout/login.
- Make language changes from the Profile page update the entire site immediately (no full reload) and ensure the saved language is loaded and applied on authentication state changes (defaulting to `en-US` when no profile exists).
- Apply a coherent visual theme to the Profile experience (spacing, typography, component styling) to match the rest of the app without changing functionality.

**User-visible outcome:** Users can edit and save their full profile (including avatar URL and bio), see the chosen language reflected immediately across the app, and have their language and profile details automatically restored after logging out and back in.
