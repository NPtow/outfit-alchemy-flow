import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveOutfit, removeSavedOutfit, isOutfitSaved } from "@/lib/outfitStorage";
import { useToast } from "@/hooks/use-toast";
import { mlApi } from '@/lib/mlApi';
import { supabase } from "@/integrations/supabase/client";
import likeDefault from "@/assets/icon_like_mode_default.svg";
import likeActive from "@/assets/icon_like_mode_active.svg";
import shareDefault from "@/assets/icon_share_mode_default.svg";
import shareActive from "@/assets/icon_share_mode_active.svg";
import detailsDefault from "@/assets/icon_details_mode_default.svg";
import detailsActive from "@/assets/icon_details_mode_active.svg";
import { ItemCarousel } from "./ItemCarousel";
import { OutfitCollage, CollageItem } from "./OutfitCollage";
import { assignFinalGridLayout } from "@/lib/gridLayoutsFinal";

// Category mapping from English to Russian for layout positioning
const categoryMapping: Record<string, string> = {
  'TShirt': 'футболка',
  'TankTop': 'топ',
  'Blouse': 'топ',
  'Sweater': 'топ',
  'Sweatshirt': 'топ',
  'Jumper': 'топ',
  'TShirtPolo': 'топ',
  'Dress': 'платье',
  'Skirt': 'юбка',
  'Pants': 'брюки',
  'Jeans': 'джинсы',
  'Shorts': 'брюки',
  'Blazer': 'пиджак',
  'LeatherJacket': 'куртка',
  'DownJacket': 'куртка',
  'WinterCoat': 'пальто',
  'FurCoat': 'пальто',
  'BalletFlats': 'туфли',
  'AnkleBoots': 'туфли',
  'HessianBoots': 'обувь',
  'Bag': 'сумка',
};

interface ShoppableItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  itemNumber: string;
  price: number;
  shopUrl: string;
  image?: string;
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
  onView?: (outfitId: string) => void;
  useML?: boolean;
}

