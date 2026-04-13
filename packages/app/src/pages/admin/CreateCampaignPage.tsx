import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CampaignForm } from '../../components/marketing/CampaignForm';
import WorkspacePageShell from '../../components/vendorsoluce-intelligence/WorkspacePageShell';

const CreateCampaignPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSave = () => {
    navigate('/admin/marketing');
  };

  const handleCancel = () => {
    navigate('/admin/marketing');
  };

  return (
    <WorkspacePageShell
      title="Create Marketing Campaign"
      description="Set up a new automated email campaign"
      actions={[{ label: 'Back to campaigns', to: '/admin/marketing', variant: 'outline' }]}
    >
      <div className="max-w-2xl">
        <CampaignForm onSave={handleSave} onCancel={handleCancel} />
      </div>
    </WorkspacePageShell>
  );
};

export default CreateCampaignPage;
