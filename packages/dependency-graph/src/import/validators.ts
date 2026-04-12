import type { EdgeCsvRow, ParsedCsvResult, ProcessingCsvRow, ServiceCsvRow, VendorCsvRow } from './csvSchemas';
import { ALLOWED_EDGE_TYPES, ALLOWED_VISIBILITY } from './csvSchemas';

function isScore(value?: string): boolean {
  if (!value || value === '') return true;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= 1;
}

function isInt(value?: string): boolean {
  if (!value || value === '') return true;
  const n = Number(value);
  return Number.isInteger(n) && n >= 1;
}

export function validateVendors(rows: VendorCsvRow[]): ParsedCsvResult<VendorCsvRow> {
  const errors: string[] = [];
  rows.forEach((row, i) => {
    if (!row.vendor_name?.trim()) errors.push(`vendors row ${i + 2}: vendor_name is required`);
    if (!isScore(row.criticality)) errors.push(`vendors row ${i + 2}: criticality must be 0..1`);
    if (!isScore(row.inherent_risk)) errors.push(`vendors row ${i + 2}: inherent_risk must be 0..1`);
    if (!isScore(row.substitution_difficulty)) errors.push(`vendors row ${i + 2}: substitution_difficulty must be 0..1`);
  });
  return { rows, errors };
}

export function validateServices(rows: ServiceCsvRow[]): ParsedCsvResult<ServiceCsvRow> {
  const errors: string[] = [];
  rows.forEach((row, i) => {
    if (!row.service_name?.trim()) errors.push(`services row ${i + 2}: service_name is required`);
    if (!isScore(row.criticality)) errors.push(`services row ${i + 2}: criticality must be 0..1`);
  });
  return { rows, errors };
}

export function validateProcessing(rows: ProcessingCsvRow[]): ParsedCsvResult<ProcessingCsvRow> {
  const errors: string[] = [];
  rows.forEach((row, i) => {
    if (!row.processing_name?.trim()) errors.push(`processing row ${i + 2}: processing_name is required`);
    if (!isScore(row.sensitivity)) errors.push(`processing row ${i + 2}: sensitivity must be 0..1`);
    if (!isScore(row.regulatory_weight)) errors.push(`processing row ${i + 2}: regulatory_weight must be 0..1`);
  });
  return { rows, errors };
}

export function validateEdges(rows: EdgeCsvRow[]): ParsedCsvResult<EdgeCsvRow> {
  const errors: string[] = [];
  rows.forEach((row, i) => {
    if (!row.source_key?.trim()) errors.push(`edges row ${i + 2}: source_key is required`);
    if (!row.target_key?.trim()) errors.push(`edges row ${i + 2}: target_key is required`);
    if (!ALLOWED_EDGE_TYPES.includes(row.edge_type)) errors.push(`edges row ${i + 2}: invalid edge_type`);
    if (row.visibility_level && !ALLOWED_VISIBILITY.includes(row.visibility_level)) errors.push(`edges row ${i + 2}: invalid visibility_level`);
    if (!isScore(row.dependency_strength)) errors.push(`edges row ${i + 2}: dependency_strength must be 0..1`);
    if (!isScore(row.operational_criticality)) errors.push(`edges row ${i + 2}: operational_criticality must be 0..1`);
    if (!isScore(row.data_sensitivity_factor)) errors.push(`edges row ${i + 2}: data_sensitivity_factor must be 0..1`);
    if (!isScore(row.substitution_penalty)) errors.push(`edges row ${i + 2}: substitution_penalty must be 0..1`);
    if (!isInt(row.tier_level)) errors.push(`edges row ${i + 2}: tier_level must be a positive integer`);
  });
  return { rows, errors };
}
