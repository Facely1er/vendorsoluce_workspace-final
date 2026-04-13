import React from 'react';
import { Shield, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import {
  attestationVerificationService,
  type LinkedAttestation,
} from '../../services/attestationVerificationService';
import { isSupabaseEnabled } from '../../lib/supabase';

interface VendorAttestationPanelProps {
  vendorId: string;
}

const DETERMINATION_LABEL: Record<string, string> = {
  met: 'Met',
  conditional: 'Conditional',
  not_met: 'Not Met',
};

const DETERMINATION_COLOR: Record<string, string> = {
  met: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  conditional: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  not_met: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const VendorAttestationPanel: React.FC<VendorAttestationPanelProps> = ({ vendorId }) => {
  const [attestations, setAttestations] = React.useState<LinkedAttestation[]>(() =>
    attestationVerificationService.getAttestationsForVendor(vendorId),
  );
  const [tokenInput, setTokenInput] = React.useState('');
  const [verifying, setVerifying] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ ok: boolean; message: string } | null>(null);

  const canVerify = isSupabaseEnabled();

  const handleVerify = async () => {
    const token = tokenInput.trim();
    if (!token) return;
    setVerifying(true);
    setFeedback(null);
    try {
      const result = await attestationVerificationService.verifyToken(token);
      if (!result.valid) {
        setFeedback({ ok: false, message: result.error ?? 'Token is not valid.' });
        return;
      }
      const linked = await attestationVerificationService.linkAttestationToVendor(vendorId, result);
      setAttestations(attestationVerificationService.getAttestationsForVendor(vendorId));
      setTokenInput('');
      setFeedback({
        ok: true,
        message: `Attestation verified and linked: ${linked.framework}${linked.level ? ` — ${linked.level}` : ''}.`,
      });
    } catch (err) {
      setFeedback({
        ok: false,
        message: err instanceof Error ? err.message : 'Failed to link attestation.',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleRemove = (token: string) => {
    attestationVerificationService.removeAttestationFromVendor(vendorId, token);
    setAttestations(attestationVerificationService.getAttestationsForVendor(vendorId));
  };

  return (
    <div className="space-y-5">
      {/* Token entry */}
      <div className="space-y-3">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Enter an attestation token issued by a third-party assessor to verify and link it to this
          vendor record.
          {!canVerify && (
            <span className="ml-1 text-gray-400 dark:text-gray-500">
              (Connect a database to enable token verification.)
            </span>
          )}
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleVerify();
            }}
            placeholder="Paste attestation token…"
            disabled={verifying}
            aria-label="Attestation token"
            className="min-w-0 flex-1 rounded-xl border border-gray-200/70 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-60 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
          />
          <button
            type="button"
            onClick={() => void handleVerify()}
            disabled={verifying || !tokenInput.trim()}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-xl border border-gray-200/70 px-4 py-2 text-sm font-medium transition',
              'hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50',
              'dark:border-gray-800 dark:hover:bg-gray-900/60',
              'text-gray-900 dark:text-white',
            )}
          >
            {verifying ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Shield className="h-4 w-4" aria-hidden="true" />
            )}
            {verifying ? 'Verifying…' : 'Verify'}
          </button>
        </div>

        {feedback ? (
          <div
            className={cn(
              'flex items-start gap-2 rounded-xl border px-4 py-3 text-sm',
              feedback.ok
                ? 'border-green-200 bg-green-50/80 text-green-900 dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-200'
                : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300',
            )}
            role="status"
          >
            {feedback.ok ? (
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <span>{feedback.message}</span>
          </div>
        ) : null}
      </div>

      {/* Linked attestations */}
      {attestations.length === 0 ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          No attestations are linked to this vendor yet.
        </div>
      ) : (
        <div className="space-y-3">
          {attestations.map((att) => (
            <div
              key={att.token}
              className="rounded-2xl border border-gray-200/70 p-4 dark:border-gray-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {att.framework}
                    {att.level ? ` — ${att.level}` : ''}
                  </span>
                  {att.determination ? (
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                        DETERMINATION_COLOR[att.determination] ??
                          'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
                      )}
                    >
                      {DETERMINATION_LABEL[att.determination] ?? att.determination}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(att.token)}
                  aria-label={`Remove attestation ${att.token}`}
                  className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-3 grid gap-1.5 text-xs text-gray-600 dark:text-gray-400 sm:grid-cols-2">
                {att.overallScore != null && (
                  <div>
                    Score:{' '}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {att.overallScore}
                    </span>
                  </div>
                )}
                {att.assessorOrg && (
                  <div>
                    Assessor:{' '}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {att.assessorOrg}
                    </span>
                  </div>
                )}
                {att.assessedAt && (
                  <div>
                    Assessed:{' '}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(att.assessedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {att.expiresAt && (
                  <div>
                    Expires:{' '}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(att.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="sm:col-span-2">
                  Token:{' '}
                  <span className="break-all font-mono text-gray-900 dark:text-white">
                    {att.token}
                  </span>
                </div>
                <div>
                  Verified:{' '}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(att.verifiedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorAttestationPanel;
