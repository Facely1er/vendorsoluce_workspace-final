declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/** Primary and fallback contact recipients — ensure no lead is lost */
const CONTACT_EMAILS = ['contact@ermits.com', 'support@ermits.com'];
const EMAIL_FROM = 'VendorSoluce Contact <noreply@vendorsoluce.com>';

async function sendContactEmail(payload: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string | null;
  topic: string | null;
  message: string;
}): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY') || Deno.env.get('EMAIL_API_KEY');
  if (!apiKey) {
    console.warn('RESEND_API_KEY/EMAIL_API_KEY not set; contact email skipped. Add to Supabase Edge Function secrets.');
    return;
  }

  const fullName = [payload.firstName, payload.lastName].filter(Boolean).join(' ') || 'Contact Form';
  const subject = `VendorSoluce Contact: ${payload.topic || 'General'} from ${fullName}`;
  const html = `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${fullName}</p>
<p><strong>Email:</strong> <a href="mailto:${payload.email}">${payload.email}</a></p>
<p><strong>Phone:</strong> ${payload.phone || '-'}</p>
<p><strong>Company:</strong> ${payload.company || '-'}</p>
<p><strong>Topic:</strong> ${payload.topic || '-'}</p>
<p><strong>Message:</strong></p>
<pre>${payload.message.replace(/</g, '&lt;')}</pre>
<hr><p><small>VendorSoluce Contact Form</small></p>
  `.trim();

  for (const to of CONTACT_EMAILS) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: Deno.env.get('EMAIL_FROM') || EMAIL_FROM,
          to,
          subject,
          html,
        }),
      });
      if (res.ok) {
        console.log(`Contact email sent to ${to}`);
        return;
      }
      const err = await res.text();
      console.error(`Resend failed for ${to}:`, err);
    } catch (e) {
      console.error(`Error sending to ${to}:`, e);
    }
  }
  console.error('All contact email attempts failed');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Import Supabase client
    // @ts-expect-error - Dynamic import for Supabase client in Edge Functions
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get request body with error handling
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    const { firstName, lastName, name, email, phone, company, topic, message, request_type } = requestBody;

    // Support topic and request_type (static website form)
    const topicVal = topic || request_type || null;

    // Support both full name (firstName+lastName) and simple name field for static sites
    const firstNameVal = firstName ?? (name ? (String(name).trim().split(/\s+/)[0] || '') : '');
    const lastNameVal = lastName ?? (name ? (String(name).trim().split(/\s+/).slice(1).join(' ') || '') : '');

    // Validate required fields (email and message required; name can be split)
    if (!email || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email and message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert contact submission into database (use vs_contact_submissions for VendorSoluce schema)
    const { data, error } = await supabaseClient
      .from('vs_contact_submissions')
      .insert({
        first_name: firstNameVal || 'Contact',
        last_name: lastNameVal || 'Form',
        email,
        phone: phone || null,
        company: company || null,
        topic: topicVal,
        message,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save contact submission',
          details: error.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send email to contact@ermits.com (and fallback) — non-blocking; DB is source of truth
    const emailPayload = {
      firstName: firstNameVal || 'Contact',
      lastName: lastNameVal || 'Form',
      email,
      phone: phone || null,
      company: company || null,
      topic: topicVal,
      message,
    };
    sendContactEmail(emailPayload).catch((e) => console.error('Contact email error:', e));

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contact form submitted successfully',
        id: data.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})