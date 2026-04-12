import { supabase } from '../lib/supabase';
import { generatePdfFromHtml } from './generatePdf';
import { pdf, pdfScoreColor } from './pdfHtmlPalette';

export interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
  skippedCount: number;
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
  includeHeaders?: boolean;
  dateFormat?: 'iso' | 'local';
}

// CSV Parsing Utilities
export const parseCSV = (csvContent: string): any[] => {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must have at least a header row and one data row');
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) {
      console.warn(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}`);
      continue;
    }
    
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    data.push(row);
  }
  
  return data;
};

const parseCSVLine = (line: string): string[] => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"' && (i === 0 || line[i - 1] === ',')) {
      inQuotes = true;
    } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i + 1] === ',')) {
      inQuotes = false;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

// Generate CSV from data
export const generateCSV = (data: any[], headers?: string[]): string => {
  if (data.length === 0) return '';
  
  const keys = headers || Object.keys(data[0]);
  const csvHeaders = keys.join(',');
  
  const csvRows = data.map(row => 
    keys.map(key => {
      const value = row[key];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
};

// Vendor Data Import/Export
export const importVendors = async (fileContent: string, format: 'csv' | 'json', userId: string): Promise<ImportResult> => {
  const result: ImportResult = {
    success: false,
    importedCount: 0,
    errors: [],
    skippedCount: 0
  };
  
  try {
    let vendorData: any[] = [];
    
    if (format === 'csv') {
      const rawData = parseCSV(fileContent);
      vendorData = rawData.map(row => ({
        name: row.name || row['Vendor Name'] || row['vendor_name'],
        industry: row.industry || row['Industry'] || null,
        website: row.website || row['Website'] || null,
        contact_email: row.contact_email || row['Contact Email'] || row['email'] || null,
        risk_score: parseInt(row.risk_score || row['Risk Score'] || '50') || 50,
        risk_level: row.risk_level || row['Risk Level'] || 'Medium',
        compliance_status: row.compliance_status || row['Compliance Status'] || 'Non-Compliant',
        notes: row.notes || row['Notes'] || null,
        user_id: userId
      }));
    } else if (format === 'json') {
      const parsed = JSON.parse(fileContent);
      vendorData = Array.isArray(parsed) ? parsed : [parsed];
      vendorData = vendorData.map(vendor => ({ ...vendor, user_id: userId }));
    }
    
    // Filter out invalid vendors and prepare for bulk insert
    const validVendors = vendorData.filter(vendor => {
      if (!vendor.name || vendor.name.trim() === '') {
        result.errors.push(`Skipped vendor due to missing name: ${JSON.stringify(vendor)}`);
        result.skippedCount++;
        return false;
      }
      // Ensure default values are set if not provided
      if (!vendor.risk_score) vendor.risk_score = 50;
      if (!vendor.risk_level) vendor.risk_level = 'Medium';
      if (!vendor.compliance_status) vendor.compliance_status = 'Non-Compliant';
      return true;
    });

    if (validVendors.length > 0) {
      const { error } = await supabase.from('vs_vendors').insert(validVendors);
      if (error) {
        // If bulk insert fails, try to identify which ones failed (though Supabase doesn't return per-row errors easily)
        // For simplicity, we'll mark all as failed if the bulk operation fails.
        validVendors.forEach(vendor => {
          result.errors.push(`Error importing vendor "${vendor.name}": ${error.message}`);
          result.skippedCount++;
        });
      } else {
        result.importedCount += validVendors.length;
      }
    }
    
    result.success = result.importedCount > 0;
    return result;
  } catch (err) {
    result.errors.push(`Parse error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return result;
  }
};

