import { useState, useEffect } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { getSavedOutfits } from "@/lib/outfitStorage";
import { Heart } from "lucide-react";

// Import outfit images
import outfit1 from "@/assets/outfit-1.png";
import outfit2 from "@/assets/outfit-2.png";
import outfit3 from "@/assets/outfit-3.png";
import outfit4 from "@/assets/outfit-4.png";
import outfit5 from "@/assets/outfit-5.png";

const MyOutfits = () => {
  const [savedOutfitIds, setSavedOutfitIds] = useState<string[]>([]);

  useEffect(() => {
    setSavedOutfitIds(getSavedOutfits());
  }, []);

  // All outfits data
  const allOutfits = [
    { id: "outfit-1", occasion: "Outfit 1", image: outfit1 },
    { id: "outfit-2", occasion: "Outfit 2", image: outfit2 },
    { id: "outfit-3", occasion: "Outfit 3", image: outfit3 },
    { id: "outfit-4", occasion: "Outfit 4", image: outfit4 },
    { id: "outfit-5", occasion: "Outfit 5", image: outfit5 },
  ];

  const savedOutfits = allOutfits.filter(outfit => 
    savedOutfitIds.includes(outfit.id)
  );

  return (
    <div className="min-h-screen w-full bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-soledago font-bold" style={{ color: '#A88AED' }}>
            Мои образы
          </h1>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-primary text-primary" />
            <span className="text-sm font-soledago font-semibold" style={{ color: '#A88AED' }}>{savedOutfits.length}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {savedOutfits.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
            <Heart className="w-20 h-20 text-muted-foreground mb-4" />
            <h2 className="text-xl font-soledago font-semibold mb-2" style={{ color: '#A88AED' }}>
              Пока нет сохраненных образов
            </h2>
            <p className="font-soledago" style={{ color: '#A88AED' }}>
              Нажмите на сердечко в ленте, чтобы сохранить понравившиеся образы
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {savedOutfits.map((outfit) => (
              <div
                key={outfit.id}
                className="relative aspect-[3/4] rounded-xl overflow-hidden bg-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-200 hover:scale-105 cursor-pointer"
              >
                <img
                  src={outfit.image}
                  alt={outfit.occasion}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-sm font-soledago font-semibold" style={{ color: '#A88AED' }}>
                    {outfit.occasion}
                  </p>
                </div>
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
