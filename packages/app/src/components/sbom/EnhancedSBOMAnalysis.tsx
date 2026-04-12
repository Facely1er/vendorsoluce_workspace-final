import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import RiskBadge from '../ui/RiskBadge';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  FileJson,
  Settings,
  Search,
  Download,
  ExternalLink,
  Clock,
  Zap
} from 'lucide-react';
import type { NTIACompliance } from '../../utils/sbomAnalyzer';

interface PolicyRule {
  id: string;
  name: string;
  type: 'license' | 'vulnerability' | 'version' | 'security';
  description: string;
  condition: string;
  action: 'block' | 'warn' | 'allow';
  isActive: boolean;
}

interface VulnerabilityData {
  cve: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  score?: number;
  cvssMax?: number;
  cvssV3Score?: number;
  cvssV2Score?: number;
  summary?: string;
  description?: string;
  publishedDate?: string;
  references?: string[];
}

interface EnhancedComponent {
  id: string;
  name: string;
  version: string;
  license: string;
  vulnerabilities: VulnerabilityData[];
  riskScore: number;
  policyViolations: PolicyRule[];
  supplier?: string;
  purl?: string;
  releaseDate?: string;
}

interface EnhancedSBOMAnalysisProps {
  components: Array<Record<string, unknown>>;
  ntiaCompliance?: NTIACompliance;
  onPolicyUpdate?: (policies: PolicyRule[]) => void;
}

const APPROVED_LICENSES = new Set(['MIT', 'Apache-2.0', 'BSD-3-Clause', 'BSD-2-Clause', 'ISC', 'CC0-1.0']);

