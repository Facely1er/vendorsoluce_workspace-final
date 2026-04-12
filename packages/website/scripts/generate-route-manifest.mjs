import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
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
