#!/usr/bin/env node

/**
 * Script to copy demo HTML files to dist-demo directory
 * This prepares the static HTML demo for deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const demoSourceDir = path.join(rootDir, 'demo');
const demoOutputDir = path.join(rootDir, 'dist-demo');

// Ensure output directory exists
if (!fs.existsSync(demoOutputDir)) {
  fs.mkdirSync(demoOutputDir, { recursive: true });
}

// Copy function
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    files.forEach(file => {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      copyRecursive(srcPath, destPath);
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy demo folder to dist-demo
console.log('📦 Copying demo files to dist-demo...');
try {
  copyRecursive(demoSourceDir, demoOutputDir);
  console.log('✅ Demo files copied successfully!');
  console.log(`📁 Output directory: ${demoOutputDir}`);
} catch (error) {
  console.error('❌ Error copying demo files:', error);
  process.exit(1);
}

