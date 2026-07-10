# Import Fidelity Tools Design

## Goal

Improve image import fidelity for pixel-art and bead-pattern workflows by separating preservation, cleanup, and production simplification.

## Confirmed Scope

- Add an original-image comparison layer in bead mode with an opacity control.
- Add three import modes: high fidelity, balanced, and easy to make.
- Add local intelligent color-code recognition that identifies likely outline and highlight colors, locks them, and protects them during optimization and restoration.

## Design

### Original Comparison Layer

Bead mode stores the current source image and import calibration. When enabled, the renderer draws the source image aligned to the current bead grid, using calibration metadata when present and full-pattern alignment otherwise. A single opacity value controls the layer. This is an editing aid only; exports keep their current behavior.

### Import Modes

The import mode is stored on `state.beads.importMode`.

- `fidelity`: use source sampling without cleanup so small highlights and outline fragments survive.
- `balanced`: use gentle cleanup after sampling and protect locked outline/highlight colors.
- `simple`: use cleanup plus color-count reduction for an easier production chart.

Direct import and calibrated import both use the selected mode. Existing manual color optimization remains explicit.

### Intelligent Color Recognition

The app analyzes the generated pattern after import:

- likely outline colors are dark colors with meaningful usage or edge-adjacent structure;
- likely highlight colors are very light, low-usage colors surrounded by non-background cells;
- locked colors are stored as `state.beads.lockedColorCodes`.

Locked colors are displayed in the color optimization panel. Color optimization and restoration do not replace locked colors unless the user manually edits them.

## Testing

- Unit-style browser hooks verify import modes, locked color detection, and protected color optimization.
- Existing synthetic import, calibration, restoration, and sync tests must remain passing.
