import React, { useState } from 'react';
import WelcomeScreen from '../../components/onboarding/WelcomeScreen';
import WorkspacePageShell from '../../components/vendorsoluce-intelligence/WorkspacePageShell';

const OnboardingPage: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleOnboardingComplete = () => {
    setShowWelcome(false);
    // The markOnboardingComplete function will handle navigation
  };

  return (
    <WorkspacePageShell title="Onboarding" description="Complete your workspace setup to activate risk scoring and reporting.">
      {showWelcome ? <WelcomeScreen onComplete={handleOnboardingComplete} /> : null}
    </WorkspacePageShell>
  );
};

export default OnboardingPage;