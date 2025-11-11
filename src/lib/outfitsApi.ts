// import { supabase } from "@/integrations/supabase/client";

// function getImageUrl(imagePath: string | null | undefined): string {
//   if (!imagePath) return '';
//   // Image URLs are already signed URLs from backend
//   return imagePath;
// }

// export interface OutfitItem {
//   id: string;
//   product_id: string;
//   product_name: string;
//   category: string;
//   style?: string;
//   price?: number;
//   image_processed?: string;
//   image_path?: string;
//   shop_link?: string;
// }

// export interface Outfit {
//   id: string;
//   outfit_number: number;
//   occasion: string;
//   items: string[];
//   products: OutfitItem[];
//   created_at: string;
// }

// export interface OutfitsResponse {
//   outfits: Outfit[];
//   unseenCount: number;
//   totalCount: number;
//   viewedCount: number;
// }

// class OutfitsApi {
//   private async getUserIdentifiers() {
//     const { data: { user } } = await supabase.auth.getUser();
    
//     console.log('🔍 Getting user identifiers, user:', user?.id);
    
//     if (user?.id) {
//       console.log('✅ User authenticated:', user.id);
//       return {
//         userId: user.id,
//         anonymousId: null
//       };
//     }
    
//     // For non-authenticated users, use/generate anonymousId
//     let anonymousId = localStorage.getItem('anonymousId');
//     if (!anonymousId) {
//       anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//       localStorage.setItem('anonymousId', anonymousId);
//       console.log('🆕 Generated new anonymousId:', anonymousId);
//     } else {
//       console.log('📦 Using existing anonymousId:', anonymousId);
//     }
    
//     return {
//       userId: null,
//       anonymousId
//     };
//   }

//   async getOutfits(occasion: string = 'general', limit: number = 20): Promise<OutfitsResponse> {
//     const { userId, anonymousId } = await this.getUserIdentifiers();

//     console.log('🎯 Fetching outfits:', { userId, anonymousId, occasion, limit });

//     const { data, error } = await supabase.functions.invoke('get-outfits', {
//       body: { userId, anonymousId, occasion, limit }
//     });

//     if (error) {
//       console.error('❌ Error fetching outfits:', error);
//       throw error;
//     }

//     console.log('✅ Received outfits:', data);
    
//     // Image URLs are already signed URLs from backend
//     const transformedData = {
//       ...data,
//       outfits: data.outfits.map((outfit: any) => ({
//         ...outfit,
//         products: outfit.products.map((product: any) => ({
//           ...product,
//           image_processed: getImageUrl(product.image_processed),
//           image_path: product.image_path
//         }))
//       }))
//     };
    
//     return transformedData as OutfitsResponse;
//   }

//   async recordView(outfitId: string, actionType?: string, actionDetails?: any): Promise<void> {
//     const { userId, anonymousId } = await this.getUserIdentifiers();

//     console.log('📝 Recording view:', { userId, anonymousId, outfitId, actionType });

//     const { error } = await supabase.functions.invoke('record-outfit-view', {
//       body: { userId, anonymousId, outfitId, actionType, actionDetails }
//     });

//     if (error) {
//       console.error('❌ Error recording view:', error);
//     }
//   }

//   async recordAction(actionType: string, actionDetails: any = {}): Promise<void> {
//     const { userId, anonymousId } = await this.getUserIdentifiers();

//     const { error } = await supabase
//       .from('user_action_logs')
//       .insert({
//         user_id: userId,
//         anonymous_id: anonymousId,
//         action_type: actionType,
//         details: actionDetails
//       });

//     if (error) {
//       console.error('❌ Error recording action:', error);
//     }
//   }

//   async generateMoreOutfits(): Promise<void> {
//     console.log('🎨 Triggering outfit generation...');

//     const { error } = await supabase.functions.invoke('generate-outfits', {
//       body: {}
//     });

//     if (error) {
//       console.error('❌ Error generating outfits:', error);
//       throw error;
//     }

//     console.log('✅ Outfit generation triggered');
//   }
// }

// export const outfitsApi = new OutfitsApi();

import { supabase } from "@/integrations/supabase/client";

// Функция для получения signed URL из Supabase Storage (для приватного bucket)
async function getImageUrl(category: string, productId: string): Promise<string> {
  if (!category || !productId) {
    console.warn('⚠️ Missing category or productId for image');
    return '';
  }

  // Формируем правильный путь в Supabase Storage
  // Формат: new_db/{Category}/{art_number}/{art_number}.png
  const storagePath = `new_db/${category}/${productId}/${productId}.png`;

  // Получаем signed URL из Supabase Storage (действителен 1 час)
  const { data, error } = await supabase.storage
    .from('SwipeStyle')
    .createSignedUrl(storagePath, 3600); // 3600 секунд = 1 час

  if (error) {
    console.error(`❌ Error creating signed URL for ${storagePath}:`, error);
    return '';
  }

  console.log(`🖼️ Generated signed URL for ${productId}:`, data.signedUrl);

  return data.signedUrl;
}

export interface OutfitItem {
  id: string;
  product_id: string;
  product_name: string;
  category: string;
  style?: string;
  price?: number;
  image_processed?: string;
  image_path?: string;
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

    console.log('🔍 Getting user identifiers, user:', user?.id);

    if (user?.id) {
      console.log('✅ User authenticated:', user.id);
      return {
        userId: user.id,
        anonymousId: null
      };
    }

    // For non-authenticated users, use/generate anonymousId
    let anonymousId = localStorage.getItem('anonymousId');
    if (!anonymousId) {
      anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('anonymousId', anonymousId);
      console.log('🆕 Generated new anonymousId:', anonymousId);
    } else {
      console.log('📦 Using existing anonymousId:', anonymousId);
    }

    return {
      userId: null,
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

    // Трансформируем пути изображений в правильные Supabase Storage signed URLs
    const transformedData = {
      ...data,
      outfits: await Promise.all(data.outfits.map(async (outfit: any) => ({
        ...outfit,
        products: await Promise.all(outfit.products.map(async (product: any) => {
          // Используем original_id если есть, иначе product_id
          const productId = product.original_id || product.product_id;

          // Генерируем signed URL из Supabase Storage
          const imageUrl = await getImageUrl(product.category, productId);

          return {
            ...product,
            image_processed: imageUrl,
            image_path: product.image_path
          };
        }))
      })))
    };

    console.log('🖼️ Transformed outfit with images:', transformedData.outfits[0]?.products[0]);

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