
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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Log the incoming request for debugging
    console.log('Received request to send-to-zapier with headers:', 
      JSON.stringify([...req.headers.entries()].reduce((obj, [key, val]) => {
        obj[key] = val;
        return obj;
      }, {})));

    // Get request body
    let userData;
    try {
      const body = await req.json();
      userData = body.userData;
      console.log('Request body:', JSON.stringify(body));
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request body format',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    if (!userData) {
      console.error('Missing userData in request body');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing userData in request body',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Get user from auth header if present
    let user = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      try {
        const { data, error } = await supabaseClient.auth.getUser(
          authHeader.replace('Bearer ', '')
        );
        
        if (error) {
          console.error('Error getting user:', error.message);
        } else if (data?.user) {
          user = data.user;
          console.log('Authenticated user:', user.id);
        }
      } catch (authError) {
        console.error('Auth error:', authError);
      }
    } else {
      console.log('No Authorization header present, proceeding with public access');
    }
    
    // Extract referral parameters if any
    const referralParams = userData.referralParams || {};
    
    // The fixed Zapier webhook URL
    const webhookUrl = 'https://hooks.zapier.com/hooks/catch/21954452/20avejv/';
    
    // Prepare data for Zapier webhook
    const payload = {
      user_id: user?.id || 'anonymous',
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      company: userData.company || null,
      password: userData.password || null, // Add password to the payload
      signup_date: new Date().toISOString(),
      ...referralParams, // Add all referral params to the payload
    };

    console.log('Sending webhook to Zapier with payload:', JSON.stringify(payload));

    // Log the webhook event in the database
    try {
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
      } else {
        console.log('Webhook event logged with ID:', eventData.id);
      }
    } catch (dbError) {
      console.error('Database error logging webhook event:', dbError);
    }

    // Send the data to Zapier
    try {
      console.log(`Sending POST request to ${webhookUrl}`);
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
        console.error(`Error from Zapier (${response.status}): ${responseText}`);
        throw new Error(`Error sending data to Zapier: ${responseText}`);
      }

      // Get the response data
      const responseData = await response.json().catch(() => ({}));
      console.log('Zapier response:', JSON.stringify(responseData));
      
      // Update the webhook event with the response data and status
      if (eventData?.id) {
        await supabaseClient
          .from('webhook_events')
          .update({
            status: 'success',
            response_data: responseData,
          })
          .eq('id', eventData.id);
      }

      // Return success response
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Data sent to Zapier successfully' 
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    } catch (fetchError) {
      console.error('Fetch error sending to Zapier:', fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error('Error in send-to-zapier function:', error);
    
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
