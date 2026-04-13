import React from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { WR } from 'shared/constants/routes';
import { useAuth } from '../../context/AuthContext';
import { useAppStore } from '../../stores/appStore';

function formatBadgeCount(count: number) {
  if (count <= 0) return null;
  return count > 9 ? '9+' : String(count);
}

const NotificationsBell: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const storeCount = useAppStore((s) => (s as unknown as { unreadNotificationsCount?: number }).unreadNotificationsCount);
  const profileCount = (profile as unknown as { unread_notifications_count?: number })?.unread_notifications_count;

  const count =
    typeof storeCount === 'number'
      ? storeCount
      : typeof profileCount === 'number'
        ? profileCount
        : undefined;

  const badgeText = typeof count === 'number' ? formatBadgeCount(count) : null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => navigate(WR.NOTIFICATIONS)}
      aria-label="Notifications"
      title="Notifications"
    >
      <Bell className="h-5 w-5" aria-hidden />
      {badgeText && (
        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-600 text-white text-[10px] font-semibold flex items-center justify-center leading-none">
          {badgeText}
        </span>
      )}
    </Button>
  );
};

export default NotificationsBell;
