import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STYLING_GUIDE = `# Improved System Prompt for AI Stylist

---

## 🚨 CRITICAL INSTRUCTIONS FOR AI STYLIST 🚨

**Your Role:** You are an advanced AI Stylist. Your task is to create fashionable, harmonious, and diverse outfits by strictly following the rules outlined below. You must act as an expert who understands not only fashion but also the technical requirements for the output format.

**Primary Goal:** Generate unique outfits using **ONLY** the \`product_id\` from the provided product list.

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
    - Do not pair athletic shoes with evening dresses.
  - **Bags:**
    - \`Tote\` or \`Backpack\` — for \`occasion: everyday\` or \`work\`.
    - \`Clutch\` or \`Crossbody\` — for \`occasion: evening\` and \`special\`.

- **Rule of Patterns:**
  - **Safe Rule:** 1 item with a \`pattern\` + the rest \`solid\`.
  - **Advanced Rule:** You can combine 2 patterned items if:
    - One pattern is large, the other is small.
    - The patterns belong to the same theme.
  - **FORBIDDEN:** Combining two large, active patterns.

### KNOWLEDGE BASE: The Ultimate Guide to Fashion Styling Rules

**1. UNDERSTANDING GARMENT PERSONALITIES**
- T-shirt: casual comfort
- Blouse: elevated femininity
- Dress: one-piece statements

**2. PROPORTION & BALANCE**
Golden Rule: Fitted + Loose = Perfection
- Tight top → wide pants
- Fitted bottom → loose top
- NEVER tight on both

**3. COLOR MASTERY**
- Neutrals work with everything
- Classic combos: navy+white+camel, black+white+gold
- Warm = energetic, Cool = reliable

**4. PATTERN MIXING**
- Beginner: One pattern + solids
- Intermediate: Mix different scales
- Advanced: Shared colors

**5. FABRIC & TEXTURE**
- Mix smooth with rough
- Denim is universal mixer

**6. OCCASION DRESSING**
- Work: crisp, muted, minimal
- Everyday: comfortable, versatile
- Evening: elegant, statement
- Special: festive, polished`;

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const DEFAULT_N_OUTFITS = 20;

