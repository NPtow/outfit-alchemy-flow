import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { imageUrl, category, brand, productName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating attributes for:', category, brand, productName);

    const systemPrompt = `You are a fashion expert. Analyze the clothing item and return detailed attributes in JSON format.
    
Required attributes:
- colors: array of main colors (e.g., ["черный", "белый"])
- style: array of style categories (e.g., ["casual", "elegant", "streetwear", "minimalist"])
- fabric: array of fabric types if visible (e.g., ["cotton", "denim", "leather"])
- season: array of suitable seasons (e.g., ["spring", "summer", "fall", "winter"])
- occasion: array of occasions (e.g., ["work", "party", "casual", "date", "sport"])
- sleeves: sleeve length if applicable ("short", "long", "sleeveless", "3/4")
- pattern: pattern type if applicable (e.g., ["solid", "striped", "polka-dot", "floral"])
- fit: fit type (e.g., "loose", "regular", "slim", "oversized")
- length: length type if applicable (e.g., "short", "midi", "long", "mini")
- decorative_elements: array of decorative elements (e.g., ["buttons", "zippers", "pockets", "embroidery"])
- vibe: overall vibe (e.g., ["romantic", "edgy", "classic", "modern", "vintage"])

Return ONLY valid JSON without any additional text.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this ${category} item. Brand: ${brand || 'unknown'}, Product: ${productName || 'unknown'}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const attributesText = data.choices?.[0]?.message?.content;

    if (!attributesText) {
      throw new Error('No attributes returned from AI');
    }

    // Parse JSON from the response
    let attributes;
    try {
      // Remove markdown code blocks if present
      const cleanText = attributesText.replace(/```json\n?|\n?```/g, '').trim();
      attributes = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse attributes:', attributesText);
      throw new Error('Failed to parse AI response as JSON');
    }

    console.log('Attributes generated successfully:', attributes);

    return new Response(
      JSON.stringify({ attributes }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
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
