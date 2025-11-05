import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveOutfit, removeSavedOutfit, isOutfitSaved } from "@/lib/outfitStorage";
import { useToast } from "@/hooks/use-toast";
import { mlApi } from '@/lib/mlApi';
import { getUserId } from '@/lib/userStorage';
import likeDefault from "@/assets/icon_like_mode_default.svg";
import likeActive from "@/assets/icon_like_mode_active.svg";
import shareDefault from "@/assets/icon_share_mode_default.svg";
import shareActive from "@/assets/icon_share_mode_active.svg";
import detailsDefault from "@/assets/icon_details_mode_default.svg";
import detailsActive from "@/assets/icon_details_mode_active.svg";
import { ItemCarousel } from "./ItemCarousel";
import { OutfitCollage, CollageItem } from "./OutfitCollage";
import { getOutfitLayout, getCategoryPosition } from "@/lib/outfitLayouts";

interface ShoppableItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  itemNumber: string;
  price: number;
  shopUrl: string;
  image?: string; // Add image field
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
  onInteraction?: () => void;
  useML?: boolean;
}

export const VerticalOutfitFeed = ({ 
  outfits, 
  onInteraction, 
  useML = false 
}: VerticalOutfitFeedProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPrices, setShowPrices] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);
  const [carouselStartIndex, setCarouselStartIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [detailsViewed, setDetailsViewed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [viewStartTime, setViewStartTime] = useState(Date.now());
  const { toast } = useToast();
  const userId = getUserId();

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
      setDetailsViewed(false);
    }
  }, [currentOutfit]);

  // При смене образа записываем view
  useEffect(() => {
    setViewStartTime(Date.now());
    
    if (useML && currentOutfit) {
      mlApi.recordInteraction(userId, currentOutfit.id, 'view').catch(console.error);
    }
  }, [currentIndex, useML, currentOutfit, userId]);

  // Preload adjacent outfit images
  useEffect(() => {
    const preloadImages = () => {
      // Preload next outfit
      if (currentIndex < outfits.length - 1) {
        const nextOutfit = outfits[currentIndex + 1];
        nextOutfit.items.forEach(item => {
          const img = new Image();
          img.src = item.image || `/clothing-images/${item.category.toLowerCase()}.png`;
        });
      }
      
      // Preload previous outfit
      if (currentIndex > 0) {
        const prevOutfit = outfits[currentIndex - 1];
        prevOutfit.items.forEach(item => {
          const img = new Image();
          img.src = item.image || `/clothing-images/${item.category.toLowerCase()}.png`;
        });
      }
    };

    preloadImages();
  }, [currentIndex, outfits]);

  // Preload all icons on mount
  useEffect(() => {
    [likeDefault, likeActive, shareDefault, shareActive, detailsDefault, detailsActive].forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

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
    // Вычисляем длительность просмотра
    const viewDuration = (Date.now() - viewStartTime) / 1000;
    
    if (useML && currentOutfit) {
      // Если меньше 2 секунд = skip
      const interactionType = viewDuration < 2 ? 'skip' : 'view';
      mlApi.recordInteraction(
        userId, 
        currentOutfit.id, 
        interactionType, 
        viewDuration
      ).catch(console.error);
    }
    
    if (currentIndex < outfits.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setViewStartTime(Date.now());
      setShowPrices(false);
      setShowCarousel(false);
      
      // Trigger prefetch callback when near the end
      if (onInteraction && currentIndex >= outfits.length - 3) {
        onInteraction();
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowPrices(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (showCarousel) return;
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (showCarousel) return;
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (showCarousel) return;
    if (touchStart - touchEnd > 50) {
      handleNext();
    }
    if (touchStart - touchEnd < -50) {
      handlePrev();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (showCarousel) return;
    if (e.deltaY > 0) {
      handleNext();
    } else if (e.deltaY < 0) {
      handlePrev();
    }
  };

  const handleItemClick = (item: ShoppableItem) => {
    window.open(item.shopUrl, "_blank");
  };

  const handleLike = async () => {
    if (isLiked) {
      removeSavedOutfit(currentOutfit.id);
      setIsLiked(false);
      toast({
        title: "Удалено из сохраненных",
        description: "Образ удален из вашей коллекции",
      });
    } else {
      saveOutfit({
        id: currentOutfit.id,
        occasion: currentOutfit.occasion,
        items: currentOutfit.items,
        savedAt: Date.now()
      });
      setIsLiked(true);
      
      // Записываем лайк в ML backend
      if (useML) {
        try {
          await mlApi.recordInteraction(userId, currentOutfit.id, 'like');
          
          // Обновляем ленту для персонализации
          if (onInteraction) {
            setTimeout(() => onInteraction(), 500);
          }
          
          toast({
            title: "Образ сохранен!",
            description: "ML покажет больше похожих образов ✨",
          });
        } catch (error) {
          console.error('Failed to record like:', error);
          toast({
            title: "Образ сохранен!",
          });
        }
      } else {
        toast({
          title: "Образ сохранен!",
        });
      }
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
    if (!showPrices && useML && currentOutfit) {
      // Записываем view_detail
      mlApi.recordInteraction(userId, currentOutfit.id, 'view_detail').catch(console.error);
    }
    setShowPrices(!showPrices);
  };

  return (
    <>
      <div
        ref={containerRef}
        className="fixed inset-0 bg-black overflow-hidden"
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
          <div className="absolute right-3 sm:right-6 bottom-40 sm:bottom-52 z-20 flex flex-col gap-3 sm:gap-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={showCarousel}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Like"
            >
              <img 
                src={isLiked ? likeActive : likeDefault} 
                alt="Like" 
                className="w-full h-full"
                loading="eager"
              />
            </button>
            
            {/* Details Button */}
            <button
              onClick={() => {
                setDetailsViewed(true);
                setCarouselStartIndex(0);
                // Показываем карусель с небольшой задержкой после смены состояния кнопки
                setTimeout(() => {
                  setShowCarousel(true);
                }, 150);
              }}
              disabled={showCarousel}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Details"
            >
              <img 
                src={detailsViewed ? detailsActive : detailsDefault} 
                alt="Details" 
                className="w-full h-full"
                loading="eager"
              />
            </button>
            
            {/* Share Button */}
            <button
              onClick={handleShare}
              disabled={showCarousel}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Share"
            >
              <img 
                src={isShared ? shareActive : shareDefault} 
                alt="Share" 
                className="w-full h-full"
                loading="eager"
              />
            </button>
          </div>

          {/* Outfit Image */}
          <div className="relative w-[340px] h-[527px] sm:w-[380px] sm:h-[589px] md:w-[420px] md:h-[651px] mx-auto bg-white rounded-3xl sm:rounded-[32px] flex items-center justify-center overflow-hidden">
            <OutfitCollage 
              items={currentOutfit.items.map(item => {
                // Get layout pattern for this outfit composition
                const layout = getOutfitLayout(currentOutfit.items);
                const position = getCategoryPosition(item.category, layout);
                
                // If position not found in layout, use a default
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
              outfitId={currentOutfit.id}
            />
          </div>

          {/* Scroll Indicator */}
          {currentIndex < outfits.length - 1 && (
            <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-10 animate-bounce">
              <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-white/40" />
            </div>
          )}

          {/* Progress Indicators */}
          <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20">
            {outfits.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-0.5 sm:h-1 rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "w-6 sm:w-8 bg-[#C8E871]"
                    : "w-0.5 sm:w-1 bg-white/20"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Item Carousel */}
      {showCarousel && (
        <ItemCarousel
          items={currentOutfit.items}
          outfitId={currentOutfit.id}
          initialIndex={carouselStartIndex}
          onClose={() => {
            setShowCarousel(false);
            setDetailsViewed(false);
          }}
        />
      )}
    </>
  );
};