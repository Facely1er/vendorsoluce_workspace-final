import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageLoader from '../../components/common/PageLoader';
import { MR } from 'shared/constants/routes';

export default function ErmitsAuthCallbackPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) navigate(MR.DASHBOARD, { replace: true });
    else navigate('/signin', { replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <PageLoader message="Confirming your login…" />
    </div>
  );
}
