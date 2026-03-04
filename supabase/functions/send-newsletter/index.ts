import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { Resend } from 'https://esm.sh/resend@3.2.0'

console.log('Send Newsletter function starting...');

const resendApiKey = Deno.env.get('RESEND_API_KEY');
if (!resendApiKey) {
  console.warn('RESEND_API_KEY is not set. Emails will not be sent.');
}
const resend = new Resend(resendApiKey);
const fromEmail = 'Lota Labs <noreply@lotalabs.com>';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { subject, html_content } = await req.json()
    if (!subject || !html_content) {
      throw new Error('Missing required fields: subject and html_content are needed.')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) throw new Error('Missing Supabase env vars.');

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    console.log('Admin client created.');

    console.log('Fetching newsletter subscribers...');
    const { data: subscribers, error: subsError } = await supabaseAdmin
      .from('profiles')
      .select('id') 
      .eq('email_on_newsletter', true) 

    if (subsError) throw subsError;
    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscribers to send to.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    console.log(`Found ${subscribers.length} subscribers. Preparing emails...`);

    const emailSendPromises = []; 

    for (const sub of subscribers) {
      const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(sub.id);

      if (userError || !user?.user?.email) {
        console.warn(`Could not find email for user ${sub.id}. Skipping.`);
        continue; 
      }

      const userEmail = user.user.email;

      const emailPayload = {
        from: fromEmail,
        to: userEmail,
        subject: subject,
        html: html_content, 
      };

      emailSendPromises.push(
        resend.emails.send(emailPayload)
      );
    }

    const emailResults = await Promise.allSettled(emailSendPromises);
    emailResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to send email to user ${subscribers[index].id}:`, result.reason);
      }
    });

    const successfulEmails = emailResults.filter(r => r.status === 'fulfilled').length;

    return new Response(JSON.stringify({ 
      message: `Successfully sent ${successfulEmails} of ${emailSendPromises.length} newsletter emails.` 
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })

  } catch (error) {
    console.error('*** Send Newsletter function failed ***:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})