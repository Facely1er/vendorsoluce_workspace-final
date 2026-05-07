import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(__dirname, 'vendor-threat-radar.html'), 'utf8');

const checks = [];
function ok(cond, msg) {
  checks.push({ pass: !!cond, msg });
}

// Required DOM elements
ok(html.includes('name="radarMode"') && (html.match(/name="radarMode"/g) || []).length >= 3, 'radarMode radios (3)');
ok(html.includes('id="radarModeBaseline"') && html.includes('id="radarModeReal"') && html.includes('id="radarModeHybrid"'), 'mode radio IDs');
ok(html.includes('id="csvImport"') && html.includes('type="file"'), 'csvImport file input');
ok(html.includes('id="csvTemplateLink"'), 'csvTemplateLink present');
ok(html.includes('class="mode-fieldset"'), 'mode-fieldset');
ok(html.includes('initRadarModeSelector()'), 'initRadarModeSelector called on load');
ok(html.includes('radar-first-run.js'), 'radar-first-run.js included before runtime');
ok(html.includes('radar-interactions.js'), 'radar-interactions.js included before runtime');
ok(html.includes('window.openAddVendor = openAddVendor'), 'openAddVendor exposed');
ok(html.includes('window.downloadVendorCsvTemplate = downloadVendorCsvTemplate'), 'downloadVendorCsvTemplate exposed');
ok(html.includes('window.importVendors = importVendors'), 'importVendors exposed');
ok(!html.includes('<label for="csvImport">'), 'No invalid label wrapping Import CSV button');
ok(html.includes('csv-format-details'), 'CSV spreadsheet help section present');
ok(html.includes('pointer-events: auto'), 'pointer-events auto in styles');
ok(html.includes('csv-file-input-hidden'), 'Hidden file input class');

const failed = checks.filter(c => !c.pass);
checks.forEach(c => console.log((c.pass ? 'PASS' : 'FAIL') + ': ' + c.msg));
if (failed.length) {
  console.log('\n' + failed.length + ' check(s) failed.');
  process.exit(1);
}
console.log('\nAll ' + checks.length + ' checks passed.');
