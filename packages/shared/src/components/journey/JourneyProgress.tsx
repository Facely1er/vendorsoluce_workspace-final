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
    <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 sm:p-4">
      <div className="mb-2 sm:mb-3">
        <h3 className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Your Journey Progress
        </h3>
        <p className="text-[11px] leading-snug text-gray-600 dark:text-gray-400">
          Complete all 3 stages to achieve evidence-based vendor compliance
        </p>
      </div>

      <div className="flex items-center justify-between gap-0.5">
        {stages.map((stage, index) => {
          const isCurrent = currentStage === stage.number;
          const isComplete = stage.complete;
          const isPast = currentStage > stage.number;
          const showLine = index < stages.length - 1;

          return (
            <React.Fragment key={stage.number}>
              <div className="flex min-w-0 flex-1 flex-col items-center">
                <div className="relative shrink-0">
                  {isComplete || isPast ? (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-vendorsoluce-green sm:h-10 sm:w-10">
                      <CheckCircle className="h-4 w-4 text-white sm:h-[18px] sm:w-[18px]" />
                    </div>
                  ) : isCurrent ? (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-vendorsoluce-green bg-vendorsoluce-green/20 sm:h-10 sm:w-10">
                      <span className="text-sm font-bold text-vendorsoluce-green">{stage.number}</span>
                    </div>
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 sm:h-10 sm:w-10">
                      <Circle className="h-4 w-4 text-gray-400 sm:h-[18px] sm:w-[18px]" />
                    </div>
                  )}
                </div>
                <div className="mt-1.5 max-w-[5.5rem] text-center sm:mt-2 sm:max-w-[6.5rem]">
                  <div
                    className={`mb-0.5 text-[10px] font-semibold leading-tight sm:text-[11px] ${
                      isCurrent
                        ? 'text-vendorsoluce-green'
                        : isComplete || isPast
                          ? 'text-gray-700 dark:text-gray-300'
                          : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    Stage {stage.number}
                  </div>
                  <div
                    className={`line-clamp-2 text-[10px] leading-tight sm:text-[11px] ${
                      isCurrent ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {stage.title}
                  </div>
                </div>
                {showNavigation && (isComplete || isPast || isCurrent) && (
                  <Link
                    to={stage.path}
                    className={`mt-1 text-[10px] font-medium transition-colors sm:text-[11px] ${
                      isCurrent
                        ? 'text-vendorsoluce-green hover:text-vendorsoluce-dark-green'
                        : 'text-gray-500 hover:text-vendorsoluce-green dark:text-gray-400'
                    }`}
                  >
                    {isCurrent ? 'Current' : 'View'}
                  </Link>
                )}
              </div>
              {showLine && (
                <div
                  className={`h-0.5 min-w-[6px] flex-1 self-center mx-1 sm:mx-1.5 ${
                    isPast || (isCurrent && index === 0) ? 'bg-vendorsoluce-green' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="mt-2 rounded-md border border-vendorsoluce-green/30 bg-vendorsoluce-pale-green p-2.5 dark:bg-vendorsoluce-green/10 sm:mt-3 sm:p-3">
        <div className="text-[11px] font-semibold text-vendorsoluce-green dark:text-vendorsoluce-light-green">
          Stage {currentStage} outcome
        </div>
        <p className="mt-0.5 text-xs font-medium leading-snug text-gray-900 dark:text-white sm:text-sm">
          &ldquo;{stages[currentStage - 1].outcome}&rdquo;
        </p>
      </div>

      {currentStage < 3 && (
        <div className="mt-2 flex justify-end sm:mt-3">
          <Link
            to={stages[currentStage].path}
            className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-vendorsoluce-green px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-vendorsoluce-dark-green sm:gap-2 sm:px-3 sm:py-2 sm:text-xs"
          >
            <span className="truncate">Next: Stage {currentStage + 1}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default JourneyProgress;
