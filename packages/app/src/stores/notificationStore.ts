import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  NotificationRule,
  WorkspaceNotification,
  WorkspaceVendor,
  EvidenceVaultItem,
  NotificationTrigger,
} from '../types/workspace';

interface NotificationState {
  rules: NotificationRule[];
  notifications: WorkspaceNotification[];
  unreadCount: number;

  addNotification: (n: Omit<WorkspaceNotification, 'id'>) => void;
  markAllRead: () => void;
  clearHistory: () => void;
  evaluateRules: (context: {
    vendors: WorkspaceVendor[];
    evidenceItems: EvidenceVaultItem[];
    assessments: unknown[];
  }) => void;
}

const DEFAULT_RULES: NotificationRule[] = [
  {
    trigger: 'vendor_risk_threshold_crossed',
    threshold_risk_score: 70,
    channel: 'in_app',
    recipients: ['grc_lead'],
    template: 'Vendor {{vendor_name}} has exceeded risk threshold (score: {{score}}).',
  },
  {
    trigger: 'evidence_expiring',
    threshold_days: 30,
    channel: 'in_app',
    recipients: ['vendor_manager'],
    template: 'Evidence "{{evidence_name}}" for {{vendor_name}} expires in {{days}} days.',
  },
  {
    trigger: 'assessment_overdue',
    threshold_days: 14,
    channel: 'in_app',
    recipients: ['risk_analyst'],
    template: 'Assessment for {{vendor_name}} is overdue by {{days}} days.',
  },
];

function generateId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function deduplicationKey(type: NotificationTrigger, entityId: string): string {
  return `${type}::${entityId}`;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    persist(
      (set, get) => ({
        rules: DEFAULT_RULES,
        notifications: [],
        unreadCount: 0,

        addNotification: (n) =>
          set(
            (state) => ({
              notifications: [{ ...n, id: generateId() }, ...state.notifications],
              unreadCount: state.unreadCount + 1,
            }),
            false,
            'notificationStore/addNotification'
          ),

        markAllRead: () =>
          set({ unreadCount: 0 }, false, 'notificationStore/markAllRead'),

        clearHistory: () =>
          set(
            { notifications: [], unreadCount: 0 },
            false,
            'notificationStore/clearHistory'
          ),

        evaluateRules: (context) => {
          const { rules, notifications } = get();
          const now = Date.now();
          const oneDayMs = 24 * 60 * 60 * 1000;

          const recentKeys = new Set(
            notifications
              .filter((n) => now - new Date(n.sent_at).getTime() < oneDayMs)
              .map((n) => deduplicationKey(n.type, n.content))
          );

          const toAdd: Omit<WorkspaceNotification, 'id'>[] = [];

          for (const rule of rules) {
            if (rule.trigger === 'vendor_risk_threshold_crossed' && rule.threshold_risk_score != null) {
              for (const vendor of context.vendors) {
                const score = vendor.inherent_risk_score ?? vendor.residual_risk_score ?? 0;
                if (score >= rule.threshold_risk_score) {
                  const key = deduplicationKey(rule.trigger, vendor.id);
                  if (!recentKeys.has(key)) {
                    recentKeys.add(key);
                    toAdd.push({
                      type: rule.trigger,
                      sent_at: new Date().toISOString(),
                      recipient: rule.recipients[0] ?? 'grc_lead',
                      status: 'pending',
                      content: key,
                    });
                  }
                }
              }
            }

            if (rule.trigger === 'evidence_expiring' && rule.threshold_days != null) {
              for (const item of context.evidenceItems) {
                if (!item.expiry_date) continue;
                const daysUntil = Math.floor(
                  (new Date(item.expiry_date).getTime() - now) / (1000 * 60 * 60 * 24)
                );
                if (daysUntil >= 0 && daysUntil <= rule.threshold_days) {
                  const key = deduplicationKey(rule.trigger, item.id);
                  if (!recentKeys.has(key)) {
                    recentKeys.add(key);
                    toAdd.push({
                      type: rule.trigger,
                      sent_at: new Date().toISOString(),
                      recipient: rule.recipients[0] ?? 'vendor_manager',
                      status: 'pending',
                      content: key,
                    });
                  }
                }
              }
            }

            if (rule.trigger === 'assessment_overdue' && rule.threshold_days != null) {
              for (const vendor of context.vendors) {
                if (vendor.assessment_status === 'overdue') {
                  const key = deduplicationKey(rule.trigger, vendor.id);
                  if (!recentKeys.has(key)) {
                    recentKeys.add(key);
                    toAdd.push({
                      type: rule.trigger,
                      sent_at: new Date().toISOString(),
                      recipient: rule.recipients[0] ?? 'risk_analyst',
                      status: 'pending',
                      content: key,
                    });
                  }
                }
              }
            }
          }

          if (toAdd.length > 0) {
            set(
              (state) => ({
                notifications: [
                  ...toAdd.map((n) => ({ ...n, id: generateId() })),
                  ...state.notifications,
                ],
                unreadCount: state.unreadCount + toAdd.length,
              }),
              false,
              'notificationStore/evaluateRules'
            );
          }
        },
      }),
      {
        name: 'vendorsoluce-notification-store-v1',
        partialize: (state) => ({
          rules: state.rules,
          notifications: state.notifications,
          unreadCount: state.unreadCount,
        }),
      }
    ),
    { name: 'vendorsoluce-notification-store-v1' }
  )
);
