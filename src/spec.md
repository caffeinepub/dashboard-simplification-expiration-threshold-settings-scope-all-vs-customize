# Specification

## Summary
**Goal:** Make the Dashboard documents section update immediately after any bench-document changes by sourcing its data from React Query and using query invalidation/refetch.

**Planned changes:**
- Refactor DashboardPage documents/bench data loading to use a React Query hook (stable queryKey) instead of one-time local `useState` + `useEffect` fetching via `actor.exportData()`.
- Add a reusable React Query hook for dashboard/export data (wrapping `actor.exportData()` and any dependent calls such as `actor.getAllTestBenches()`), exposing loading/error state and using a single well-defined queryKey.
- Update all document and bench-document mutation hooks to centrally invalidate the dashboard/export queryKey after upload+associate, associate existing, remove from bench, edit, duplicate, and delete actions.
- Update BenchDocumentsEditor to rely on React Query invalidation/refetch (shared query consumption and/or `queryClient.invalidateQueries`) rather than only reloading local state via `actor.exportData()` calls.

**User-visible outcome:** After uploading, associating, removing, editing, duplicating, or deleting bench documents anywhere in the app, the Dashboard’s documents list and its document-to-bench mapping updates correctly without a manual page reload or refresh action.
