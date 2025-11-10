// import { useState, useEffect } from "react";
// import { useQuery } from '@tanstack/react-query';
// import { VerticalOutfitFeed } from "@/components/VerticalOutfitFeed";
// import { CategoryTabs, Category } from "@/components/CategoryTabs";
// import { BottomNavigation } from "@/components/BottomNavigation";
// import { outfitsApi, Outfit } from "@/lib/outfitsApi";
// import { useToast } from "@/hooks/use-toast";
// import { isProductsTableEmpty, autoImportProducts } from "@/lib/importProducts";

// const Feed = () => {
//   const [activeCategory, setActiveCategory] = useState<Category>("all");
//   const [outfits, setOutfits] = useState<Outfit[]>([]);
//   const [isLoadingMore, setIsLoadingMore] = useState(false);
//   const { toast } = useToast();
  
//   // Load outfits from Try-This API
//   const { data: outfitsData, isLoading: isLoadingOutfits, refetch } = useQuery({
//     queryKey: ['trythis-outfits', activeCategory],
//     queryFn: async () => {
//       const products = await outfitsApi.getTryThisOutfit();
//       // Create a single outfit from Try-This response
//       return {
//         outfits: [{
//           id: `trythis_${Date.now()}`,
//           outfit_number: 1,
//           occasion: activeCategory === 'all' ? 'general' : activeCategory,
//           items: products.map(p => p.product_id),
//           products: products,
//           created_at: new Date().toISOString()
//         }],
//         unseenCount: 1,
//         totalCount: 1,
//         viewedCount: 0
//       };
//     },
//     staleTime: 120000,
//   });

//   useEffect(() => {
//     if (outfitsData?.outfits) {
//       console.log('✅ Loaded outfits:', outfitsData.outfits.length);
//       console.log('📊 Stats:', {
//         unseen: outfitsData.unseenCount,
//         total: outfitsData.totalCount,
//         viewed: outfitsData.viewedCount
//       });
//       setOutfits(outfitsData.outfits);
//     }
//   }, [outfitsData]);

//   // Load more outfits when user scrolls near the end
//   const handleLoadMore = async () => {
//     if (isLoadingMore) return;
    
//     try {
//       setIsLoadingMore(true);
//       const products = await outfitsApi.getTryThisOutfit();
      
//       // Create a new outfit from Try-This
//       const newOutfit = {
//         id: `trythis_${Date.now()}`,
//         outfit_number: outfits.length + 1,
//         occasion: activeCategory === 'all' ? 'general' : activeCategory,
//         items: products.map(p => p.product_id),
//         products: products,
//         created_at: new Date().toISOString()
//       };
      
//       setOutfits(prev => [...prev, newOutfit]);
//     } catch (error) {
//       console.error('Error loading more outfits:', error);
//     } finally {
//       setIsLoadingMore(false);
//     }
//   };

//   // Record view when user sees an outfit
//   const handleOutfitView = async (outfitId: string) => {
//     try {
//       await outfitsApi.recordView(outfitId, 'view');
//       // Refetch to update unseen count
//       refetch();
//     } catch (error) {
//       console.error('Error recording view:', error);
//     }
//   };

//   // Record interaction actions
//   const handleInteraction = async (outfitId: string, interactionType: 'like' | 'skip' | 'share' | 'view_detail') => {
//     try {
//       await outfitsApi.recordView(outfitId, interactionType);
//       await outfitsApi.recordAction(interactionType, { outfit_id: outfitId });
//     } catch (error) {
//       console.error('Error recording interaction:', error);
//     }
//   };

//   const filteredOutfits = outfits;

//   return (
//     <div className="min-h-screen w-full bg-black">
//       <CategoryTabs 
//         activeCategory={activeCategory} 
//         onCategoryChange={setActiveCategory}
//       />
      
