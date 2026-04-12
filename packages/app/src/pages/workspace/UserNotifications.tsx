import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Settings, Check, X, Clock, AlertTriangle, Info, Shield, Target, FileText, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import WorkspacePageShell from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
import PanelCard from '../../components/vendorsoluce-intelligence/PanelCard';
import EmptyState from '../../components/vendorsoluce-intelligence/EmptyState';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'vendor' | 'assessment' | 'security' | 'system';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

const UserNotifications: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Critical Vulnerability Detected', message: 'High-severity vulnerability found in React component used by TechCorp Solutions', type: 'error', category: 'security', timestamp: '2025-01-17T10:30:00Z', read: false, actionUrl: '/vendors' },
    { id: '2', title: 'Vendor Assessment Overdue', message: 'CloudSecure Inc assessment is 3 days overdue. Please follow up.', type: 'warning', category: 'vendor', timestamp: '2025-01-16T14:15:00Z', read: false, actionUrl: '/vendor-assessments' },
    { id: '3', title: 'Assessment Completed', message: 'Your NIST SP 800-161 supply chain assessment has been completed with a score of 78%', type: 'success', category: 'assessment', timestamp: '2025-01-15T16:45:00Z', read: true, actionUrl: '/supply-chain-results' },
    { id: '4', title: 'New Vendor Added', message: 'DevTools Pro has been successfully added to your vendor portfolio', type: 'info', category: 'vendor', timestamp: '2025-01-14T09:20:00Z', read: true },
    { id: '5', title: 'Security Settings Updated', message: 'Two-factor authentication has been enabled for your account', type: 'success', category: 'security', timestamp: '2025-01-13T11:30:00Z', read: true },
    { id: '6', title: 'System Maintenance Scheduled', message: 'Scheduled maintenance on January 20th from 2:00 AM to 4:00 AM EST', type: 'info', category: 'system', timestamp: '2025-01-12T08:00:00Z', read: false },
  ]);

  const getNotificationIcon = (type: string, category: string) => {
    if (type === 'error') return <AlertTriangle className="h-5 w-5 text-red-500" />;
    if (type === 'warning') return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    if (type === 'success') return <Check className="h-5 w-5 text-green-500" />;
    switch (category) {
      case 'vendor': return <Target className="h-5 w-5 text-blue-500" />;
      case 'assessment': return <FileText className="h-5 w-5 text-purple-500" />;
      case 'security': return <Shield className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'success': return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      default: return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = (id: string) => setNotifications((prev) => prev.map((notif) => notif.id === id ? { ...notif, read: true } : notif));
  const markAllAsRead = () => setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  const deleteNotification = (id: string) => setNotifications((prev) => prev.filter((notif) => notif.id !== id));

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.category === filter;
  });
  const unreadCount = notifications.filter((n) => !n.read).length;
  const filterOptions = [
    { value: 'all', label: 'All notifications' },
    { value: 'unread', label: 'Unread' },
    { value: 'vendor', label: 'Vendor management' },
    { value: 'assessment', label: 'Assessments' },
    { value: 'security', label: 'Security' },
    { value: 'system', label: 'System' },
  ];

  return (
    <WorkspacePageShell
      eyebrow="Workspace administration"
      title="Notifications"
      description="Review alerts, updates, and workflow notifications in one consistent operational inbox."
      actions={[{ label: 'Mark all read', onClick: markAllAsRead, variant: 'outline' }, { label: 'Notification settings', to: '/account', variant: 'outline' }]}
      stats={[{ label: 'Unread', value: unreadCount, hint: 'Pending review' }, { label: 'Visible', value: filteredNotifications.length, hint: 'Current filter result' }]}
    >
      <PanelCard title={<span className="flex items-center gap-2"><Filter className="h-4 w-4" /> Notification filters</span>} description="Filter the inbox without changing page layout or losing the operational context.">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          aria-label="Filter notifications"
        >
          {filterOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </PanelCard>

      {filteredNotifications.length === 0 ? (
        <EmptyState icon="bell" title="No notifications found" description={filter === 'unread' ? 'All caught up. There are no unread notifications in the current view.' : 'You will see new alerts, assessments, and system events here as they arrive.'} />
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div key={notification.id} className={`rounded-2xl border border-gray-200/70 border-l-4 shadow-sm dark:border-gray-800 ${getNotificationColor(notification.type)} ${!notification.read ? 'ring-2 ring-blue-100 dark:ring-blue-900/20' : ''}`}>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex flex-1 items-start space-x-3">
                    <div className="mt-1 flex-shrink-0">{getNotificationIcon(notification.type, notification.category)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{notification.title}</h3>
                        {!notification.read ? <div className="h-2 w-2 rounded-full bg-blue-500" /> : null}
                      </div>
                      <p className={`mt-1 text-sm ${!notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600 dark:text-gray-400'}`}>{notification.message}</p>
                      <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400"><Clock className="mr-1 h-3 w-3" />{formatTimestamp(notification.timestamp)}</div>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    {notification.actionUrl ? <Link to={notification.actionUrl}><Button variant="outline" size="sm">View</Button></Link> : null}
                    {!notification.read ? <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}><Check className="h-4 w-4" /></Button> : null}
                    <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)}><X className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PanelCard title="Notification preferences" description="Customize when and how you receive notifications without leaving the structured workspace shell.">
        <p className="mb-4 text-sm leading-6 text-gray-600 dark:text-gray-300">Customize when and how you receive notifications to stay informed without being overwhelmed.</p>
        <Link to="/account"><Button variant="primary"><Settings className="mr-2 h-4 w-4" />Manage notification settings</Button></Link>
      </PanelCard>
    </WorkspacePageShell>
  );
};

export default UserNotifications;
