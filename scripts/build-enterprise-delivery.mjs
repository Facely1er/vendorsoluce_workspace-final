#!/usr/bin/env node
/**
 * Build the VendorSoluce Enterprise (downloadable) package and zip it for distribution.
 * Produces a license-key build (no Stripe) suitable for air-gapped or self-hosted deployment.
 *
 * Usage: node scripts/build-enterprise-delivery.mjs [version]
 * Example: node scripts/build-enterprise-delivery.mjs 1.0.0
 *
 * Output: release/VendorSoluce-Enterprise-v{version}.zip
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const appDir = path.join(root, 'packages', 'app');
const distDir = path.join(appDir, 'dist-enterprise');
const stagingDir = path.join(root, '_enterprise_staging');
const releaseDir = path.join(root, 'release');

const packageJson = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8')
);
const version = process.argv[2] || packageJson.version || '1.0.0';
const zipName = `VendorSoluce-Enterprise-v${version}.zip`;
const zipPath = path.join(releaseDir, zipName);

const README_CONTENT = `VendorSoluce Enterprise – Client Delivery
============================================

This package contains the VendorSoluce platform and VendorSoluce Portal for
vendor assurance and due diligence. No Stripe—license key activation.
Deploy in your own environment for air-gapped or self-hosted use.

QUICK START
-----------

1. Extract this ZIP to a folder on your computer or web server.
2. Serve the contents via a web server. For local testing:

   npx serve . -l 3000

   Then open http://localhost:3000

3. Navigate to the License / Billing page to activate with your license key.
   Tier entitlements are unlocked via the license key—no VendorSoluce-hosted
   database required.

DEPLOYMENT
----------

- Deploy the extracted folder to any static host (nginx, Apache, S3, etc.)
- Or run behind your corporate proxy/firewall for air-gapped use
- Ensure your license key is provided to users for activation

FEATURES
-------

✓ Vendor risk assessments and supply chain assurance
✓ SBOM analysis and NIST SP 800-161 compliance
✓ Vendor Risk Radar and dashboard
✓ VendorSoluce Portal for vendor self-assessment
✓ License-key activation (no Stripe/payment in build)

Version: ${version}
Generated: ${new Date().toISOString().slice(0, 10)}

Support: https://www.vendorsoluce.com
`;

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: 'inherit', cwd: root, ...opts });
}

function main() {
  console.log('\n=== VendorSoluce Enterprise Delivery Build ===\n');
  console.log('Version:', version);
  console.log('Output:', zipPath, '\n');

  // 1) Build enterprise app
  console.log('Building enterprise app...');
  try {
    run('npm run build:enterprise -w app');
  } catch (e) {
    console.error('Enterprise build failed:', e.message);
    process.exit(1);
  }

  if (!fs.existsSync(distDir)) {
    console.error('Expected dist-enterprise/ after build. Build may have failed.');
    process.exit(1);
  }

  // 2) Create staging directory and copy files
  if (fs.existsSync(stagingDir)) {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
  fs.mkdirSync(stagingDir, { recursive: true });

  console.log('Copying built files...');
  copyRecursive(distDir, stagingDir);

  // 3) Write README
  fs.writeFileSync(path.join(stagingDir, 'README.txt'), README_CONTENT);

  // 4) Create release dir and zip
  if (!fs.existsSync(releaseDir)) {
    fs.mkdirSync(releaseDir, { recursive: true });
  }

  console.log('Creating zip...');
  const isWin = process.platform === 'win32';
  if (isWin) {
    const relStaging = path.relative(root, stagingDir).replace(/\\/g, '/');
    const relZip = path.relative(root, zipPath).replace(/\\/g, '/');
    run(
      `powershell -NoProfile -Command "Compress-Archive -Path '${relStaging}/*' -DestinationPath '${relZip}' -Force"`,
      { cwd: root }
    );
  } else {
    execSync(`cd "${stagingDir}" && zip -rq "${zipPath}" .`, {
      stdio: 'inherit',
      shell: true,
    });
  }

  // 5) Cleanup staging
  fs.rmSync(stagingDir, { recursive: true, force: true });

  console.log('\nDone. Output:', zipPath);
  console.log('');
}

function copyRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const srcPath = path.join(src, e.name);
    const destPath = path.join(dest, e.name);
    if (e.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

main();
