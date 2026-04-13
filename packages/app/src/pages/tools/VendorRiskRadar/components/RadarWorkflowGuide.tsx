import React from 'react';
import { ListOrdered, Upload, Radar, Table2, FileOutput } from 'lucide-react';

const STEPS = [
  {
    n: 1,
    title: 'Load vendors',
    body: 'Add vendors from the catalog, run the intake wizard, or import CSV / portfolio JSON.',
    icon: Upload,
    targetId: 'vendor-risk-radar-toolbar',
  },
  {
    n: 2,
    title: 'Review the map',
    body: 'Use the radar and filters to see concentration and SBOM posture signals.',
    icon: Radar,
    targetId: 'vendor-risk-radar-visualization',
  },
  {
    n: 3,
    title: 'Inspect rows',
    body: 'Open a vendor for detail, or stay in the table for sorting and risk bands.',
    icon: Table2,
    targetId: 'vendor-risk-radar-table',
  },
  {
    n: 4,
    title: 'Choose a report',
    body: 'Summary for quick readouts, or full portfolio HTML for formal C-SCRM evidence.',
    icon: FileOutput,
    targetId: 'vendor-risk-radar-deliverables',
  },
] as const;

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export type RadarWorkflowGuideProps = {
  /** Run before scrolling (e.g. switch to the tab that contains the targets). */
  onBeforeJump?: () => void;
};

const RadarWorkflowGuide: React.FC<RadarWorkflowGuideProps> = ({ onBeforeJump }) => {
  return (
    <section
      className="mb-6 rounded-xl border border-vendorsoluce-green/25 bg-gradient-to-br from-vendorsoluce-pale-green/80 to-white dark:from-vendorsoluce-green/10 dark:to-gray-900/40 dark:border-vendorsoluce-green/30 px-4 py-5 sm:px-6"
      aria-labelledby="radar-workflow-heading"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="mt-0.5 rounded-lg bg-vendorsoluce-green/15 dark:bg-vendorsoluce-green/25 p-2">
          <ListOrdered className="w-5 h-5 text-vendorsoluce-green dark:text-vendorsoluce-light-green" aria-hidden />
        </div>
        <div>
          <h2 id="radar-workflow-heading" className="text-base font-semibold text-gray-900 dark:text-white">
            Guided workflow
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 max-w-3xl">
            Follow these steps in order. Jump to a section anytime — links scroll the page for you.
          </p>
        </div>
      </div>
      <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 list-none p-0 m-0">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <li key={step.n}>
              <button
                type="button"
                onClick={() => {
                  onBeforeJump?.();
                  window.requestAnimationFrame(() => {
                    window.requestAnimationFrame(() => scrollToSection(step.targetId));
                  });
                }}
                className="w-full text-left h-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white/90 dark:bg-gray-800/80 px-3 py-3 shadow-sm hover:border-vendorsoluce-green/60 hover:shadow-md dark:hover:border-vendorsoluce-light-green/50 transition-all focus:outline-none focus:ring-2 focus:ring-vendorsoluce-green/40 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-vendorsoluce-green text-white text-xs font-bold"
                    aria-hidden
                  >
                    {step.n}
                  </span>
                  <Icon className="w-4 h-4 text-vendorsoluce-green dark:text-vendorsoluce-light-green shrink-0" aria-hidden />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{step.title}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug pl-9">{step.body}</p>
                <span className="text-xs font-medium text-vendorsoluce-green dark:text-vendorsoluce-light-green mt-2 inline-block pl-9">
                  Go to step →
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default RadarWorkflowGuide;
