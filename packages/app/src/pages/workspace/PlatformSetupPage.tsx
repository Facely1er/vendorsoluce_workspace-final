import React from 'react';
import { Shield } from 'lucide-react';
import GuidedSetupWorkflow from '../../components/setup/GuidedSetupWorkflow';
import WorkspacePageShell from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
import PanelCard from '../../components/vendorsoluce-intelligence/PanelCard';

const PlatformSetupPage: React.FC = () => {
  return (
    <WorkspacePageShell
      eyebrow="Workspace"
      title="Platform setup"
      description="Set up your vendor portfolio, requirements, and assessment defaults."
      stats={[
        { label: 'Setup path', value: 'Guided', hint: 'Step-by-step configuration' },
        { label: 'Scope', value: 'Workspace-wide', hint: 'Applies across vendor operations' },
      ]}
    >
      <PanelCard
        title={<span className="flex items-center gap-2"><Shield className="h-5 w-5 text-vendorsoluce-green" /> Guided operational setup</span>}
        description="Use the guided workflow below to establish portfolio scope, requirements, and operational defaults in the same structured setup frame used across the workspace."
      >
        <GuidedSetupWorkflow />
      </PanelCard>
    </WorkspacePageShell>
  );
};

export default PlatformSetupPage;
