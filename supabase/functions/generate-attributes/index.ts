import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, category, productName, brand } = await req.json();
    console.log('Generating attributes for:', productName, 'Category:', category);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

    const systemPrompt = `You are a fashion expert AI. Analyze clothing items and generate detailed attributes in JSON format.

For each item, provide the following attributes:
- color: main colors (array of strings)
- style: fashion style (e.g., casual, formal, sporty, streetwear, elegant, etc.)
- fabric: type of fabric/material
- season: suitable season (spring, summer, autumn, winter, all-season)
- sleeves: sleeve type if applicable (short, long, sleeveless, etc.)
- pattern: pattern type (solid, striped, polka-dot, floral, etc.)
- fit: fit type (slim, regular, oversized, etc.)
- occasion: suitable occasions (array: casual, work, party, sport, date, etc.)
- neckline: neckline type if applicable
- length: length type if applicable
- closure: closure type if applicable
- pockets: has pockets (yes/no)
- decorative_elements: any decorative elements (array)
- vibe: overall vibe/mood (array: edgy, romantic, minimalist, bold, etc.)

Return ONLY valid JSON without any markdown formatting or code blocks.`;

    const userPrompt = `Analyze this ${category} item from ${brand} called "${productName}". Generate comprehensive attributes.`;

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
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${base64Image}` }
              }
            ]
          }
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
    
    const attributesText = data.choices?.[0]?.message?.content;
    
    if (!attributesText) {
      throw new Error('No attributes generated');
    }

    // Clean the response and parse JSON
    let attributes;
    try {
      // Remove markdown code blocks if present
      const cleanedText = attributesText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      attributes = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse attributes:', attributesText);
      throw new Error('Failed to parse AI response as JSON');
    }

    return new Response(
      JSON.stringify({ attributes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-attributes function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
