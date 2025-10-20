import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Welcome notification function starting up...');

Deno.serve(async (req) => {
  console.log('Received request for welcome notification:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { record: user } = await req.json() // Auth hook sends user data in 'record'

    if (!user || !user.id) {
      throw new Error('Invalid user data received.');
    }
    console.log('Processing welcome notification for user:', user.id);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables.');
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    console.log('Supabase admin client created.');

    // Prepare the welcome notification
    const welcomeNotification = {
      user_id: user.id,
      content: "Welcome to the IF/Platform! Check out the latest announcements.",
      link_url: '/announcements' 
    };
    console.log('Prepared welcome notification:', welcomeNotification);

    // Insert the notification
    const { error: insertError } = await supabaseAdmin
      .from('notifications')
      .insert(welcomeNotification);

    if (insertError) {
      console.error('Error inserting welcome notification:', insertError);
      throw insertError;
    }
    console.log('Successfully inserted welcome notification for user:', user.id);

    return new Response(JSON.stringify({ message: `Welcome notification created for user ${user.id}.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    })
  } catch (error) {
    console.error('*** Welcome notification function failed ***:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
    })
  }
})
