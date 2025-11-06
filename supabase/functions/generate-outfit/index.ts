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
const STYLING_GUIDE = `## AI STYLIST INSTRUCTIONS

**Your Role:** Create fashionable, harmonious outfits following styling rules.

### OUTPUT FORMAT
Return ONLY a JSON array. Each object:
- occasion: work, everyday, evening, or special
- product_ids: array of exact product_id strings

### OUTFIT COMPOSITION RULES
1. Each outfit: 4-5 items ONLY
2. MANDATORY in EVERY outfit:
   - 1 x Shoes
   - 1 x Bag
   - 1 x Top + 1 x Bottom OR 1 x Dress
3. OPTIONAL 5th item: Outerwear

### STYLING RULES

**Proportions:**
- Fitted top → loose bottom
- Fitted bottom → loose top
- FORBIDDEN: fitted top + fitted bottom

**Color:**
- Max 3 main colors per outfit
- Neutrals (black, white, gray, beige, navy) unlimited
- Work: neutral/muted palettes
- Evening: bolder combinations

**Accessories:**
- Sneakers/Flats: everyday only
- Heels/Boots: work, evening, special
- Tote/Backpack: everyday, work
- Clutch/Crossbody: evening, special

**Patterns:**
- Safe: 1 pattern + solids
- Advanced: 2 patterns if different scales
- FORBIDDEN: two large patterns

**Occasion Guidelines:**
- Work: crisp lines, muted colors
- Everyday: comfortable, versatile
- Evening: elegant, statement pieces
- Special: festive, polished`;

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
    const productsDescription = products.map((product) => {
      const attrs = product.generated_attributes || '';
      
      return `ID: ${product.product_id}
Category: ${product.category}
Style: ${product.style || 'N/A'}
Price: ${product.price} RUB
Attributes: ${attrs.substring(0, 150)}`;
    }).join('\n\n');

    const systemPrompt = `You are a professional fashion stylist AI. Create ${count} complete, diverse outfits using the styling guide below.

${STYLING_GUIDE}

CRITICAL RULES:
1. Each outfit must have EXACTLY 5 items from DIFFERENT categories
2. Use ONLY the exact product IDs provided (format: Category_Number, e.g., "Jumper_298659705")
3. All ${count} outfits must be DIFFERENT - vary styles, colors, vibes
4. Select items that follow styling rules (proportion, color harmony, etc.)
5. DO NOT make up or modify product IDs - use them exactly as given
6. Avoid repeating the same products across multiple outfits

Return ONLY a JSON array of ${count} outfits:
[
  {
    "product_ids": ["exact_product_id1", "exact_product_id2", "exact_product_id3", "exact_product_id4", "exact_product_id5"],
    "style": "outfit style",
    "vibe": "outfit vibe",
    "occasion": "occasion"
  }
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
      console.log('Raw AI response:', outfitsText.substring(0, 500));
      generatedOutfits = JSON.parse(cleanedText);
      console.log('Parsed outfits:', JSON.stringify(generatedOutfits, null, 2));
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
      console.log(`Processing outfit with ${productIds.length} product IDs:`, productIds);
      
      // Find products by their IDs
      const outfitProducts = productIds
        .map((pid: string) => {
          const found = products.find(p => p.product_id === pid);
          if (!found) {
            console.warn(`Product not found: ${pid}`);
          }
          return found;
        })
        .filter(Boolean);

      console.log(`Found ${outfitProducts.length} products out of ${productIds.length}`);
      
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
