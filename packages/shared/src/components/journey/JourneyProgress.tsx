import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';

interface JourneyProgressProps {
  currentStage: 1 | 2 | 3;
  stage1Complete?: boolean;
  stage2Complete?: boolean;
  stage3Complete?: boolean;
  showNavigation?: boolean;
}

const JourneyProgress: React.FC<JourneyProgressProps> = ({
  currentStage,
  stage1Complete = false,
  stage2Complete = false,
  stage3Complete = false,
  showNavigation = true,
}) => {
  // Aligned with website (how-it-works.html, index.html): Stage 1 Risk Radar, Stage 2 Assessment, Stage 3 Due Diligence
  const stages = [
    {
      number: 1,
      title: 'Discover Your Vendor Exposure',
      outcome: 'I know exactly which vendors pose the greatest risk to my organization.',
      path: '/vendor-risk-radar',
      complete: stage1Complete,
    },
    {
      number: 2,
      title: 'Understand Your Compliance Gaps',
      outcome: 'I know exactly which security controls and compliance requirements I need from each vendor based on their risk level.',
      path: '/vendor-requirements',
      complete: stage2Complete,
    },
    {
      number: 3,
      title: 'Close the Compliance Gaps',
      outcome: 'I have evidence-based proof of vendor compliance and defensible vendor risk management decisions.',
      path: '/vendor-assessments',
      complete: stage3Complete,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
          Your Journey Progress
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Complete all 3 stages to achieve evidence-based vendor compliance
        </p>
      </div>

      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const isCurrent = currentStage === stage.number;
          const isComplete = stage.complete;
          const isPast = currentStage > stage.number;
          const showLine = index < stages.length - 1;

          return (
            <React.Fragment key={stage.number}>
              <div className="flex flex-col items-center flex-1">
                <div className="relative">
                  {isComplete || isPast ? (
                    <div className="w-12 h-12 rounded-full bg-vendorsoluce-green flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-12 h-12 rounded-full bg-vendorsoluce-green/20 border-2 border-vendorsoluce-green flex items-center justify-center">
                      <span className="text-vendorsoluce-green font-bold text-lg">{stage.number}</span>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Circle className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="mt-3 text-center max-w-[120px]">
                  <div className={`text-xs font-semibold mb-1 ${
                    isCurrent ? 'text-vendorsoluce-green' : isComplete || isPast ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    Stage {stage.number}
                  </div>
                  <div className={`text-xs mb-2 ${
                    isCurrent ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {stage.title}
                  </div>
                  {isCurrent && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                      "{stage.outcome}"
                    </div>
                  )}
                </div>
                {showNavigation && (isComplete || isPast || isCurrent) && (
                  <Link
                    to={stage.path}
                    className={`mt-2 text-xs font-medium transition-colors ${
                      isCurrent
                        ? 'text-vendorsoluce-green hover:text-vendorsoluce-dark-green'
                        : 'text-gray-500 dark:text-gray-400 hover:text-vendorsoluce-green'
                    }`}
                  >
                    {isCurrent ? 'Current' : 'View'}
                  </Link>
                )}
              </div>
              {showLine && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  isPast || (isCurrent && index === 0) ? 'bg-vendorsoluce-green' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Outcome Statement for Current Stage */}
      <div className="mt-6 p-4 bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/10 rounded-lg border border-vendorsoluce-green/30">
        <div className="text-sm font-semibold text-vendorsoluce-green dark:text-vendorsoluce-light-green mb-1">
          🎯 STAGE {currentStage} OUTCOME
        </div>
        <p className="text-base font-medium text-gray-900 dark:text-white">
          "{stages[currentStage - 1].outcome}"
        </p>
      </div>

      {/* Next Step CTA */}
      {currentStage < 3 && (
        <div className="mt-4 flex justify-end">
          <Link
            to={stages[currentStage].path}
            className="inline-flex items-center gap-2 px-4 py-2 bg-vendorsoluce-green text-white rounded-lg text-sm font-medium hover:bg-vendorsoluce-dark-green transition-colors"
          >
            Continue to Stage {currentStage + 1}: {stages[currentStage].title}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default JourneyProgress;
