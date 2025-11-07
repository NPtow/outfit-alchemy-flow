import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STYLING_GUIDE = `The Ultimate Guide to Fashion Styling Rules: A Human-Centered Approach

1. UNDERSTANDING GARMENT PERSONALITIES
Reading a Garment's "Character"
Every piece of clothing has a personality that speaks before you even put it on. Here's how to read these fashion signals:

The T-shirt Family: Casual Comfort
- A basic cotton tee whispers "relaxed weekend"
- A fitted V-neck suggests "effortless chic"
- A graphic tee shouts "I'm fun and approachable"
- A silk tee murmurs "I'm casual but expensive"

The Blouse Dynasty: Elevated Femininity
- A crisp white button-up declares "I mean business"
- A silk blouse with bow ties says "I'm romantic but professional"
- A peasant blouse sings "free-spirited bohemian"
- A structured blazer-style blouse announces "power player"

The Dress Spectrum: One-Piece Statements
- A little black dress is the Swiss Army knife of fashion - adaptable to any situation
- A maxi dress flows with "bohemian goddess" energy
- A bodycon dress broadcasts "confident and sexy"
- A shirt dress speaks "polished casual" fluency

2. THE ART OF PROPORTION & BALANCE
The Golden Rule: Fitted + Loose = Perfection
Think of your body as a canvas where you're creating visual harmony:

When Your Top is Fitted:
- Tight sweater → Pair with wide-leg trousers or a flowing skirt
- Bodycon top → Balance with boyfriend jeans or palazzo pants
- Fitted blazer → Let it shine with looser pants or an A-line skirt

When Your Bottom is Fitted:
- Skinny jeans → Top it with an oversized sweater, flowing blouse, or boxy jacket
- Pencil skirt → Soften with a draped top or loose cardigan
- Leggings → Always pair with longer, loose tops (never tight on both - this breaks the cardinal rule!)

3. COLOR MASTERY: THE PSYCHOLOGY OF HUES
Understanding Color Relationships
Colors have relationships just like people - some are best friends, others are perfect opposites that attract, and some just don't get along.

The Neutral Superstars (Your Wardrobe's Best Friends):
- Black: Slimming, powerful, goes with everything (but can be harsh near the face for some)
- Navy: More approachable than black, works with almost every color
- White: Fresh, clean, brightens your complexion (but requires careful fabric choice)
- Gray: The ultimate diplomat - makes every other color look good
- Beige/Camel: Warm, sophisticated, perfect with both brights and other neutrals

Foolproof Color Combinations That Never Fail
Classic Combinations:
- Navy + white + camel = French sophistication
- Black + white + gold accents = timeless elegance
- Gray + soft pink + cream = feminine minimalism
- Denim + white + any bright accent = American casual

4. PATTERN MIXING: THE BRAVE AND THE BEAUTIFUL
Pattern Personalities
Each pattern has its own voice:
- Stripes: Clean, nautical, can be slimming (vertical) or widening (horizontal)
- Florals: Feminine, romantic, can range from sweet to bold
- Polka dots: Playful, vintage, surprisingly versatile
- Plaid: Can be preppy, punk, or cozy depending on colors and scale
- Animal prints: Bold, confident, always a statement

5. OCCASION DRESSING: READING THE ROOM
Workplace Wisdom
Conservative Office:
- Think: crisp lines, muted colors, minimal patterns
- Perfect formula: tailored blazer + silk blouse + wool trousers + leather pumps

Creative Workplace:
- More personality allowed: interesting textures, bolder colors, pattern mixing

Social Situation Styling
Casual Coffee Date:
- Approachable but put-together: nice jeans + soft sweater + ankle boots

Dinner Party:
- Smart casual elegance: silk blouse + tailored pants + heels

Wedding Guest:
- Celebrate without upstaging: avoid white, choose festive colors

Job Interview:
- Dress for the job you want, but slightly more conservative`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎨 Starting outfit generation...');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all available products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('product_id, product_name, category, style, price, generated_attributes')
      .limit(809);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      throw productsError;
    }

    console.log(`📦 Loaded ${products?.length} products`);

    // Get existing outfits to avoid duplicates
    const { data: existingOutfits } = await supabase
      .from('outfits')
      .select('items');

    const existingItemCombinations = new Set(
      existingOutfits?.map(o => JSON.stringify(o.items.sort())) || []
    );

    console.log(`📊 Found ${existingItemCombinations.size} existing outfit combinations`);

    // Format products for AI
    const productsDescription = products?.map(p => 
      `${p.product_id}: ${p.product_name} (${p.category}) - ${p.style || 'N/A'} - ${p.generated_attributes || 'No attributes'}`
    ).join('\n') || '';

    const systemPrompt = `${STYLING_GUIDE}

CRITICAL INSTRUCTIONS:
You are a professional fashion stylist. Generate EXACTLY 49 unique, stylish outfit combinations using ONLY the products provided below.

MANDATORY RULES - EACH OUTFIT MUST INCLUDE 4-5 ITEMS:
1. **MINIMUM 4 items, MAXIMUM 5 items**
2. **REQUIRED categories in EVERY outfit (4 minimum):**
   - ONE Shoes (обувь, туфли, кроссовки, ботинки) - ALWAYS REQUIRED
   - ONE Bag (сумка) - ALWAYS REQUIRED
   - ONE of: Top (футболка, топ, блузка, свитер) OR Dress (платье) - REQUIRED
   - ONE Bottom (брюки, джинсы, юбка) - REQUIRED (skip ONLY if Dress is used)
3. OPTIONAL 5th item: Outerwear (куртка, пальто, пиджак, жакет)
4. ONLY use product_id values from the list below
5. Create diverse outfits for different occasions
6. Distribute outfits evenly across these occasions:
   - "work" (business attire)
   - "everyday" (casual daily wear)
   - "evening" (going out, dinner, events)
   - "home" (comfortable loungewear)

AVAILABLE PRODUCTS (${products?.length || 0} total):
Categories available: TShirt, Top, Blouse, Dress, Pants, Jeans, Skirt, Blazer, Bag, BalletFlats, AnkleBoots, etc.

${productsDescription.substring(0, 30000)}

OUTPUT FORMAT:
Return ONLY a JSON array of exactly 49 objects. Each object must have EXACTLY 4-5 items:
{
  "occasion": "work" | "everyday" | "evening" | "home",
  "items": ["product_id1", "product_id2", "product_id3", "product_id4"] // or 5 items with outerwear
}

CORRECT EXAMPLES (4-5 items, SHOES & BAG ALWAYS INCLUDED):
[
  {
    "occasion": "work",
    "items": ["Blazer_123", "Top_456", "Pants_789", "Shoes_012", "Bag_345"]
  },
  {
    "occasion": "everyday", 
    "items": ["TShirt_111", "Jeans_222", "Sneakers_333", "Bag_444"]
  },
  {
    "occasion": "evening",
    "items": ["Dress_555", "Heels_666", "Bag_777", "Blazer_888"]
  }
]

WRONG EXAMPLES (DO NOT CREATE):
❌ {"items": ["Top_123", "Pants_456"]} - Only 2 items, missing Shoes and Bag!
❌ {"items": ["Dress_789", "Bag_012"]} - Only 2 items, missing Shoes!
❌ {"items": ["Top_111", "Pants_222", "Shoes_333"]} - Only 3 items, missing Bag!

IMPORTANT: Return ONLY the JSON array, no other text or explanation.`;

    console.log('🤖 Calling Lovable AI...');
    console.log('System prompt preview:', systemPrompt.substring(0, 500));

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
          { role: 'user', content: 'Generate 49 unique, stylish outfits with 4-5 items each. SHOES and BAG are MANDATORY in every outfit. Return ONLY the JSON array.' }
        ],
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const aiResponse = await response.json();
    console.log('✅ AI Response received');

    let content = aiResponse.choices[0].message.content;
    console.log('Raw AI response:', content.substring(0, 500));

    // Clean up response - remove markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let generatedOutfits;
    try {
      generatedOutfits = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('Content that failed to parse:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    if (!Array.isArray(generatedOutfits)) {
      throw new Error('AI response is not an array');
    }

    console.log(`🎯 Generated ${generatedOutfits.length} outfits from AI`);

    // Get the highest outfit_number to continue numbering
    const { data: maxOutfitData } = await supabase
      .from('outfits')
      .select('outfit_number')
      .order('outfit_number', { ascending: false })
      .limit(1);

    let nextOutfitNumber = (maxOutfitData?.[0]?.outfit_number || 0) + 1;

    // Filter and prepare outfits for database
    const outfitsToInsert = generatedOutfits
      .filter(outfit => {
        // Validate structure
        if (!outfit.occasion || !Array.isArray(outfit.items) || outfit.items.length === 0) {
          console.warn('❌ Invalid outfit structure:', outfit);
          return false;
        }

        // CRITICAL: Check items count (4-5 items required)
        if (outfit.items.length < 4 || outfit.items.length > 5) {
          console.warn(`❌ Outfit has ${outfit.items.length} items (required: 4-5):`, outfit);
          return false;
        }

        // Check if all products exist
        const allProductsExist = outfit.items.every((itemId: string) => 
          products?.some(p => p.product_id === itemId)
        );

        if (!allProductsExist) {
          console.warn('❌ Outfit contains non-existent products:', outfit);
          return false;
        }

        // Validate that outfit has required categories
        const outfitProducts = outfit.items
          .map((itemId: string) => products?.find(p => p.product_id === itemId))
          .filter(Boolean);
        
        const categories = outfitProducts.map((p: any) => p!.category.toLowerCase());
        const hasShoes = categories.some((c: string) => 
          c.includes('shoe') || c.includes('boot') || c.includes('flats') || 
          c.includes('обувь') || c.includes('туфли') || c.includes('ботинки')
        );
        const hasBag = categories.some((c: string) => c.includes('bag') || c.includes('сумка'));
        
        if (!hasShoes) {
          console.warn('❌ Outfit missing SHOES:', outfit);
          return false;
        }
        if (!hasBag) {
          console.warn('❌ Outfit missing BAG:', outfit);
          return false;
        }

        // Check for duplicates
        const sortedItems = JSON.stringify(outfit.items.sort());
        if (existingItemCombinations.has(sortedItems)) {
          console.warn('❌ Duplicate outfit combination:', outfit);
          return false;
        }

        existingItemCombinations.add(sortedItems);
        return true;
      })
      .map(outfit => ({
        outfit_number: nextOutfitNumber++,
        occasion: outfit.occasion,
        items: outfit.items
      }));

    console.log(`💾 Inserting ${outfitsToInsert.length} valid outfits into database...`);

    if (outfitsToInsert.length === 0) {
      throw new Error('No valid outfits to insert');
    }

    const { data: insertedOutfits, error: insertError } = await supabase
      .from('outfits')
      .insert(outfitsToInsert)
      .select();

    if (insertError) {
      console.error('❌ Insert error:', insertError);
      throw insertError;
    }

    console.log(`✅ Successfully inserted ${insertedOutfits?.length} outfits`);

    return new Response(
      JSON.stringify({
        success: true,
        generated: insertedOutfits?.length || 0,
        outfits: insertedOutfits
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in generate-outfits:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});