//       <div className="pt-16 pb-14">
//         {/* Loading outfits */}
//         {isLoadingOutfits && (
//           <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
//             <div className="text-white text-center">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
//               <p className="text-lg">Загружаем образы...</p>
//             </div>
//           </div>
//         )}

//         {/* Empty category state */}
//         {!isLoadingOutfits && filteredOutfits.length === 0 && (
//           <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
//             <div className="text-white text-center max-w-md px-4">
//               <p className="text-xl mb-4">😔</p>
//               <p className="text-lg">В этой категории пока нет образов</p>
//             </div>
//           </div>
//         )}

//         {/* Feed ready */}
//         {!isLoadingOutfits && filteredOutfits.length > 0 && (
//           <VerticalOutfitFeed 
//             outfits={filteredOutfits.map(outfit => {
//               const items = outfit.products.map(product => ({
//                 id: product.id,
//                 name: product.product_name,
//                 brand: '',
//                 category: product.category,
//                 itemNumber: product.product_id,
//                 price: product.price || 0,
//                 shopUrl: product.shop_link || '',
//                 // Use placeholder image if no image available
//                 image: product.image_processed || product.image_path || `https://placehold.co/400x600/e5e7eb/9ca3af?text=${product.category}`,
//                 position: { left: '0%', top: '0%' },
//                 placement: 'below' as const
//               }));
              
//               console.log(`✅ Outfit ${outfit.id}: ${items.length} items (with placeholders if needed)`);
              
//               return {
//                 id: outfit.id,
//                 image: '',
//                 occasion: outfit.occasion,
//                 items
//               };
//             })}
//             onView={handleOutfitView}
//             onInteraction={handleLoadMore}
//             useML={false}
//           />
//         )}
        
//         {/* Loading more indicator */}
//         {isLoadingMore && (
//           <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
//             Загружаем ещё...
//           </div>
//         )}
//       </div>
      
//       <BottomNavigation />
//     </div>
//   );
// };

// export default Feed;


