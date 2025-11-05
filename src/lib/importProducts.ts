import { supabase } from '@/integrations/supabase/client';

interface ProductRow {
  product_id: string;
  original_id: string;
  wildberries_id: string;
  category: string;
  product_name: string;
  price: string;
  style: string;
  shop_link: string;
  image_path: string;
  image_processed: string;
  generated_attributes: string;
  metadata: string;
}

export async function importProductsFromCSV(csvText: string): Promise<void> {
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');
  
  // Parse CSV rows
  const products: ProductRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Handle CSV with quotes and commas inside fields
    const values: string[] = [];
    let currentValue = '';
    let insideQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());
    
    if (values.length >= 12) {
      products.push({
        product_id: values[0],
        original_id: values[1],
        wildberries_id: values[2],
        category: values[3],
        product_name: values[4],
        price: values[5],
        style: values[6],
        shop_link: values[7],
        image_path: values[8],
        image_processed: values[9],
        generated_attributes: values[10].replace(/^"|"$/g, ''),
        metadata: values[11].replace(/^"|"$/g, '')
      });
    }
  }
  
  console.log(`Parsed ${products.length} products from CSV`);
  
  // Insert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    
    const insertData = batch.map(p => ({
      product_id: p.product_id,
      original_id: p.original_id,
      wildberries_id: p.wildberries_id,
      category: p.category,
      product_name: p.product_name,
      price: parseFloat(p.price) || 0,
      style: p.style,
      shop_link: p.shop_link,
      image_path: p.image_path,
      image_processed: p.image_processed,
      generated_attributes: p.generated_attributes,
      metadata: JSON.parse(p.metadata)
    }));
    
    const { error } = await supabase
      .from('products')
      .insert(insertData);
    
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      throw error;
    }
    
    console.log(`Inserted batch ${i / batchSize + 1} of ${Math.ceil(products.length / batchSize)}`);
  }
  
  console.log('All products imported successfully!');
}
