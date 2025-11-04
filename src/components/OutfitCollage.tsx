import { useState, useEffect } from "react";
import { ItemCarousel } from "./ItemCarousel";
import { Skeleton } from "./ui/skeleton";

export interface CollageItem {
  id: string;
  name: string;
  brand?: string;
  category: string;
  itemNumber: string;
  price: number;
  shopUrl: string;
  image: string;
  position: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
}

interface OutfitCollageProps {
  items: CollageItem[];
  outfitId: string;
}

export const OutfitCollage = ({ items, outfitId }: OutfitCollageProps) => {
  const [showCarousel, setShowCarousel] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  useEffect(() => {
    setLoadedImages(new Set());
    setAllImagesLoaded(false);
  }, [outfitId]);

  const handleImageLoad = (itemId: string) => {
    console.log(`Image loaded: ${itemId} for outfit ${outfitId}`);
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(itemId);
      console.log(`Loaded ${newSet.size}/${items.length} images for outfit ${outfitId}`);
      if (newSet.size === items.length) {
        console.log(`All images loaded for outfit ${outfitId}`);
        setAllImagesLoaded(true);
      }
      return newSet;
    });
  };

  const handleItemClick = (index: number) => {
    setSelectedItemIndex(index);
    setShowCarousel(true);
  };

  const carouselItems = items.map(item => ({
    id: item.id,
    name: item.name,
    brand: item.brand || "Wildberries",
    category: item.category,
    itemNumber: item.itemNumber,
    price: item.price,
    shopUrl: item.shopUrl,
    image: item.image,
  }));

  return (
    <>
      <div className="relative w-full h-full">
        {/* Loading spinner */}
        {!allImagesLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <div className="w-12 h-12 border-4 border-[#C8E871] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {items.map((item, index) => {
          const { left, top, right, bottom } = item.position;
          const width = (right - left) * 100;
          const height = (bottom - top) * 100;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(index)}
              className="absolute cursor-pointer transition-transform hover:scale-105 active:scale-95"
              style={{
                left: `${left * 100}%`,
                top: `${top * 100}%`,
                width: `${width}%`,
                height: `${height}%`,
              }}
            >
              <img
                src={item.image}
                alt={item.name}
                className={`w-full h-full object-contain transition-opacity duration-300 ${
                  loadedImages.has(item.id) ? 'opacity-100' : 'opacity-0'
                }`}
                draggable={false}
                loading="eager"
                onLoad={() => handleImageLoad(item.id)}
              />
            </button>
          );
        })}
      </div>

      {showCarousel && (
        <ItemCarousel
          items={carouselItems}
          outfitId={outfitId}
          initialIndex={selectedItemIndex}
          onClose={() => setShowCarousel(false)}
        />
      )}
    </>
  );
};
