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
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importComplete, setImportComplete] = useState(false);
  
  // Check if we need to auto-import
  const { data: needsImport, isLoading: checkingDB } = useQuery({
    queryKey: ['check-products-empty'],
    queryFn: isProductsTableEmpty,
    staleTime: Infinity,
  });

  // Auto-import if needed
  useEffect(() => {
    if (needsImport && !isImporting && !importComplete) {
      console.log('Products table is empty, starting auto-import...');
      setIsImporting(true);
      
      autoImportProducts((current, total) => {
        setImportProgress({ current, total });
      })
        .then((result) => {
          if (result.success) {
            console.log(`Auto-imported ${result.imported} products`);
            toast({
              title: "База данных готова",
              description: `Импортировано ${result.imported} товаров`,
            });
            setImportComplete(true);
          } else {
            toast({
              title: "Ошибка импорта",
              description: result.error || "Не удалось импортировать товары",
              variant: "destructive"
            });
          }
        })
        .catch((error) => {
          console.error('Auto-import failed:', error);
          toast({
            title: "Ошибка импорта",
            description: error instanceof Error ? error.message : "Неизвестная ошибка",
            variant: "destructive"
          });
        })
        .finally(() => {
          setIsImporting(false);
          setImportProgress(null);
        });
    }
  }, [needsImport, isImporting, importComplete, toast]);

  // Load outfits from new API
  const { data: outfitsData, isLoading: isLoadingOutfits, refetch } = useQuery({
    queryKey: ['outfits', activeCategory],
    queryFn: () => {
      const occasion = activeCategory === 'all' ? 'general' : activeCategory;
      return outfitsApi.getOutfits(occasion, 20);
    },
    enabled: !isImporting && !checkingDB && (needsImport === false || importComplete),
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
        {/* Auto-import in progress */}
        {isImporting && importProgress && (
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <div className="text-white text-center max-w-md px-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-6"></div>
              <p className="text-xl mb-2">Первый запуск</p>
              <p className="text-sm text-gray-400 mb-4">Загружаем базу товаров...</p>
              <div className="bg-gray-800 rounded-full h-2 overflow-hidden mb-2">
                <div 
                  className="bg-white h-full transition-all duration-300"
                  style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                {importProgress.current} / {importProgress.total}
              </p>
            </div>
          </div>
        )}

        {/* Loading outfits */}
        {!isImporting && isLoadingOutfits && (
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-lg">Загружаем образы...</p>
            </div>
          </div>
        )}

        {/* Empty category state */}
        {!isImporting && !isLoadingOutfits && filteredOutfits.length === 0 && (
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <div className="text-white text-center max-w-md px-4">
              <p className="text-xl mb-4">😔</p>
              <p className="text-lg">В этой категории пока нет образов</p>
            </div>
          </div>
        )}

        {/* Feed ready */}
        {!isImporting && !isLoadingOutfits && filteredOutfits.length > 0 && (
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