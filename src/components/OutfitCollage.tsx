import { useState } from "react";
import { ItemCarousel } from "./ItemCarousel";

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
                className="w-full h-full object-contain"
                draggable={false}
                loading="eager"
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
