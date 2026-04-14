import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WR } from 'shared/constants/routes';
import { Button } from '../../components/ui/Button';
import WorkspacePageShell from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
import PanelCard from '../../components/vendorsoluce-intelligence/PanelCard';
import { applyLicenseToken } from '../../lib/licenseActivation';

const ActivateLicensePage: React.FC = () => {
  const navigate = useNavigate();
  const [token, setToken] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<Awaited<ReturnType<typeof applyLicenseToken>> | null>(
    null
  );

  const onActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await applyLicenseToken(token.trim(), true);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const successBanner = result?.success ? (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
      <div className="font-semibold">License activated.</div>
      <div className="mt-1 space-y-0.5">
        <div>Tier: {result.tier}</div>
        {result.hasPortal ? <div>Vendor portal access: enabled</div> : null}
        {result.expiresAt ? (
          <div>Expires: {new Date(result.expiresAt).toLocaleString()}</div>
        ) : (
          <div>No expiry — perpetual license</div>
        )}
      </div>
      <div className="mt-3">
        <Button variant="primary" onClick={() => navigate(WR.USER_DASHBOARD, { replace: true })}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  ) : null;

  const errorBanner = result && !result.success ? (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300">
      {result.error ?? 'Invalid license key.'}
    </div>
  ) : null;

  return (
    <WorkspacePageShell
      title="Activate License"
      description="Enter your VendorSoluce license key to unlock your subscription."
    >
      <PanelCard title="License key" description="Paste a license token (demo or RS256 JWT).">
        <form onSubmit={onActivate} className="space-y-4">
          {successBanner}
          {errorBanner}
          <div>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your license key here"
              className="w-full rounded-xl border border-gray-200/70 bg-white px-4 py-3 font-mono text-sm text-gray-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/60 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:focus:border-emerald-900/60 dark:focus:ring-emerald-900/30"
              disabled={loading}
              autoComplete="off"
            />
          </div>
          <div className="flex items-center justify-end">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Activating…' : 'Activate'}
            </Button>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Your license key is verified locally on your device. No data is sent to ERMITS servers.
          </div>
        </form>
      </PanelCard>
    </WorkspacePageShell>
  );
};

export default ActivateLicensePage;
