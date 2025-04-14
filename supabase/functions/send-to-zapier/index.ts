
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.20.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    // Get the user from the auth header
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Error getting user or user not found');
    }

    // Get data from request body
    const { userData } = await req.json();
    
    // The fixed Zapier webhook URL
    const webhookUrl = 'https://hooks.zapier.com/hooks/catch/21954452/20avejv/';
    
    // Extract referral parameters if any
    const referralParams = userData.referralParams || {};
    
    // Prepare data for Zapier webhook
    const payload = {
      user_id: user.id,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      company: userData.company || null,
      signup_date: new Date().toISOString(),
      ...referralParams, // Add all referral params to the payload
    };

    console.log('Sending webhook to Zapier with payload:', payload);

    // Log the webhook event in the database
    const { data: eventData, error: eventError } = await supabaseClient
      .from('webhook_events')
      .insert({
        event_type: 'user_signup',
        payload,
        webhook_url: webhookUrl,
      })
      .select('id')
      .single();

    if (eventError) {
      console.error('Error logging webhook event:', eventError);
      throw new Error('Error logging webhook event');
    }

    // Send the data to Zapier
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Check if the request was successful
    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`Error sending data to Zapier: ${responseText}`);
    }

    // Get the response data
    const responseData = await response.json().catch(() => ({}));
    
    // Update the webhook event with the response data and status
    await supabaseClient
      .from('webhook_events')
      .update({
        status: 'success',
        response_data: responseData,
      })
      .eq('id', eventData.id);

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: 'Data sent to Zapier successfully' }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in send-to-zapier function:', error);
    
    // Update webhook event with error status if possible
    // (not critical if this fails)
    
    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
