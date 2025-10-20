import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Notify subscribers function starting...');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { record: updatedContent, table } = await req.json() // Trigger sends the updated row ('record') and table name

    if (!updatedContent || !updatedContent.id || !table) {
      throw new Error('Invalid update data received.');
    }
    console.log(`Processing update for table '${table}', ID: ${updatedContent.id}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) throw new Error('Missing Supabase env vars.');

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    console.log('Admin client created.');

    // Determine which column to filter subscriptions by
    const contentIdColumn = table === 'posts' ? 'post_id' : (table === 'projects' ? 'project_id' : null);
    if (!contentIdColumn) {
       console.log(`Table '${table}' is not configured for subscriptions.`);
       return new Response(JSON.stringify({ message: `No subscriptions for table ${table}.` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    // 1. Find all my users subscribed to this content
    console.log(`Fetching subscribers for ${contentIdColumn} = ${updatedContent.id}`);
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id')
      .eq(contentIdColumn, updatedContent.id);

    if (subError) throw subError;
    if (!subscriptions || subscriptions.length === 0) {
      console.log('No subscribers found for this content.');
      return new Response(JSON.stringify({ message: 'No subscribers found.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }
    console.log(`Found ${subscriptions.length} subscribers.`);

    // 2. Prepare notifications
    const contentType = table === 'posts' ? 'post' : 'project';
    const sectionPath = contentType === 'post' ? 'blog' : 'projects'; // Determine section name

    const notificationsToInsert = subscriptions.map(sub => ({
      user_id: sub.user_id,
      content: `The ${contentType} "${updatedContent.title}" you subscribed to has been updated!`,
      // UPDATED: Add content ID to the link
      link_url: `/${sectionPath}?${contentType}=${updatedContent.id}` // e.g., /blog?post=uuid or /projects?project=int
    }));
    console.log('Prepared notifications:', notificationsToInsert);

    // 3. Insert notifications
    const { error: insertError } = await supabaseAdmin
      .from('notifications')
      .insert(notificationsToInsert);

    if (insertError) throw insertError;
    console.log('Successfully inserted subscriber notifications.');

    return new Response(JSON.stringify({ message: `Created ${notificationsToInsert.length} subscriber notifications.` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })

  } catch (error) {
    console.error('*** Notify subscribers function failed ***:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})