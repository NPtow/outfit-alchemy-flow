import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToBasket, isInBasket } from "@/lib/basketStorage";
import { useToast } from "@/hooks/use-toast";
import likeDefault from "@/assets/icon_like_mode_default.svg";
import likeActive from "@/assets/icon_like_mode_active.svg";
import dotActive from "@/assets/icon_dot_mode_active.svg";
import dotDefault from "@/assets/icon_dot_mode_default.svg";

interface CarouselItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  itemNumber: string;
  price: number;
  shopUrl: string;
  image?: string;
}

interface ItemCarouselProps {
  items: CarouselItem[];
  outfitId: string;
  initialIndex?: number;
  onClose: () => void;
}

export const ItemCarousel = ({
  items,
  outfitId,
  initialIndex = 0,
  onClose,
}: ItemCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const { toast } = useToast();

  const currentItem = items[currentIndex];

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleLike = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    if (!isInBasket(itemId)) {
      addToBasket({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        outfitId,
        image: item.image,
      });
      setLiked({ ...liked, [itemId]: true });
      toast({
        title: "Добавлено в корзину",
        description: item.name,
      });
    } else {
      toast({
        title: "Уже в корзине",
        description: item.name,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1a1a1a]">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 text-white"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </Button>

      <div className="h-full flex flex-col">
        {/* Item image */}
        <div 
          className="flex-1 flex items-center justify-center px-4 pt-16 pb-8"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative w-full max-w-md">
            {/* Dots indicator - above image */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {items.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className="transition-all"
                >
                  <div 
                    className={`rounded-full transition-all ${
                      index === currentIndex 
                        ? 'w-2.5 h-2.5 bg-[#C8E871]' 
                        : 'w-2.5 h-2.5 bg-[#4a4a4a]'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Image container */}
            <div className="w-full aspect-square bg-[#808080] rounded-2xl overflow-hidden flex items-center justify-center">
              {currentItem.image && (
                <img
                  src={currentItem.image}
                  alt={currentItem.name}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>
        </div>

        {/* Item details */}
        <div className="bg-[#2a2a2a] rounded-t-3xl p-6 space-y-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-stolzl font-bold text-white mb-1">
                Название
              </h3>
              <p className="text-sm text-white/60 font-stolzl mb-2">
                Артикул
              </p>
              <p className="text-2xl font-stolzl font-bold text-[#C8E871]">
                {currentItem.price.toLocaleString()} ₽
              </p>
            </div>

            <button
              className="w-12 h-12 flex items-center justify-center flex-shrink-0 bg-transparent border-2 border-white rounded-full"
              onClick={() => handleLike(currentItem.id)}
            >
              <img
                src={liked[currentItem.id] || isInBasket(currentItem.id) ? likeActive : likeDefault}
                alt="Like"
                className="w-6 h-6"
              />
            </button>
          </div>

          {/* Shop button */}
          <button
            onClick={() => window.open(currentItem.shopUrl, '_blank')}
            className="w-full bg-white text-black font-stolzl font-semibold py-3 px-6 rounded-full hover:bg-white/90 transition-colors"
          >
            Перейти
          </button>
        </div>
      </div>
    </div>
  );
};
