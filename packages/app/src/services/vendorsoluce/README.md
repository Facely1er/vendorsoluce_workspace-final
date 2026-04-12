# VendorSoluce dependency intelligence integration

Phase 18 adds the dependency graph engine as a first-class workspace service layer.

Included here:
- CSV import -> graph node/edge persistence
- metric recomputation
- critical path recomputation
- scenario execution
- HTML cascade brief export
- integrated vendor risk model merge with legacy `vs_vendors` rows

This is the service backbone for wiring UI routes/pages onto the graph model without keeping a parallel truth system.
