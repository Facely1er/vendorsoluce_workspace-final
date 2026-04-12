/**
 * Mock data for demo mode.
 * Used when VITE_DEMO_MODE=true to avoid confusing empty states.
 * All IDs use a demo prefix for clarity.
 */

import type { Database } from '../lib/database.types';

type VendorRow = Database['public']['Tables']['vs_vendors']['Row'];
type AssessmentRow = Database['public']['Tables']['vs_supply_chain_assessments']['Row'];
type SBOMRow = Database['public']['Tables']['vs_sbom_analyses']['Row'];

const DEMO_USER_ID = 'demo-user-00000000-0000-0000-0000-000000000001';
const NOW = new Date().toISOString();

export const DEMO_VENDORS: VendorRow[] = [
  {
    id: 'demo-vendor-001',
    user_id: DEMO_USER_ID,
    name: 'Acme Cloud Services',
    industry: 'Cloud Infrastructure',
    website: 'https://example.com/acme',
    contact_email: 'security@acme.example.com',
    risk_score: 72,
    risk_level: 'High',
    compliance_status: 'Partial',
    last_assessment_date: NOW,
    notes: 'Demo vendor - sample data',
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: 'demo-vendor-002',
    user_id: DEMO_USER_ID,
    name: 'SecurePay Solutions',
    industry: 'Financial Services',
    website: 'https://example.com/securepay',
    contact_email: 'compliance@securepay.example.com',
    risk_score: 45,
    risk_level: 'Medium',
    compliance_status: 'Compliant',
    last_assessment_date: NOW,
    notes: 'Demo vendor - sample data',
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: 'demo-vendor-003',
    user_id: DEMO_USER_ID,
    name: 'DataFlow Analytics',
    industry: 'Data Analytics',
    website: 'https://example.com/dataflow',
    contact_email: 'privacy@dataflow.example.com',
    risk_score: 58,
    risk_level: 'Medium',
    compliance_status: 'Partial',
    last_assessment_date: NOW,
    notes: 'Demo vendor - sample data',
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: 'demo-vendor-004',
    user_id: DEMO_USER_ID,
    name: 'Legacy Systems Inc',
    industry: 'Software',
    website: 'https://example.com/legacy',
    contact_email: 'security@legacy.example.com',
    risk_score: 85,
    risk_level: 'Critical',
    compliance_status: 'Non-Compliant',
    last_assessment_date: NOW,
    notes: 'Demo vendor - sample data',
    created_at: NOW,
    updated_at: NOW,
  },
];

export const DEMO_ASSESSMENTS: AssessmentRow[] = [
  {
    id: 'demo-assessment-001',
    user_id: DEMO_USER_ID,
    vendor_id: 'demo-vendor-001',
    assessment_name: 'NIST SP 800-161 Supply Chain Assessment (Demo)',
    overall_score: 72,
    section_scores: {
      governance: 75,
      supplier_management: 68,
      product_security: 78,
    },
    answers: {},
    status: 'completed',
    completed_at: NOW,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: 'demo-assessment-002',
    user_id: DEMO_USER_ID,
    vendor_id: 'demo-vendor-002',
    assessment_name: 'ISO 28000 Supply Chain Security (Demo)',
    overall_score: 85,
    section_scores: {
      governance: 88,
      supplier_management: 82,
    },
    answers: {},
    status: 'completed',
    completed_at: NOW,
    created_at: NOW,
    updated_at: NOW,
  },
];

export const DEMO_SBOM_ANALYSES: SBOMRow[] = [
  {
    id: 'demo-sbom-001',
    user_id: DEMO_USER_ID,
    filename: 'demo-app-sbom.json',
    file_type: 'application/json',
    total_components: 127,
    total_vulnerabilities: 3,
    risk_score: 42,
    analysis_data: null,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: 'demo-sbom-002',
    user_id: DEMO_USER_ID,
    filename: 'core-services-cdx.xml',
    file_type: 'application/xml',
    total_components: 89,
    total_vulnerabilities: 1,
    risk_score: 28,
    analysis_data: null,
    created_at: NOW,
    updated_at: NOW,
  },
];
