import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    console.log('Generating outfit for user:', userId);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Required environment variables not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all clothing items from database
    const { data: items, error: itemsError } = await supabase
      .from('clothing_items')
      .select('*')
      .limit(50);

    if (itemsError) throw itemsError;
    if (!items || items.length === 0) {
      throw new Error('No clothing items in database');
    }

    console.log(`Found ${items.length} items in database`);

    // Get user insights from ML backend
    let userPreferences = '';
    try {
      const mlInsightsResponse = await fetch(`http://localhost:8000/api/ml/insights/${userId}`);
      if (mlInsightsResponse.ok) {
        const insights = await mlInsightsResponse.json();
        if (insights.phase !== 'cold_start') {
          const prefs = [];
          if (insights.top_styles?.length) prefs.push(`styles: ${insights.top_styles.join(', ')}`);
          if (insights.top_colors?.length) prefs.push(`colors: ${insights.top_colors.join(', ')}`);
          if (insights.top_vibes?.length) prefs.push(`vibes: ${insights.top_vibes.join(', ')}`);
          userPreferences = prefs.length ? `User preferences: ${prefs.join('; ')}. ` : '';
        }
      }
    } catch (e) {
      console.log('Could not fetch ML insights, using random selection');
    }

    // Prepare items description for LLM
    const itemsDescription = items.map((item, idx) => {
      const attrs = item.attributes || {};
      return `Item ${idx}: ${item.category || 'unknown'} from ${item.brand || 'unknown brand'}
- Colors: ${attrs.color?.join?.(', ') || 'unknown'}
- Style: ${attrs.style || 'unknown'}
- Pattern: ${attrs.pattern || 'unknown'}
- Fit: ${attrs.fit || 'unknown'}
- Vibe: ${attrs.vibe?.join?.(', ') || 'unknown'}
- Occasion: ${attrs.occasion?.join?.(', ') || 'unknown'}`;
    }).join('\n\n');

    const systemPrompt = `You are a professional fashion stylist AI. Your task is to create a complete stylish outfit by selecting 3-5 clothing items from the provided database.

${userPreferences}Create an outfit that matches the user's preferences if provided, or create a trendy, cohesive look.

Return ONLY a JSON object with this structure:
{
  "items": [item_index1, item_index2, ...],
  "style": "outfit style name",
  "vibe": "outfit vibe/mood",
  "occasion": "suitable occasion",
  "description": "brief outfit description"
}

Select items that work well together in terms of colors, styles, and occasion.`;

    const userPrompt = `Create a complete outfit from these items:\n\n${itemsDescription}`;

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
    
    const outfitText = data.choices?.[0]?.message?.content;
    
    if (!outfitText) {
      throw new Error('No outfit generated');
    }

    // Parse the outfit JSON
    let outfit;
    try {
      const cleanedText = outfitText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      outfit = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse outfit:', outfitText);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Build the complete outfit with item details
    const selectedItems = outfit.items.map((idx: number) => items[idx]).filter(Boolean);
    
    if (selectedItems.length === 0) {
      throw new Error('No valid items selected');
    }

    const completeOutfit = {
      id: `outfit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      style: outfit.style,
      vibe: outfit.vibe,
      occasion: outfit.occasion,
      description: outfit.description,
      items: selectedItems.map((item: any) => ({
        id: item.id,
        name: item.product_name,
        brand: item.brand,
        category: item.category,
        imageUrl: item.processed_image_url,
        article: `${item.brand} ${item.product_name}`,
      })),
      image: selectedItems[0]?.processed_image_url || '', // Use first item as main image for now
    };

    return new Response(
      JSON.stringify({ outfit: completeOutfit }),
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
