/**
 * Asserts the report template in vendor-threat-radar.html contains all expected
 * section headings and structure. Run without a browser.
 *
 * Usage: node radar/verify-report-template.js
 * From: packages/website
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'vendor-threat-radar.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const expectedInReportTemplate = [
  // Cover & meta
  { name: 'Cover page title', substring: 'Vendor Portfolio Inherent Risk' },
  { name: 'Report ID in template', substring: 'reportId' },
  { name: 'Cover risk summary', substring: 'cover-risk-summary' },
  // TOC
  { name: 'TOC Executive Summary', substring: 'Section 1  -  Executive Summary' },
  { name: 'TOC Portfolio Risk Posture', substring: 'Section 1b  -  Portfolio Risk Posture' },
  { name: 'TOC Vendor Risk Register', substring: 'Section 2  -  Vendor Risk Register' },
  { name: 'TOC Dependency & Cascade', substring: 'Section 5b  -  Dependency' },
  { name: 'TOC Appendix', substring: 'Appendix  -  Methodology' },
  // Executive Summary
  { name: 'Executive Summary section', substring: 'Section 1  -  Executive Summary' },
  { name: 'Purpose & Scope', substring: 'Purpose &amp; Scope' },
  { name: 'Portfolio Risk Overview', substring: 'Portfolio Risk Overview' },
  { name: 'Risk Distribution Breakdown', substring: 'Risk Distribution Breakdown' },
  // Portfolio Risk Posture (Section 1b)
  { name: 'Section 1b header', substring: 'Section 1b  -  Portfolio Risk Posture' },
  { name: 'Posture: Vendor Risk Distribution', substring: '1. Vendor Risk Distribution' },
  { name: 'Posture: Dependency Concentration', substring: '2. Dependency Concentration' },
  { name: 'Posture: Operational Exposure', substring: '3. Operational Exposure' },
  { name: 'Posture: Data Exposure Overview', substring: '4. Data Exposure Overview' },
  { name: 'Posture: Supply Chain Visibility', substring: '5. Supply Chain Visibility' },
  { name: 'Posture: Posture Statement', substring: '6. Portfolio Risk Posture Statement' },
  { name: 'Posture neutral language', substring: 'may influence' },
  { name: 'Posture no control effectiveness', substring: 'does not assess control effectiveness' },
  // Vendor register
  { name: 'Section 2 Vendor Risk Register', substring: 'Section 2  -  Vendor Risk Register' },
  { name: 'Vendor table Source column', substring: 'Source</th>' },
  { name: 'Vendor table Inherent', substring: 'Inherent</th>' },
  { name: 'Vendor table Residual', substring: 'Residual</th>' },
  // Dependency & Cascade
  { name: 'Section 5b Dependency Cascade', substring: 'Section 5b  -  Dependency' },
  { name: 'Dependency KPIs', substring: 'with mapped dependencies' },
  { name: 'Shared dependency hotspots', substring: 'Shared dependency' },
  // Recommendations
  { name: 'Section 5 Recommended Actions', substring: 'Section 5  -  Recommended' },
  // Appendix
  { name: 'Appendix Methodology', substring: 'Appendix  -  Methodology' },
  { name: 'Inherent risk methodology', substring: 'Inherent Risk Methodology' },
  { name: 'Inherent vs residual glossary', substring: 'Inherent risk:</strong>' },
  { name: 'NIST alignment', substring: 'NIST SP 800-161' },
  // Footer
  { name: 'Report footer', substring: 'report-footer' },
  { name: 'Report ID in footer', substring: 'Report ID:' }
];

let failed = 0;
for (const { name, substring } of expectedInReportTemplate) {
  if (!html.includes(substring)) {
    console.error('Missing:', name, '(expected substring:', JSON.stringify(substring), ')');
    failed++;
  }
}

if (failed > 0) {
  console.error('\nReport template verification failed:', failed, 'missing item(s).');
  process.exit(1);
}

console.log('OK: Report template contains all', expectedInReportTemplate.length, 'expected section headings and structure.');
process.exit(0);
