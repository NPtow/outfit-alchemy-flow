import { useState, useRef, useEffect } from "react";
import { ShoppingBag, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { saveOutfit, removeSavedOutfit, isOutfitSaved } from "@/lib/outfitStorage";
import { useToast } from "@/hooks/use-toast";
import heartLike from "@/assets/heart-like.png";
import shareIcon from "@/assets/share-icon.png";

interface ShoppableItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  itemNumber: string;
  price: number;
  shopUrl: string;
  position: {
    top: string;
    left: string;
  };
  placement: "above" | "below";
}

interface OutfitSlide {
  id: string;
  image: string;
  occasion: string;
  items: ShoppableItem[];
}

interface VerticalOutfitFeedProps {
  outfits: OutfitSlide[];
}

export const VerticalOutfitFeed = ({ outfits }: VerticalOutfitFeedProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPrices, setShowPrices] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const { toast } = useToast();

  // Reset index when outfits array changes
  useEffect(() => {
    if (currentIndex >= outfits.length) {
      setCurrentIndex(0);
    }
  }, [outfits, currentIndex]);

  const currentOutfit = outfits[currentIndex];

  useEffect(() => {
    if (currentOutfit) {
      setIsLiked(isOutfitSaved(currentOutfit.id));
    }
  }, [currentOutfit]);

  // Show empty state if no outfits
  if (!outfits || outfits.length === 0) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-xl font-display font-semibold text-foreground mb-2">
            Образы не найдены
          </h2>
          <p className="text-muted-foreground">
            Попробуйте выбрать другую категорию
          </p>
        </div>
      </div>
    );
  }

  // Safety check for currentOutfit
  if (!currentOutfit) {
    return null;
  }

  const handleNext = () => {
    if (currentIndex < outfits.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowPrices(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowPrices(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      handleNext();
    }
    if (touchStart - touchEnd < -50) {
      handlePrev();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0) {
      handleNext();
    } else if (e.deltaY < 0) {
      handlePrev();
    }
  };

  const handleItemClick = (item: ShoppableItem) => {
    window.open(item.shopUrl, "_blank");
  };

  const handleLike = () => {
    if (isLiked) {
      removeSavedOutfit(currentOutfit.id);
      setIsLiked(false);
      toast({
        title: "Удалено из сохраненных",
        description: "Образ удален из вашей коллекции",
      });
    } else {
      saveOutfit(currentOutfit.id);
      setIsLiked(true);
      toast({
        title: "Сохранено!",
        description: "Образ добавлен в 'Мои образы'",
      });
    }
  };

  const handleShare = async () => {
    setIsShared(true);
    setTimeout(() => setIsShared(false), 600);
    
    const shareData = {
      title: `${currentOutfit.occasion} - InspirationKit`,
      text: "Посмотри этот образ в InspirationKit!",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Ссылка скопирована",
          description: "Поделитесь образом с друзьями",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleShopLook = () => {
    setShowPrices(!showPrices);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-background overflow-hidden"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Outfit Slide */}
      <div
        key={currentOutfit.id}
        className="relative w-full h-full flex items-center justify-center animate-fade-in"
      >
        {/* Action Buttons - Right Side */}
        <div className="absolute right-6 bottom-52 z-20 flex flex-col gap-4">
          <button
            onClick={handleLike}
            className={cn(
              "w-14 h-14 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-[var(--shadow-card)] active:scale-95",
              isLiked 
                ? "bg-primary/30 shadow-[0_0_20px_rgba(168,138,237,0.5)]" 
                : "bg-card/90 hover:bg-primary/20"
            )}
            aria-label="Like"
          >
            <img 
              src={heartLike} 
              alt="Like" 
              className={cn(
                "w-8 h-8 transition-all duration-200",
                isLiked && "scale-110 drop-shadow-[0_0_8px_rgba(168,138,237,0.8)]"
              )} 
            />
          </button>
          <button
            onClick={handleShare}
            className={cn(
              "w-14 h-14 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-[var(--shadow-card)] active:scale-95",
              isShared 
                ? "bg-primary/30 shadow-[0_0_20px_rgba(168,138,237,0.5)]" 
                : "bg-card/90 hover:bg-primary/20"
            )}
            aria-label="Share"
          >
            <img 
              src={shareIcon} 
              alt="Share" 
              className={cn(
                "w-8 h-8 transition-all duration-200",
                isShared && "scale-110 drop-shadow-[0_0_8px_rgba(168,138,237,0.8)]"
              )} 
            />
          </button>
        </div>

        {/* Outfit Image with Clickable Items */}
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={currentOutfit.image}
            alt={currentOutfit.occasion}
            className="w-full h-full object-contain"
          />

          {/* Clickable Price Tags */}
          {showPrices &&
            currentOutfit.items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="absolute z-10 animate-scale-in hover:scale-105 transition-all duration-300 group"
                style={{
                  top: item.position.top,
                  left: item.position.left,
                  animationDelay: `${index * 0.1}s`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Точка-маркер */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary/80 border-4 border-background shadow-lg"></div>
                
                {/* Информационная карточка */}
                <div 
                  className="bg-card/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-[var(--shadow-hover)] border border-border w-[120px]"
                  style={{
                    position: 'relative',
                    [item.placement === 'above' ? 'bottom' : 'top']: '16px'
                  }}
                >
                  <div className="flex flex-col gap-0.5 text-left">
                    <p className="text-[11px] font-semibold text-foreground leading-tight">
                      {item.category}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      Артикул: {item.itemNumber}
                    </p>
                    <p className="text-sm font-bold mt-0.5" style={{ color: '#A88AED' }}>
                      {item.price}₽
                    </p>
                  </div>
                </div>
              </button>
            ))}
        </div>

        {/* Bottom Shop Button */}
        <div className="absolute bottom-16 left-6 right-6 z-20">
          <button
            onClick={handleShopLook}
            className="w-full px-6 py-4 rounded-full font-semibold text-lg transition-all duration-200 font-gropled border-2 border-border hover:border-primary flex items-center justify-center gap-3 bg-transparent"
            style={{ color: '#A88AED' }}
          >
            <ShoppingBag className="w-6 h-6" />
            {showPrices ? "Скрыть артикулы" : "узнать артикулы"}
          </button>
        </div>

        {/* Scroll Indicator */}
        {currentIndex < outfits.length - 1 && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 animate-bounce">
            <ChevronDown className="w-8 h-8 text-muted-foreground" />
          </div>
        )}

        {/* Progress Indicators */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {outfits.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-1 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