export const exportVendors = async (vendors: any[], options: ExportOptions): Promise<string> => {
  const exportData = vendors.map(vendor => ({
    'Vendor Name': vendor.name,
    'Industry': vendor.industry || '',
    'Website': vendor.website || '',
    'Contact Email': vendor.contact_email || '',
    'Risk Score': vendor.risk_score || 0,
    'Risk Level': vendor.risk_level || 'Medium',
    'Compliance Status': vendor.compliance_status || 'Non-Compliant',
    'Last Assessment': vendor.last_assessment_date || 'Never',
    'Notes': vendor.notes || '',
    'Created Date': options.dateFormat === 'local' 
      ? new Date(vendor.created_at).toLocaleDateString()
      : vendor.created_at
  }));
  
  if (options.format === 'csv') {
    return generateCSV(exportData);
  } else if (options.format === 'json') {
    return JSON.stringify(exportData, null, 2);
  } else if (options.format === 'pdf') {
    const filename = `vendors_export_${new Date().toISOString().split('T')[0]}.pdf`;
    await exportVendorsToPdf(vendors, options, filename);
    return filename; // Return filename for consistency, though PDF is handled differently
  }
  
  throw new Error(`Unsupported export format: ${options.format}`);
};

const exportVendorsToPdf = async (vendors: any[], options: ExportOptions, filename: string) => {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low':
        return pdf.riskLow;
      case 'medium':
        return pdf.riskMedium;
      case 'high':
        return pdf.riskHigh;
      case 'critical':
        return pdf.riskCritical;
      default:
        return pdf.neutralGray;
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'compliant':
        return pdf.riskLow;
      case 'partial':
        return pdf.riskMedium;
      case 'non-compliant':
        return pdf.riskCritical;
      default:
        return pdf.neutralGray;
    }
  };

  const dateStr = options.dateFormat === 'local' 
    ? new Date().toLocaleDateString()
    : new Date().toISOString().split('T')[0];

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid ${pdf.navy}; padding-bottom: 20px;">
        <h1 style="color: ${pdf.navy}; margin: 0; font-size: 28px;">Vendor Export Report</h1>
        <p style="color: ${pdf.mutedText}; margin: 10px 0 0 0; font-size: 16px;">Generated: ${dateStr}</p>
        <p style="color: ${pdf.mutedText}; margin: 5px 0 0 0; font-size: 14px;">Total Vendors: ${vendors.length}</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <h2 style="color: ${pdf.teal}; margin-bottom: 20px; font-size: 22px;">Vendor List</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: ${pdf.gray100}; border-bottom: 2px solid ${pdf.navy};">
              <th style="padding: 12px; text-align: left; color: ${pdf.gray700}; font-weight: 600;">Vendor Name</th>
              <th style="padding: 12px; text-align: left; color: ${pdf.gray700}; font-weight: 600;">Industry</th>
              <th style="padding: 12px; text-align: center; color: ${pdf.gray700}; font-weight: 600;">Risk Score</th>
              <th style="padding: 12px; text-align: center; color: ${pdf.gray700}; font-weight: 600;">Risk Level</th>
              <th style="padding: 12px; text-align: center; color: ${pdf.gray700}; font-weight: 600;">Compliance</th>
            </tr>
          </thead>
          <tbody>
            ${vendors.map((vendor, index) => `
              <tr style="border-bottom: 1px solid ${pdf.gray200}; ${index % 2 === 0 ? 'background-color: ${pdf.gray50};' : ''}">
                <td style="padding: 10px; color: ${pdf.gray700};">${vendor.name || 'N/A'}</td>
                <td style="padding: 10px; color: ${pdf.neutralGray};">${vendor.industry || 'N/A'}</td>
                <td style="padding: 10px; text-align: center; font-weight: 600; color: ${getRiskColor(vendor.risk_level)};">${vendor.risk_score || 0}</td>
                <td style="padding: 10px; text-align: center;">
                  <span style="background-color: ${getRiskColor(vendor.risk_level)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
                    ${vendor.risk_level || 'Medium'}
                  </span>
                </td>
                <td style="padding: 10px; text-align: center;">
                  <span style="background-color: ${getComplianceColor(vendor.compliance_status)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
                    ${vendor.compliance_status || 'Non-Compliant'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      ${vendors.length > 0 ? `
        <div style="margin-top: 30px; padding: 20px; background-color: ${pdf.blue50}; border-radius: 8px; border: 1px solid ${pdf.blue};">
          <h3 style="color: ${pdf.navy}; margin: 0 0 15px 0; font-size: 18px;">Summary Statistics</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div>
              <strong style="color: ${pdf.gray700};">Total Vendors:</strong> 
              <span style="color: ${pdf.neutralGray}; margin-left: 8px;">${vendors.length}</span>
            </div>
            <div>
              <strong style="color: ${pdf.gray700};">Average Risk Score:</strong> 
              <span style="color: ${pdf.neutralGray}; margin-left: 8px;">
                ${Math.round(vendors.reduce((sum, v) => sum + (v.risk_score || 0), 0) / vendors.length)}
              </span>
            </div>
            <div>
              <strong style="color: ${pdf.gray700};">High Risk Vendors:</strong> 
              <span style="color: ${pdf.riskCritical}; margin-left: 8px;">
                ${vendors.filter(v => ['high', 'critical'].includes(v.risk_level?.toLowerCase())).length}
              </span>
            </div>
            <div>
              <strong style="color: ${pdf.gray700};">Compliant Vendors:</strong> 
              <span style="color: ${pdf.riskLow}; margin-left: 8px;">
                ${vendors.filter(v => v.compliance_status?.toLowerCase() === 'compliant').length}
              </span>
            </div>
          </div>
        </div>
      ` : ''}
      
      <div style="margin-top: 30px; text-align: center; color: ${pdf.neutralGray}; font-size: 12px; border-top: 1px solid ${pdf.gray200}; padding-top: 20px;">
        <p style="margin: 0;">Generated by VendorSoluce Supply Chain Risk Management Platform</p>
        <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} VendorSoluce. All rights reserved.</p>
      </div>
    </div>
  `;

  await generatePdfFromHtml(htmlContent, filename);
};

/** TechnoSoluce VendorSoluce export shape (from TechnoSoluce ERMITS export) */
export interface TechnoSoluceVendorSoluceExport {
  vendorSBOMAnalysis: {
    componentCount: number;
    vulnerabilityCount: number;
    criticalVulnerabilities?: number;
    supplyChainRiskScore: number;
    complianceStatus?: boolean;
    abandonedPackages?: number;
    unverifiedSignatures?: number;
    attackVectors?: { hashMismatch?: number; dependencyConfusion?: number; typosquatting?: number };
    dependencyDepth?: number;
  };
  vendorData?: unknown;
  licenseRisk?: unknown;
  complianceMetrics?: unknown;
  integrationMetadata?: { source?: string; syncEndpoint?: string };
  timestamp?: string;
}

export function isTechnoSoluceVendorSoluceExport(obj: unknown): obj is TechnoSoluceVendorSoluceExport {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.vendorSBOMAnalysis === 'object' &&
    o.vendorSBOMAnalysis !== null &&
    'componentCount' in (o.vendorSBOMAnalysis as object) &&
    'supplyChainRiskScore' in (o.vendorSBOMAnalysis as object)
  );
}

