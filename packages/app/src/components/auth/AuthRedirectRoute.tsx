import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AR } from 'shared/constants/routes';

interface AuthRedirectRouteProps {
  authenticatedPath: string;
}

export function AuthRedirectRoute({ authenticatedPath }: AuthRedirectRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // While auth state is loading, render nothing to avoid flash
  if (isLoading) return null;

  // Authenticated: send to workspace path
  if (user) return <Navigate to={authenticatedPath} replace />;

  // Unauthenticated: send to sign-in with return URL encoded
  const returnUrl = encodeURIComponent(authenticatedPath);
  return <Navigate to={`${AR.SIGN_IN}?return=${returnUrl}`} replace state={{ from: location }} />;
}

