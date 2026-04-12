import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationManager from '../../components/common/NotificationManager';
import PlatformLanding from '../../components/home/PlatformLanding';

/**
 * Platform root. Continuation from the website (no duplicate content):
 * - Authenticated: redirect to dashboard.
 * - Not authenticated: minimal landing — sign in, get started, try assessment; learn more on website.
 */
const HomePage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <>
        <NotificationManager />
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-vendorsoluce-green" />
        </div>
      </>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <NotificationManager />
      <PlatformLanding />
    </>
  );
};

export default HomePage;