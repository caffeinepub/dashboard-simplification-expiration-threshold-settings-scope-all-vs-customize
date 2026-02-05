# Specification

## Summary
**Goal:** Ensure profile updates persist correctly (especially profile photos and entity values) and that avatar changes are reflected immediately across the UI.

**Planned changes:**
- Fix profile save logic so the selected avatar (predefined or uploaded) is not overwritten by subsequent saves.
- Ensure avatar displays that rely on public user info (including the “binôme profile” tab) refresh immediately after a successful profile save.
- Invalidate/refetch relevant React Query caches after profile updates so changes appear without a hard refresh.
- Allow saving newly typed “entity” values (not only suggested ones) and ensure newly saved entities appear in suggestions afterward.
- Align backend validation with frontend rules so admin users are not blocked from saving due to email-domain constraints.

**User-visible outcome:** Users can change their profile picture (avatar or uploaded photo) and see it update immediately everywhere (including the binôme profile tab), and they can save newly typed entity values (e.g., “T2I”, “IVV”, “Qualite”, “IMI”, “RLI”) which then show up in entity suggestions.