async function callLovableAIWithRetry(prompt: string, apiKey: string, maxRetries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`⏳ API call attempt ${attempt}/${maxRetries}...`);
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        }),
      });

      if (response.status === 429) {
        const waitTime = RETRY_DELAY * attempt;
        console.log(`⚠️  Rate limit exceeded. Waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (response.status === 402) {
        throw new Error('❌ Payment required. Add funds to your Lovable AI workspace.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ AI API error (status ${response.status}):`, errorText);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
          continue;
        }
        throw new Error(`AI API error after ${maxRetries} attempts: ${errorText}`);
      }

      const aiResponse = await response.json();
      let content = aiResponse.choices[0].message.content;

      if (!content) {
        throw new Error('❌ Empty response from API');
      }

      console.log(`✅ Response received (${content.length} characters)`);

      // Clean markdown blocks
      content = content.trim();
      if (content.startsWith('```json')) {
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      } else if (content.startsWith('```')) {
        content = content.replace(/```/g, '').trim();
      }

      // Parse JSON
      try {
        const outfits = JSON.parse(content);
        if (!Array.isArray(outfits)) {
          throw new Error('Response is not an array');
        }
        return outfits;
      } catch (parseError) {
        console.error('⚠️  JSON parse error:', parseError);
        console.error('First 500 chars:', content.substring(0, 500));
        
        // Try to extract JSON from text
        const jsonMatch = content.match(/\[.*\]/s);
        if (jsonMatch) {
          try {
            const outfits = JSON.parse(jsonMatch[0]);
            console.log('✅ JSON extracted from text');
            return outfits;
          } catch {}
        }
        
        if (attempt < maxRetries) {
          console.log(`🔄 Retry in ${RETRY_DELAY * attempt}ms...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
          continue;
        }
        throw new Error(`Failed to parse JSON after ${maxRetries} attempts`);
      }
    } catch (error) {
      if (attempt === maxRetries) throw error;
      console.log(`❌ Attempt ${attempt} failed:`, error);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
    }
  }
  throw new Error('All retry attempts exhausted');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=' .repeat(60));
    console.log('🎨 OUTFIT GENERATION VIA LOVABLE API');
    console.log('=' .repeat(60));

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Determine number of outfits (priority: n env var > N_OUTFITS env var > request body > default)
    let nOutfits = DEFAULT_N_OUTFITS;
    const envN = Deno.env.get('n');
    const envNOutfits = Deno.env.get('N_OUTFITS');
    
    if (envN) {
      nOutfits = parseInt(envN);
      console.log(`📌 Using n=${nOutfits} from environment variable`);
    } else if (envNOutfits) {
      nOutfits = parseInt(envNOutfits);
      console.log(`📌 Using N_OUTFITS=${nOutfits} from environment variable`);
    } else {
      try {
        const body = await req.json();
        if (body.n || body.count) {
          nOutfits = body.n || body.count;
          console.log(`📌 Using n=${nOutfits} from request body`);
        }
      } catch {
        console.log(`📌 Using default value: ${nOutfits}`);
      }
    }

    console.log(`📊 Final number of outfits to generate: ${nOutfits}`);

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

    // Format products as: product_id | category | product_name (Python script format)
    console.log('\n📋 Formatting product list...');
    const productsDescription = products?.map(p => 
      `${p.product_id} | ${p.category} | ${p.product_name}`
    ).join('\n') || '';
    console.log(`✅ Formatted ${products?.length} products`);

    const fullPrompt = `${STYLING_GUIDE}

### 3. AVAILABLE CATALOG INFORMATION

You must create outfits considering the actual quantity of available items.

- **Overall Statistics:**
  - Total products in the catalog: ${products?.length || 0}

- **Quantity by Main Types:**
  - Tops (T-shirts, blouses, sweaters): ${topsCount}
  - Bottoms (pants, skirts, jeans): ${bottomsCount}
  - Dresses: ${dressesCount}
  - Outerwear: ${outerwearCount}
  - Shoes: ${shoesCount}
  - Bags: ${bagsCount}

- **IMPORTANT NOTE:** The quantity of shoes and bags is limited. Do not use the same articles too frequently to ensure variety.

## LIST OF AVAILABLE PRODUCTS

Below is the list of all available products. Use **ONLY** the \`product_id\` from this list.

\`\`\`
${productsDescription.substring(0, 35000)}
\`\`\`

---

## YOUR TASK

Generate **EXACTLY ${nOutfits}** unique outfit combinations.

**MANDATORY REQUIREMENTS:**
1. Each outfit: **4-5 items** (4 = standard, 5 = with outerwear)
2. **REQUIRED in EVERY outfit:**
   - 1 x Shoes (heels, boots, sneakers, etc.)
   - 1 x Bag (any type)
   - 1 x Dress OR (1 x Top + 1 x Bottom)
3. **OPTIONAL:** 1 x Outerwear (blazer, jacket, coat)

**OCCASION DISTRIBUTION:**
Distribute evenly across: \`work\`, \`everyday\`, \`evening\`, \`special\`

**OUTPUT FORMAT - CRITICAL:**
Return **ONLY** a JSON array. No text before or after:

\`\`\`json
[
  {
    "occasion": "work",
    "items": ["product_id1", "product_id2", "product_id3", "product_id4"]
  }
]
\`\`\`

**REMINDER:** Use ONLY \`product_id\` from the list above. Return ONLY the JSON array.`;

    console.log('\n📝 Prompt prepared');
    console.log(`📏 Prompt length: ${fullPrompt.length} characters`);
    console.log('\n' + '='.repeat(60));
    console.log('🚀 Sending request to Lovable AI...');
    
    const generatedOutfits = await callLovableAIWithRetry(fullPrompt, LOVABLE_API_KEY);
    
    console.log(`\n✅ Successfully generated ${generatedOutfits.length} outfits from AI`);

    // Get the highest outfit_number to continue numbering
    const { data: maxOutfitData } = await supabase
      .from('outfits')
      .select('outfit_number')
      .order('outfit_number', { ascending: false })
      .limit(1);

    let nextOutfitNumber = (maxOutfitData?.[0]?.outfit_number || 0) + 1;

    // Filter and prepare outfits for database
    const outfitsToInsert = generatedOutfits
      .filter((outfit: any) => {
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
      .map((outfit: any) => ({
        outfit_number: nextOutfitNumber++,
        occasion: outfit.occasion,
        items: outfit.items
      }));

    console.log(`\n💾 Inserting ${outfitsToInsert.length} valid outfits into database...`);

    if (outfitsToInsert.length === 0) {
      throw new Error('❌ No valid outfits to insert');
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
    
    // Statistics
    const occasionStats = outfitsToInsert.reduce((acc: Record<string, number>, o: any) => {
      acc[o.occasion] = (acc[o.occasion] || 0) + 1;
      return acc;
    }, {});
    
    const itemCounts = outfitsToInsert.map((o: any) => o.items.length);
    const avgItems = itemCounts.reduce((sum: number, n: number) => sum + n, 0) / itemCounts.length;
    const minItems = Math.min(...itemCounts);
    const maxItems = Math.max(...itemCounts);

    console.log('\n' + '='.repeat(60));
    console.log('📊 STATISTICS');
    console.log('='.repeat(60));
    console.log(`Total outfits: ${insertedOutfits?.length}`);
    console.log('\nBy occasion:');
    for (const [occasion, count] of Object.entries(occasionStats)) {
      console.log(`  - ${occasion}: ${count}`);
    }
    console.log(`\nAverage items per outfit: ${avgItems.toFixed(1)}`);
    console.log(`Min items: ${minItems}`);
    console.log(`Max items: ${maxItems}`);
    console.log('='.repeat(60));

    return new Response(
      JSON.stringify({
        success: true,
        generated: insertedOutfits?.length || 0,
        statistics: {
          total: insertedOutfits?.length,
          byOccasion: occasionStats,
          avgItems,
          minItems,
          maxItems
        },
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