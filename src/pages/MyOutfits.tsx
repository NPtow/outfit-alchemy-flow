import { useState, useEffect } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { getSavedOutfits, SavedOutfit } from "@/lib/outfitStorage";
import { OutfitCollage, CollageItem } from "@/components/OutfitCollage";
import { getOutfitLayout, getCategoryPosition } from "@/lib/outfitLayouts";
import { Heart } from "lucide-react";

const MyOutfits = () => {
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);

  useEffect(() => {
    const outfits = getSavedOutfits();
    console.log('Loaded saved outfits:', outfits.length, outfits);
    setSavedOutfits(outfits);
  }, []);

  return (
    <div className="min-h-screen w-full bg-black pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-stolzl font-bold text-white">
            Мои образы
          </h1>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-pink-400 text-pink-400" />
            <span className="text-sm font-stolzl font-semibold text-pink-400">
              {savedOutfits.length}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {savedOutfits.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
            <Heart className="w-20 h-20 text-white/30 mb-4" />
            <h2 className="text-xl font-stolzl font-semibold mb-2 text-white">
              Пока нет сохраненных образов
            </h2>
            <p className="font-stolzl text-white/60">
              Нажмите на сердечко в ленте, чтобы сохранить понравившиеся образы
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {savedOutfits.map((outfit) => (
              <div
                key={outfit.id}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white cursor-pointer"
              >
                <OutfitCollage
                  key={`collage-${outfit.id}-${outfit.items.length}`}
                  items={outfit.items.map(item => {
                    const layout = getOutfitLayout(outfit.items);
                    const position = getCategoryPosition(item.category, layout);
                    const defaultPosition = { left: 0.3, top: 0.3, right: 0.7, bottom: 0.7 };
                    const pos = position || defaultPosition;
                    
                    return {
                      id: item.id,
                      name: item.name,
                      brand: item.brand,
                      category: item.category,
                      itemNumber: item.itemNumber,
                      price: item.price,
                      shopUrl: item.shopUrl,
                      image: item.image || `/clothing-images/${item.category.toLowerCase()}.png`,
                      position: pos
                    } as CollageItem;
                  })}
                  outfitId={outfit.id}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default MyOutfits;
