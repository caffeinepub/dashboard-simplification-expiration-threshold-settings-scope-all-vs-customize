# Specification

## Summary
**Goal:** Restore correct site-wide i18n behavior, improve bench document management, enrich dashboard recap with document assignment/version info, add a visual component-movement flow section, and enable exporting all dashboard data.

**Planned changes:**
- Fix frontend i18n usage so all user-visible UI strings use the translation system (useI18n.t) and update immediately when the language changes, including dashboard/statistics and other sections with hard-coded text.
- Extend bench document management to support component-like actions: edit document metadata (and optionally replace file), download, delete the document entity (not just unassign), and duplicate documents to assign to one or more other benches.
- Update the dashboard documents recap to show each document’s version and the bench(es) it is assigned to (by bench name), with sensible empty states for missing versions.
- Add a dedicated dashboard section with a visual flow/chart of component movements between benches, computed from recorded move history (source bench, destination bench, counts) and showing an empty state when no events exist.
- Add an Export option to export all dashboard data in one action, including documents (with version and bench assignments) and component movement flow/move-event data.

**User-visible outcome:** The UI remains fully translated when switching languages, users can fully manage bench documents (edit/download/delete/duplicate and reassign), the dashboard shows document version + bench assignments and a visual component-movement flow, and users can export all dashboard-related datasets via a single “All dashboard data” option.
