import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Import Resend. Note: Deno uses URL imports.
import { Resend } from 'https://esm.sh/resend@3.4.0'

console.log('send-email-notification function booting...');

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the new notification record from the trigger's payload
    const { record: notification } = await req.json()
    console.log('Processing notification:', notification.id);

    if (!notification || !notification.user_id) {
      throw new Error('Invalid notification data received.');
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY'); // Get our new secret

    if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
        throw new Error('Missing environment variables (URL, Service Key, or Resend Key).');
    }

    // Initialize clients
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const resend = new Resend(resendApiKey);
    console.log('Clients initialized.');

    // Fetch the user's email address from the auth.users table
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      notification.user_id
    )

    if (userError) throw userError;
    if (!user || !user.user.email) {
      throw new Error(`User profile not found or has no email: ${notification.user_id}`);
    }

    const userEmail = user.user.email;
    console.log(`Found user email: ${userEmail}`);

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Lota Labs <onboarding@resend.dev>', // Test "From" address
      to: [userEmail],
      subject: 'You have a new notification on Lota Labs!',
      html: `
        <div>
          <p>Hi there,</p>
          <p>${notification.content}</p>
          ${notification.link_url ? `<p><a href="https://full-stack-admin-dashboard-lotanna-three.vercel.app${notification.link_url}">View it on the site</a></p>` : ''}
          <br>
          <p><small>You received this because you are a member of Lota Labs.</small></p>
        </div>
      `,
    });

    if (error) throw error;

    console.log('Email sent successfully:', data.id);
    return new Response(JSON.stringify({ message: `Email sent to ${userEmail}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    })

  } catch (error) {
    console.error('*** Function execution failed ***:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
    })
  }
})