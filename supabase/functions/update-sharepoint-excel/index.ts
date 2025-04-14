
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

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
    // Get data from request body
    const { userData } = await req.json();
    
    // Extract referral parameters if any
    const referralParams = userData.referralParams || {};
    
    // Log the data that would be sent to SharePoint Excel
    console.log('User data for SharePoint Excel:', {
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      company: userData.company || null,
      signup_date: new Date().toISOString(),
      ...referralParams // Add all referral params to the payload
    });
    
    // For now, just simulate the update
    // In a real implementation, you would add code to update the SharePoint Excel document here
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'SharePoint Excel update triggered successfully (simulation)'
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in update-sharepoint-excel function:', error);
    
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
