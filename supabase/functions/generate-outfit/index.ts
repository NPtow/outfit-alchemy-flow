import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// External Supabase configuration for images
const EXTERNAL_SUPABASE_URL = 'https://fdldkohnxiezccirxxfb.supabase.co';

function getExternalImageUrl(path: string): string {
  if (!path) return '';
  const fullPath = `new_db/${path}`;
  return `${EXTERNAL_SUPABASE_URL}/storage/v1/object/public/SwipeStyle/${fullPath}`;
}

// Fashion styling guide content
const STYLING_GUIDE = `The Ultimate Guide to Fashion Styling Rules:

1. PROPORTION & BALANCE - The Golden Rule: Fitted + Loose = Perfection
- Tight top → wide-leg pants or flowing skirt
- Fitted bottom → oversized sweater or loose top
- NEVER tight on both top and bottom

2. COLOR MASTERY
- Neutrals: black, navy, white, gray, beige work with everything
- Classic combos: navy+white+camel, black+white+gold, gray+pink+cream
- Warm colors (red, orange, yellow) = approachable and energetic
- Cool colors (blue, green, purple) = calm and reliable

3. PATTERN MIXING
- Beginner: One pattern + solid colors
- Intermediate: Mix different pattern scales (small polka dots + large plaid)
- Advanced: Mix patterns with shared colors
- Safety rule: Use neutral piece to calm bold patterns

4. FABRIC & TEXTURE
- Mix smooth with rough, soft with structured
- Cotton pairs with: denim, linen, wool, leather
- Silk pairs with: cashmere, cotton, leather
- Denim is universal mixer

5. OUTFIT BUILDING RULES
- Create focal point: choose ONE statement piece
- Balance proportions: fitted + loose
- Stick to 3-4 colors maximum
- Match metals in accessories
- Consider occasion and season`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { count = 5, excludedProductIds = [] } = await req.json();
    console.log(`Generating ${count} outfits, excluding ${excludedProductIds.length} products`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Required environment variables not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get products from database, excluding already shown ones
    let query = supabase
      .from('products')
      .select('*');
    
    if (excludedProductIds.length > 0) {
      query = query.not('product_id', 'in', `(${excludedProductIds.join(',')})`);
    }
    
    const { data: products, error: productsError } = await query;

    if (productsError) throw productsError;
    if (!products || products.length === 0) {
      throw new Error('No products in database. Please import products first.');
    }

    console.log(`Found ${products.length} available products`);

    // Prepare products description for AI
    const productsDescription = products.map((product, idx) => {
      const attrs = product.generated_attributes || '';
      const metadata = typeof product.metadata === 'string' ? JSON.parse(product.metadata) : product.metadata;
      
      return `Product ${idx} (ID: ${product.product_id}):
- Category: ${product.category}
- Style: ${product.style}
- Price: ${product.price} RUB
- Attributes: ${attrs.substring(0, 200)}`;
    }).join('\n\n');

    const systemPrompt = `You are a professional fashion stylist AI. Create ${count} complete, diverse outfits using the styling guide below.

${STYLING_GUIDE}

IMPORTANT RULES:
1. Each outfit must have exactly 5 items from different categories
2. All ${count} outfits must be DIFFERENT - vary styles, colors, vibes
3. Select items that follow styling rules (proportion, color harmony, etc.)
4. Avoid repeating the same products across multiple outfits
5. Consider occasion, season, and style coherence

Return ONLY a JSON array of ${count} outfits:
[
  {
    "product_ids": ["product_id1", "product_id2", "product_id3", "product_id4", "product_id5"],
    "style": "outfit style",
    "vibe": "outfit vibe",
    "occasion": "occasion"
  },
  ...
]`;

    const userPrompt = `Available products:\n\n${productsDescription}\n\nGenerate ${count} diverse, stylish outfits.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required, please add funds to your Lovable AI workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('AI response received');
    
    const outfitsText = data.choices?.[0]?.message?.content;
    
    if (!outfitsText) {
      throw new Error('No outfits generated');
    }

    // Parse the outfits JSON
    let generatedOutfits;
    try {
      const cleanedText = outfitsText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      generatedOutfits = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse outfits:', outfitsText);
      throw new Error('Failed to parse AI response as JSON');
    }

    if (!Array.isArray(generatedOutfits)) {
      throw new Error('AI response is not an array of outfits');
    }

    // Generate positions for items in collage
    const positions = [
      { top: "22%", left: "35%", placement: "above" },
      { top: "25%", left: "62%", placement: "above" },
      { top: "58%", left: "68%", placement: "below" },
      { top: "68%", left: "58%", placement: "below" },
      { top: "68%", left: "18%", placement: "below" },
    ];

    // Build complete outfits with product details
    const completeOutfits = [];
    const usedProductIds = new Set();

    for (const outfit of generatedOutfits) {
      const productIds = outfit.product_ids || [];
      
      // Find products by their IDs
      const outfitProducts = productIds
        .map((pid: string) => products.find(p => p.product_id === pid))
        .filter(Boolean);

      if (outfitProducts.length < 3) {
        console.warn('Skipping outfit with insufficient products');
        continue;
      }

      // Track used products
      outfitProducts.forEach((p: any) => usedProductIds.add(p.product_id));

      const completeOutfit = {
        id: `outfit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        style: outfit.style || 'Casual',
        vibe: outfit.vibe || 'Comfortable',
        occasion: outfit.occasion || 'Everyday',
        category: 'all',
        image: '',
        items: outfitProducts.map((product: any, idx: number) => {
          const metadata = typeof product.metadata === 'string' ? JSON.parse(product.metadata) : product.metadata;
          // Use external Supabase storage URL for images
          const imageUrl = getExternalImageUrl(product.image_processed || product.image_path || '');
          
          return {
            id: product.product_id,
            name: metadata?.name || product.product_name || 'Item',
            brand: 'Wildberries',
            category: product.category,
            itemNumber: product.wildberries_id || product.product_id,
            price: parseFloat(metadata?.price || product.price || 0),
            shopUrl: metadata?.shop_links?.[0] || product.shop_link || '#',
            image: imageUrl,
            position: positions[idx] || positions[0],
            placement: positions[idx]?.placement || "above",
          };
        }),
      };

      completeOutfits.push(completeOutfit);
    }

    if (completeOutfits.length === 0) {
      throw new Error('No valid outfits generated');
    }

    return new Response(
      JSON.stringify({ 
        outfits: completeOutfits,
        usedProductIds: Array.from(usedProductIds)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-outfit function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
