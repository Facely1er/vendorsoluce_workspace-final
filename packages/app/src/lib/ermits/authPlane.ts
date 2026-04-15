import type { SupabaseClient } from '@supabase/supabase-js';

export function createErmitsAuthPlane(client: SupabaseClient) {
  async function sendMagicLink(email: string, redirectTo: string, allowSignup = false) {
    const { error } = await client.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: allowSignup,
        emailRedirectTo: redirectTo,
      },
    });
    if (error) throw error;
  }

  async function signOut() {
    const { error } = await client.auth.signOut();
    if (error) throw error;
  }

  async function bootstrapProfile(userId: string, email: string) {
    const { error } = await client.from('ermits_profiles').upsert(
      { id: userId, email, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    );
    if (error) throw error;
  }

  return { sendMagicLink, signOut, bootstrapProfile };
}
