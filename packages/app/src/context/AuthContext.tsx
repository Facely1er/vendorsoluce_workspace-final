import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseEnabled } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Profile } from '../types';
import { setUserContext, clearUserContext, addBreadcrumb } from '../utils/sentry';
import { logger } from '../utils/logger';
import { config } from '../utils/config';
import type { Database } from '../lib/database.types';

const DEMO_USER_ID = 'demo-user-00000000-0000-0000-0000-000000000001';
const LOCAL_USER_ID = 'local-workspace-user-00000000-0000-0000-0000-000000000001';

const createDemoUser = (): User =>
  ({
    id: DEMO_USER_ID,
    email: 'demo@vendorsoluce.com',
    user_metadata: {},
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  }) as User;

const createDemoProfile = (): Profile => ({
  id: DEMO_USER_ID,
  email: 'demo@vendorsoluce.com',
  full_name: '',
  role: 'admin',
  is_first_login: false,
});

const createLocalWorkspaceUser = (): User =>
  ({
    id: LOCAL_USER_ID,
    email: 'local@vendorsoluce.local',
    user_metadata: { organization_name: '' },
    app_metadata: { provider: 'local' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  }) as User;

const createLocalWorkspaceProfile = (): Profile => ({
  id: LOCAL_USER_ID,
  email: 'local@vendorsoluce.local',
  full_name: '',
  company: '',
  role: 'workspace_admin',
  is_first_login: false,
});

type ProfileInsert = Database['public']['Tables']['vs_profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['vs_profiles']['Update'];

const AUTH_NOT_CONFIGURED_MSG =
  'Authentication is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to sign in.';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** False when Supabase is not configured; auth actions will throw a friendly error. */
  authAvailable: boolean;
  /** True when VITE_DEMO_MODE is enabled (bypasses real auth) */
  isDemoMode: boolean;
  /** True when Supabase is not configured and not in demo mode — local browser-only session */
  isLocalWorkspaceMode: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  /** In demo mode: signs in as demo user without Supabase */
  enterDemoMode: () => void;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  markOnboardingComplete: (profileData?: {
    role?: string;
    company_size?: string;
    industry?: string;
  }) => Promise<void>;
   markTourComplete: () => Promise<void>;
   startTour: () => void;
   isTourRunning: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isDemoMode = config.app.demoMode;
  const isLocalWorkspaceMode = !isDemoMode && !isSupabaseEnabled();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
   const [isTourRunning, setIsTourRunning] = useState(false);
  const navigate = useNavigate();

  const enterDemoMode = useCallback(() => {
    setUser(createDemoUser());
    setProfile(createDemoProfile());
    setUserContext({ id: DEMO_USER_ID, email: 'demo@vendorsoluce.com' });
    addBreadcrumb({ message: 'Entered demo mode', category: 'auth', level: 'info' });
    navigate('/dashboard');
  }, [navigate]);

  const fetchProfile = useCallback(async (userId: string) => {
    if (!isSupabaseEnabled()) return;
    try {
      const { data: profileData, error } = await supabase
        .from('vs_profiles')
        .select('*')
        .eq('id', userId);

      // 401 / JWT expired or invalid: clear profile and avoid retries
      if (error) {
        const status = (error as { status?: number })?.status;
        if (status === 401 || (error as { code?: string })?.code === 'PGRST301') {
          setProfile(null);
          logger.warn('Profile fetch unauthorized; session may be expired.');
          return;
        }
        throw error;
      }

      // If no profile exists, create one
      if (!profileData || profileData.length === 0) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: newProfile, error: createError } = await (supabase
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase type workaround
            .from('vs_profiles') as any
            )
            .insert([
              {
                id: userId,
                email: user.email || '',
                full_name: user.user_metadata?.full_name || '',
                is_first_login: true,
              } as ProfileInsert,
            ])
            .select()
            .single();

          if (createError) {
            if ((createError as { status?: number })?.status === 401) {
              setProfile(null);
              return;
            }
            throw createError;
          }
          const profile = newProfile as Profile;
          setProfile(profile);

          // New user should go to onboarding
          if (profile?.is_first_login) {
            navigate('/onboarding');
          }
        }
      } else {
        const profile = profileData[0] as Profile;
        setProfile(profile);

        // Check if this is the first login
        if (profile?.is_first_login) {
          navigate('/onboarding');
        }
      }
    } catch (error) {
      logger.error('Error fetching profile:', error);
    }
  }, [navigate]);

  useEffect(() => {
    if (isDemoMode) {
      // Demo mode: auto-login as demo user, skip Supabase
      setUser(createDemoUser());
      setProfile(createDemoProfile());
      setUserContext({ id: DEMO_USER_ID, email: 'demo@vendorsoluce.com' });
      addBreadcrumb({ message: 'Demo mode active', category: 'auth', level: 'info' });
      setIsLoading(false);
      return;
    }

    if (isLocalWorkspaceMode) {
      setUser(createLocalWorkspaceUser());
      setProfile(createLocalWorkspaceProfile());
      setUserContext({ id: LOCAL_USER_ID, email: 'local@vendorsoluce.local' });
      addBreadcrumb({ message: 'Local workspace mode active', category: 'auth', level: 'info' });
      setIsLoading(false);
      return;
    }

    // Check active session; use getUser() to refresh token and avoid 401 from stale session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          fetchProfile(user.id);
          setUserContext({ id: user.id, email: user.email });
          addBreadcrumb({ message: 'User session restored', category: 'auth', level: 'info' });
        } else {
          setUser(null);
          setProfile(null);
          clearUserContext();
        }
      } else {
        setUser(null);
        clearUserContext();
      }
      setIsLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      // Handle email verification
      if (event === 'SIGNED_IN' && session?.user && !session.user.email_confirmed_at) {
        // User signed in but email not verified
        addBreadcrumb({ message: 'User signed in but email not verified', category: 'auth', level: 'warning' });
      }
      
      // Handle password recovery
      if (event === 'PASSWORD_RECOVERY') {
        addBreadcrumb({ message: 'Password recovery initiated', category: 'auth', level: 'info' });
        // User will be redirected to reset password page via URL params
      }
      
      if (session?.user) {
        fetchProfile(session.user.id);
        // Set user context in Sentry
        setUserContext({
          id: session.user.id,
          email: session.user.email,
        });
        addBreadcrumb({ message: `User ${event}`, category: 'auth', level: 'info' });
      } else {
        setProfile(null);
        clearUserContext();
        addBreadcrumb({ message: 'User signed out', category: 'auth', level: 'info' });
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, isDemoMode, isLocalWorkspaceMode]);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseEnabled()) throw new Error(AUTH_NOT_CONFIGURED_MSG);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseEnabled()) throw new Error(AUTH_NOT_CONFIGURED_MSG);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) throw error;

    // Create profile only when we have a session (e.g. email confirmation disabled).
    // If email confirmation is required, data.session is null and RLS would return 401;
    // the profile will be created on first sign-in in fetchProfile.
    if (data.user && data.session) {
      const { error: profileError } = await (supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase type workaround
        .from('vs_profiles') as any
        )
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            is_first_login: true,
            subscription_tier: 'free',
          } as ProfileInsert,
        ]);

      if (profileError) throw profileError;
    }
  };

  const logout = async () => {
    if (isDemoMode) {
      setUser(null);
      setProfile(null);
      clearUserContext();
      navigate('/');
      return;
    }
    if (isLocalWorkspaceMode) {
      setUser(createLocalWorkspaceUser());
      setProfile(createLocalWorkspaceProfile());
      navigate('/workspace/vendors');
      return;
    }
    if (!isSupabaseEnabled()) {
      setUser(null);
      setProfile(null);
      navigate('/');
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    navigate('/');
  };
  
  const signOut = logout; // Alias for backward compatibility

  const resetPassword = async (email: string) => {
    if (!isSupabaseEnabled()) throw new Error(AUTH_NOT_CONFIGURED_MSG);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    if (!isSupabaseEnabled()) throw new Error(AUTH_NOT_CONFIGURED_MSG);
    if (!user) throw new Error('User must be authenticated to update password');

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  };

  const resendVerificationEmail = async () => {
    if (!isSupabaseEnabled()) throw new Error(AUTH_NOT_CONFIGURED_MSG);
    if (!user?.email) throw new Error('User email not found');

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
    });

    if (error) throw error;
  };

  const markOnboardingComplete = async (profileData?: {
    role?: string;
    company_size?: string;
    industry?: string;
  }) => {
    if (!user) return;

    if (isDemoMode) {
      const updateData: Partial<Profile> = { is_first_login: false, ...profileData };
      setProfile((prev: Profile | null) => prev ? ({ ...prev, ...updateData }) : null);
      navigate('/dashboard');
      return;
    }

    if (!isSupabaseEnabled()) return;

    try {
      const updateData: Partial<Profile> = { is_first_login: false };
      
      // Add profile data if provided
      if (profileData) {
        if (profileData.role) updateData.role = profileData.role;
        if (profileData.company_size) updateData.company_size = profileData.company_size;
        if (profileData.industry) updateData.industry = profileData.industry;
      }
      
      const { error } = await (supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase type workaround
        .from('vs_profiles') as any
        )
        .update(updateData as ProfileUpdate)
        .eq('id', user.id);

      if (error) throw error;

      // Update local profile state
      setProfile((prev: Profile | null) => prev ? ({ ...prev, ...updateData }) : null);

      // Navigate to dashboard after onboarding
      navigate('/dashboard');
    } catch (error) {
      logger.error('Error marking onboarding complete:', error);
    }
  };

   const markTourComplete = async () => {
     if (!user) return;

     if (isDemoMode) {
       setProfile((prev: Profile | null) => prev ? ({ ...prev, tour_completed: true }) : null);
       setIsTourRunning(false);
       return;
     }
 
     if (!isSupabaseEnabled()) return;
 
     try {
       const { error } = await (supabase
         // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase type workaround
         .from('vs_profiles') as any
         )
         .update({ tour_completed: true } as ProfileUpdate)
         .eq('id', user.id);
 
       if (error) throw error;
 
       // Update local profile state
       setProfile((prev: Profile | null) => prev ? ({ ...prev, tour_completed: true }) : null);
       setIsTourRunning(false);
     } catch (error) {
       logger.error('Error marking tour complete:', error);
     }
   };
 
   const startTour = () => {
     setIsTourRunning(true);
   };
  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    authAvailable: isSupabaseEnabled() || isDemoMode || isLocalWorkspaceMode,
    isDemoMode,
    isLocalWorkspaceMode,
    signIn,
    signUp,
    signOut,
    logout,
    enterDemoMode,
    resetPassword,
    updatePassword,
    resendVerificationEmail,
    markOnboardingComplete,
     markTourComplete,
     startTour,
     isTourRunning,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}