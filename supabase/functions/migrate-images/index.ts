import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// External Supabase configuration
const EXTERNAL_SUPABASE_URL = 'https://fdldkohnxiezccirxxfb.supabase.co';
const EXTERNAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbGRrb2hueGllemNjaXJ4eGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA3MzI0NTMsImV4cCI6MjA0NjMwODQ1M30.YFxOuYQqx5xBz2vEXQZDGm3xtB5ZRkEw9vj4-vZHLt4';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase clients
    const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY);
    const localSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { batchSize = 50, offset = 0 } = await req.json();

    console.log(`Processing batch: offset=${offset}, size=${batchSize}`);

    // Get products batch
    const { data: products, error: fetchError } = await localSupabase
      .from('products')
      .select('id, product_id, category, original_id, wildberries_id, image_processed')
      .range(offset, offset + batchSize - 1);

    if (fetchError) {
      throw new Error(`Failed to fetch products: ${fetchError.message}`);
    }

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No more products to process', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${products.length} products`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const product of products) {
      try {
        const { category, original_id } = product;
        if (!category || !original_id) {
          console.log(`Skipping product ${product.product_id}: missing category or original_id`);
          continue;
        }

        // Build external image path
        const externalPath = `new_db/${category}/${original_id}.png`;
        const externalUrl = `${EXTERNAL_SUPABASE_URL}/storage/v1/object/public/SwipeStyle/${externalPath}`;
        
        console.log(`Downloading: ${externalUrl}`);

        // Download image from external storage
        const imageResponse = await fetch(externalUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to download image: ${imageResponse.status}`);
        }

        const imageBlob = await imageResponse.blob();
        const imageBuffer = await imageBlob.arrayBuffer();

        // Upload to local storage
        const localPath = `${category}/${original_id}.png`;
        
        const { error: uploadError } = await localSupabase.storage
          .from('clothing-images')
          .upload(localPath, imageBuffer, {
            contentType: 'image/png',
            upsert: true
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Update product with new path
        const { error: updateError } = await localSupabase
          .from('products')
          .update({ image_processed: localPath })
          .eq('id', product.id);

        if (updateError) {
          throw new Error(`Database update failed: ${updateError.message}`);
        }

        successCount++;
        console.log(`✓ Migrated: ${product.product_id}`);

      } catch (error) {
        errorCount++;
        const errorMsg = `Failed to process ${product.product_id}: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: products.length,
        successful: successCount,
        failed: errorCount,
        errors: errors.slice(0, 10), // Return first 10 errors
        hasMore: products.length === batchSize
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
