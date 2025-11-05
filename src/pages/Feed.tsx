import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { VerticalOutfitFeed } from "@/components/VerticalOutfitFeed";
import { CategoryTabs, Category } from "@/components/CategoryTabs";
import { BottomNavigation } from "@/components/BottomNavigation";
import { outfitGenerationApi } from "@/lib/outfitGenerationApi";
import { useToast } from "@/hooks/use-toast";

const Feed = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const { toast } = useToast();
  
  // Generate initial batch of outfits
  const { data: aiGeneratedOutfits, isLoading, error: generationError } = useQuery({
    queryKey: ['generated-outfits'],
    queryFn: async () => {
      console.log('Generating initial outfit batch...');
      const outfits = await outfitGenerationApi.generateBatch(5);
      return outfits;
    },
    staleTime: Infinity,
    retry: 1,
  });

  // Prefetch next batch when user scrolls
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
      
      if (errorMessage.includes('No products in database')) {
        toast({
          title: "База данных пуста",
          description: "Перейдите на /import-products чтобы импортировать товары",
          variant: "destructive",
          duration: 10000,
        });
      } else {
        toast({
          title: "Ошибка генерации",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }
  }, [generationError, toast]);

  const allOutfits = aiGeneratedOutfits || [];

  // Filter by category
  const filteredOutfits = activeCategory === "all" 
    ? allOutfits 
    : allOutfits.filter(outfit => outfit.category === activeCategory);

  return (
    <div className="min-h-screen w-full bg-black">
      {/* Empty database message */}
      {generationError && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-50 bg-yellow-500 text-white px-6 py-3 rounded-lg text-sm animate-fade-in max-w-md text-center">
          <div className="font-semibold mb-1">⚠️ База данных пуста</div>
          <div className="text-xs">
            Импортируйте товары через <a href="/import-products" className="underline font-bold">эту страницу</a>
          </div>
        </div>
      )}
      
      <CategoryTabs 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory}
      />
      
      <div className="pt-16 pb-14">
        {isLoading ? (
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Генерируем образы для вас...</p>
            </div>
          </div>
        ) : filteredOutfits.length === 0 ? (
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <div className="text-white text-center max-w-md px-4">
              <p className="text-xl mb-4">😔</p>
              <p>Нет образов в этой категории</p>
            </div>
          </div>
        ) : (
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
