import React from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import type { EvidenceVaultItem } from '../../types/workspace';
import { isSupabaseEnabled } from '../../lib/supabase';
import { Info, FileCheck } from 'lucide-react';

interface EvidenceVaultPanelProps {
  items: EvidenceVaultItem[];
  expirySummary: {
    valid: number;
    expiring_soon_30_days: number;
    expired: number;
    missing_required: number;
  };
  onApprove: (id: string, approved_by: string) => void;
}

const EXPIRY_COLOR: Record<string, string> = {
  valid: 'text-green-600 dark:text-green-400',
  expiring_soon: 'text-orange-500 dark:text-orange-400',
  expired: 'text-red-600 dark:text-red-400',
  missing: 'text-gray-400 dark:text-gray-500',
  pending_review: 'text-blue-500 dark:text-blue-400',
};

const APPROVAL_COLORS: Record<string, string> = {
  pending_review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

function daysLabel(days: number | null): string {
  if (days === null) return '—';
  if (days < 0) return `${Math.abs(days)}d expired`;
  return `${days}d`;
}

function daysColorClass(days: number | null): string {
  if (days === null) return 'text-gray-400 dark:text-gray-500';
  if (days < 0) return 'text-red-600 dark:text-red-400 font-semibold';
  if (days < 14) return 'text-red-500 dark:text-red-400 font-semibold';
  if (days < 30) return 'text-orange-500 dark:text-orange-400';
  return 'text-gray-500 dark:text-gray-400';
}

const EvidenceVaultPanel: React.FC<EvidenceVaultPanelProps> = ({
  items,
  expirySummary,
  onApprove,
}) => {
  const supabaseEnabled = isSupabaseEnabled();

  return (
    <div className="space-y-4">
      {/* Expiry summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Valid', value: expirySummary.valid, color: 'text-green-600 dark:text-green-400' },
          { label: 'Expiring (30d)', value: expirySummary.expiring_soon_30_days, color: 'text-orange-500 dark:text-orange-400' },
          { label: 'Expired', value: expirySummary.expired, color: 'text-red-600 dark:text-red-400' },
          { label: 'Missing', value: expirySummary.missing_required, color: 'text-gray-500 dark:text-gray-400' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-center"
          >
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {!supabaseEnabled && (
        <div
          className="flex items-start gap-2 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-3 text-sm text-blue-700 dark:text-blue-300"
          role="note"
        >
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          File upload requires a backend connection — metadata tracking available in local mode.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Evidence Vault</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileCheck className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" aria-hidden="true" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No evidence items</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Add evidence items to track expiry and approval status.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table" aria-label="Evidence vault items">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vendor</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expiry</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Days</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Approval</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sr-only">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.vendor_id}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{item.type}</td>
                      <td className={`px-4 py-3 ${EXPIRY_COLOR[item.expiry_status] ?? ''}`}>
                        {item.expiry_date ?? '—'}
                      </td>
                      <td className={`px-4 py-3 ${daysColorClass(item.days_until_expiry)}`}>
                        {daysLabel(item.days_until_expiry)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${APPROVAL_COLORS[item.approval_status] ?? ''}`}
                        >
                          {item.approval_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {item.approval_status === 'pending_review' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onApprove(item.id, 'current_user')}
                            aria-label={`Approve evidence: ${item.name}`}
                          >
                            Approve
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EvidenceVaultPanel;
