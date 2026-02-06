# Specification

## Summary
**Goal:** Ensure duplicated/reassigned equipment components are persisted to the destination bench and immediately visible in the destination bench Health Book.

**Planned changes:**
- Backend: fix duplication/reassignment logic so the duplicated component is stored under the destination bench (with `associatedBenchId` set to the destination bench) and is returned by `getComponents(destinationBenchId)`.
- Backend: prevent traps for valid duplication actions (authorized user, existing source bench, existing destination bench).
- Frontend: after successful duplication, invalidate/refetch React Query cache for `['benchComponents', destinationBenchId]` (for each selected destination bench) so the Health Book displays updated data.
- Frontend: on duplication failure, show an error toast and do not show a success toast.

**User-visible outcome:** After duplicating an equipment/component from one bench to another, users can navigate to the destination bench and see the duplicated component in its Health Book immediately (no hard refresh needed).