/**
 * Map TechnoSoluce "Export for VendorSoluce" JSON to a vs_sbom_analyses insert row.
 * Use with useSBOMAnalyses().createAnalysis() for client-side import.
 */
export function mapTechnoSoluceExportToSBOMAnalysis(
  exportData: TechnoSoluceVendorSoluceExport,
  filename?: string
): Omit<import('../lib/database.types').Database['public']['Tables']['vs_sbom_analyses']['Insert'], 'user_id'> {
  const vb = exportData.vendorSBOMAnalysis;
  const name = filename || `TechnoSoluce export ${exportData.timestamp || new Date().toISOString().slice(0, 10)}`;
  return {
    filename: name,
    file_type: 'technosoluce-vendorsoluce',
    total_components: vb.componentCount ?? 0,
    total_vulnerabilities: vb.vulnerabilityCount ?? 0,
    risk_score: vb.supplyChainRiskScore ?? null,
    analysis_data: exportData as unknown as import('../lib/database.types').Json,
  };
}

/**
 * Import a TechnoSoluce "Export for VendorSoluce" JSON file into vs_sbom_analyses.
 * Returns ImportResult; use when importing via file upload.
 */
export const importTechnoSoluceVendorSoluceExport = async (
  fileContent: string,
  userId: string
): Promise<ImportResult> => {
  const result: ImportResult = {
    success: false,
    importedCount: 0,
    errors: [],
    skippedCount: 0,
  };
  try {
    const parsed = JSON.parse(fileContent) as unknown;
    if (!isTechnoSoluceVendorSoluceExport(parsed)) {
      result.errors.push('File is not a valid TechnoSoluce VendorSoluce export (missing vendorSBOMAnalysis).');
      return result;
    }
    const row = mapTechnoSoluceExportToSBOMAnalysis(parsed);
    const { error } = await supabase.from('vs_sbom_analyses').insert({
      ...row,
      user_id: userId,
    });
    if (error) {
      result.errors.push(error.message);
      return result;
    }
    result.importedCount = 1;
    result.success = true;
    return result;
  } catch (err) {
    result.errors.push(err instanceof Error ? err.message : 'Invalid JSON');
    return result;
  }
};

