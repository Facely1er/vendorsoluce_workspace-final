import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ermitsEntitlements } from '../../lib/ermits';
import { AR } from 'shared/constants/routes';

const PRODUCT = 'vendorsoluce';

export default function ErmitsUpgradePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const reason = (location.state as { reason?: string } | null)?.reason;
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const startTrial = async () => {
    if (!user?.id) {
      navigate(AR.SIGNIN, { state: { from: '/upgrade' } });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const r = await ermitsEntitlements.provisionTrial(user.id, PRODUCT);
      if ('error' in r && r.error) setMsg(r.error);
      else navigate('/', { replace: true });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not start trial');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full space-y-4 text-center">
        <h1 className="text-2xl font-semibold">VendorSoluce access</h1>
        {reason && <p className="text-sm text-muted-foreground">{reason.replace(/_/g, ' ')}</p>}
        <p className="text-sm text-muted-foreground">Start a trial or contact your administrator.</p>
        <div className="flex flex-col gap-2">
          <button type="button" className="btn btn-primary" disabled={busy} onClick={startTrial}>
            {busy ? 'Starting…' : 'Start free trial'}
          </button>
          <Link to={AR.SIGNIN} className="btn btn-outline">
            Sign in
          </Link>
        </div>
        {msg && <p className="text-sm text-destructive">{msg}</p>}
      </div>
    </div>
  );
}