export const VerticalOutfitFeed = ({ 
  outfits, 
  onInteraction, 
  onView,
  useML = false
}: VerticalOutfitFeedProps) => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    // Restore session on mount
    const session = sessionStorage.getItem('feed_session');
    if (session) {
      try {
        const { currentIndex: savedIndex, timestamp } = JSON.parse(session);
        // Restore if session is less than 30 minutes old
        if (Date.now() - timestamp < 30 * 60 * 1000 && savedIndex < outfits.length) {
          return savedIndex;
        }
      } catch (e) {
        console.error('Failed to restore session:', e);
      }
    }
    return 0;
  });
  const [direction, setDirection] = useState(0); // 1 = down, -1 = up
  const [showCarousel, setShowCarousel] = useState(false);
  const [carouselStartIndex, setCarouselStartIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [detailsViewed, setDetailsViewed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [viewStartTime, setViewStartTime] = useState(Date.now());
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get authenticated user ID
  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getUserId();
  }, []);

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
    
    if (useML && currentOutfit && userId) {
      mlApi.recordInteraction(userId, currentOutfit.id, 'view').catch(console.error);
    }
  }, [currentIndex, useML, currentOutfit, userId]);

  // Preload adjacent outfit images
  useEffect(() => {
    const preloadImages = () => {
      // Preload next outfit
      if (currentIndex < outfits.length - 1) {
        const nextOutfit = outfits[currentIndex + 1];
        if (nextOutfit?.items) {
          nextOutfit.items.forEach(item => {
            const img = new Image();
            img.src = item.image || `/clothing-images/${item.category.toLowerCase()}.png`;
          });
        }
      }
      
      // Preload previous outfit
      if (currentIndex > 0) {
        const prevOutfit = outfits[currentIndex - 1];
        if (prevOutfit?.items) {
          prevOutfit.items.forEach(item => {
            const img = new Image();
            img.src = item.image || `/clothing-images/${item.category.toLowerCase()}.png`;
          });
        }
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

  // Save session on index change
  useEffect(() => {
    if (outfits.length > 0) {
      sessionStorage.setItem('feed_session', JSON.stringify({
        currentIndex,
        timestamp: Date.now()
      }));
    }
  }, [currentIndex, outfits.length]);

  // Trigger fetch when near end
  useEffect(() => {
    if (currentIndex >= outfits.length - 3 && onInteraction) {
      onInteraction();
    }
  }, [currentIndex, outfits.length, onInteraction]);

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
    if (currentIndex >= outfits.length - 1) return;
    
    // Вычисляем длительность просмотра
    const viewDuration = (Date.now() - viewStartTime) / 1000;
    
    // Record view with onView callback
    if (onView && currentOutfit) {
      onView(currentOutfit.id);
    }
    
    if (useML && currentOutfit && userId) {
      // Если меньше 2 секунд = skip
      const interactionType = viewDuration < 2 ? 'skip' : 'view';
      mlApi.recordInteraction(
        userId, 
        currentOutfit.id, 
        interactionType, 
        viewDuration
      ).catch(console.error);
    }
    
    setDirection(1);
    setCurrentIndex(currentIndex + 1);
    setViewStartTime(Date.now());
    setShowCarousel(false);
    setDetailsViewed(false);
  };

  const handlePrev = () => {
    if (currentIndex <= 0) return;
    
    setDirection(-1);
    setCurrentIndex(currentIndex - 1);
    setViewStartTime(Date.now());
    setShowCarousel(false);
    setDetailsViewed(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (showCarousel) return;
    setTouchStart(e.targetTouches[0].clientY);
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (showCarousel) return;
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (showCarousel) return;
    const diff = touchStart - touchEnd;
    
    // Swipe up (next)
    if (diff > 50) {
      handleNext();
    }
    // Swipe down (prev)
    else if (diff < -50) {
      handlePrev();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (showCarousel) return;
    
    // Prevent default to avoid double scrolling
    e.preventDefault();
    
    if (e.deltaY > 20) {
      handleNext();
    } else if (e.deltaY < -20) {
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
      if (useML && userId) {
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

  // Render only visible outfits (current-1, current, current+1) for performance
  const visibleOutfits = [
    currentIndex > 0 ? outfits[currentIndex - 1] : null,
    outfits[currentIndex],
    currentIndex < outfits.length - 1 ? outfits[currentIndex + 1] : null
  ].filter(Boolean);

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
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentOutfit.id}
            custom={direction}
            initial={{ 
              y: direction > 0 ? "100%" : direction < 0 ? "-100%" : 0,
              opacity: 0 
            }}
            animate={{ 
              y: 0,
              opacity: 1 
            }}
            exit={{ 
              y: direction > 0 ? "-100%" : direction < 0 ? "100%" : 0,
              opacity: 0 
            }}
            transition={{ 
              type: "tween", 
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
          {/* Outfit Image - Flexible with margins from top and bottom menus */}
          {/* Top menu height: ~100px (title + tabs + padding), Bottom menu: ~70px + 24px bottom offset = 94px */}
          <div 
            className="absolute left-[2mm] right-[2mm] flex items-center justify-center"
            style={{
              top: 'calc(100px + 2mm)',
              bottom: 'calc(94px + 2mm)'
            }}
          >
            <div className="relative w-full h-full bg-white rounded-[32px] flex items-center justify-center overflow-hidden">
              {/* Action Buttons - Inside white container, right side */}
              <div className="absolute right-[2mm] bottom-[10mm] z-20 flex flex-col gap-3 sm:gap-4">
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

              <OutfitCollage
              items={assignFinalGridLayout(
                currentOutfit.items.map(item => ({
                  id: item.id,
                  name: item.name,
                  brand: item.brand,
                  category: item.category,
                  itemNumber: item.itemNumber,
                  price: item.price,
                  shopUrl: item.shopUrl,
                  image: item.image || `/clothing-images/${item.category.toLowerCase()}.png`,
                  position: { left: 0, top: 0, right: 1, bottom: 1 } // temporary, will be replaced by assignFinalGridLayout
                }))
              )}
              outfitId={currentOutfit.id}
              />
            </div>
          </div>

          {/* Scroll Indicator */}
          {currentIndex < outfits.length - 1 && (
            <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-10 animate-bounce">
              <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-white/40" />
            </div>
          )}

          {/* Progress Indicators */}
          <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20">
            {outfits.slice(0, Math.min(outfits.length, 10)).map((_, index) => (
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
            {outfits.length > 10 && (
              <div className="text-white/40 text-xs self-center">
                +{outfits.length - 10}
              </div>
            )}
          </div>
        </motion.div>
        </AnimatePresence>
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