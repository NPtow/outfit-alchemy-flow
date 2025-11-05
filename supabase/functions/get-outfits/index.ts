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
    const { userId, anonymousId, occasion = 'general', limit = 20 } = await req.json();

    console.log('📥 Get outfits request:', { userId, anonymousId, occasion, limit });

    if (!userId && !anonymousId) {
      throw new Error('Either userId or anonymousId must be provided');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's viewed outfits
    let viewedOutfitsQuery = supabase
      .from('user_outfit_views')
      .select('outfit_id');

    if (userId) {
      viewedOutfitsQuery = viewedOutfitsQuery.eq('user_id', userId);
    } else {
      viewedOutfitsQuery = viewedOutfitsQuery.eq('anonymous_id', anonymousId);
    }

    const { data: viewedData, error: viewedError } = await viewedOutfitsQuery;

    if (viewedError) {
      console.error('Error fetching viewed outfits:', viewedError);
      throw viewedError;
    }

    const viewedOutfitIds = viewedData?.map(v => v.outfit_id) || [];
    console.log(`👁️ User has viewed ${viewedOutfitIds.length} outfits`);

    // Get total outfit count
    const { count: totalOutfits, error: countError } = await supabase
      .from('outfits')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting outfits:', countError);
      throw countError;
    }

    const unseenCount = (totalOutfits || 0) - viewedOutfitIds.length;
    console.log(`📊 Unseen outfits: ${unseenCount} (Total: ${totalOutfits}, Viewed: ${viewedOutfitIds.length})`);

    // CHECK RULE: If ANY user has <= 50 unseen outfits, trigger generation
    if (unseenCount <= 50) {
      console.log('🚨 TRIGGER: Unseen outfits <= 50, starting background generation...');
      
      // Trigger generation in background (don't await)
      fetch(`${supabaseUrl}/functions/v1/generate-outfits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      }).catch(err => {
        console.error('❌ Background generation failed:', err);
      });
    }

    // Get unseen outfits for this user
    let outfitsQuery = supabase
      .from('outfits')
      .select(`
        id,
        outfit_number,
        occasion,
        items,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter by occasion if not 'general'
    if (occasion !== 'general') {
      outfitsQuery = outfitsQuery.eq('occasion', occasion);
    }

    // Exclude viewed outfits
    if (viewedOutfitIds.length > 0) {
      outfitsQuery = outfitsQuery.not('id', 'in', `(${viewedOutfitIds.map(id => `"${id}"`).join(',')})`);
    }

    const { data: outfits, error: outfitsError } = await outfitsQuery;

    if (outfitsError) {
      console.error('Error fetching outfits:', outfitsError);
      throw outfitsError;
    }

    console.log(`✅ Returning ${outfits?.length || 0} outfits`);

    // Get product details for each outfit
    const outfitsWithProducts = await Promise.all(
      (outfits || []).map(async (outfit) => {
        const productIds = outfit.items as string[];
        
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('product_id', productIds);

        if (productsError) {
          console.error('Error fetching products:', productsError);
          return { ...outfit, products: [] };
        }

        return {
          ...outfit,
          products: products || []
        };
      })
    );

    return new Response(
      JSON.stringify({
        outfits: outfitsWithProducts,
        unseenCount,
        totalCount: totalOutfits,
        viewedCount: viewedOutfitIds.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in get-outfits:', error);
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