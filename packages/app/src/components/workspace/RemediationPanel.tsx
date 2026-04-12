import React from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import type { RemediationItem } from '../../types/workspace';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface RemediationPanelProps {
  items: RemediationItem[];
  onResolve: (id: string) => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'border-l-red-600 bg-red-50 dark:bg-red-900/10',
  high: 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10',
  medium: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
  low: 'border-l-blue-400 bg-blue-50 dark:bg-blue-900/10',
};

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  accepted: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

function agingDays(raised_date: string): number {
  return Math.floor((Date.now() - new Date(raised_date).getTime()) / (1000 * 60 * 60 * 24));
}

const RemediationPanel: React.FC<RemediationPanelProps> = ({ items, onResolve }) => {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle className="h-10 w-10 text-green-400 mb-3" aria-hidden="true" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No remediation items</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            All findings have been resolved or none have been raised yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Remediation Tracker</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-gray-100 dark:divide-gray-700" role="list" aria-label="Remediation items">
          {items.map((item) => {
            const aging = agingDays(item.raised_date);
            return (
              <li
                key={item.id}
                className={`p-4 border-l-4 ${SEVERITY_COLORS[item.severity] ?? ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {item.finding}
                      </span>
                      {item.escalated && (
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          title="Escalated"
                          aria-label="Escalated"
                        >
                          <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                          Escalated
                        </span>
                      )}
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.status] ?? ''}`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.vendor_name} · {aging} days open · Due:{' '}
                      {item.target_completion}
                    </p>
                    {item.owner && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        Owner: {item.owner}
                      </p>
                    )}
                  </div>
                  {item.status !== 'resolved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onResolve(item.id)}
                      aria-label={`Resolve finding: ${item.finding}`}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};

export default RemediationPanel;
