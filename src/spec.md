# Specification

## Summary
**Goal:** Improve profile entity input UX, ensure avatars update everywhere immediately after change, fix Safran logo truncation, and restore reliable Dashboard bar-chart “Graphs” section visibility for all users.

**Planned changes:**
- Update the Profile “Entity” field to a single-value tag-style input (removable badge + typeahead suggestions) while still persisting only one entity value.
- Expose an entity-suggestions endpoint/query to signed-in non-admin users for autocomplete (deduplicated, stable list).
- Ensure profile picture updates propagate across all UI surfaces in-session by invalidating/refetching relevant cached user/profile queries after update.
- Adjust Safran logo sizing/rendering on home and header/left areas to avoid cropping (contain-style fit with appropriate max sizing, no aspect distortion).
- Add/restore a “Graphs” section on the Dashboard with bar-chart style stats, and merge default sections with any saved dashboard order so charts aren’t hidden when missing from stored preferences.
- Update backend default dashboard section ordering for new/empty profiles so chart/graph sections are included by default.

**User-visible outcome:** Users can select or type a single “Entity” as a tag with autocomplete, see their updated avatar everywhere without hard refresh, view an unclipped Safran logo on home/header, and reliably see the Dashboard “Graphs” bar-chart section even if their saved layout is missing it.