function evaluatePolicyViolations(
  comp: EnhancedComponent,
  activePolicies: PolicyRule[]
): PolicyRule[] {
  const violations: PolicyRule[] = [];

  for (const policy of activePolicies) {
    if (!policy.isActive) continue;

    if (policy.type === 'vulnerability') {
      const hasCritical = comp.vulnerabilities.some(
        v => v.severity?.toString().toUpperCase() === 'CRITICAL'
      );
      if (hasCritical) violations.push(policy);
    }

    if (policy.type === 'license') {
      const licId = comp.license?.split(',')[0]?.trim();
      if (licId && licId !== 'Unknown' && !APPROVED_LICENSES.has(licId)) {
        violations.push(policy);
      }
    }

    if (policy.type === 'version' && comp.releaseDate) {
      const ageMonths =
        (Date.now() - new Date(comp.releaseDate).getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (ageMonths > 24) violations.push(policy);
    }
  }

  return violations;
}

const EnhancedSBOMAnalysis: React.FC<EnhancedSBOMAnalysisProps> = ({ 
  components = [],
  ntiaCompliance,
  onPolicyUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'vulnerabilities' | 'compliance'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  
  const [policies, setPolicies] = useState<PolicyRule[]>([
    {
      id: 'policy-1',
      name: 'No Critical Vulnerabilities',
      type: 'vulnerability',
      description: 'Block components with critical vulnerabilities (CVSS >= 9.0)',
      condition: 'vulnerability.severity === "critical"',
      action: 'block',
      isActive: true
    },
    {
      id: 'policy-2',
      name: 'Approved Licenses Only',
      type: 'license',
      description: 'Only allow MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, and CC0-1.0 licenses',
      condition: 'license in ["MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC", "CC0-1.0"]',
      action: 'block',
      isActive: true
    },
    {
      id: 'policy-3',
      name: 'Recent Version Requirement',
      type: 'version',
      description: 'Warn about components older than 2 years',
      condition: 'component.age > 24 months',
      action: 'warn',
      isActive: false
    },
    {
      id: 'policy-4',
      name: 'Missing Supplier Info',
      type: 'security',
      description: 'Warn about components with no supplier information',
      condition: 'component.supplier === undefined',
      action: 'warn',
      isActive: true
    }
  ]);

  // Map raw component data to typed EnhancedComponent, using only real data
  const enhancedComponents: EnhancedComponent[] = components.map((comp, index) => {
    const rawVulns = (comp.vulnerabilities as VulnerabilityData[] | undefined) || [];
    const base: EnhancedComponent = {
      id: (comp.id as string) || `component-${index}`,
      name: (comp.name as string) || 'Unknown',
      version: (comp.version as string) || 'Unknown',
      license: (comp.license as string) || 'Unknown',
      riskScore: (comp.riskScore as number) ?? 100,
      supplier: comp.supplier as string | undefined,
      purl: comp.purl as string | undefined,
      releaseDate: (comp.releaseDate as string | undefined),
      vulnerabilities: rawVulns,
      policyViolations: []
    };
    base.policyViolations = evaluatePolicyViolations(base, policies);
    return base;
  });

  const getRiskLevel = (score: number): 'Low' | 'Medium' | 'High' | 'Critical' => {
    if (score >= 80) return 'Low';
    if (score >= 60) return 'Medium';
    if (score >= 40) return 'High';
    return 'Critical';
  };

  const normalizeSeverity = (sev: string): string => sev?.toString().toLowerCase() || 'unknown';

  const getSeverityColor = (severity: string) => {
    switch (normalizeSeverity(severity)) {
      case 'critical': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getVulnScore = (vuln: VulnerabilityData): number =>
    vuln.score ?? vuln.cvssMax ?? vuln.cvssV3Score ?? vuln.cvssV2Score ?? 0;

  const getVulnDescription = (vuln: VulnerabilityData): string =>
    vuln.description ?? vuln.summary ?? 'No description available';

  const filteredComponents = enhancedComponents.filter(comp => {
    const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverity === 'all' || 
      comp.vulnerabilities.some(v => normalizeSeverity(v.severity) === selectedSeverity);
    return matchesSearch && matchesSeverity;
  });

  const totalVulnerabilities = enhancedComponents.reduce(
    (sum, comp) => sum + comp.vulnerabilities.length, 0
  );
  const criticalVulns = enhancedComponents.reduce(
    (sum, comp) => sum + comp.vulnerabilities.filter(
      v => normalizeSeverity(v.severity) === 'critical'
    ).length, 0
  );
  const totalPolicyViolations = enhancedComponents.reduce(
    (sum, comp) => sum + comp.policyViolations.length, 0
  );

  // Compliance derived from real analysis data
  const unknownLicenseCount = enhancedComponents.filter(c => c.license === 'Unknown').length;
  const licenseCompliant = unknownLicenseCount === 0;
  const missingPurlCount = enhancedComponents.filter(c => !c.purl).length;

  const handlePoliciesUpdate = (updated: PolicyRule[]) => {
    setPolicies(updated);
    onPolicyUpdate?.(updated);
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Components</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{enhancedComponents.length}</p>
              </div>
              <FileJson className="h-8 w-8 text-vendorsoluce-teal" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Vulnerabilities</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalVulnerabilities}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalVulns}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Policy Violations</p>
                <p className={`text-2xl font-bold ${totalPolicyViolations > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                  {totalPolicyViolations}
                </p>
              </div>
              <Shield className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Component Overview', icon: FileJson },
            { id: 'vulnerabilities', label: 'Vulnerabilities', icon: AlertTriangle },
            { id: 'policies', label: 'Policy Engine', icon: Shield },
            { id: 'compliance', label: 'Compliance', icon: CheckCircle }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as 'overview' | 'policies' | 'vulnerabilities' | 'compliance')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-vendorsoluce-teal text-vendorsoluce-teal'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search components..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  aria-label="Search components"
                />
              </div>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                aria-label="Filter by severity"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          </div>

          {filteredComponents.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No components match the current filter.
            </div>
          )}

          <div className="space-y-4">
            {filteredComponents.map((component) => (
              <Card key={component.id} className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {component.name} <span className="text-gray-500 dark:text-gray-400">v{component.version}</span>
                        </h3>
                        <RiskBadge level={getRiskLevel(component.riskScore)} />
                        {component.policyViolations.length > 0 && (
                          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full text-xs font-medium">
                            {component.policyViolations.length} policy violation{component.policyViolations.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">License:</span>
                          <span className={`ml-1 ${component.license === 'Unknown' ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}`}>
                            {component.license}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Vulnerabilities:</span>
                          <span className="ml-1 text-gray-900 dark:text-white">{component.vulnerabilities.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Supplier:</span>
                          <span className={`ml-1 ${!component.supplier ? 'text-gray-400 dark:text-gray-500 italic' : 'text-gray-900 dark:text-white'}`}>
                            {component.supplier || 'Not specified'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">PURL:</span>
                          <span className={`ml-1 ${!component.purl ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}`}>
                            {component.purl ? '✓' : 'Missing'}
                          </span>
                        </div>
                      </div>
                      
                      {component.vulnerabilities.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {component.vulnerabilities.slice(0, 2).map((vuln, vi) => (
                            <div key={vuln.cve || vi} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(vuln.severity)}`}>
                                  {normalizeSeverity(vuln.severity).toUpperCase()}
                                </span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{vuln.cve}</span>
                                {getVulnScore(vuln) > 0 && (
                                  <span className="text-sm text-gray-600 dark:text-gray-300">CVSS {getVulnScore(vuln).toFixed(1)}</span>
                                )}
                              </div>
                              {vuln.references && vuln.references.length > 0 && (
                                <a
                                  href={vuln.references[0]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-vendorsoluce-teal hover:text-vendorsoluce-teal/80"
                                  aria-label={`View details for ${vuln.cve}`}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          ))}
                          {component.vulnerabilities.length > 2 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              +{component.vulnerabilities.length - 2} more vulnerabilities
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Policy Engine Tab */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Security & Compliance Policies</h3>
          </div>
          
          {totalPolicyViolations > 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              {totalPolicyViolations} violation{totalPolicyViolations > 1 ? 's' : ''} found across {
                enhancedComponents.filter(c => c.policyViolations.length > 0).length
              } component{enhancedComponents.filter(c => c.policyViolations.length > 0).length > 1 ? 's' : ''}.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {policies.map((policy) => {
              const violatingComponents = enhancedComponents.filter(c =>
                c.policyViolations.some(v => v.id === policy.id)
              );
              return (
                <Card key={policy.id} className="border border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{policy.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            policy.action === 'block' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                            policy.action === 'warn' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                            'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          }`}>
                            {policy.action.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            policy.isActive 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}>
                            {policy.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {policy.isActive && violatingComponents.length > 0 && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                              {violatingComponents.length} violation{violatingComponents.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{policy.description}</p>
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 px-2 py-1 rounded">
                          {policy.condition}
                        </code>
                        {policy.isActive && violatingComponents.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {violatingComponents.slice(0, 5).map(c => (
                              <span key={c.id} className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded text-xs">
                                {c.name}@{c.version}
                              </span>
                            ))}
                            {violatingComponents.length > 5 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 py-0.5">
                                +{violatingComponents.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" aria-label={`Configure policy: ${policy.name}`}>
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={policy.isActive ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => {
                            const updated = policies.map(p => 
                              p.id === policy.id ? { ...p, isActive: !p.isActive } : p
                            );
                            handlePoliciesUpdate(updated);
                          }}
                        >
                          {policy.isActive ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Vulnerabilities Tab */}
      {activeTab === 'vulnerabilities' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-orange-500" />
                Vulnerability Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalVulns}</div>
                  <div className="text-sm text-red-600 dark:text-red-400">Critical CVEs</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {enhancedComponents.reduce((sum, comp) => 
                      sum + comp.vulnerabilities.filter(v => normalizeSeverity(v.severity) === 'high').length, 0)}
                  </div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">High Severity</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {enhancedComponents.filter(comp => comp.vulnerabilities.length === 0).length}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">Clean Components</div>
                </div>
              </div>
              
              {totalVulnerabilities === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="font-medium">No vulnerabilities detected</p>
                  <p className="text-sm mt-1">All components passed vulnerability checks via OSV Database.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {enhancedComponents
                    .filter(comp => comp.vulnerabilities.length > 0)
                    .flatMap(comp => 
                      comp.vulnerabilities.map(vuln => ({ ...vuln, componentName: comp.name, componentVersion: comp.version }))
                    )
                    .sort((a, b) => {
                      const severityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1, unknown: 0 };
                      return (severityOrder[normalizeSeverity(b.severity)] ?? 0) - (severityOrder[normalizeSeverity(a.severity)] ?? 0);
                    })
                    .slice(0, 10)
                    .map((vuln, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(vuln.severity)}`}>
                                {normalizeSeverity(vuln.severity).toUpperCase()}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white">{vuln.cve}</span>
                              {getVulnScore(vuln) > 0 && (
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                  CVSS {getVulnScore(vuln).toFixed(1)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{getVulnDescription(vuln)}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              <span>Component: {vuln.componentName}@{vuln.componentVersion}</span>
                              {vuln.publishedDate && (
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Published {new Date(vuln.publishedDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          {vuln.references && vuln.references.length > 0 && (
                            <a
                              href={vuln.references[0]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-4 flex-shrink-0"
                            >
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Details
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Compliance Tab - derived from real analysis data */}
      {activeTab === 'compliance' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SBOM Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* NTIA Compliance - from real validation */}
                {ntiaCompliance ? (
                  <div className={`flex items-center justify-between p-4 rounded-lg ${
                    ntiaCompliance.compliant
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : 'bg-yellow-50 dark:bg-yellow-900/20'
                  }`}>
                    <div className="flex items-center">
                      {ntiaCompliance.compliant
                        ? <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                        : <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3" />
                      }
                      <div>
                        <h4 className={`font-medium ${ntiaCompliance.compliant ? 'text-green-800 dark:text-green-300' : 'text-yellow-800 dark:text-yellow-300'}`}>
                          NTIA Minimum Elements
                        </h4>
                        <p className={`text-sm ${ntiaCompliance.compliant ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                          {ntiaCompliance.compliant
                            ? 'All required NTIA minimum elements present'
                            : `Missing: ${ntiaCompliance.failedChecks.map(c => c.replace(/([A-Z])/g, ' $1').trim()).join(', ')}`
                          }
                        </p>
                      </div>
                    </div>
                    <span className={`font-medium ${ntiaCompliance.compliant ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                      {ntiaCompliance.compliant ? '✓ Compliant' : `Score: ${ntiaCompliance.score}%`}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <XCircle className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300">NTIA Minimum Elements</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">NTIA compliance data not available for this analysis</p>
                      </div>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 font-medium">— N/A</span>
                  </div>
                )}
                
                {/* Vulnerability Assessment - based on real counts */}
                <div className={`flex items-center justify-between p-4 rounded-lg ${
                  criticalVulns === 0
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <div className="flex items-center">
                    {criticalVulns === 0
                      ? <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                      : <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                    }
                    <div>
                      <h4 className={`font-medium ${criticalVulns === 0 ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                        Vulnerability Assessment
                      </h4>
                      <p className={`text-sm ${criticalVulns === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {totalVulnerabilities === 0
                          ? 'No vulnerabilities detected across all components'
                          : criticalVulns > 0
                          ? `${criticalVulns} critical vulnerabilit${criticalVulns > 1 ? 'ies' : 'y'} require immediate remediation`
                          : `${totalVulnerabilities} non-critical vulnerabilit${totalVulnerabilities > 1 ? 'ies' : 'y'} detected`
                        }
                      </p>
                    </div>
                  </div>
                  <span className={`font-medium ${
                    criticalVulns === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {criticalVulns === 0 ? (totalVulnerabilities === 0 ? '✓ Compliant' : '⚠ Partial') : '✗ Non-Compliant'}
                  </span>
                </div>
                
                {/* License Compliance - based on real license data */}
                <div className={`flex items-center justify-between p-4 rounded-lg ${
                  licenseCompliant
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-yellow-50 dark:bg-yellow-900/20'
                }`}>
                  <div className="flex items-center">
                    {licenseCompliant
                      ? <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                      : <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3" />
                    }
                    <div>
                      <h4 className={`font-medium ${licenseCompliant ? 'text-green-800 dark:text-green-300' : 'text-yellow-800 dark:text-yellow-300'}`}>
                        License Documentation
                      </h4>
                      <p className={`text-sm ${licenseCompliant ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                        {licenseCompliant
                          ? 'All components have license information'
                          : `${unknownLicenseCount} component${unknownLicenseCount > 1 ? 's' : ''} missing license information`
                        }
                      </p>
                    </div>
                  </div>
                  <span className={`font-medium ${licenseCompliant ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                    {licenseCompliant ? '✓ Compliant' : '⚠ Partial'}
                  </span>
                </div>

                {/* Component Identity (PURL/Hashes) */}
                <div className={`flex items-center justify-between p-4 rounded-lg ${
                  missingPurlCount === 0
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-yellow-50 dark:bg-yellow-900/20'
                }`}>
                  <div className="flex items-center">
                    {missingPurlCount === 0
                      ? <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                      : <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3" />
                    }
                    <div>
                      <h4 className={`font-medium ${missingPurlCount === 0 ? 'text-green-800 dark:text-green-300' : 'text-yellow-800 dark:text-yellow-300'}`}>
                        Component Identity (PURL)
                      </h4>
                      <p className={`text-sm ${missingPurlCount === 0 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                        {missingPurlCount === 0
                          ? 'All components have package URL (purl) identifiers'
                          : `${missingPurlCount} component${missingPurlCount > 1 ? 's' : ''} missing purl identifier`
                        }
                      </p>
                    </div>
                  </div>
                  <span className={`font-medium ${missingPurlCount === 0 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                    {missingPurlCount === 0 ? '✓ Compliant' : '⚠ Partial'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedSBOMAnalysis;
