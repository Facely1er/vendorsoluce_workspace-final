import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { User, Mail, Building, Save, Shield } from 'lucide-react';
import WorkspacePageShell from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
import PanelCard from '../../components/vendorsoluce-intelligence/PanelCard';
import StatusBanner from '../../components/vendorsoluce-intelligence/StatusBanner';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';

const fieldClass = (editing: boolean) => `w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 ${editing ? 'bg-white text-gray-900 dark:bg-gray-800 dark:text-white' : 'bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`;

const ProfilePage: React.FC = () => {
  const { user, profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    company: profile?.company || '',
    role: profile?.role || '',
    avatar_url: profile?.avatar_url || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const updateData = {
        full_name: formData.full_name,
        company: formData.company,
        role: formData.role,
        avatar_url: formData.avatar_url,
      };
      const { error } = await ((supabase.from('vs_profiles') as any).update(updateData).eq('id', user.id));
      if (error) throw error;
      setSaveMessage({ type: 'success', text: 'Profile updated successfully.' });
      setIsEditing(false);
    } catch (error) {
      logger.error('Error updating profile:', error);
      setSaveMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleCancel = () => {
    setFormData({ full_name: profile?.full_name || '', company: profile?.company || '', role: profile?.role || '', avatar_url: profile?.avatar_url || '' });
    setIsEditing(false);
    setSaveMessage(null);
  };

  return (
    <WorkspacePageShell
      eyebrow="Workspace administration"
      title="Profile"
      description="Manage your identity, role, company details, and presentation settings from one consistent profile workspace."
      actions={[{ label: isEditing ? 'Cancel edits' : 'Edit profile', onClick: () => (isEditing ? handleCancel() : setIsEditing(true)), variant: 'outline' }]}
      stats={[
        { label: 'Profile mode', value: isEditing ? 'Editing' : 'Viewing', hint: 'Current page state' },
        { label: 'Company', value: profile?.company || '—', hint: 'Primary organization' },
      ]}
    >
      {saveMessage ? <StatusBanner tone={saveMessage.type === 'success' ? 'success' : 'error'}>{saveMessage.text}</StatusBanner> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PanelCard title={<span className="flex items-center gap-2"><User className="h-5 w-5" /> Profile picture</span>} description="Keep identity details, avatar presentation, and role context aligned with the rest of the workspace.">
          <div className="text-center">
            <div className="mb-6">
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="Profile" className="mx-auto h-32 w-32 rounded-full border-4 border-vendorsoluce-green object-cover" />
              ) : (
                <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-4 border-vendorsoluce-green bg-vendorsoluce-green/10">
                  <User className="h-16 w-16 text-vendorsoluce-green" />
                </div>
              )}
            </div>
            {isEditing ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Avatar URL</label>
                <input type="url" name="avatar_url" value={formData.avatar_url} onChange={handleInputChange} className={fieldClass(true)} placeholder="https://example.com/avatar.jpg" />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Enter a valid image URL for your profile picture</p>
              </div>
            ) : null}
          </div>
        </PanelCard>

        <div className="space-y-6 lg:col-span-2">
          <PanelCard title={<span className="flex items-center gap-2"><Shield className="h-5 w-5" /> Personal information</span>} description="Update profile details in the same panelized format used across the workspace.">
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"><Mail className="mr-2 inline h-4 w-4" />Email</label>
                <input type="email" value={user?.email || ''} disabled className={fieldClass(false)} placeholder="Email" />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Email cannot be changed from this page.</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Full name</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} disabled={!isEditing} className={fieldClass(isEditing)} placeholder="Enter your full name" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"><Building className="mr-2 inline h-4 w-4" />Company</label>
                <input type="text" name="company" value={formData.company} onChange={handleInputChange} disabled={!isEditing} className={fieldClass(isEditing)} placeholder="Enter your company name" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                {isEditing ? (
                  <select name="role" value={formData.role} onChange={handleInputChange} aria-label="Role" className={fieldClass(true)}>
                    <option value="">Select your role</option>
                    <option value="security">Security Professional</option>
                    <option value="procurement">Procurement Manager</option>
                    <option value="compliance">Compliance Officer</option>
                    <option value="risk">Risk Manager</option>
                    <option value="it">IT Manager</option>
                    <option value="executive">Executive</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <input type="text" value={formData.role || 'Not specified'} disabled aria-label="Role" className={fieldClass(false)} />
                )}
              </div>

              {isEditing ? (
                <div className="flex justify-end">
                  <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving…' : 'Save profile'}
                  </Button>
                </div>
              ) : null}
            </div>
          </PanelCard>

          <PanelCard title="Account information" description="Keep immutable account dates visible in the same profile view.">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Account created</label>
                <p className="text-gray-900 dark:text-white">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Last updated</label>
                <p className="text-gray-900 dark:text-white">{profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Never'}</p>
              </div>
            </div>
          </PanelCard>
        </div>
      </div>
    </WorkspacePageShell>
  );
};

export default ProfilePage;
