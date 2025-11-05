import { createClient } from '@supabase/supabase-js';

// External Supabase project configuration
const EXTERNAL_SUPABASE_URL = 'https://fdldkohnxiezccirxxfb.supabase.co';
const EXTERNAL_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbGRrb2hueGllemNjaXJ4eGZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM0ODEzOSwiZXhwIjoyMDc3OTI0MTM5fQ.fy6tc4oIy-rl193AjouUlTxXN7MJJM5pF_qIwJa-mzM';

const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_SERVICE_KEY);

/**
 * Get image URL from external Storage (SwipeStyle bucket)
 * @param path - Path within new_db folder (e.g., "AnkleBoots/176006711/176006711.png")
 */
export function getExternalImageUrl(path: string): string {
  const fullPath = `new_db/${path}`;
  return `${EXTERNAL_SUPABASE_URL}/storage/v1/object/public/SwipeStyle/${fullPath}`;
}

/**
 * Get signed URL for external Storage (valid for 7 days)
 * @param path - Path within new_db folder
 */
export async function getExternalSignedUrl(path: string): Promise<string | null> {
  try {
    const fullPath = `new_db/${path}`;
    const { data, error } = await externalSupabase.storage
      .from('SwipeStyle')
      .createSignedUrl(fullPath, 604800); // 7 days

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Failed to get signed URL:', error);
    return null;
  }
}

/**
 * List files in a category folder
 * @param category - Category folder name (e.g., "AnkleBoots")
 */
export async function listCategoryFiles(category: string) {
  try {
    const { data, error } = await externalSupabase.storage
      .from('SwipeStyle')
      .list(`new_db/${category}`);

    if (error) {
      console.error('Error listing files:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to list files:', error);
    return [];
  }
}
