import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { Resend } from 'https://esm.sh/resend@3.4.0'

console.log('send-email-notification function booting...');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { record: notification } = await req.json()
    if (!notification || !notification.user_id) {
      throw new Error('Invalid notification data.');
    }
    console.log(`Processing notification type: ${notification.type} for user: ${notification.user_id}`);

    // 1. Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
      throw new Error('Missing environment variables.');
    }

    // 2. Initialize clients
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const resend = new Resend(resendApiKey);

    // --- 3. FETCH PREFERENCES (Query 1) ---
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('notify_comments, notify_announcements, notify_subscriptions')
      .eq('id', notification.user_id)
      .single();

    if (profileError || !profileData) {
      throw new Error(`Could not find profile for user: ${notification.user_id}. Error: ${profileError?.message}`);
    }

    // --- 4. PREFERENCE CHECK ---
    let shouldSendEmail = false;
    switch (notification.type) {
      case 'comment_reply':
        if (profileData.notify_comments) shouldSendEmail = true;
        break;
      case 'announcement':
        if (profileData.notify_announcements) shouldSendEmail = true;
        break;
      case 'subscription':
        if (profileData.notify_subscriptions) shouldSendEmail = true;
        break;
      default:
        shouldSendEmail = true; // Default to sending (e.g., Welcome Message)
    }

    if (!shouldSendEmail) {
      console.log(`User ${notification.user_id} has disabled emails for this type.`);
      return new Response(JSON.stringify({ message: 'Email not sent due to user preference.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      });
    }

    // --- 5. FETCH USER EMAIL (Query 2) ---
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      notification.user_id
    );
      
    if (userError) throw userError;
    if (!user || !user.user.email) {
      throw new Error(`Email not found for user: ${notification.user_id}`);
    }
    const userEmail = user.user.email;
    console.log(`User email found: ${userEmail}. Sending email...`);

    // --- 6. SEND THE EMAIL ---
    const { data, error } = await resend.emails.send({
      from: 'Lota Labs <onboarding@resend.dev>',
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

    if (error) throw error; // Throw Resend error

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