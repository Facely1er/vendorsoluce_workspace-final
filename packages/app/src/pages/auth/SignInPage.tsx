import React, { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Mail, Lock, AlertCircle, UserPlus, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';

const SignInPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(() => {
    // Check if we're on the signup route or ?mode=signup (e.g. from /trial)
    const params = new URLSearchParams(window.location.search);
    return window.location.pathname === '/signup' || params.get('mode') === 'signup';
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const fromCheckout = searchParams.get('from_checkout') === 'true';
  const checkoutSessionId = searchParams.get('session_id');
  const { signIn, signUp, resetPassword, authAvailable, isDemoMode, isAuthenticated, enterDemoMode } = useAuth();
  
  // Get the intended destination from the location state (pathname + search for checkout?plan=), or default to dashboard
  const fromState = (location.state as { from?: { pathname: string; search?: string } })?.from;
  const from = fromState ? fromState.pathname + (fromState.search || '') : '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegister) {
        // Handle registration
        if (!fullName.trim()) {
          setError('Please enter your full name');
          setIsLoading(false);
          return;
        }
        
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }

        if (password.length < 8) {
          setError('Password must be at least 8 characters long');
          setIsLoading(false);
          return;
        }

        if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
          setError('Password must contain at least one uppercase letter and one number');
          setIsLoading(false);
          return;
        }
        
        await signUp(email, password, fullName);
        if (fromCheckout && checkoutSessionId) {
          try {
            const { error } = await supabase.functions.invoke('link-checkout-session', {
              body: { sessionId: checkoutSessionId },
            });
            if (error) logger.error('Link checkout session:', error);
          } catch (linkErr) {
            logger.error('Link checkout session:', linkErr);
          }
        }
        navigate(from, { replace: true });
      } else {
        await signIn(email, password);
        if (fromCheckout && checkoutSessionId) {
          try {
            const { error } = await supabase.functions.invoke('link-checkout-session', {
              body: { sessionId: checkoutSessionId },
            });
            if (error) logger.error('Link checkout session:', error);
          } catch (linkErr) {
            logger.error('Link checkout session:', linkErr);
          }
        }
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      setError(isRegister ? 
        (err instanceof Error ? err.message : 'Registration failed. This email may already be in use.') :
        'Invalid email or password. Please try again.'
      );
      logger.error('Authentication error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsRegister(!isRegister);
    setShowForgotPassword(false);
    setError('');
    setSuccess('');
    // Update URL without triggering a navigation
    window.history.pushState({}, '', isRegister ? '/signin' : '/signup');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await resetPassword(email);
      setSuccess('Password reset email sent! Check your inbox for instructions.');
      setShowForgotPassword(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send password reset email. Please try again.');
      logger.error('Password reset error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center">
            <img src="/vendorsoluce.png" alt="VendorSoluce" className="w-12 h-12 object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {isRegister ? 'Create an Account' : 'Sign in to VendorSoluce\u2122'}
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isRegister 
              ? 'Join VendorSoluce to manage your supply chain security'
              : 'Enter your credentials to access your account'}
          </p>
        </CardHeader>
        <CardContent>
          {fromCheckout && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Payment successful.
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Sign in or create an account to access your subscription.
              </p>
            </div>
          )}
          {isDemoMode && !isAuthenticated && (
            <div className="mb-4 p-4 bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20 rounded-md border border-vendorsoluce-green/30">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Demo mode is enabled</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Sign in as demo user to access all pages for testing.</p>
              <Button
                type="button"
                variant="primary"
                className="w-full"
                onClick={() => enterDemoMode()}
              >
                Enter Demo Mode
              </Button>
            </div>
          )}
          {!authAvailable && !isDemoMode && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md flex items-start border border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-amber-800 dark:text-amber-200 text-sm">
                <p className="font-medium">Authentication is not configured</p>
                <p className="mt-1">Sign-in and account features are disabled. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable auth. The rest of the platform remains available.</p>
              </div>
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md flex items-start border border-red-200 dark:border-red-800">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
              <span className="text-red-600 dark:text-red-400 text-sm">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md flex items-start border border-green-200 dark:border-green-800">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0" />
              <span className="text-green-600 dark:text-green-400 text-sm">{success}</span>
            </div>
          )}
          
          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword}>
              <div className="mb-4">
                <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    id="resetEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-vendorsoluce-green"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2 mb-4"
                disabled={isLoading || !authAvailable}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setError('');
                  setSuccess('');
                }}
                className="w-full text-sm text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline"
              >
                Back to Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="mb-4">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <UserPlus className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-vendorsoluce-green"
                    placeholder="John Doe"
                    autoComplete="name"
                    required={isRegister}
                  />
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-vendorsoluce-green"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowForgotPassword(true);
                      setError('');
                      setSuccess('');
                    }}
                    className="text-sm text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </span>
                {isRegister ? (
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-vendorsoluce-green"
                    placeholder="********"
                    autoComplete="new-password"
                    required
                  />
                ) : (
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-vendorsoluce-green"
                    placeholder="********"
                    autoComplete="current-password"
                    required
                  />
                )}
              </div>
            </div>
            
            {isRegister && (
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4 mb-4">
                Must be 8+ characters with at least one uppercase letter and one number.
              </p>
            )}

            {isRegister && (
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-vendorsoluce-green"
                    placeholder="********"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
            )}
            
            <Button
              type="submit"
              variant="primary"
              className="w-full py-2"
              disabled={isLoading || !authAvailable}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isRegister ? 'Creating account...' : 'Signing in...'}
                </div>
              ) : (
                isRegister ? 'Create Account' : 'Sign in'
              )}
            </Button>
          </form>
          )}
          
          {!showForgotPassword && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={toggleAuthMode}
                className="text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline font-medium"
              >
                {isRegister ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;
