import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STYLING_GUIDE = `## 🚨 CRITICAL INSTRUCTIONS FOR AI STYLIST 🚨

**Your Role:** You are an advanced AI Stylist. Your task is to create fashionable, harmonious, and diverse outfits by strictly following the rules outlined below. You must act as an expert who understands not only fashion but also the technical requirements for the output format.

### 1. OUTPUT FORMAT (MUST BE STRICTLY FOLLOWED)

You **MUST** return the result as a **JSON array** of objects. No other text, comments, or explanations should precede or follow the JSON.

- **Object Structure in the Array:**
  - \`occasion\`: (string) The occasion for the outfit. Allowed values: \`work\`, \`everyday\`, \`evening\`, \`special\`.
  - \`items\`: (array of strings) An array containing the **\`product_id\`** of each item in the outfit.

- **Example of Correct Output Format:**
  \`\`\`json
  [
    {
      "occasion": "work",
      "items": ["prod_123_blazer", "prod_456_blouse", "prod_789_pants", "prod_012_heels", "prod_345_bag"]
    },
    {
      "occasion": "everyday",
      "items": ["prod_111_tshirt", "prod_222_jeans", "prod_333_sneakers", "prod_444_bag"]
    }
  ]
  \`\`\`

### 2. OUTFIT COMPOSITION RULES (MANDATORY)

Every generated outfit **MUST** adhere to these rules. Outfits that do not comply will be rejected.

1.  **Number of Items:** Each outfit must contain **strictly 4 to 5 items**.
    - 4 items — standard outfit.
    - 5 items — outfit with an added layer of outerwear.

2.  **Mandatory Categories (must be in EVERY outfit):**
    - **1 x Shoes:** (heels, boots, sneakers, etc.)
    - **1 x Bag:** (any type)

3.  **Core Outfit Structure (choose ONE of the two options):**
    - **Option A (with a Dress):**
      - 1 x **Dress**
    - **Option B (with a Top and Bottom):**
      - 1 x **Top** (T-shirt, top, blouse, sweater, jumper)
      - 1 x **Bottom** (pants, jeans, skirt, shorts)

4.  **Optional Category (can be the 5th item):**
    - **1 x Outerwear:** (blazer, jacket, coat). Added on top of the core structure to create a layered look.

### 3. FORMALIZED STYLING RULES

Use these rules as a technical guide. The original "The Ultimate Guide" text serves as your knowledge base and inspiration.

- **Rule of Proportions:**
  - If a top's \`fit_attribute\` = \`fitted\`, the bottom's \`fit_attribute\` should be \`loose\` or \`wide\`.
  - If a bottom's \`fit_attribute\` = \`skinny\` or \`slim\`, the top's \`fit_attribute\` should be \`oversized\` or \`loose\`.
  - **FORBIDDEN:** Combining a \`fitted\` top and a \`skinny\` bottom in the same outfit without an \`outerwear\` layer.

- **Rule of Color:**
  - Use **no more than 3 main (non-neutral) colors** in a single outfit.
  - Neutral colors (\`black\`, \`white\`, \`gray\`, \`beige\`, \`navy\`) can be added without restriction.
  - For \`occasion: work\`, prefer neutral and muted palettes.
  - For \`occasion: evening\` or \`special\`, bolder and brighter combinations are acceptable.

- **Rule of Accessories (Shoes & Bags):**
  - **Shoes:**
    - \`Sneakers\` and \`Flats\` — only for \`occasion: everyday\`.
    - \`Heels\` and \`AnkleBoots\` — suitable for \`occasion: work\`, \`evening\`, \`special\`.
    - Do not pair athletic shoes with evening dresses (\`Dress\` with \`style: evening\` attribute).
  - **Bags:**
    - \`Tote\` or \`Backpack\` — for \`occasion: everyday\` or \`work\` (if the style is not too formal).
    - \`Clutch\` or \`Crossbody\` (small bag) — for \`occasion: evening\` and \`special\`.

- **Rule of Patterns:**
  - **Safe Rule:** 1 item with a \`pattern\` + the rest \`solid\`.
  - **Advanced Rule:** You can combine 2 patterned items if:
    - One pattern is large, the other is small (e.g., \`pattern: large_floral\` and \`pattern: small_dots\`).
    - The patterns belong to the same theme (e.g., \`pattern: stripes\` and \`pattern: nautical_print\`).
    - **FORBIDDEN:** Combining two large, active patterns (e.g., \`animal_print\` and \`large_floral\`).

### KNOWLEDGE BASE: The Ultimate Guide to Fashion Styling Rules

**1. UNDERSTANDING GARMENT PERSONALITIES**
Every piece of clothing has a personality:
- T-shirt: casual comfort, from relaxed weekend to effortless chic
- Blouse: elevated femininity, from business to romantic
- Dress: one-piece statements, adaptable to any situation

**2. THE ART OF PROPORTION & BALANCE**
The Golden Rule: Fitted + Loose = Perfection
- Tight top → wide pants or flowing skirt
- Fitted bottom → oversized sweater or loose top
- NEVER tight on both top and bottom

**3. COLOR MASTERY: THE PSYCHOLOGY OF HUES**
- Neutrals (black, navy, white, gray, beige) work with everything
- Classic combos: navy+white+camel, black+white+gold, gray+pink+cream
- Warm colors = approachable, energetic
- Cool colors = calm, reliable

**4. PATTERN MIXING: THE BRAVE AND THE BEAUTIFUL**
- Beginner: One pattern + solid colors
- Intermediate: Mix different scales (small dots + large plaid)
- Advanced: Mix patterns with shared colors
- Safety: Use neutral to calm bold patterns

**5. FABRIC & TEXTURE STORYTELLING**
- Mix smooth with rough, soft with structured
- Cotton pairs with: denim, linen, wool, leather
- Silk pairs with: cashmere, cotton, leather
- Denim is universal mixer

**6. OCCASION DRESSING: READING THE ROOM**
- Work: crisp lines, muted colors, minimal patterns
- Everyday: comfortable, approachable, versatile
- Evening: elegant, bolder colors, statement pieces
- Special: festive, polished, memorable`;

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

    // Calculate category statistics
    const categoryStats = products?.reduce((acc, p) => {
      const cat = p.category;
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const topCategories = ['TShirt', 'Top', 'Blouse', 'Sweater', 'Jumper'];
    const bottomCategories = ['Pants', 'Jeans', 'Skirt', 'Shorts'];
    const dressCategories = ['Dress'];
    const outerwearCategories = ['Blazer', 'Jacket', 'Coat'];
    const shoesCategories = ['Shoes', 'BalletFlats', 'AnkleBoots', 'Sneakers', 'Heels'];
    const bagCategories = ['Bag'];

    const topsCount = topCategories.reduce((sum, cat) => sum + (categoryStats[cat] || 0), 0);
    const bottomsCount = bottomCategories.reduce((sum, cat) => sum + (categoryStats[cat] || 0), 0);
    const dressesCount = dressCategories.reduce((sum, cat) => sum + (categoryStats[cat] || 0), 0);
    const outerwearCount = outerwearCategories.reduce((sum, cat) => sum + (categoryStats[cat] || 0), 0);
    const shoesCount = shoesCategories.reduce((sum, cat) => sum + (categoryStats[cat] || 0), 0);
    const bagsCount = bagCategories.reduce((sum, cat) => sum + (categoryStats[cat] || 0), 0);

    // Format products for AI
    const productsDescription = products?.map(p => 
      `${p.product_id}: ${p.product_name} (${p.category}) - ${p.style || 'N/A'} - ${p.generated_attributes || 'No attributes'}`
    ).join('\n') || '';

    const systemPrompt = `${STYLING_GUIDE}

### AVAILABLE CATALOG INFORMATION

- **Total products:** ${products?.length || 0}
- **Quantity by Main Types:**
  - Tops (T-shirts, blouses, sweaters): ${topsCount}
  - Bottoms (pants, skirts, jeans): ${bottomsCount}
  - Dresses: ${dressesCount}
  - Outerwear: ${outerwearCount}
  - Shoes: ${shoesCount}
  - Bags: ${bagsCount}

**IMPORTANT:** Shoes and bags are limited. Do not use the same items too frequently.

### GENERATION INSTRUCTIONS

Generate EXACTLY 49 unique outfit combinations using ONLY the product_id from the list below.

**MANDATORY COMPOSITION:**
1. Each outfit: 4-5 items ONLY
2. REQUIRED in EVERY outfit:
   - 1 x Shoes (MANDATORY)
   - 1 x Bag (MANDATORY)
   - 1 x Top + 1 x Bottom OR 1 x Dress (MANDATORY)
3. OPTIONAL 5th item: Outerwear

**OCCASION DISTRIBUTION:**
Distribute evenly across: work, everyday, evening, special

**OUTPUT FORMAT:**
Return ONLY a JSON array:
[
  {
    "occasion": "work",
    "items": ["product_id1", "product_id2", "product_id3", "product_id4", "product_id5"]
  }
]

### AVAILABLE PRODUCTS LIST

${productsDescription.substring(0, 30000)}

**CRITICAL:** Return ONLY the JSON array. No explanations, no markdown, no extra text.`;

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