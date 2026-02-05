# Specification

## Summary
**Goal:** Improve profile management, enforce configurable email domain rules, enhance bench documents handling, standardize drag-and-drop layout reordering, expand Admin entity/user visibility with online status, and apply targeted UI/Statistics/bench form fixes.

**Planned changes:**
- Profile: add avatar options (upload custom photo or select from a predefined avatar list) and add an editable “Entity” field per user.
- Email rule: enforce a configurable email domain for profile email updates; add an Admin setting to view/update the enforced domain (default `safrangroup.com`).
- Bench documents: in each bench’s Documents tab, add direct “+” add actions for HW/SW/Other lists and per-document delete, edit/replace, and download actions.
- Layouts: enable drag-and-drop reordering for all layout blocks across all tabs with consistent UX; improve Admin tab drag UX (handles/spacing/feedback).
- Admin: add an Entity selector listing all entities; filter user list by selected entity with an English empty state.
- Admin: show per-user online/offline indicator based on backend last-seen timestamps updated periodically by the authenticated frontend (no sockets).
- Branding/UI: replace the app logo with the provided Safran logo and ensure it works in light/dark themes; fix light-mode fixed header overlap by adding correct content offset and white header background.
- Navigation helpers: add contextual “scroll to bottom” (near top) and “scroll to top” (near bottom) shortcuts with keyboard accessibility.
- Statistics: allow internal chart/layout card reordering within Statistics and persist order per user; add two draggable chart cards with filters (components by criticality, components by deadline/date limite).
- Benches list/form: show PLM Agile URL shortcut only when provided; add a deterministic client-side “Rewrite” button for bench description.

**User-visible outcome:** Users can personalize their profile (avatar + entity), are prevented from saving emails outside the configured domain, manage bench documents with add/replace/delete/download controls, reorder layouts consistently across the app (including within Statistics), admins can filter users by entity and see online status indicators, the Safran logo and header behave correctly in light/dark modes, pages provide scroll shortcuts, and bench list/form UX is improved.
