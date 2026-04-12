import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', '..', '..');
const routesPath = path.join(root, 'packages', 'shared', 'routes.json');
const outPath = path.join(root, 'packages', 'website', 'assets', 'js', 'generated', 'route-manifest.js');

const routes = JSON.parse(fs.readFileSync(routesPath, 'utf8'));
const lines = [
  '/** Generated from packages/shared/routes.json. Do not edit by hand. */',
  'window.VENDORSOLUCE_ROUTE_MANIFEST = ' + JSON.stringify(routes, null, 2) + ';',
  ''
];
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, lines.join('\n'));
console.log('Generated route manifest:', outPath);
