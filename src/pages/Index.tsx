import { useState } from "react";
import { OutfitCollage, CollageItem } from "@/components/OutfitCollage";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Outfit 1 items
import jacketBlack from "@/assets/jacket-black-2.png";
import topCream from "@/assets/top-cream-2.png";
import pantsBlack from "@/assets/pants-black-2.png";
import shoesBlack from "@/assets/shoes-black-2.png";
import bagBlack from "@/assets/bag-black-2.png";

// Outfit 2 items
import tshirtWhite from "@/assets/tshirt-white.png";
import pantsBrown from "@/assets/pants-brown.png";
import loafersBeige from "@/assets/loafers-beige.png";
import bagSilver from "@/assets/bag-silver.png";

const Index = () => {
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);

  const outfits = [
    {
      id: "outfit-1",
      items: [
        {
          id: "1",
          name: "Пиджак",
          brand: "KARL LAGERFELD",
          category: "Пиджак",
          itemNumber: "316111333",
          price: 3621,
          shopUrl: "https://www.wildberries.ru/catalog/316111333/detail.aspx",
          image: jacketBlack,
          position: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.8 },
        },
        {
          id: "2",
          name: "Топ",
          brand: "Wildberries",
          category: "Топ",
          itemNumber: "491770604",
          price: 2621,
          shopUrl: "https://www.wildberries.ru/catalog/491770604/detail.aspx",
          image: topCream,
          position: { left: 0.35, top: 0.12, right: 0.79, bottom: 0.5 },
        },
        {
          id: "3",
          name: "Брюки",
          brand: "Wildberries",
          category: "Брюки",
          itemNumber: "298659975",
          price: 5621,
          shopUrl: "https://www.wildberries.ru/catalog/298659975/detail.aspx",
          image: pantsBlack,
          position: { left: 0.46, top: 0.35, right: 0.8, bottom: 0.85 },
        },
        {
          id: "4",
          name: "Туфли",
          brand: "Wildberries",
          category: "Туфли",
          itemNumber: "283783392",
          price: 2721,
          shopUrl: "https://www.wildberries.ru/catalog/283783392/detail.aspx",
          image: shoesBlack,
          position: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9 },
        },
        {
          id: "5",
          name: "Сумка",
          brand: "Wildberries",
          category: "Сумка",
          itemNumber: "283783392",
          price: 2721,
          shopUrl: "https://www.wildberries.ru/catalog/283783392/detail.aspx",
          image: bagBlack,
          position: { left: 0.15, top: 0.5, right: 0.44, bottom: 0.79 },
        },
      ],
    },
    {
      id: "outfit-2",
      items: [
        {
          id: "6",
          name: "Футболка",
          brand: "Wildberries",
          category: "Футболка",
          itemNumber: "316111333",
          price: 3621,
          shopUrl: "https://www.wildberries.ru/catalog/316111333/detail.aspx",
          image: tshirtWhite,
          position: { left: 0.29, top: 0.064, right: 0.72, bottom: 0.45 },
        },
        {
          id: "7",
          name: "Брюки",
          brand: "Wildberries",
          category: "Брюки",
          itemNumber: "491770604",
          price: 2621,
          shopUrl: "https://www.wildberries.ru/catalog/491770604/detail.aspx",
          image: pantsBrown,
          position: { left: 0.33, top: 0.37, right: 0.68, bottom: 0.86 },
        },
        {
          id: "8",
          name: "Лоферы",
          brand: "Wildberries",
          category: "Обувь",
          itemNumber: "298659975",
          price: 5621,
          shopUrl: "https://www.wildberries.ru/catalog/298659975/detail.aspx",
          image: loafersBeige,
          position: { left: 0.54, top: 0.54, right: 0.86, bottom: 0.9 },
        },
        {
          id: "9",
          name: "Сумка",
          brand: "Wildberries",
          category: "Сумка",
          itemNumber: "298659975",
          price: 5621,
          shopUrl: "https://www.wildberries.ru/catalog/298659975/detail.aspx",
          image: bagSilver,
          position: { left: 0.1, top: 0.4, right: 0.37, bottom: 0.68 },
        },
      ],
    },
  ];

  const currentOutfit = outfits[currentOutfitIndex];

  const handleNext = () => {
    if (currentOutfitIndex < outfits.length - 1) {
      setCurrentOutfitIndex(currentOutfitIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentOutfitIndex > 0) {
      setCurrentOutfitIndex(currentOutfitIndex - 1);
    }
  };

  return (
    <div className="h-screen w-full bg-background relative">
      <OutfitCollage items={currentOutfit.items} outfitId={currentOutfit.id} />
      
      {/* Navigation arrows */}
      {currentOutfitIndex > 0 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      
      {currentOutfitIndex < outfits.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Outfit counter */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm font-stolzl z-10">
        {currentOutfitIndex + 1} / {outfits.length}
      </div>
    </div>
  );
};

export default Index;
