import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    // Get authenticated user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error('User authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔑 Generating outfit for user: ${user.id}`);

    // Get Try-This API token
    const TRYTHIS_API_TOKEN = Deno.env.get('TRYTHIS_API_TOKEN');
    if (!TRYTHIS_API_TOKEN) {
      throw new Error('TRYTHIS_API_TOKEN not configured');
    }

    // Call Try-This API
    console.log('📞 Calling Try-This API...');
    const trythisResponse = await fetch('https://try-this.ru/get_outfit/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: TRYTHIS_API_TOKEN,
        user_id: user.id,
        include_cloths: [] // Empty array - get full outfit from their catalog
      })
    });

    if (!trythisResponse.ok) {
      const errorText = await trythisResponse.text();
      console.error('Try-This API error:', trythisResponse.status, errorText);
      throw new Error(`Try-This API error: ${trythisResponse.status}`);
    }

    const trythisData = await trythisResponse.json();
    console.log('✅ Received outfit from Try-This:', trythisData);

    // Validate response structure
    if (!trythisData.payload || !trythisData.payload.cloths) {
      throw new Error('Invalid response from Try-This API');
    }

    // Save outfit to database
    const { data: savedOutfit, error: saveError } = await supabaseClient
      .from('trythis_outfits')
      .insert({
        user_id: user.id,
        items: trythisData.payload.cloths
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving outfit:', saveError);
      throw saveError;
    }

    console.log('💾 Saved outfit to database:', savedOutfit.id);

    return new Response(
      JSON.stringify({
        success: true,
        outfit: savedOutfit
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
