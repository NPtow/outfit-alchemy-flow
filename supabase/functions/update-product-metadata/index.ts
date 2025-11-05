import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EXTERNAL_SUPABASE_URL = 'https://fdldkohnxiezccirxxfb.supabase.co';
const EXTERNAL_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbGRrb2hueGllemNjaXJ4eGZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM0ODEzOSwiZXhwIjoyMDc3OTI0MTM5fQ.fy6tc4oIy-rl193AjouUlTxXN7MJJM5pF_qIwJa-mzM';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_SERVICE_KEY);
    const localSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('Starting metadata update...');

    // Get all categories from new_db folder
    const { data: categories, error: catError } = await externalSupabase.storage
      .from('SwipeStyle')
      .list('new_db', { limit: 100 });

    if (catError) throw new Error(`Failed to list categories: ${catError.message}`);
    
    console.log(`Found ${categories?.length || 0} categories`);

    let totalUpdated = 0;
    let totalFailed = 0;
    const errors: string[] = [];

    for (const category of categories || []) {
      if (!category.name) continue;
      
      console.log(`Processing category: ${category.name}`);

      // List all files in category folder
      const { data: files, error: filesError } = await externalSupabase.storage
        .from('SwipeStyle')
        .list(`new_db/${category.name}`, { limit: 1000 });

      if (filesError) {
        console.error(`Error listing files in ${category.name}:`, filesError);
        continue;
      }

      // Find JSON files
      const jsonFiles = files?.filter(f => f.name.endsWith('.json')) || [];
      console.log(`Found ${jsonFiles.length} JSON files in ${category.name}`);

      for (const jsonFile of jsonFiles) {
        try {
          const jsonPath = `new_db/${category.name}/${jsonFile.name}`;
          
          // Download JSON file
          const { data: jsonData, error: downloadError } = await externalSupabase.storage
            .from('SwipeStyle')
            .download(jsonPath);

          if (downloadError) {
            console.error(`Failed to download ${jsonPath}:`, downloadError);
            totalFailed++;
            errors.push(`${jsonPath}: ${downloadError.message}`);
            continue;
          }

          // Parse JSON
          const jsonText = await jsonData.text();
          const metadata = JSON.parse(jsonText);

          // Extract product ID from filename (e.g., "176006711.json" -> "176006711")
          const productId = jsonFile.name.replace('.json', '');
          const fullProductId = `${category.name}_${productId}`;

          console.log(`Updating product ${fullProductId} with metadata:`, metadata);

          // Update product in database
          const { error: updateError } = await localSupabase
            .from('products')
            .update({
              product_name: metadata.name || metadata.title || metadata.product_name || 'Unknown',
              price: metadata.price || metadata.cost || 0,
              metadata: metadata,
            })
            .eq('product_id', fullProductId);

          if (updateError) {
            console.error(`Failed to update ${fullProductId}:`, updateError);
            totalFailed++;
            errors.push(`${fullProductId}: ${updateError.message}`);
          } else {
            totalUpdated++;
          }

        } catch (error) {
          console.error(`Error processing ${jsonFile.name}:`, error);
          totalFailed++;
          errors.push(`${jsonFile.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }

    console.log(`Update complete. Updated: ${totalUpdated}, Failed: ${totalFailed}`);

    return new Response(
      JSON.stringify({
        success: true,
        updated: totalUpdated,
        failed: totalFailed,
        errors: errors.slice(0, 10), // Return first 10 errors
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Update error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
