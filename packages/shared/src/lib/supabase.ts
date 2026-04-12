import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { config } from '../utils/config';

const NOT_CONFIGURED_MSG =
  'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for auth and data.';

function createStubClient(): SupabaseClient<Database> {
  const noopUnsubscribe = () => {};
  const rejectError = () => Promise.resolve({ data: null, error: { message: NOT_CONFIGURED_MSG } });
  const emptySession = () => Promise.resolve({ data: { session: null }, error: null });
  const emptyUser = () => Promise.resolve({ data: { user: null }, error: null });

  const errResult = { data: null, error: { message: NOT_CONFIGURED_MSG } };
  const stubChain: Record<string, unknown> = {
    select: () => stubChain,
    insert: () => stubChain,
    update: () => stubChain,
    eq: () => stubChain,
    single: () => stubChain,
  };
  stubChain.then = (resolve: (v: typeof errResult) => void) => {
    resolve(errResult);
    return Promise.resolve(errResult);
  };
  stubChain.catch = () => Promise.resolve(errResult);

  const from = () => stubChain;

  const storageStub = {
    from: () => ({
      getPublicUrl: (_path: string) => ({ data: { publicUrl: '' } }),
      download: () => Promise.resolve({ data: null, error: { message: NOT_CONFIGURED_MSG } }),
      list: () => Promise.resolve({ data: null, error: { message: NOT_CONFIGURED_MSG } }),
      upload: () => Promise.resolve({ data: null, error: { message: NOT_CONFIGURED_MSG } }),
    }),
  };

  const authStub = {
    getSession: emptySession,
    getUser: emptyUser,
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: noopUnsubscribe } } }),
    signInWithPassword: () => rejectError(),
    signUp: () => rejectError(),
    signOut: () => rejectError(),
    resetPasswordForEmail: () => rejectError(),
    updateUser: () => rejectError(),
    resend: () => rejectError(),
  };

  const functionsStub = {
    invoke: () => rejectError(),
  };

  return {
    auth: authStub,
    from,
    storage: storageStub,
    functions: functionsStub,
  } as unknown as SupabaseClient<Database>;
}

function createRealClient(): SupabaseClient<Database> {
  const url = config.supabase.url;
  const anonKey = config.supabase.anonKey;
  return createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    global: {
      headers: {
        'X-Client-Info': `${config.app.name}-web@${config.app.version}`,
      },
    },
    db: {
      schema: 'public',
    },
  });
}

/** Supabase client. When Supabase is not configured, this is a stub that returns no session and errors on data operations. */
export const supabase: SupabaseClient<Database> = config.supabase.enabled
  ? createRealClient()
  : createStubClient();

/** Use this to guard features that require Supabase (auth, storage, DB). */
export const isSupabaseEnabled = (): boolean => config.supabase.enabled;
