import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// External Supabase configuration
const EXTERNAL_SUPABASE_URL = 'https://fdldkohnxiezccirxxfb.supabase.co';
const EXTERNAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbGRrb2hueGllemNjaXJ4eGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDgxMzksImV4cCI6MjA3NzkyNDEzOX0.DEcALBwNO1tkoCRzVTifrvd7nFaz_T7heDwfaEE8fJU';

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

    // First, let's explore the bucket structure
    console.log('=== Exploring SwipeStyle bucket ===');
    
    // List root folders
    const { data: rootFolders, error: rootError } = await externalSupabase.storage
      .from('SwipeStyle')
      .list('', { limit: 100 });
    
    console.log('Root folders:', JSON.stringify(rootFolders, null, 2));
    if (rootError) console.error('Root error:', rootError);
    
    // List new_db contents
    const { data: newDbContents, error: newDbError } = await externalSupabase.storage
      .from('SwipeStyle')
      .list('new_db', { limit: 100 });
    
    console.log('new_db contents:', JSON.stringify(newDbContents, null, 2));
    if (newDbError) console.error('new_db error:', newDbError);
    
    // Try to list one category
    if (newDbContents && newDbContents.length > 0) {
      const firstCategory = newDbContents[0].name;
      const { data: categoryContents, error: categoryError } = await externalSupabase.storage
        .from('SwipeStyle')
        .list(`new_db/${firstCategory}`, { limit: 10 });
      
      console.log(`Category ${firstCategory} contents:`, JSON.stringify(categoryContents, null, 2));
      if (categoryError) console.error('Category error:', categoryError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        rootFolders: rootFolders?.length || 0,
        newDbContents: newDbContents?.length || 0,
        message: 'Check logs for structure'
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
