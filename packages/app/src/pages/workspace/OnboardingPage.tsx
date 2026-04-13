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
    <WorkspacePageShell title="Onboarding" description="Start the workspace with a guided onboarding sequence and a consistent, polished setup experience.">
      {showWelcome ? <WelcomeScreen onComplete={handleOnboardingComplete} /> : null}
    </WorkspacePageShell>
  );
};

export default OnboardingPage;