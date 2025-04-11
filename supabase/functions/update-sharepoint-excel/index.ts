
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userData } = await req.json();
    console.log("Received user data:", userData);

    // We need Microsoft Graph API credentials to update SharePoint Excel files
    // For now, we'll mock the API call and log the attempt
    console.log(`Would update SharePoint Excel with: 
      First Name: ${userData.firstName || 'N/A'}, 
      Last Name: ${userData.lastName || 'N/A'},
      Email: ${userData.email || 'N/A'},
      Company: ${userData.company || 'N/A'}`);

    // In a full implementation, we would:
    // 1. Authenticate with Microsoft Graph API using OAuth
    // 2. Use the Excel API to append a row to the spreadsheet
    // This requires Microsoft app registration and proper permissions

    return new Response(
      JSON.stringify({ success: true, message: "Data logged for SharePoint Excel update" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
