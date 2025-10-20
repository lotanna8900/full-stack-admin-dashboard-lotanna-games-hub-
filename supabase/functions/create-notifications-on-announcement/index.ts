import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Function starting up...'); // Log when the function instance starts

Deno.serve(async (req) => {
  console.log('Received request:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Log the raw request body text first
    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);
    
    // Now try to parse it as JSON
    const announcement = JSON.parse(rawBody); // Parse the raw text
    console.log('Parsed announcement data:', announcement);

    if (!announcement || !announcement.title) {
      throw new Error('Invalid announcement data received.');
    }

    // Ensure environment variables are loaded
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Missing Supabase environment variables.');
    }
    console.log('Supabase URL loaded.'); // Confirm URL is loaded

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    console.log('Supabase admin client created.');

    // 1. Get user IDs
    console.log('Fetching user profiles...');
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }
    console.log(`Found ${profiles.length} profiles to notify.`);

    if (profiles.length === 0) {
      console.log('No profiles found, skipping notification creation.');
      return new Response(JSON.stringify({ message: 'No users to notify.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      });
    }

    // 2. Prepare notifications
    const notificationsToInsert = profiles.map((profile) => ({
      user_id: profile.id,
      content: `New announcement posted: "${announcement.title}"`,
      link_url: '/announcements' 
    }));
    console.log('Prepared notifications:', notificationsToInsert);

    // 3. Insert notifications
    console.log('Inserting notifications into database...');
    const { error: notificationsError } = await supabaseAdmin
      .from('notifications')
      .insert(notificationsToInsert);

    if (notificationsError) {
      console.error('Error inserting notifications:', notificationsError);
      throw notificationsError;
    }
    console.log('Successfully inserted notifications.');

    return new Response(JSON.stringify({ message: `Created ${notificationsToInsert.length} notifications.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    })
  } catch (error) {
    console.error('*** Function execution failed ***:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
    })
  }
})