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
  useEffect(() => {
    mlApi.checkStatus().then(status => {
      if (status) {
        console.log('✅ ML Backend доступен:', status);
        setUseML(true);
      } else {
        console.warn('⚠️ ML Backend недоступен, используем fallback');
        toast({
          title: "ML Backend недоступен",
          description: "Работаем без ML персонализации",
        });
      }
    });
  }, []);

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

  // Статические образы из базы данных
  const staticOutfits = [
    {
      id: "outfit-1-business",
      occasion: "Business Look",
      category: "work" as Category,
      image: "",
      items: [
        {
          id: "9215be6f-0b51-49c8-baf2-9f509e50035c",
          name: "Черный пиджак KARL LAGERFELD",
          brand: "KARL LAGERFELD",
          category: "пиджак",
          itemNumber: "316111333",
          price: 3621,
          shopUrl: "https://www.wildberries.ru/catalog/316111333/detail.aspx",
          image: "/clothing-images/blazer-black.png",
          position: { top: "18%", left: "30%" },
          placement: "above" as const,
        },
        {
          id: "8ed90a53-a5dc-4cda-ac19-90b790dd83a3",
          name: "Топ с высоким воротом",
          brand: "Wildberries",
          category: "топ",
          itemNumber: "491770604",
          price: 2621,
          shopUrl: "https://www.wildberries.ru/catalog/491770604/detail.aspx",
          image: "/clothing-images/top-cream.png",
          position: { top: "28%", left: "58%" },
          placement: "above" as const,
        },
        {
          id: "5cbe2ee7-1711-47ae-b6d5-bfea7408fa32",
          name: "Черные брюки клеш",
          brand: "Wildberries",
          category: "брюки",
          itemNumber: "298659975",
          price: 5621,
          shopUrl: "https://www.wildberries.ru/catalog/298659975/detail.aspx",
          image: "/clothing-images/pants-black.png",
          position: { top: "54%", left: "46%" },
          placement: "below" as const,
        },
        {
          id: "61ff4d4d-e95b-46e7-b880-a77baa508f15",
          name: "Черные туфли-лодочки",
          brand: "Wildberries",
          category: "туфли",
          itemNumber: "283783392",
          price: 2721,
          shopUrl: "https://www.wildberries.ru/catalog/283783392/detail.aspx",
          image: "/clothing-images/heels-black.png",
          position: { top: "68%", left: "50%" },
          placement: "below" as const,
        },
        {
          id: "929778d8-62ff-471e-96ad-4f1b44f56537",
          name: "Черная сумка-седло",
          brand: "Wildberries",
          category: "сумка",
          itemNumber: "283783392",
          price: 2721,
          shopUrl: "https://www.wildberries.ru/catalog/283783392/detail.aspx",
          image: "/clothing-images/bag-black.png",
          position: { top: "66%", left: "18%" },
          placement: "below" as const,
        },
      ],
    },
    {
      id: "outfit-2-casual",
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
          position: { top: "22%", left: "40%" },
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
          position: { top: "52%", left: "44%" },
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
          position: { top: "66%", left: "18%" },
          placement: "below" as const,
        },
      ],
    },
  ];

  const generatedOutfits = staticOutfits;
  const isGenerating = false;
  const generateError = null;

  // ML-персонализированная лента
  const { data: mlData, isLoading: isLoadingML, error, refetch } = useQuery({
    queryKey: ['ml-feed', userId, activeCategory],
    queryFn: async () => {
      const response = await mlApi.getFeed(userId, 20);
      
      // Мапим ML outfits к нашему формату, используем сгенерированные образы
      const mappedOutfits = response.outfits.map((mlOutfit, index) => {
        const generatedOutfit = generatedOutfits?.[index % (generatedOutfits?.length || 1)];
        const fallback = allOutfits[index % allOutfits.length];
        
        return generatedOutfit ? {
          id: mlOutfit.outfit_id,
          occasion: generatedOutfit.occasion || fallback.occasion,
          category: (generatedOutfit.occasion?.toLowerCase() || 'casual') as Category,
          image: generatedOutfit.image || fallback.image,
          items: generatedOutfit.items,
          mlScore: mlOutfit.score,
          mlAttributes: mlOutfit.attributes,
          mlPhase: mlOutfit.phase
        } : {
          ...fallback,
          id: mlOutfit.outfit_id,
          mlScore: mlOutfit.score,
          mlAttributes: mlOutfit.attributes,
          mlPhase: mlOutfit.phase
        };
      });
      
      return {
        outfits: mappedOutfits,
        user_phase: response.user_phase,
        total_likes: response.total_likes
      };
    },
    enabled: useML && !isGenerating && !!generatedOutfits,
    refetchOnWindowFocus: false
  });

  const isLoading = isGenerating || isLoadingML;

  // Фильтрация по категории
  const filteredOutfits = useML && mlData
    ? (activeCategory === "all" 
        ? mlData.outfits 
        : mlData.outfits.filter(outfit => outfit.category === activeCategory))
    : (activeCategory === "all" 
        ? allOutfits 
        : allOutfits.filter(outfit => outfit.category === activeCategory));

  const userPhase = mlData?.user_phase || 'cold_start';

  return (
    <div className="min-h-screen w-full bg-black">
      {/* Сообщение о пустой базе данных */}
      {generateError && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-50 bg-yellow-500 text-white px-6 py-3 rounded-lg text-sm animate-fade-in max-w-md text-center">
          <div className="font-semibold mb-1">⚠️ База данных пуста</div>
          <div className="text-xs">Добавьте товары через <a href="/admin" className="underline font-bold">админ-панель</a></div>
        </div>
      )}
      
      {/* Индикатор фазы персонализации */}
      {useML && userPhase === 'cold_start' && !generateError && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-50 bg-pink-400 text-white px-4 py-2 rounded-full text-sm animate-fade-in">
          👋 Лайкни 5+ образов для ML персонализации
        </div>
      )}
      
      {useML && userPhase === 'learning' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-4 py-2 rounded-full text-sm animate-fade-in">
          🤖 ML учится твои предпочтения...
        </div>
      )}
      
      {useML && userPhase === 'personalized' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-full text-sm animate-fade-in">
          ✨ Лента персонализирована ML!
        </div>
      )}
      
      <CategoryTabs 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory}
      />
      
      <div className="pt-16 pb-14">
        {isLoading ? (
          <div className="flex items-center justify-center h-screen">
            <p className="text-primary">Загружаем ML рекомендации...</p>
          </div>
        ) : (
          <VerticalOutfitFeed 
            outfits={filteredOutfits} 
            onInteraction={refetch}
            useML={useML}
          />
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Feed;
