/**
 * Full common baseline lifecycle for all products.
 * Template is the master delivery artifact; CyberCaution, VendorSoluce, CyberCorrect
 * run this lifecycle with features activated as needed and theme updated for brand.
 */

export const LIFECYCLE_PHASES = [
  { id: 'onboarding', order: 1, name: 'Onboarding & config', description: 'Align client environment, select use case and frameworks, configure data sources and normalization' },
  { id: 'normalization', order: 2, name: 'Data normalization', description: 'Apply baseline schema and templates so client data is normalized before feed' },
  { id: 'enrichment', order: 3, name: 'Enrichment (optional)', description: 'Run enrichment pass for metadata overlay (privacy, vendor, etc.)' },
  { id: 'assessment', order: 4, name: 'Assessment', description: 'Framework-driven assessment (NIST CSF, CMMC, FISMA, etc.)' },
  { id: 'gap_analysis', order: 5, name: 'Gap analysis', description: 'Identify gaps, priorities, and recommendations' },
  { id: 'implementation', order: 6, name: 'Implementation', description: 'POA&M, tasks, RACI; evidence collection' },
  { id: 'evidence', order: 7, name: 'Evidence', description: 'Per-control evidence and linking' },
  { id: 'reporting', order: 8, name: 'Reporting & export', description: 'Reports, PDF/JSON/CSV export, delivery artifacts' },
] as const;

export type LifecyclePhaseId = (typeof LIFECYCLE_PHASES)[number]['id'];
