#!/usr/bin/env node
/**
 * Regenerate SBOM Analysis JSON
 * 
 * Analyzes SBOM files and generates comprehensive analysis JSON with:
 * - NTIA compliance checks
 * - Deterministic risk scoring
 * - Dependency graphs
 * - Vulnerability summaries
 * - Document provenance
 * - Data quality issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the SBOM analyzer utilities
// Since we're in Node.js, we'll need to reimplement the core logic
// or use a different approach

/**
 * NTIA Compliance Validator
 */
function validateNTIACompliance(document, hasDependencyGraph) {
  const checks = {
    hasDependencyGraph,
    hasAuthorOrOriginator: !!(document.authors && document.authors.length > 0) ||
                           !!(document.generators && document.generators.length > 0),
    hasSbomTimestamp: !!document.created,
    hasSpecVersion: !!document.specVersion,
    hasSerialNumberOrDocumentNamespace: !!(document.serialNumber || document.documentNamespace)
  };

  const failedChecks = Object.entries(checks)
    .filter(([_, passed]) => !passed)
    .map(([check]) => check);

  const compliant = failedChecks.length === 0;
  const passedCount = Object.values(checks).filter(Boolean).length;
  const score = Math.round((passedCount / Object.keys(checks).length) * 100);

  return {
    compliant,
    checks,
    failedChecks,
    score
  };
}

/**
 * Calculate deterministic risk score
 */
