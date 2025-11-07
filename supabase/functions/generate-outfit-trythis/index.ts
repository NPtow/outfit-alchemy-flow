import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { userId } = await req.json();
    
    console.log(`🔑 Generating outfit for user: ${userId || 'anonymous'}`);

    // Get Try-This API token
    const TRYTHIS_API_TOKEN = Deno.env.get('TRYTHIS_API_TOKEN');
    if (!TRYTHIS_API_TOKEN) {
      throw new Error('TRYTHIS_API_TOKEN not configured');
    }

    // Call Try-This API with POST request (GET cannot have body)
    console.log('📞 Calling Try-This API...');
    const trythisResponse = await fetch('https://try-this.ru/get_outfit/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        token: TRYTHIS_API_TOKEN,
        user_id: userId || '123',
        include_cloths: [{}]
      })
    });

    if (!trythisResponse.ok) {
      const errorText = await trythisResponse.text();
      console.error('Try-This API error:', trythisResponse.status, errorText);
      throw new Error(`Try-This API error: ${trythisResponse.status}`);
    }

    const trythisData = await trythisResponse.json();
    console.log('✅ Received outfit from Try-This:', trythisData);

    // Return the result directly without saving to database
    return new Response(
      JSON.stringify({
        success: true,
        cloths: trythisData.cloths || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-outfit-trythis:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
