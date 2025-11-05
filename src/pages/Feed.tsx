import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { VerticalOutfitFeed } from "@/components/VerticalOutfitFeed";
import { CategoryTabs, Category } from "@/components/CategoryTabs";
import { BottomNavigation } from "@/components/BottomNavigation";
import { outfitGenerationApi } from "@/lib/outfitGenerationApi";
import { useToast } from "@/hooks/use-toast";
import { isProductsTableEmpty, autoImportProducts } from "@/lib/importProducts";

const Feed = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const { toast } = useToast();
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importComplete, setImportComplete] = useState(false);
  
  // Check if we need to auto-import
  const { data: needsImport } = useQuery({
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

  // Generate outfits (only when DB is ready)
  const { data: aiGeneratedOutfits, isLoading, error: generationError } = useQuery({
    queryKey: ['generated-outfits'],
    queryFn: async () => {
      console.log('Generating initial outfit batch...');
      const outfits = await outfitGenerationApi.generateBatch(5);
      return outfits;
    },
    staleTime: Infinity,
    retry: 1,
    enabled: !isImporting && needsImport === false, // Only when DB has data
  });

  // Prefetch next batch
  const prefetchNextBatch = async () => {
    try {
      await outfitGenerationApi.generateBatch(5);
      console.log('Prefetched next batch');
    } catch (err) {
      console.error('Failed to prefetch:', err);
    }
  };

  useEffect(() => {
    if (generationError) {
      const errorMessage = generationError instanceof Error 
        ? generationError.message 
        : "Не удалось сгенерировать образы";
      
      toast({
        title: "Ошибка генерации",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [generationError, toast]);

  const allOutfits = aiGeneratedOutfits || [];

  // Filter by category
  const filteredOutfits = activeCategory === "all" 
    ? allOutfits 
    : allOutfits.filter(outfit => outfit.category === activeCategory);

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

        {/* Generating outfits */}
        {!isImporting && isLoading && (
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Генерируем образы для вас...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {!isImporting && generationError && (
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <div className="text-white text-center max-w-md px-4">
              <p className="text-xl mb-4">😔</p>
              <p className="mb-2">Ошибка генерации образов</p>
              <p className="text-sm text-gray-400">
                {generationError instanceof Error ? generationError.message : 'Попробуйте перезагрузить страницу'}
              </p>
            </div>
          </div>
        )}

        {/* Empty category state */}
        {!isImporting && !isLoading && !generationError && filteredOutfits.length === 0 && (
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <div className="text-white text-center max-w-md px-4">
              <p className="text-xl mb-4">😔</p>
              <p>Нет образов в этой категории</p>
            </div>
          </div>
        )}

        {/* Feed ready */}
        {!isImporting && !isLoading && filteredOutfits.length > 0 && (
          <VerticalOutfitFeed 
            outfits={filteredOutfits}
            onInteraction={prefetchNextBatch}
            useML={false}
          />
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Feed;