function calculateRiskScore(vulnerabilities, component, policyFlags = {}) {
  let score = 100;

  // CVE presence - use max CVSS score
  if (vulnerabilities.length > 0) {
    const maxCVSS = Math.max(
      ...vulnerabilities.map(v => v.cvssMax || v.cvssV3Score || v.cvssV2Score || 0)
    );
    
    if (maxCVSS >= 9.0) {
      score -= 50;
    } else if (maxCVSS >= 7.0) {
      score -= 40;
    } else if (maxCVSS >= 5.0) {
      score -= 30;
    } else if (maxCVSS >= 3.0) {
      score -= 20;
    } else if (maxCVSS > 0) {
      score -= 10;
    }
  }

  // KEV flag
  const hasKEV = vulnerabilities.some(v => v.kev === true);
  if (hasKEV) {
    score -= 30;
  }

  // EPSS
  const maxEPSS = Math.max(...vulnerabilities.map(v => v.epss || 0));
  if (maxEPSS > 0.5) {
    score -= 20;
  } else if (maxEPSS > 0.2) {
    score -= 10;
  }

  // Package age
  if (component.releaseDate) {
    const releaseDate = new Date(component.releaseDate);
    const ageInMonths = (Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (ageInMonths > 60) {
      score -= 15;
    } else if (ageInMonths > 36) {
      score -= 10;
    } else if (ageInMonths > 24) {
      score -= 5;
    }
  }

  // Policy/license flags
  if (policyFlags.licenseApproved === false) {
    score -= 10;
  }
  if (policyFlags.maintainerActive === false) {
    score -= 5;
  }

  if (vulnerabilities.length === 0 && !hasKEV && maxEPSS === 0) {
    return Math.max(80, score);
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Summarize vulnerabilities
 */
function summarizeVulnerabilities(vulnerabilities) {
  const summary = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    unknown: 0,
    total: vulnerabilities.length
  };

  vulnerabilities.forEach(v => {
    switch (v.severity) {
      case 'CRITICAL':
        summary.critical++;
        break;
      case 'HIGH':
        summary.high++;
        break;
      case 'MEDIUM':
        summary.medium++;
        break;
      case 'LOW':
        summary.low++;
        break;
      case 'UNKNOWN':
        summary.unknown++;
        break;
    }
  });

  return summary;
}

/**
 * Extract hashes from component
 */
function extractHashes(component) {
  const hashes = [];
  
  if (component.hashes && Array.isArray(component.hashes)) {
    component.hashes.forEach((hash) => {
      hashes.push({
        algorithm: hash.alg || hash.algorithm || 'UNKNOWN',
        content: hash.content || hash.value || ''
      });
    });
  }

  return hashes.sort((a, b) => {
    if (a.algorithm === 'SHA-256') return -1;
    if (b.algorithm === 'SHA-256') return 1;
    return 0;
  });
}

/**
 * Parse CycloneDX SBOM
 */
function parseCycloneDX(data, sourceFile) {
  const document = {
    bomFormat: 'CycloneDX',
    specVersion: data.specVersion || data.version || 'Unknown',
    serialNumber: data.serialNumber,
    created: data.metadata?.timestamp || data.metadata?.created,
    authors: data.metadata?.authors || [],
    generators: data.metadata?.tools?.components || [],
    sourceFile
  };

  const components = [];
  const dependencyEdges = [];

  if (data.components && Array.isArray(data.components)) {
    data.components.forEach((comp, index) => {
      const componentId = comp['bom-ref'] || `component-${index}`;
      const hashes = extractHashes(comp);
      
      const component = {
        id: componentId,
        name: comp.name || 'Unknown',
        version: comp.version || 'Unknown',
        type: comp.type || 'library',
        ecosystem: getEcosystemFromPurl(comp.purl) || 'npm',
        license: extractLicense(comp),
        purl: comp.purl,
        hashes: hashes.length > 0 ? hashes : undefined,
        supplier: comp.supplier?.name,
        description: comp.description,
        releaseDate: comp.releaseDate || comp.published,
        maintainer: comp.publisher || comp.maintainer?.name
      };

      components.push(component);
    });
  }

  // Parse dependency graph
  if (data.dependencies && Array.isArray(data.dependencies)) {
    data.dependencies.forEach((dep) => {
      const fromRef = dep.ref || dep['bom-ref'];
      if (dep.dependsOn && Array.isArray(dep.dependsOn)) {
        dep.dependsOn.forEach((toRef) => {
          dependencyEdges.push({
            from: fromRef,
            to: toRef,
            type: 'dependsOn'
          });
        });
      }
    });
  }

  // If no explicit dependencies, create edges from root
  if (dependencyEdges.length === 0 && components.length > 0) {
    const rootComponent = components.find(c => c.type === 'application') || components[0];
    if (rootComponent) {
      components.forEach(comp => {
        if (comp.id !== rootComponent.id) {
          dependencyEdges.push({
            from: rootComponent.id,
            to: comp.id,
            type: 'dependency'
          });
        }
      });
    }
  }

  return { document, components, dependencyEdges };
}

/**
 * Parse SPDX SBOM
 */
function parseSPDX(data, sourceFile) {
  const document = {
    bomFormat: 'SPDX',
    specVersion: data.spdxVersion || 'Unknown',
    documentNamespace: data.documentNamespace,
    created: data.creationInfo?.created,
    authors: (data.creationInfo?.creators || []).map((c) => {
      const match = c.match(/^(.+?)\s*<(.+)>$/);
      return match ? { name: match[1], email: match[2] } : { name: c };
    }),
    generators: (data.creationInfo?.creators || []).filter((c) => 
      c.toLowerCase().includes('tool') || c.toLowerCase().includes('generator')
    ).map((c) => ({ name: c })),
    sourceFile
  };

  const components = [];
  const dependencyEdges = [];

  if (data.packages && Array.isArray(data.packages)) {
    data.packages.forEach((pkg, index) => {
      const packageId = pkg.SPDXID || `package-${index}`;
      
      const hashes = [];
      if (pkg.checksums && Array.isArray(pkg.checksums)) {
        pkg.checksums.forEach((checksum) => {
          hashes.push({
            algorithm: checksum.algorithm || 'UNKNOWN',
            content: checksum.checksumValue || ''
          });
        });
      }

      let purl;
      if (pkg.externalRefs && Array.isArray(pkg.externalRefs)) {
        const purlRef = pkg.externalRefs.find((ref) => 
          ref.referenceType === 'purl' || ref.referenceCategory === 'PACKAGE-MANAGER'
        );
        if (purlRef) {
          purl = purlRef.referenceLocator;
        }
      }

      const component = {
        id: packageId,
        name: pkg.name || 'Unknown',
        version: pkg.versionInfo || 'Unknown',
        type: 'package',
        ecosystem: getEcosystemFromPurl(purl) || 'npm',
        license: pkg.licenseConcluded || pkg.licenseDeclared || 'Unknown',
        purl,
        hashes: hashes.length > 0 ? hashes : undefined,
        supplier: pkg.supplier || pkg.originator,
        description: pkg.description,
        releaseDate: pkg.releaseDate
      };

      components.push(component);
    });
  }

  // Parse relationships
  if (data.relationships && Array.isArray(data.relationships)) {
    data.relationships.forEach((rel) => {
      const relationshipType = rel.relationshipType || '';
      
      if (relationshipType.includes('DEPENDS_ON') || 
          relationshipType.includes('DEPENDENCY_OF') ||
          relationshipType.includes('CONTAINS')) {
        dependencyEdges.push({
          from: rel.spdxElementId,
          to: rel.relatedSpdxElement,
          type: relationshipType
        });
      }
    });
  }

  return { document, components, dependencyEdges };
}

function getEcosystemFromPurl(purl) {
  if (!purl) return undefined;
  const match = purl.match(/^pkg:([^/]+)/);
  return match ? match[1] : undefined;
}

function extractLicense(component) {
  if (!component.licenses) return 'Unknown';
  if (Array.isArray(component.licenses)) {
    const licenseIds = component.licenses
      .map((l) => l.license?.id || l.license?.name || l.id || l.name)
      .filter(Boolean);
    return licenseIds.length > 0 ? licenseIds.join(', ') : 'Unknown';
  }
  if (typeof component.licenses === 'string') {
    return component.licenses;
  }
  return 'Unknown';
}

/**
 * Analyze SBOM file
 */
async function analyzeSBOMFile(filePath) {
  console.log(`Analyzing ${filePath}...`);
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  const basename = path.basename(filePath, path.extname(filePath));
  const dirname = path.dirname(filePath);

  let parsed;
  if (data.bomFormat === 'CycloneDX' || data.components) {
    parsed = parseCycloneDX(data, filePath);
  } else if (data.spdxVersion || data.packages) {
    parsed = parseSPDX(data, filePath);
  } else {
    throw new Error('Unsupported SBOM format');
  }

  const { document, components, dependencyEdges } = parsed;

  // For this script, we'll create mock vulnerabilities since we don't have OSV API access
  // In production, this would call the OSV API
  const analyzedComponents = components.map((comp) => {
    // Mock vulnerabilities (in real implementation, this would query OSV API)
    const vulnerabilities = [];
    
    const riskScore = calculateRiskScore(vulnerabilities, comp);
    
    const dataQuality = {};
    if (!comp.purl) dataQuality.missingPurl = true;
    if (!comp.hashes || comp.hashes.length === 0) dataQuality.missingHashes = true;
    if (!comp.supplier) dataQuality.missingSupplier = true;

    return {
      component: comp,
      vulnerabilities,
      riskScore,
      dataQuality: Object.keys(dataQuality).length > 0 ? dataQuality : undefined
    };
  });

  // NTIA compliance
  const ntiaCompliance = validateNTIACompliance(document, dependencyEdges.length > 0);

  // Vulnerability summary
  const allVulnerabilities = analyzedComponents.flatMap(c => c.vulnerabilities);
  const vulnerabilitySummary = summarizeVulnerabilities(allVulnerabilities);

  // Data quality issues
  const dataQuality = {
    issues: []
  };
  components.forEach(comp => {
    if (!comp.purl) {
      dataQuality.issues.push({
        componentId: comp.id,
        field: 'purl',
        issue: 'Missing package URL (purl) identifier'
      });
    }
    if (!comp.hashes || comp.hashes.length === 0) {
      dataQuality.issues.push({
        componentId: comp.id,
        field: 'hashes',
        issue: 'Missing component hashes (prefer SHA-256)'
      });
    }
    if (!comp.supplier) {
      dataQuality.issues.push({
        componentId: comp.id,
        field: 'supplier',
        issue: 'Missing supplier information'
      });
    }
  });

  // Overall risk score
  const overallRiskScore = analyzedComponents.length > 0
    ? Math.round(analyzedComponents.reduce((sum, c) => sum + c.riskScore, 0) / analyzedComponents.length)
    : 100;

  const analysisResult = {
    document,
    components: analyzedComponents,
    dependencyEdges,
    vulnerabilitySummary,
    ntiaCompliance,
    dataQuality,
    overallRiskScore,
    analyzedAt: new Date().toISOString()
  };

  // Save analysis result
  const outputPath = path.join(dirname, `sbom-analysis-${basename}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(analysisResult, null, 2));
  console.log(`✓ Saved analysis to ${outputPath}`);

  return analysisResult;
}

/**
 * Main execution
 */
async function main() {
  const testFiles = [
    '/mnt/data/cyclonedx-1.5-large-mixed.json',
    '/mnt/data/spdx-2.3-sample.json',
    '/mnt/data/test-sbom.json'
  ];

  // Also check workspace for test files
  const workspaceFiles = [
    path.join(__dirname, '../public/templates/sbom/cyclonedx-sbom-template.json'),
    path.join(__dirname, '../public/templates/sbom/spdx-sbom-template.json')
  ];

  const filesToProcess = [];

  // Check each file
  for (const file of [...testFiles, ...workspaceFiles]) {
    if (fs.existsSync(file)) {
      filesToProcess.push(file);
    } else {
      console.log(`⚠ File not found: ${file}`);
    }
  }

  if (filesToProcess.length === 0) {
    console.log('No SBOM files found to analyze.');
    console.log('Expected files:');
    testFiles.forEach(f => console.log(`  - ${f}`));
    return;
  }

  console.log(`Found ${filesToProcess.length} file(s) to analyze\n`);

  for (const file of filesToProcess) {
    try {
      await analyzeSBOMFile(file);
    } catch (error) {
      console.error(`✗ Error analyzing ${file}:`, error.message);
    }
  }

  console.log('\n✓ Analysis complete!');
}

main().catch(console.error);
