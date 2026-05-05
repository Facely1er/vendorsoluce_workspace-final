# VendorSoluce Workspace v1.0 (Clean)

Minimal, production-grade **vendor risk management** workspace.

## Constraints (by design)
- **localStorage only** (no backend)
- **no auth**
- **no multi-tenant**
- **no DSAR**
- minimal implementation (no platform/ecosystem)

## Routes
- `/dashboard`
- `/intake`
- `/vendors`
- `/risks`
- `/evidence`
- `/actions`
- `/reports`
- `/settings`

## Data model
- **Vendor**: name, service, criticality (Low/Medium/High)
- **Risk**: vendor dependency, data exposure, supply chain risk
- **Evidence**: vendor documentation, contracts, assessments
- **Remediation actions**: auto-generated from high criticality, missing evidence, unresolved risks (plus manual actions)
- **Report**: readiness score, critical vendors, open risks, evidence coverage, action plan

## Development

```bash
cd vendorsoluce-workspace-v1
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Folder structure
- `src/app/`: app shell, routing, theme sync
- `src/pages/`: route pages
- `src/store/`: localStorage state + derived actions + stats
- `src/styles/`: CyberCorrect-compatible tokens + workspace styles
- `src/ui/`: small UI primitives