// SBOM Analysis Import/Export
export const importSBOMAnalyses = async (fileContent: string, format: 'json', userId: string): Promise<ImportResult> => {
  const result: ImportResult = {
    success: false,
    importedCount: 0,
    errors: [],
    skippedCount: 0
  };
  
  try {
    const parsed = JSON.parse(fileContent);
    const analyses = Array.isArray(parsed) ? parsed : [parsed];

    const validAnalyses = analyses.filter(analysis => {
      if (!analysis.filename) {
        result.errors.push(`Skipped analysis due to missing filename: ${JSON.stringify(analysis)}`);
        result.skippedCount++;
        return false;
      }
      return true;
    }).map(analysis => ({ ...analysis, user_id: userId }));

    if (validAnalyses.length > 0) {
      const { error } = await supabase.from('vs_sbom_analyses').insert(validAnalyses);
      if (error) {
        validAnalyses.forEach(analysis => {
          result.errors.push(`Error importing analysis "${analysis.filename}": ${error.message}`);
          result.skippedCount++;
        });
      } else {
        result.importedCount += validAnalyses.length;
      }
    }
    
    result.success = result.importedCount > 0;
    return result;
  } catch (err) {
    result.errors.push(`Parse error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return result;
  }
};

export const exportSBOMAnalyses = async (analyses: any[], options: ExportOptions): Promise<string> => {
  const exportData = analyses.map(analysis => ({
    'Filename': analysis.filename,
    'File Type': analysis.file_type,
    'Total Components': analysis.total_components || 0,
    'Total Vulnerabilities': analysis.total_vulnerabilities || 0,
    'Risk Score': analysis.risk_score || 0,
    'Created Date': options.dateFormat === 'local' 
      ? new Date(analysis.created_at).toLocaleDateString()
      : analysis.created_at,
    'Analysis Data': JSON.stringify(analysis.analysis_data || {})
  }));
  
  if (options.format === 'csv') {
    return generateCSV(exportData);
  } else if (options.format === 'json') {
    return JSON.stringify(analyses, null, 2);
  } else if (options.format === 'pdf') {
    const filename = `sbom_analyses_export_${new Date().toISOString().split('T')[0]}.pdf`;
    await exportSBOMAnalysesToPdf(analyses, options, filename);
    return filename;
  }
  
  throw new Error(`Unsupported export format: ${options.format}`);
};

const exportSBOMAnalysesToPdf = async (analyses: any[], options: ExportOptions, filename: string) => {
  const dateStr = options.dateFormat === 'local' 
    ? new Date().toLocaleDateString()
    : new Date().toISOString().split('T')[0];

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid ${pdf.navy}; padding-bottom: 20px;">
        <h1 style="color: ${pdf.navy}; margin: 0; font-size: 28px;">SBOM Analyses Export Report</h1>
        <p style="color: ${pdf.mutedText}; margin: 10px 0 0 0; font-size: 16px;">Generated: ${dateStr}</p>
        <p style="color: ${pdf.mutedText}; margin: 5px 0 0 0; font-size: 14px;">Total Analyses: ${analyses.length}</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <h2 style="color: ${pdf.teal}; margin-bottom: 20px; font-size: 22px;">SBOM Analysis Results</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: ${pdf.gray100}; border-bottom: 2px solid ${pdf.navy};">
              <th style="padding: 12px; text-align: left; color: ${pdf.gray700}; font-weight: 600;">Filename</th>
              <th style="padding: 12px; text-align: left; color: ${pdf.gray700}; font-weight: 600;">File Type</th>
              <th style="padding: 12px; text-align: center; color: ${pdf.gray700}; font-weight: 600;">Components</th>
              <th style="padding: 12px; text-align: center; color: ${pdf.gray700}; font-weight: 600;">Vulnerabilities</th>
              <th style="padding: 12px; text-align: center; color: ${pdf.gray700}; font-weight: 600;">Risk Score</th>
            </tr>
          </thead>
          <tbody>
            ${analyses.map((analysis, index) => {
              const riskScore = analysis.risk_score || 0;
              return `
                <tr style="border-bottom: 1px solid ${pdf.gray200}; ${index % 2 === 0 ? 'background-color: ${pdf.gray50};' : ''}">
                  <td style="padding: 10px; color: ${pdf.gray700};">${analysis.filename || 'N/A'}</td>
                  <td style="padding: 10px; color: ${pdf.neutralGray};">${analysis.file_type || 'N/A'}</td>
                  <td style="padding: 10px; text-align: center; color: ${pdf.gray700};">${analysis.total_components || 0}</td>
                  <td style="padding: 10px; text-align: center; color: ${riskScore >= 60 ? '${pdf.riskCritical}' : '${pdf.gray700}'}; font-weight: ${riskScore >= 60 ? '600' : 'normal'};">
                    ${analysis.total_vulnerabilities || 0}
                  </td>
                  <td style="padding: 10px; text-align: center;">
                    <span style="background-color: ${pdfScoreColor(riskScore)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
                      ${riskScore}%
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      ${analyses.length > 0 ? `
        <div style="margin-top: 30px; padding: 20px; background-color: ${pdf.blue50}; border-radius: 8px; border: 1px solid ${pdf.blue};">
          <h3 style="color: ${pdf.navy}; margin: 0 0 15px 0; font-size: 18px;">Summary Statistics</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div>
              <strong style="color: ${pdf.gray700};">Total Analyses:</strong> 
              <span style="color: ${pdf.neutralGray}; margin-left: 8px;">${analyses.length}</span>
            </div>
            <div>
              <strong style="color: ${pdf.gray700};">Total Components:</strong> 
              <span style="color: ${pdf.neutralGray}; margin-left: 8px;">
                ${analyses.reduce((sum, a) => sum + (a.total_components || 0), 0)}
              </span>
            </div>
            <div>
              <strong style="color: ${pdf.gray700};">Total Vulnerabilities:</strong> 
              <span style="color: ${pdf.riskCritical}; margin-left: 8px;">
                ${analyses.reduce((sum, a) => sum + (a.total_vulnerabilities || 0), 0)}
              </span>
            </div>
            <div>
              <strong style="color: ${pdf.gray700};">Average Risk Score:</strong> 
              <span style="color: ${pdf.neutralGray}; margin-left: 8px;">
                ${Math.round(analyses.reduce((sum, a) => sum + (a.risk_score || 0), 0) / analyses.length)}%
              </span>
            </div>
          </div>
        </div>
      ` : ''}
      
      <div style="margin-top: 30px; text-align: center; color: ${pdf.neutralGray}; font-size: 12px; border-top: 1px solid ${pdf.gray200}; padding-top: 20px;">
        <p style="margin: 0;">Generated by VendorSoluce Supply Chain Risk Management Platform</p>
        <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} VendorSoluce. All rights reserved.</p>
      </div>
    </div>
  `;

  await generatePdfFromHtml(htmlContent, filename);
};

// Assessment Import/Export
export const importAssessments = async (fileContent: string, format: 'json', userId: string): Promise<ImportResult> => {
  const result: ImportResult = {
    success: false,
    importedCount: 0,
    errors: [],
    skippedCount: 0
  };
  
  try {
    const parsed = JSON.parse(fileContent);
    const assessments = Array.isArray(parsed) ? parsed : [parsed];
    
    const validAssessments = assessments.filter(assessment => {
      if (!assessment.assessment_name) {
        result.errors.push(`Skipped assessment due to missing name: ${JSON.stringify(assessment)}`);
        result.skippedCount++;
        return false;
      }
      return true;
    }).map(assessment => ({ ...assessment, user_id: userId }));

    if (validAssessments.length > 0) {
      const { error } = await supabase.from('vs_supply_chain_assessments').insert(validAssessments);
      if (error) {
        validAssessments.forEach(assessment => {
          result.errors.push(`Error importing assessment "${assessment.assessment_name}": ${error.message}`);
          result.skippedCount++;
        });
      } else {
        result.importedCount += validAssessments.length;
      }
    }
    
    result.success = result.importedCount > 0;
    return result;
  } catch (err) {
    result.errors.push(`Parse error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return result;
  }
};

