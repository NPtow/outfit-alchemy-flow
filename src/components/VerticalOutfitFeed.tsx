import { useState, useRef } from "react";
import { Heart, Bookmark, Share2, ShoppingBag, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const currentOutfit = outfits[currentIndex];

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
    // Like action
  };

  const handleSave = () => {
    // Save action
  };

  const handleShare = () => {
    // Share action
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
      {/* Occasion Badge */}
      <div className="absolute top-16 left-6 z-20">
        <Badge variant="secondary" className="text-base px-5 py-2 backdrop-blur-md bg-secondary/90 font-bold">
          {currentOutfit.occasion}
        </Badge>
      </div>

        {/* Action Buttons - Right Side */}
        <div className="absolute right-6 bottom-32 z-20 flex flex-col gap-4">
          <button
            onClick={handleLike}
            className="w-14 h-14 rounded-full bg-card/90 backdrop-blur-md flex items-center justify-center hover:bg-accent transition-all duration-300 hover:scale-110 shadow-[var(--shadow-card)]"
            aria-label="Like"
          >
            <Heart className="w-6 h-6 text-foreground" />
          </button>
          <button
            onClick={handleSave}
            className="w-14 h-14 rounded-full bg-card/90 backdrop-blur-md flex items-center justify-center hover:bg-accent transition-all duration-300 hover:scale-110 shadow-[var(--shadow-card)]"
            aria-label="Save"
          >
            <Bookmark className="w-6 h-6 text-foreground" />
          </button>
          <button
            onClick={handleShare}
            className="w-14 h-14 rounded-full bg-card/90 backdrop-blur-md flex items-center justify-center hover:bg-accent transition-all duration-300 hover:scale-110 shadow-[var(--shadow-card)]"
            aria-label="Share"
          >
            <Share2 className="w-6 h-6 text-foreground" />
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
                className="absolute z-10 animate-scale-in hover:scale-105 transition-all duration-300"
                style={{
                  top: item.position.top,
                  left: item.position.left,
                  animationDelay: `${index * 0.1}s`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="bg-primary text-primary-foreground px-2.5 py-1.5 rounded-lg shadow-[var(--shadow-hover)] backdrop-blur-sm">
                  <p className="text-xs font-semibold whitespace-nowrap">
                    {item.category} {item.itemNumber} ${item.price}
                  </p>
                </div>
              </button>
            ))}
        </div>

        {/* Bottom Shop Button */}
        <div className="absolute bottom-6 left-6 right-6 z-20">
          <Button
            variant="gradient"
            size="lg"
            className="w-full gap-3 text-lg font-bold py-6"
            onClick={handleShopLook}
          >
            <ShoppingBag className="w-6 h-6" />
            {showPrices ? "Hide Items" : "Shop This Look"}
          </Button>
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
