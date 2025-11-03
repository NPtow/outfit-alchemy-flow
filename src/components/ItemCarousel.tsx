import { useState } from "react";
import { X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToBasket, isInBasket } from "@/lib/basketStorage";
import { useToast } from "@/hooks/use-toast";

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
          <div className="relative w-full max-w-md aspect-square bg-[#3a3a3a] rounded-2xl" />
        </div>

        {/* Item details */}
        <div className="bg-[#2a2a2a] rounded-t-3xl p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-stolzl font-bold text-white mb-1">
                Название
              </h3>
              <p className="text-sm text-white/60 font-stolzl mb-3">
                {currentItem.category}
              </p>
              <p className="text-2xl font-stolzl font-bold text-[#C8E871]">
                {currentItem.price.toLocaleString()} ₽
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
              onClick={() => handleLike(currentItem.id)}
            >
              <Heart
                className={`w-8 h-8 ${
                  liked[currentItem.id] || isInBasket(currentItem.id)
                    ? "fill-pink-400 text-pink-400"
                    : "text-white"
                }`}
              />
            </Button>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 pt-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-[#C8E871]"
                    : "w-2 bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
