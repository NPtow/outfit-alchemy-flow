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
  const { toast } = useToast();

  const currentItem = items[currentIndex];

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
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
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
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="relative w-full max-w-md aspect-square bg-[#808080] rounded-2xl overflow-hidden">
            {currentItem.image && (
              <img
                src={currentItem.image}
                alt={currentItem.name}
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>

        {/* Item details */}
        <div className="bg-[#2a2a2a] rounded-t-3xl p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-stolzl font-bold text-white mb-1">
                {currentItem.name}
              </h3>
              <p className="text-sm text-white/60 font-stolzl mb-3">
                {currentItem.category}
              </p>
              <p className="text-2xl font-stolzl font-bold text-[#C8E871]">
                {currentItem.price.toLocaleString()} ₽
              </p>
            </div>

            <button
              className="w-[52px] h-[52px] flex items-center justify-center flex-shrink-0"
              onClick={() => handleLike(currentItem.id)}
            >
              <img
                src={liked[currentItem.id] || isInBasket(currentItem.id) ? likeActive : likeDefault}
                alt="Like"
                className="w-full h-full"
              />
            </button>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 pt-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="w-3 h-3 flex items-center justify-center"
              >
                <img
                  src={index === currentIndex ? dotActive : dotDefault}
                  alt=""
                  className="w-full h-full"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
