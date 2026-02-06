# Specification

## Summary
**Goal:** Let users duplicate (copy) a component to one or more other existing test benches, both during bench creation and after a bench/component already exists.

**Planned changes:**
- Backend: Add an authorized duplication method that takes a `Component` payload plus `targetBenchIds`, validates target benches exist, appends copied components to each target bench with `associatedBenchId` set to the target bench, and writes a history entry per affected bench.
- Bench Detail page: Add a “Duplicate / Copy” action for a component in the components (Health Book) table to select one/more target benches (excluding current bench by default), confirm duplication, show success/error toasts, and refresh relevant data.
- Add New Test Bench modal: While adding component(s), add a control to optionally select existing benches that should also receive copies; after the new bench is created successfully, duplicate the selected component(s) into the selected existing benches and surface any duplication errors via toasts.

**User-visible outcome:** Users can copy a component to other existing benches either from an existing bench’s component list or while creating a new bench, without recreating the component from scratch; target benches show the duplicated component and a history entry for the duplication.
