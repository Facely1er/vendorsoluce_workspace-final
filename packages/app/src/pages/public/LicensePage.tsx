/**
 * License activation and info page for enterprise (on-premise) builds.
 * Replaces BillingPage when VITE_LICENSE_MODE is true.
 */

import React, { useState, useEffect } from 'react';
import { Key, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import WorkspacePageShell, { WORKSPACE_PAGE_BODY_STACK_CLASS } from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
import {
  getLicense,
  setLicense,
  clearLicense,
  type License,
} from '../../services/licenseService';
import { PRODUCTS } from '../../config/tiers';
import { useSubscription } from '../../context/SubscriptionContext';

const LicensePage: React.FC = () => {
  const { tier, refresh } = useSubscription();
  const [license, setLicenseState] = useState<License | null>(getLicense());
  const [keyInput, setKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setLicenseState(getLicense());
  }, [tier]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    setLoading(true);
    setMessage(null);
    const result = setLicense(keyInput.trim());
    setLoading(false);
    if (result.success) {
      setLicenseState(result.license);
      setKeyInput('');
      setMessage({ type: 'success', text: 'License activated successfully.' });
      refresh();
    } else {
      setMessage({ type: 'error', text: result.error });
    }
  };

  const handleRemove = () => {
    if (typeof window !== 'undefined' && window.confirm('Remove the current license? You will revert to the free tier.')) {
      clearLicense();
      setLicenseState(null);
      setMessage({ type: 'success', text: 'License removed.' });
      refresh();
    }
  };

  const product = license ? PRODUCTS[license.tier] : null;

  return (
    <WorkspacePageShell
      mode="execute"
      eyebrow="Workspace"
      title="License"
      description="View your current license and activate a new key when needed."
    >
      <div className={WORKSPACE_PAGE_BODY_STACK_CLASS}>
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {license && product ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-vendorsoluce-green" />
                Current License
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Plan</span>
                <span className="font-medium text-gray-900 dark:text-white">{product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Key</span>
                <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{license.keyPreview}</span>
              </div>
              {license.expiry && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Expires</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(license.expiry).toLocaleDateString()}
                  </span>
                </div>
              )}
              {license.seats >= 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Seats</span>
                  <span className="text-gray-900 dark:text-white">
                    {license.seats === -1 ? 'Unlimited' : license.seats}
                  </span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleRemove} className="mt-2">
                Remove license
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                No active license
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You are on the free tier. Enter a license key below to unlock your plan.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Activate a license key</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleActivate} className="space-y-4">
              <input
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Paste your license key (e.g. eyJ0IjoiZW50ZXJwcmlzZSJ9...)"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-vendorsoluce-green focus:border-transparent"
                disabled={loading}
              />
              <Button type="submit" variant="primary" disabled={loading || !keyInput.trim()}>
                {loading ? 'Activating…' : 'Activate license'}
              </Button>
            </form>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Ask your administrator for a license key if one has not been issued.
            </p>
          </CardContent>
        </Card>
      </div>
    </WorkspacePageShell>
  );
};

export default LicensePage;
