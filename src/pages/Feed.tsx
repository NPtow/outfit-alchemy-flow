import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { VerticalOutfitFeed } from "@/components/VerticalOutfitFeed";
import { CategoryTabs, Category } from "@/components/CategoryTabs";
import { BottomNavigation } from "@/components/BottomNavigation";
import { outfitsApi, Outfit } from "@/lib/outfitsApi";
import { useToast } from "@/hooks/use-toast";
import { isProductsTableEmpty, autoImportProducts } from "@/lib/importProducts";

const Feed = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const { toast } = useToast();
  const [isImporting] = useState(false); // Disabled auto-import since products exist
  
  // Load outfits from new API
  const { data: outfitsData, isLoading: isLoadingOutfits, refetch } = useQuery({
    queryKey: ['outfits', activeCategory],
    queryFn: () => {
      const occasion = activeCategory === 'all' ? 'general' : activeCategory;
      return outfitsApi.getOutfits(occasion, 20);
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
            outfits={filteredOutfits.map(outfit => ({
              id: outfit.id,
              image: '', // Will be generated from products
              occasion: outfit.occasion,
              items: outfit.products.map(product => ({
                id: product.id,
                name: product.product_name,
                brand: '',
                category: product.category,
                itemNumber: product.product_id,
                price: product.price || 0,
                shopUrl: product.shop_link || '',
                image: product.image_processed || '',
                position: { left: '0%', top: '0%' }, // Will be calculated in VerticalOutfitFeed
                placement: 'below' as const
              })).filter(item => {
                // Log and filter out items with no image
                if (!item.image) {
                  console.warn('⚠️ Product missing image:', item.itemNumber);
                  return false;
                }
                console.log('✅ Product image URL:', item.image);
                return true;
              })
            }))}
            onView={handleOutfitView}
            useML={false}
          />
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Feed;