/**
 * Metrics strip aligned with website homepage #metrics.
 */

import React from 'react';

const MetricsSection: React.FC = () => {
  return (
    <section id="metrics" className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <span className="text-xl font-bold text-vendorsoluce-green dark:text-vendorsoluce-light-green">3</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">Distinct Processes · Radar, Assessment, Due Diligence</span>
          </div>
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <span className="text-xl font-bold text-vendorsoluce-green dark:text-vendorsoluce-light-green">4–7</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">Hours to initial risk visibility</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MetricsSection;
