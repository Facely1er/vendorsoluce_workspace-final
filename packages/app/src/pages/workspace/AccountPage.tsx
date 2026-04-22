import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import {
  Settings,
  Shield,
  Bell,
  Moon,
  Sun,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  Lock,
  X,
} from 'lucide-react';
import WorkspacePageShell, { WORKSPACE_PAGE_BODY_GRID_CLASS } from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
import PanelCard from '../../components/vendorsoluce-intelligence/PanelCard';
import StatusBanner from '../../components/vendorsoluce-intelligence/StatusBanner';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { logger } from '../../utils/logger';

const toggleTrack = 'w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-vendorsoluce-green/20 dark:peer-focus:ring-vendorsoluce-green/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-vendorsoluce-green';

const ToggleRow = ({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (value: boolean) => void }) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
    <label className="relative inline-flex cursor-pointer items-center">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" aria-label={title} />
      <div className={toggleTrack}></div>
    </label>
  </div>
);

const AccountPage: React.FC = () => {
  const { user, logout, updatePassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currentLanguage, changeLanguage, supportedLanguages } = useI18n();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [notifications, setNotifications] = useState({ emailNotifications: true, securityAlerts: true, marketingEmails: false, weeklyReports: true });
  const [privacy, setPrivacy] = useState({ profileVisibility: 'private', dataSharing: false, analyticsOptOut: false });

  const handleNotificationChange = (key: string, value: boolean) => setNotifications((prev) => ({ ...prev, [key]: value }));
  const handlePrivacyChange = (key: string, value: boolean | string) => setPrivacy((prev) => ({ ...prev, [key]: value }));

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await logout();
    } catch (error) {
      logger.error('Error deleting account:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const exportData = () => alert('Data export functionality would be implemented here');
  const importData = () => alert('Data import functionality would be implemented here');

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await updatePassword(passwordData.newPassword);
      setPasswordSuccess('Password updated successfully.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        closePasswordModal();
      }, 1500);
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password. Please try again.');
      logger.error('Error updating password:', err);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <WorkspacePageShell
      title="Account settings"
      description="Manage preferences, security, and privacy settings."
      stats={[
        { label: 'Theme', value: theme === 'light' ? 'Light' : 'Dark', hint: 'Current UI mode' },
        { label: 'Language', value: currentLanguage.toUpperCase(), hint: 'Active locale' },
        { label: 'Visibility', value: privacy.profileVisibility, hint: 'Current privacy mode' },
      ]}
    >
      <div className={`${WORKSPACE_PAGE_BODY_GRID_CLASS} xl:grid-cols-2`}>
        <PanelCard title={<span className="flex items-center"><Settings className="mr-2 h-5 w-5" />Appearance & language</span>} description="Control the base workspace experience, including theme and interface language.">
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Theme</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred color scheme.</p>
              </div>
              <Button variant="outline" size="sm" onClick={toggleTheme} className="flex items-center">
                {theme === 'light' ? <><Moon className="mr-2 h-4 w-4" />Dark</> : <><Sun className="mr-2 h-4 w-4" />Light</>}
              </Button>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Language</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Select your preferred language.</p>
              </div>
              <select value={currentLanguage} onChange={(e) => changeLanguage(e.target.value)} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white" aria-label="Select your preferred language">
                {supportedLanguages.map((lang) => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
              </select>
            </div>
          </div>
        </PanelCard>

        <PanelCard title={<span className="flex items-center"><Bell className="mr-2 h-5 w-5" />Notification preferences</span>} description="Keep alerting settings in the same structured view as account administration.">
          <div className="space-y-4">
            <ToggleRow title="Email notifications" description="Receive notifications about account activity." checked={notifications.emailNotifications} onChange={(v) => handleNotificationChange('emailNotifications', v)} />
            <ToggleRow title="Security alerts" description="Get notified about security events." checked={notifications.securityAlerts} onChange={(v) => handleNotificationChange('securityAlerts', v)} />
            <ToggleRow title="Weekly reports" description="Receive weekly summary reports." checked={notifications.weeklyReports} onChange={(v) => handleNotificationChange('weeklyReports', v)} />
            <ToggleRow title="Marketing emails" description="Receive product updates and marketing content." checked={notifications.marketingEmails} onChange={(v) => handleNotificationChange('marketingEmails', v)} />
          </div>
        </PanelCard>

        <PanelCard title={<span className="flex items-center"><Shield className="mr-2 h-5 w-5" />Privacy & data</span>} description="Control visibility and data-use options without leaving the account workspace.">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Profile visibility</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Control who can see your profile information.</p>
              </div>
              <select value={privacy.profileVisibility} onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white" aria-label="Profile visibility">
                <option value="private">Private</option>
                <option value="organization">Organization only</option>
                <option value="public">Public</option>
              </select>
            </div>
            <ToggleRow title="Data sharing" description="Allow sharing anonymized data for product improvements." checked={privacy.dataSharing} onChange={(v) => handlePrivacyChange('dataSharing', v)} />
            <ToggleRow title="Analytics opt-out" description="Opt out of usage analytics and tracking." checked={privacy.analyticsOptOut} onChange={(v) => handlePrivacyChange('analyticsOptOut', v)} />
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button variant="outline" onClick={exportData}><Download className="mr-2 h-4 w-4" />Export my data</Button>
              <Button variant="outline" onClick={importData}><Upload className="mr-2 h-4 w-4" />Import data</Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Exports include assessments, vendor data, and SBOM analyses connected to your account.</p>
          </div>
        </PanelCard>

        <PanelCard title={<span className="flex items-center"><Lock className="mr-2 h-5 w-5" />Account security</span>} description="Keep authentication and access controls visible in the same operations frame.">
          <div className="space-y-4">
            <StatusBanner tone="success" title="Account secured">Your account is protected with secure authentication.</StatusBanner>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-sm text-gray-700 dark:text-gray-300">Password</span><Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>Change password</Button></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-700 dark:text-gray-300">Two-factor authentication</span><Button variant="outline" size="sm">Enable 2FA</Button></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-700 dark:text-gray-300">Active sessions</span><Button variant="outline" size="sm">Manage sessions</Button></div>
            </div>
          </div>
        </PanelCard>
      </div>

      <PanelCard className="border-red-200 dark:border-red-800" title={<span className="flex items-center text-red-600 dark:text-red-400"><AlertTriangle className="mr-2 h-5 w-5" />Danger zone</span>} description="Destructive account actions stay isolated and clearly framed.">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <h3 className="mb-2 text-sm font-medium text-red-800 dark:text-red-300">Delete account</h3>
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">Permanently delete your account and all associated data. This action cannot be undone.</p>
          {!showDeleteConfirm ? (
            <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(true)} className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20">
              <Trash2 className="mr-2 h-4 w-4" />Delete account
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Are you sure? This will permanently delete your account and all data.</p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleDeleteAccount} disabled={isDeleting} className="bg-red-600 text-white hover:bg-red-700">
                  {isDeleting ? <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" /> : <Trash2 className="mr-2 h-4 w-4" />}Delete forever
                </Button>
              </div>
            </div>
          )}
        </div>
      </PanelCard>

      {showPasswordModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-row items-center justify-between">
              <div className="flex items-center font-semibold text-gray-900 dark:text-white"><Lock className="mr-2 h-5 w-5" />Change password</div>
              <button onClick={closePasswordModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close password change modal"><X className="h-5 w-5" /></button>
            </div>
            <div>
              {passwordError ? <StatusBanner className="mb-4" tone="error">{passwordError}</StatusBanner> : null}
              {passwordSuccess ? <StatusBanner className="mb-4" tone="success">{passwordSuccess}</StatusBanner> : null}
              <form onSubmit={handlePasswordChange}>
                <div className="mb-4">
                  <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">New password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><Lock className="h-5 w-5 text-gray-400" /></span>
                    <input id="newPassword" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-vendorsoluce-green dark:border-gray-600 dark:bg-gray-800 dark:text-white" placeholder="Enter new password" required minLength={6} />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Must be at least 6 characters long.</p>
                </div>
                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm new password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><Lock className="h-5 w-5 text-gray-400" /></span>
                    <input id="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-vendorsoluce-green dark:border-gray-600 dark:bg-gray-800 dark:text-white" placeholder="Confirm new password" required minLength={6} />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button type="button" variant="outline" onClick={closePasswordModal} className="flex-1" disabled={isUpdatingPassword}>Cancel</Button>
                  <Button type="submit" variant="primary" className="flex-1" disabled={isUpdatingPassword}>{isUpdatingPassword ? 'Updating…' : 'Update password'}</Button>
                </div>
              </form>
            </div>
        </div>
        </div>
      ) : null}
    </WorkspacePageShell>
  );
};

export default AccountPage;
