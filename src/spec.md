# Specification

## Summary
**Goal:** Update the app header Safran logo by replacing the existing logo asset with the user-provided image, without changing the public asset path.

**Planned changes:**
- Edit the provided Safran logo image into a clean, tightly cropped wordmark sized to 220×64 (transparent background if possible).
- Replace the existing public asset at `/assets/generated/safran-logo.dim_220x64.png` with the updated logo image.
- Verify the header renders the new logo clearly on light/dark backgrounds with the existing `object-contain` sizing (no distortion or layout shift).

**User-visible outcome:** The application header displays the updated Safran logo automatically, with no code changes needed.
