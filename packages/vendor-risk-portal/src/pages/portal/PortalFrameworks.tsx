import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, CheckCircle, ArrowRight, ChevronRight, ExternalLink, Layers,
} from 'lucide-react';
import { usePortalSEO } from '../../hooks/usePortalSEO';
import {
  FRAMEWORKS, CONTROL_MAPPINGS, FRAMEWORK_COVERAGE,
  type FrameworkId, type FrameworkMeta,
} from '../../data/portalFrameworkData';

const PortalFrameworks: React.FC = () => {
  usePortalSEO({
    title: 'Framework Coverage',
    description: 'Control mapping across NIST SP 800-161, CMMC Level 2, ISO 27001, and SOC 2. See how vendor risk assessments align to each framework.',
    path: '/frameworks',
  });

  const [activeFramework, setActiveFramework] = useState<FrameworkId>('nist-800-161');
  const activeMeta = FRAMEWORKS.find(f => f.id === activeFramework)!;
  const activeCoverage = FRAMEWORK_COVERAGE[activeFramework];

  const mappedControls = Object.values(CONTROL_MAPPINGS).filter(c => {
    if (activeFramework === 'nist-800-161') return true;
    if (activeFramework === 'cmmc-l2') return !!c.cmmc;
    if (activeFramework === 'iso-27001') return !!c.iso;
    if (activeFramework === 'soc2') return !!c.soc2;
    return false;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">

      {/* Header */}
      <section className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 text-xs font-medium mb-4">
            <Layers className="w-3 h-3" /> Compliance Frameworks
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Framework coverage and control mapping
          </h1>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base max-w-2xl">
            Every assessment is aligned to recognized security frameworks. Controls are mapped across frameworks so you can see how one assessment addresses requirements from multiple standards simultaneously.
          </p>
        </div>
      </section>

      {/* Framework cards */}
      <section className="py-10 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FRAMEWORKS.map((fw: FrameworkMeta) => (
              <button
                key={fw.id}
                onClick={() => setActiveFramework(fw.id)}
                className={`text-left p-5 rounded-xl border-2 transition-all ${
                  activeFramework === fw.id
                    ? 'border-vendorsoluce-green bg-vendorsoluce-pale-green dark:border-vendorsoluce-light-green dark:bg-vendorsoluce-green/10 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <p className={`text-sm font-bold mb-1 ${fw.color}`}>{fw.shortName}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{fw.version}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{fw.controlCount} controls</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Active framework detail */}
      <section className="py-10 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 mb-8">
            <div className={`w-10 h-10 rounded-lg ${activeMeta.bgColor} flex items-center justify-center flex-shrink-0`}>
              <Shield className={`w-5 h-5 ${activeMeta.color}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{activeMeta.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">{activeMeta.description}</p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-500">Published by {activeMeta.publisher}</span>
                <a href={activeMeta.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline">
                  Source <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Coverage summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCoverage.domains.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Security domains covered</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCoverage.assessmentTypes.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Assessment modes supported</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCoverage.riskTiers.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Risk tiers applicable</p>
            </div>
          </div>

          {/* Domains */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Covered security domains</h3>
            <div className="flex flex-wrap gap-2">
              {activeCoverage.domains.map(d => (
                <span key={d} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full">{d}</span>
              ))}
            </div>
          </div>

          {/* Assessment types and tiers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Assessment modes</h3>
              <div className="space-y-1.5">
                {activeCoverage.assessmentTypes.map(t => (
                  <div key={t} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-3.5 h-3.5 text-vendorsoluce-green flex-shrink-0" />{t}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Applicable risk tiers</h3>
              <div className="space-y-1.5">
                {activeCoverage.riskTiers.map(t => (
                  <div key={t} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-3.5 h-3.5 text-vendorsoluce-green flex-shrink-0" />{t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cross-framework control mapping table */}
      <section className="py-10 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Cross-framework control mapping</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Each control in {activeMeta.shortName} maps to equivalent controls in other supported frameworks. This mapping allows a single assessment to cover requirements from multiple standards.
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">NIST 800-161</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Control Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">CMMC L2</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">ISO 27001</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">SOC 2</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {mappedControls.map(c => (
                  <tr key={c.nist} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                        {c.nist}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-gray-900 dark:text-white">{c.nistTitle}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{c.domain}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 font-mono">
                      {c.cmmc || <span className="text-gray-300 dark:text-gray-700">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 font-mono">
                      {c.iso || <span className="text-gray-300 dark:text-gray-700">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 font-mono">
                      {c.soc2 || <span className="text-gray-300 dark:text-gray-700">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Showing {mappedControls.length} mapped controls for {activeMeta.shortName}. Full control libraries are available in the platform for subscribed organizations.
          </p>
        </div>
      </section>

      {/* CTAs */}
      <section className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-4">
          <Link to="/demo" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-vendorsoluce-green text-white rounded-lg text-sm font-medium hover:bg-vendorsoluce-dark-green transition-colors">
            Try interactive demo <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/for-buyers" className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Buyer workflow <ChevronRight className="w-4 h-4" />
          </Link>
          <Link to="/how-it-works" className="text-sm text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline flex items-center gap-1">
            Full workflow <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
};

export default PortalFrameworks;