import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { VerticalOutfitFeed } from "@/components/VerticalOutfitFeed";
import { CategoryTabs, Category } from "@/components/CategoryTabs";
import { BottomNavigation } from "@/components/BottomNavigation";
import { mlApi } from "@/lib/mlApi";
import { getUserId } from "@/lib/userStorage";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Feed = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [useML, setUseML] = useState(false);
  const userId = getUserId();
  const { toast } = useToast();

  // Проверяем доступность ML backend при загрузке
  // useEffect(() => {
  //   mlApi.checkStatus().then(status => {
  //     if (status) {
  //       console.log('✅ ML Backend доступен:', status);
  //       setUseML(true);
  //     } else {
  //       console.warn('⚠️ ML Backend недоступен, используем fallback');
  //       toast({
  //         title: "ML Backend недоступен",
  //         description: "Работаем без ML персонализации",
  //       });
  //     }
  //   });
  // }, []);

  const allOutfits = [
    {
      id: "outfit-1",
      occasion: "Outfit 1",
      category: "casual" as Category,
      image: "",
      items: [
        {
          id: "1",
          name: "Худи",
          brand: "Wildberries",
          category: "Худи",
          itemNumber: "500291576",
          price: 2929,
          shopUrl: "https://www.wildberries.ru/catalog/500291576/detail.aspx",
          position: { top: "22%", left: "35%" },
          placement: "above" as const,
        },
        {
          id: "2",
          name: "Майка",
          brand: "Wildberries",
          category: "Майка",
          itemNumber: "425380572",
          price: 782,
          shopUrl: "https://www.wildberries.ru/catalog/425380572/detail.aspx",
          position: { top: "25%", left: "62%" },
          placement: "above" as const,
        },
        {
          id: "3",
          name: "Брюки",
          brand: "Wildberries",
          category: "Брюки",
          itemNumber: "476090600",
          price: 2152,
          shopUrl: "https://www.wildberries.ru/catalog/476090600/detail.aspx",
          position: { top: "58%", left: "68%" },
          placement: "below" as const,
        },
        {
          id: "4",
          name: "Кроссовки",
          brand: "Wildberries",
          category: "Кроссовки",
          itemNumber: "301698003",
          price: 1630,
          shopUrl: "https://www.wildberries.ru/catalog/301698003/detail.aspx",
          position: { top: "68%", left: "58%" },
          placement: "below" as const,
        },
        {
          id: "5",
          name: "Сумка",
          brand: "Wildberries",
          category: "Сумка",
          itemNumber: "360419398",
          price: 793,
          shopUrl: "https://www.wildberries.ru/catalog/360419398/detail.aspx",
          position: { top: "68%", left: "18%" },
          placement: "below" as const,
        },
      ],
    },
    {
      id: "outfit-2",
      occasion: "Outfit 2",
      category: "evening" as Category,
      image: "",
      items: [
        {
          id: "6",
          name: "Куртка",
          brand: "Wildberries",
          category: "Куртка",
          itemNumber: "491770420",
          price: 2382,
          shopUrl: "https://www.wildberries.ru/catalog/491770420/detail.aspx",
          position: { top: "24%", left: "28%" },
          placement: "above" as const,
        },
        {
          id: "7",
          name: "Топ",
          brand: "Wildberries",
          category: "Топ",
          itemNumber: "491770604",
          price: 2171,
          shopUrl: "https://www.wildberries.ru/catalog/491770604/detail.aspx",
          position: { top: "30%", left: "62%" },
          placement: "above" as const,
        },
        {
          id: "8",
          name: "Юбка",
          brand: "Wildberries",
          category: "Юбка",
          itemNumber: "528817330",
          price: 2484,
          shopUrl: "https://www.wildberries.ru/catalog/528817330/detail.aspx",
          position: { top: "58%", left: "68%" },
          placement: "below" as const,
        },
        {
          id: "9",
          name: "Туфли",
          brand: "Wildberries",
          category: "Туфли",
          itemNumber: "317983171",
          price: 2092,
          shopUrl: "https://www.wildberries.ru/catalog/317983171/detail.aspx",
          position: { top: "68%", left: "66%" },
          placement: "below" as const,
        },
        {
          id: "10",
          name: "Сумка",
          brand: "Wildberries",
          category: "Сумка",
          itemNumber: "219134255",
          price: 636,
          shopUrl: "https://www.wildberries.ru/catalog/219134255/detail.aspx",
          position: { top: "72%", left: "22%" },
          placement: "below" as const,
        },
      ],
    },
    {
      id: "outfit-3",
      occasion: "Outfit 3",
      category: "work" as Category,
      image: "",
      items: [
        {
          id: "11",
          name: "Жакет",
          brand: "Wildberries",
          category: "Жакет",
          itemNumber: "400658857",
          price: 2916,
          shopUrl: "https://www.wildberries.ru/catalog/400658857/detail.aspx",
          position: { top: "26%", left: "28%" },
          placement: "above" as const,
        },
        {
          id: "12",
          name: "Платье",
          brand: "Wildberries",
          category: "Платье",
          itemNumber: "495747921",
          price: 4082,
          shopUrl: "https://www.wildberries.ru/catalog/495747921/detail.aspx",
          position: { top: "45%", left: "62%" },
          placement: "above" as const,
        },
        {
          id: "13",
          name: "Туфли",
          brand: "Wildberries",
          category: "Туфли",
          itemNumber: "414640764",
          price: 1666,
          shopUrl: "https://www.wildberries.ru/catalog/414640764/detail.aspx",
          position: { top: "68%", left: "68%" },
          placement: "below" as const,
        },
        {
          id: "14",
          name: "Сумка",
          brand: "Wildberries",
          category: "Сумка",
          itemNumber: "518965934",
          price: 8993,
          shopUrl: "https://www.wildberries.ru/catalog/518965934/detail.aspx",
          position: { top: "74%", left: "20%" },
          placement: "below" as const,
        },
      ],
    },
    {
      id: "outfit-4",
      occasion: "Outfit 4",
      category: "casual" as Category,
      image: "",
      items: [
        {
          id: "15",
          name: "Футболка",
          brand: "Wildberries",
          category: "Футболка",
          itemNumber: "500293684",
          price: 2281,
          shopUrl: "https://www.wildberries.ru/catalog/500293684/detail.aspx",
          position: { top: "22%", left: "48%" },
          placement: "above" as const,
        },
        {
          id: "16",
          name: "Джинсы",
          brand: "Wildberries",
          category: "Джинсы",
          itemNumber: "311579190",
          price: 1574,
          shopUrl: "https://www.wildberries.ru/catalog/311579190/detail.aspx",
          position: { top: "52%", left: "52%" },
          placement: "below" as const,
        },
        {
          id: "17",
          name: "Кроссовки",
          brand: "Wildberries",
          category: "Кроссовки",
          itemNumber: "314358644",
          price: 1663,
          shopUrl: "https://www.wildberries.ru/catalog/314358644/detail.aspx",
          position: { top: "68%", left: "62%" },
          placement: "below" as const,
        },
        {
          id: "18",
          name: "Сумка",
          brand: "Wildberries",
          category: "Сумка",
          itemNumber: "534647773",
          price: 1788,
          shopUrl: "https://www.wildberries.ru/catalog/534647773/detail.aspx",
          position: { top: "64%", left: "20%" },
          placement: "below" as const,
        },
      ],
    },
    {
      id: "outfit-5",
      occasion: "Outfit 5",
      category: "work" as Category,
      image: "",
      items: [
        {
          id: "19",
          name: "Жакет",
          brand: "Wildberries",
          category: "Жакет",
          itemNumber: "316111333",
          price: 3548,
          shopUrl: "https://www.wildberries.ru/catalog/316111333/detail.aspx",
          position: { top: "26%", left: "30%" },
          placement: "above" as const,
        },
        {
          id: "20",
          name: "Топ",
          brand: "Wildberries",
          category: "Топ",
          itemNumber: "491770604",
          price: 2171,
          shopUrl: "https://www.wildberries.ru/catalog/491770604/detail.aspx",
          position: { top: "32%", left: "62%" },
          placement: "above" as const,
        },
        {
          id: "21",
          name: "Брюки",
          brand: "Wildberries",
          category: "Брюки",
          itemNumber: "298659975",
          price: 3574,
          shopUrl: "https://www.wildberries.ru/catalog/298659975/detail.aspx",
          position: { top: "62%", left: "66%" },
          placement: "below" as const,
        },
        {
          id: "22",
          name: "Туфли",
          brand: "Wildberries",
          category: "Туфли",
          itemNumber: "283783392",
          price: 1992,
          shopUrl: "https://www.wildberries.ru/catalog/283783392/detail.aspx",
          position: { top: "68%", left: "68%" },
          placement: "below" as const,
        },
        {
          id: "23",
          name: "Сумка",
          brand: "Wildberries",
          category: "Сумка",
          itemNumber: "448933493",
          price: 796,
          shopUrl: "https://www.wildberries.ru/catalog/448933493/detail.aspx",
          position: { top: "70%", left: "20%" },
          placement: "below" as const,
        },
      ],
    },
  ];
 const staticOutfits = [
    {
      id: "outfit-from-db-1",
      occasion: "Casual Look",
      category: "casual" as Category,
      image: "",
      items: [
        {
          id: "b5a6b0f5-a575-435e-9358-9f9c7fb80cdd",
          name: "Футболка LEGENDS ONLY",
          brand: "Wildberries",
          category: "футболка",
          itemNumber: "316111333",
          price: 3621,
          shopUrl: "https://www.wildberries.ru/catalog/316111333/detail.aspx",
          image: "/clothing-images/tshirt-white.png",
          position: { top: "22%", left: "35%" },
          placement: "above" as const,
        },
        {
          id: "d6108f29-5ff5-4495-8e0e-7b827e0a6cd7",
          name: "Кожаные брюки прямого кроя",
          brand: "Wildberries",
          category: "брюки",
          itemNumber: "491770604",
          price: 2621,
          shopUrl: "https://www.wildberries.ru/catalog/491770604/detail.aspx",
          image: "/clothing-images/pants-brown.png",
          position: { top: "52%", left: "42%" },
          placement: "below" as const,
        },
        {
          id: "86152716-7f40-4046-ab38-83ba23b773f0",
          name: "Замшевые лоферы",
          brand: "Wildberries",
          category: "обувь",
          itemNumber: "298659975",
          price: 5621,
          shopUrl: "https://www.wildberries.ru/catalog/298659975/detail.aspx",
          image: "/clothing-images/loafers-beige.png",
          position: { top: "68%", left: "48%" },
          placement: "below" as const,
        },
        {
          id: "1da701f9-9a0f-4477-9b41-5fa5e87aa636",
          name: "Серебристая сумка-хобо",
          brand: "Wildberries",
          category: "сумка",
          itemNumber: "298659975",
          price: 5621,
          shopUrl: "https://www.wildberries.ru/catalog/298659975/detail.aspx",
          image: "/clothing-images/bag-silver.png",
          position: { top: "68%", left: "18%" },
          placement: "below" as const,
        },
      ],
    },
    {
      id: "outfit-from-db-1",
      occasion: "Casual Look",
      category: "casual" as Category,
      image: "",
      items: [
        {
          id: "b5a6b0f5-a575-435e-9358-9f9c7fb80cdd",
          name: "Футболка LEGENDS ONLY",
          brand: "Wildberries",
          category: "футболка",
          itemNumber: "316111333",
          price: 3621,
          shopUrl: "https://www.wildberries.ru/catalog/316111333/detail.aspx",
          image: "/clothing-images/tshirt-white.png",
          position: { top: "22%", left: "35%" },
          placement: "above" as const,
        },
        {
          id: "d6108f29-5ff5-4495-8e0e-7b827e0a6cd7",
          name: "Кожаные брюки прямого кроя",
          brand: "Wildberries",
          category: "брюки",
          itemNumber: "491770604",
          price: 2621,
          shopUrl: "https://www.wildberries.ru/catalog/491770604/detail.aspx",
          image: "/clothing-images/pants-brown.png",
          position: { top: "52%", left: "42%" },
          placement: "below" as const,
        },
        {
          id: "86152716-7f40-4046-ab38-83ba23b773f0",
          name: "Замшевые лоферы",
          brand: "Wildberries",
          category: "обувь",
          itemNumber: "298659975",
          price: 5621,
          shopUrl: "https://www.wildberries.ru/catalog/298659975/detail.aspx",
          image: "/clothing-images/loafers-beige.png",
          position: { top: "68%", left: "48%" },
          placement: "below" as const,
        },
        {
          id: "1da701f9-9a0f-4477-9b41-5fa5e87aa636",
          name: "Серебристая сумка-хобо",
          brand: "Wildberries",
          category: "сумка",
          itemNumber: "298659975",
          price: 5621,
          shopUrl: "https://www.wildberries.ru/catalog/298659975/detail.aspx",
          image: "/clothing-images/heels-black.png",
          position: { top: "68%", left: "18%" },
          placement: "below" as const,
        },
      ],
    },
  ];
    

  const generatedOutfits = staticOutfits;
  const isGenerating = false;
  const generateError = null;
   return (
    <div className="min-h-screen bg-background pb-20">
      <CategoryTabs 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
      />

      <VerticalOutfitFeed 
        outfits={generatedOutfits}
      />

      <BottomNavigation />
    </div>
  );
};

export default Feed;
