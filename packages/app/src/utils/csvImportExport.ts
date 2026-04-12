// CSV import/export utilities for Vendor Risk Radar
import type { VendorRadar, VendorBase } from '../types/vendorRadar';
import { calculateInherentRisk, calculateResidualRisk } from './riskCalculations';

/**
 * Parse CSV text into vendor objects
 */
export const parseCSV = (csvText: string): VendorRadar[] => {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row');
  }

  // Parse headers
  const headers = parseCSVLine(lines[0]).map(h => normalizeHeader(h.trim()));
  const vendors: VendorRadar[] = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || !values[0]) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      let val = (values[idx] ?? '').trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/""/g, '"');
      }
      row[h] = val;
    });

    const vendor = mapRowToVendor(row);
    if (vendor.name) {
      const inherentRisk = calculateInherentRisk(vendor);
      const residualRisk = calculateResidualRisk(vendor, inherentRisk);
      
      vendors.push({
        id: crypto.randomUUID(),
        name: vendor.name,
        category: vendor.category || 'tactical',
        sector: vendor.sector || '',
        location: vendor.location || '',
        contact: vendor.contact,
        notes: vendor.notes,
        dataTypes: vendor.dataTypes || [],
        serviceType: vendor.serviceType,
        populationImpacted: vendor.populationImpacted,
        inherentRisk,
        residualRisk,
        sbomProfile: vendor.sbomProfile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }

  return vendors;
};

/**
 * Generate CSV text from vendor array
 */
export const generateCSV = (vendors: VendorRadar[]): string => {
  const headers = [
    'Vendor Name',
    'Category',
    'Sector',
    'Location',
    'Contact',
    'Data Types',
    'Service Type',
    'Population Impacted',
    'Provides Software',
    'SBOM Available',
    'SBOM Format',
    'Open Source Exposure',
    'Inherent Risk',
    'Residual Risk',
    'Notes'
  ];

  const rows = vendors.map(v => [
    escapeCSVValue(v.name),
    v.category,
    v.sector,
    v.location,
    v.contact || '',
    v.dataTypes.join('; '),
    escapeCSVValue(v.serviceType || ''),
    escapeCSVValue(v.populationImpacted || ''),
    v.sbomProfile?.providesSoftware ? 'Yes' : 'No',
    v.sbomProfile?.sbomAvailable ? 'Yes' : 'No',
    v.sbomProfile?.sbomFormat || '',
    v.sbomProfile?.openSourceExposure || '',
    v.inherentRisk.toString(),
    v.residualRisk.toString(),
    escapeCSVValue(v.notes || '')
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};

/**
 * Map CSV row to vendor object
 */
function mapRowToVendor(row: Record<string, string>): Partial<VendorBase> {
  const vendor: Partial<VendorBase> = {
    name: row['vendor name'] || row['name'] || '',
    category: (row['category']?.toLowerCase() as VendorBase['category']) || 'tactical',
    sector: row['sector'] || '',
    location: row['location'] || '',
    contact: row['contact'] || row['contact email'] || '',
    notes: row['notes'] || '',
  };

  // Parse data types
  if (row['data types']) {
    vendor.dataTypes = row['data types']
      .split(/[;,]/)
      .map(dt => dt.trim())
      .filter(Boolean);
  }

  // Parse SBOM profile
  const providesSoftware = row['provides software']?.toLowerCase() === 'yes' || 
                          row['provides software']?.toLowerCase() === 'true';
  const sbomAvailable = row['sbom available']?.toLowerCase() === 'yes' ||
                        row['sbom available']?.toLowerCase() === 'true';

  if (providesSoftware || sbomAvailable) {
    vendor.sbomProfile = {
      providesSoftware,
      sbomAvailable,
      sbomFormat: row['sbom format'] || undefined,
      openSourceExposure: row['open source exposure'] || undefined
    };
  }

  const st =
    row['service type'] ||
    row['servicetype'] ||
    row['service_type'] ||
    '';
  const pop =
    row['population impacted'] ||
    row['populationimpacted'] ||
    row['population_impacted'] ||
    '';
  if (st) vendor.serviceType = st;
  if (pop) vendor.populationImpacted = pop;

  return vendor;
}

/**
 * Parse CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/**
 * Normalize header names
 */
function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Escape CSV value (add quotes if needed)
 */
function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Download CSV template
 */
export const downloadCSVTemplate = () => {
  const template = [
    'Vendor Name,Category,Sector,Location,Contact,Data Types,Service Type,Population Impacted,Provides Software,SBOM Available,SBOM Format,Open Source Exposure,Notes',
    'Example Vendor,critical,Cloud Infrastructure,United States,security@example.com,"PII; PHI; Financial",Cloud / Infrastructure,All employees,Yes,No,,,Example vendor notes'
  ].join('\n');

  const blob = new Blob([template], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vendorsoluce-import-template.csv';
  a.click();
  URL.revokeObjectURL(url);
};
