import { supabase } from "@/integrations/supabase/client";
import { getUserId } from "./userStorage";

const EXTERNAL_SUPABASE_URL = 'https://fdldkohnxiezccirxxfb.supabase.co';

function getImageUrl(product: any): string {
  // Build path: new_db/{Category}/{original_id}/{original_id}.png
  const { category, original_id } = product;
  if (!category || !original_id) return '';
  
  const path = `new_db/${category}/${original_id}/${original_id}.png`;
  return `${EXTERNAL_SUPABASE_URL}/storage/v1/object/public/SwipeStyle/${path}`;
}

export interface OutfitItem {
  id: string;
  product_id: string;
  product_name: string;
  category: string;
  style?: string;
  price?: number;
  image_processed?: string;
  shop_link?: string;
}

export interface Outfit {
  id: string;
  outfit_number: number;
  occasion: string;
  items: string[];
  products: OutfitItem[];
  created_at: string;
}

export interface OutfitsResponse {
  outfits: Outfit[];
  unseenCount: number;
  totalCount: number;
  viewedCount: number;
}

class OutfitsApi {
  private async getUserIdentifiers() {
    const { data: { user } } = await supabase.auth.getUser();
    const anonymousId = user ? null : getUserId();
    
    return {
      userId: user?.id || null,
      anonymousId
    };
  }

  async getOutfits(occasion: string = 'general', limit: number = 20): Promise<OutfitsResponse> {
    const { userId, anonymousId } = await this.getUserIdentifiers();

    console.log('🎯 Fetching outfits:', { userId, anonymousId, occasion, limit });

    const { data, error } = await supabase.functions.invoke('get-outfits', {
      body: { userId, anonymousId, occasion, limit }
    });

    if (error) {
      console.error('❌ Error fetching outfits:', error);
      throw error;
    }

    console.log('✅ Received outfits:', data);
    
    // Transform image paths to full URLs
    const transformedData = {
      ...data,
      outfits: data.outfits.map((outfit: any) => ({
        ...outfit,
        products: outfit.products.map((product: any) => ({
          ...product,
          image_processed: getImageUrl(product)
        }))
      }))
    };
    
    return transformedData as OutfitsResponse;
  }

  async recordView(outfitId: string, actionType?: string, actionDetails?: any): Promise<void> {
    const { userId, anonymousId } = await this.getUserIdentifiers();

    console.log('📝 Recording view:', { userId, anonymousId, outfitId, actionType });

    const { error } = await supabase.functions.invoke('record-outfit-view', {
      body: { userId, anonymousId, outfitId, actionType, actionDetails }
    });

    if (error) {
      console.error('❌ Error recording view:', error);
    }
  }

  async recordAction(actionType: string, actionDetails: any = {}): Promise<void> {
    const { userId, anonymousId } = await this.getUserIdentifiers();

    const { error } = await supabase
      .from('user_action_logs')
      .insert({
        user_id: userId,
        anonymous_id: anonymousId,
        action_type: actionType,
        details: actionDetails
      });

    if (error) {
      console.error('❌ Error recording action:', error);
    }
  }

  async generateMoreOutfits(): Promise<void> {
    console.log('🎨 Triggering outfit generation...');

    const { error } = await supabase.functions.invoke('generate-outfits', {
      body: {}
    });

    if (error) {
      console.error('❌ Error generating outfits:', error);
      throw error;
    }

    console.log('✅ Outfit generation triggered');
  }
}

export const outfitsApi = new OutfitsApi();