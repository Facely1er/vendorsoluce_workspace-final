// Add to Nurture Edge Function
// Adds a contact to a marketing nurture sequence via the process-marketing-workflows function.
// This is a thin wrapper that records the lead in vs_contact_submissions and triggers
// the marketing automation workflow if configured.

declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void;
  env: { get: (key: string) => string | undefined };
};

// @ts-expect-error - Deno imports are resolved at runtime
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
// @ts-expect-error - Deno imports are resolved at runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, campaign, metadata } = await req.json();

    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing required field: email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Record the lead in contact submissions for CRM / reporting purposes.
    const { error: insertError } = await supabase
      .from('vs_contact_submissions')
      .insert({
        email,
        topic: campaign ?? 'nurture',
        message: JSON.stringify({ campaign, metadata }),
        first_name: '',
        last_name: '',
      });

    if (insertError) {
      console.warn('Could not insert contact submission:', insertError.message);
    }

    // Optionally trigger the broader marketing workflows function.
    const workflowsUrl = `${supabaseUrl}/functions/v1/process-marketing-workflows`;
    await fetch(workflowsUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, campaign, metadata }),
    }).catch((e) => console.warn('Marketing workflow trigger failed (non-fatal):', e));

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (error) {
    console.error('Error in add-to-nurture:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    );
  }
});
