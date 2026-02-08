# Specification

## Summary
**Goal:** Let authenticated users view another user’s public profile details by clicking their avatar, including a larger profile picture and basic public fields.

**Planned changes:**
- Add a protected frontend route (e.g., `/users/:userId`) for a “User Profile Details” page that displays username, entity, bio, and a larger profile picture, with loading and “User not found” states and English UI labels.
- Make avatars clickable where they represent another user (at minimum in the Bench History list) to navigate to the corresponding user’s profile details route using that user’s principal ID.
- Extend the backend public user info query to return `username`, `bio`, `entity`, and `profilePicture` for a given user Principal to any authenticated caller, returning a non-throwing “not found” result when the user doesn’t exist.
- Update frontend data/types (including the existing React Query hook and candid/type updates) to consume the expanded public user info without breaking existing usage (including bench history rendering).

**User-visible outcome:** After signing in, users can click another user’s avatar (at least from bench history) to open a dedicated profile details page showing that user’s username, entity, bio, and a larger profile picture, with clear feedback for loading and missing users.
