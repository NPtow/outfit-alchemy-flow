import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, anonymousId, outfitId, actionType, actionDetails } = await req.json();

    if (!userId && !anonymousId) {
      throw new Error('Either userId or anonymousId must be provided');
    }

    if (!outfitId) {
      throw new Error('outfitId is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Record outfit view
    const { error: viewError } = await supabase
      .from('user_outfit_views')
      .upsert({
        user_id: userId || null,
        anonymous_id: anonymousId || null,
        outfit_id: outfitId
      }, {
        onConflict: 'user_id,anonymous_id,outfit_id',
        ignoreDuplicates: true
      });

    if (viewError) {
      console.error('Error recording outfit view:', viewError);
    }

    // Record action log if actionType provided
    if (actionType) {
      const { error: logError } = await supabase
        .from('user_action_logs')
        .insert({
          user_id: userId || null,
          anonymous_id: anonymousId || null,
          action_type: actionType,
          details: {
            outfit_id: outfitId,
            ...actionDetails
          }
        });

      if (logError) {
        console.error('Error recording action log:', logError);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in record-outfit-view:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});