export const exportAssessments = async (assessments: any[], options: ExportOptions): Promise<string> => {
  if (options.format === 'json') {
    return JSON.stringify(assessments, null, 2);
  } else if (options.format === 'csv') {
    const exportData = assessments.map(assessment => ({
      'Assessment Name': assessment.assessment_name,
      'Overall Score': assessment.overall_score || 0,
      'Status': assessment.status,
      'Completed Date': assessment.completed_at 
        ? (options.dateFormat === 'local' 
          ? new Date(assessment.completed_at).toLocaleDateString()
          : assessment.completed_at)
        : 'Not completed',
      'Created Date': options.dateFormat === 'local' 
        ? new Date(assessment.created_at).toLocaleDateString()
        : assessment.created_at
    }));
    
    return generateCSV(exportData);
  } else if (options.format === 'pdf') {
    const filename = `assessments_export_${new Date().toISOString().split('T')[0]}.pdf`;
    await exportAssessmentsToPdf(assessments, options, filename);
    return filename;
  }
  
  throw new Error(`Unsupported export format: ${options.format}`);
};

const exportAssessmentsToPdf = async (assessments: any[], options: ExportOptions, filename: string) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return pdf.riskLow;
      case 'in-progress':
        return pdf.riskMedium;
      case 'pending':
        return pdf.neutralGray;
      default:
        return pdf.neutralGray;
    }
  };

  const dateStr = options.dateFormat === 'local' 
    ? new Date().toLocaleDateString()
    : new Date().toISOString().split('T')[0];

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid ${pdf.navy}; padding-bottom: 20px;">
        <h1 style="color: ${pdf.navy}; margin: 0; font-size: 28px;">Assessment Export Report</h1>
        <p style="color: ${pdf.mutedText}; margin: 10px 0 0 0; font-size: 16px;">Generated: ${dateStr}</p>
        <p style="color: ${pdf.mutedText}; margin: 5px 0 0 0; font-size: 14px;">Total Assessments: ${assessments.length}</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <h2 style="color: ${pdf.teal}; margin-bottom: 20px; font-size: 22px;">Assessment Results</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: ${pdf.gray100}; border-bottom: 2px solid ${pdf.navy};">
              <th style="padding: 12px; text-align: left; color: ${pdf.gray700}; font-weight: 600;">Assessment Name</th>
              <th style="padding: 12px; text-align: center; color: ${pdf.gray700}; font-weight: 600;">Score</th>
              <th style="padding: 12px; text-align: center; color: ${pdf.gray700}; font-weight: 600;">Status</th>
              <th style="padding: 12px; text-align: center; color: ${pdf.gray700}; font-weight: 600;">Completed Date</th>
            </tr>
          </thead>
          <tbody>
            ${assessments.map((assessment, index) => {
              const score = assessment.overall_score || 0;
              const completedDate = assessment.completed_at 
                ? (options.dateFormat === 'local' 
                  ? new Date(assessment.completed_at).toLocaleDateString()
                  : new Date(assessment.completed_at).toISOString().split('T')[0])
                : 'Not completed';
              return `
                <tr style="border-bottom: 1px solid ${pdf.gray200}; ${index % 2 === 0 ? 'background-color: ${pdf.gray50};' : ''}">
                  <td style="padding: 10px; color: ${pdf.gray700};">${assessment.assessment_name || 'N/A'}</td>
                  <td style="padding: 10px; text-align: center;">
                    <span style="background-color: ${pdfScoreColor(score)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
                      ${score}%
                    </span>
                  </td>
                  <td style="padding: 10px; text-align: center;">
                    <span style="background-color: ${getStatusColor(assessment.status)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
                      ${assessment.status || 'Pending'}
                    </span>
                  </td>
                  <td style="padding: 10px; text-align: center; color: ${pdf.neutralGray}; font-size: 12px;">${completedDate}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      ${assessments.length > 0 ? `
        <div style="margin-top: 30px; padding: 20px; background-color: ${pdf.blue50}; border-radius: 8px; border: 1px solid ${pdf.blue};">
          <h3 style="color: ${pdf.navy}; margin: 0 0 15px 0; font-size: 18px;">Summary Statistics</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div>
              <strong style="color: ${pdf.gray700};">Total Assessments:</strong> 
              <span style="color: ${pdf.neutralGray}; margin-left: 8px;">${assessments.length}</span>
            </div>
            <div>
              <strong style="color: ${pdf.gray700};">Average Score:</strong> 
              <span style="color: ${pdf.neutralGray}; margin-left: 8px;">
                ${Math.round(assessments.reduce((sum, a) => sum + (a.overall_score || 0), 0) / assessments.length)}%
              </span>
            </div>
            <div>
              <strong style="color: ${pdf.gray700};">Completed:</strong> 
              <span style="color: ${pdf.riskLow}; margin-left: 8px;">
                ${assessments.filter(a => a.status?.toLowerCase() === 'completed').length}
              </span>
            </div>
            <div>
              <strong style="color: ${pdf.gray700};">In Progress:</strong> 
              <span style="color: ${pdf.riskMedium}; margin-left: 8px;">
                ${assessments.filter(a => a.status?.toLowerCase() === 'in-progress').length}
              </span>
            </div>
          </div>
        </div>
      ` : ''}
      
      <div style="margin-top: 30px; text-align: center; color: ${pdf.neutralGray}; font-size: 12px; border-top: 1px solid ${pdf.gray200}; padding-top: 20px;">
        <p style="margin: 0;">Generated by VendorSoluce Supply Chain Risk Management Platform</p>
        <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} VendorSoluce. All rights reserved.</p>
      </div>
    </div>
  `;

  await generatePdfFromHtml(htmlContent, filename);
};

// File handling utilities
export const downloadFile = (content: string, filename: string, contentType: string = 'text/plain') => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Generate sample data templates
export const generateVendorTemplate = (): string => {
  const sampleData = [
    {
      'Vendor Name': 'Example Tech Corp',
      'Industry': 'Technology',
      'Website': 'https://example-tech.com',
      'Contact Email': 'security@example-tech.com',
      'Risk Score': '75',
      'Risk Level': 'Medium',
      'Compliance Status': 'Partial',
      'Notes': 'Pending security assessment completion'
    },
    {
      'Vendor Name': 'Secure Cloud Solutions',
      'Industry': 'Cloud Services',
      'Website': 'https://secure-cloud.com',
      'Contact Email': 'compliance@secure-cloud.com',
      'Risk Score': '85',
      'Risk Level': 'Low',
      'Compliance Status': 'Compliant',
      'Notes': 'SOC 2 Type II certified'
    }
  ];
  
  return generateCSV(sampleData);
};

export const generateAssessmentTemplate = (): string => {
  const sampleData = {
    assessment_name: 'Q1 2025 Supply Chain Assessment',
    overall_score: 75,
    section_scores: [
      { title: 'Supplier Risk Management', percentage: 80, completed: true },
      { title: 'Supply Chain Threat Management', percentage: 70, completed: true }
    ],
    answers: {
      'SR-1': 'yes',
      'SR-2': 'partial',
      'TM-1': 'yes'
    },
    status: 'completed'
  };
  
  return JSON.stringify(sampleData, null, 2);
};