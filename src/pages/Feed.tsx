import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { VerticalOutfitFeed } from "@/components/VerticalOutfitFeed";
import { CategoryTabs, Category } from "@/components/CategoryTabs";
import { BottomNavigation } from "@/components/BottomNavigation";
import { outfitsApi, Outfit } from "@/lib/outfitsApi";
import { useToast } from "@/hooks/use-toast";
import { isProductsTableEmpty, autoImportProducts } from "@/lib/importProducts";
import { supabase } from "@/integrations/supabase/client";

const Feed = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { toast } = useToast();
  
  // Load outfits from database or Try-This API
  const { data: outfitsData, isLoading: isLoadingOutfits, refetch } = useQuery({
    queryKey: ['outfits', activeCategory],
    queryFn: async () => {
      // First try to load from database
      const occasion = activeCategory === 'all' ? null : activeCategory;
      const query = supabase
        .from('outfits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (occasion) {
        query.eq('occasion', occasion);
      }
      
      const { data: dbOutfits, error } = await query;
      
      if (error) {
        console.error('Error loading outfits from DB:', error);
      }
      
      // If we have outfits in DB, use them
      if (dbOutfits && dbOutfits.length > 0) {
        console.log('✅ Loaded outfits from database:', dbOutfits.length);
        return {
          outfits: dbOutfits.map(outfit => ({
            id: outfit.id,
            outfit_number: outfit.outfit_number,
            occasion: outfit.occasion,
            items: Array.isArray(outfit.items) ? outfit.items.map((item: any) => item.product_id || '') : [],
            products: Array.isArray(outfit.items) ? outfit.items.map((item: any) => ({
              id: item.id || '',
              product_id: item.product_id || '',
              category: item.category || '',
              product_name: item.product_name || '',
              price: item.price || 0,
              image_path: item.image_path || '',
              image_processed: item.image_processed || '',
              shop_link: item.shop_link || ''
            })) : [],
            created_at: outfit.created_at
          })),
          unseenCount: dbOutfits.length,
          totalCount: dbOutfits.length,
          viewedCount: 0
        };
      }
      
      // Fallback to Try-This API if no DB outfits
      console.log('⚠️ No DB outfits, falling back to Try-This API');
      const products = await outfitsApi.getTryThisOutfit();
      return {
        outfits: [{
          id: `trythis_${Date.now()}`,
          outfit_number: 1,
          occasion: activeCategory === 'all' ? 'general' : activeCategory,
          items: products.map(p => p.product_id),
          products: products,
          created_at: new Date().toISOString()
        }],
        unseenCount: 1,
        totalCount: 1,
        viewedCount: 0
      };
    },
    staleTime: 5000,
  });

  useEffect(() => {
    if (outfitsData?.outfits) {
      console.log('✅ Loaded outfits:', outfitsData.outfits.length);
      console.log('📊 Stats:', {
        unseen: outfitsData.unseenCount,
        total: outfitsData.totalCount,
        viewed: outfitsData.viewedCount
      });
      setOutfits(outfitsData.outfits);
    }
  }, [outfitsData]);

  // Load more outfits when user scrolls near the end
  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    
    try {
      setIsLoadingMore(true);
      
      // Try to load more from database first
      const occasion = activeCategory === 'all' ? null : activeCategory;
      const query = supabase
        .from('outfits')
        .select('*')
        .order('created_at', { ascending: false })
        .range(outfits.length, outfits.length + 9);
      
      if (occasion) {
        query.eq('occasion', occasion);
      }
      
      const { data: moreOutfits, error } = await query;
      
      if (!error && moreOutfits && moreOutfits.length > 0) {
        const newOutfits = moreOutfits.map(outfit => ({
          id: outfit.id,
          outfit_number: outfit.outfit_number,
          occasion: outfit.occasion,
          items: Array.isArray(outfit.items) ? outfit.items.map((item: any) => item.product_id || '') : [],
          products: Array.isArray(outfit.items) ? outfit.items.map((item: any) => ({
            id: item.id || '',
            product_id: item.product_id || '',
            category: item.category || '',
            product_name: item.product_name || '',
            price: item.price || 0,
            image_path: item.image_path || '',
            image_processed: item.image_processed || '',
            shop_link: item.shop_link || ''
          })) : [],
          created_at: outfit.created_at
        }));
        
        setOutfits(prev => [...prev, ...newOutfits]);
      } else {
        // Fallback to Try-This API
        const products = await outfitsApi.getTryThisOutfit();
        const newOutfit = {
          id: `trythis_${Date.now()}`,
          outfit_number: outfits.length + 1,
          occasion: activeCategory === 'all' ? 'general' : activeCategory,
          items: products.map(p => p.product_id),
          products: products,
          created_at: new Date().toISOString()
        };
        setOutfits(prev => [...prev, newOutfit]);
      }
    } catch (error) {
      console.error('Error loading more outfits:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Record view when user sees an outfit
  const handleOutfitView = async (outfitId: string) => {
    try {
      await outfitsApi.recordView(outfitId, 'view');
      // Refetch to update unseen count
      refetch();
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  // Record interaction actions
  const handleInteraction = async (outfitId: string, interactionType: 'like' | 'skip' | 'share' | 'view_detail') => {
    try {
      await outfitsApi.recordView(outfitId, interactionType);
      await outfitsApi.recordAction(interactionType, { outfit_id: outfitId });
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  };

  const filteredOutfits = outfits;

  return (
    <div className="min-h-screen w-full bg-black">
      <CategoryTabs 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory}
      />
      
      <div className="pt-16 pb-14">
        {/* Loading outfits */}
        {isLoadingOutfits && (
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-lg">Загружаем образы...</p>
            </div>
          </div>
        )}

        {/* Empty category state */}
        {!isLoadingOutfits && filteredOutfits.length === 0 && (
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <div className="text-white text-center max-w-md px-4">
              <p className="text-xl mb-4">😔</p>
              <p className="text-lg">В этой категории пока нет образов</p>
            </div>
          </div>
        )}

        {/* Feed ready */}
        {!isLoadingOutfits && filteredOutfits.length > 0 && (
          <VerticalOutfitFeed 
            outfits={filteredOutfits.map(outfit => {
              const items = outfit.products.map(product => ({
                id: product.id,
                name: product.product_name,
                brand: '',
                category: product.category,
                itemNumber: product.product_id,
                price: product.price || 0,
                shopUrl: product.shop_link || '',
                // Use placeholder image if no image available
                image: product.image_processed || product.image_path || `https://placehold.co/400x600/e5e7eb/9ca3af?text=${product.category}`,
                position: { left: '0%', top: '0%' },
                placement: 'below' as const
              }));
              
              console.log(`✅ Outfit ${outfit.id}: ${items.length} items (with placeholders if needed)`);
              
              return {
                id: outfit.id,
                image: '',
                occasion: outfit.occasion,
                items
              };
            })}
            onView={handleOutfitView}
            onInteraction={handleLoadMore}
            useML={false}
          />
        )}
        
        {/* Loading more indicator */}
        {isLoadingMore && (
          <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
            Загружаем ещё...
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Feed;