import { Heart, Bookmark, Share2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

interface OutfitProduct {
  id: string;
  image: string;
  brand: string;
  name: string;
  price: number;
  shopUrl: string;
}

interface OutfitCardProps {
  occasion: string;
  products: OutfitProduct[];
}

export const OutfitCard = ({ occasion, products }: OutfitCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? "Removed from favorites" : "Added to favorites");
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Removed from saved" : "Saved outfit");
  };

  const handleShare = () => {
    toast.success("Link copied to clipboard!");
  };

  const handleShopLook = () => {
    products.forEach((product) => {
      window.open(product.shopUrl, "_blank");
    });
    toast.success("Opening shop links...");
  };

  const totalPrice = products.reduce((sum, product) => sum + product.price, 0);

  return (
    <div className="relative bg-card rounded-3xl overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-500 animate-fade-in">
      {/* Occasion Badge */}
      <div className="absolute top-4 left-4 z-10">
        <Badge variant="secondary" className="text-sm px-4 py-1.5 backdrop-blur-sm bg-secondary/90 font-semibold">
          {occasion}
        </Badge>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleLike}
          className="w-11 h-11 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-accent transition-all duration-300 hover:scale-110"
          aria-label={isLiked ? "Unlike" : "Like"}
        >
          <Heart
            className={`w-5 h-5 transition-all duration-300 ${
              isLiked ? "fill-accent text-accent scale-110" : "text-foreground"
            }`}
          />
        </button>
        <button
          onClick={handleSave}
          className="w-11 h-11 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-accent transition-all duration-300 hover:scale-110"
          aria-label={isSaved ? "Unsave" : "Save"}
        >
          <Bookmark
            className={`w-5 h-5 transition-all duration-300 ${
              isSaved ? "fill-primary text-primary scale-110" : "text-foreground"
            }`}
          />
        </button>
        <button
          onClick={handleShare}
          className="w-11 h-11 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-accent transition-all duration-300 hover:scale-110"
          aria-label="Share"
        >
          <Share2 className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Outfit Display - Products arranged together */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-muted/30 to-muted/60 p-6">
        <div className="grid grid-cols-2 gap-3 h-full">
          {products.slice(0, 4).map((product, index) => (
            <div
              key={product.id}
              className={`relative rounded-2xl overflow-hidden bg-card/80 backdrop-blur-sm hover:scale-105 transition-transform duration-300 ${
                index === 0 ? "col-span-1 row-span-2" : ""
              }`}
              style={{
                animation: `fade-in 0.5s ease-out ${index * 0.1}s backwards`,
              }}
            >
              <img
                src={product.image}
                alt={`${product.brand} ${product.name}`}
                className="w-full h-full object-cover"
              />
              {/* Product Info Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                <p className="text-xs text-background/90 font-medium">{product.brand}</p>
                <p className="text-[10px] text-background/70 line-clamp-1">{product.name}</p>
                <p className="text-sm text-background font-bold mt-1">${product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Info & CTA */}
      <div className="p-5 space-y-4">
        {/* Product Count & Total */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {products.length} {products.length === 1 ? "item" : "items"}
            </p>
            <p className="text-lg font-bold text-foreground">Total ${totalPrice}</p>
          </div>
        </div>

        {/* Shop Button */}
        <Button
          variant="gradient"
          size="lg"
          className="w-full gap-2 text-base font-semibold"
          onClick={handleShopLook}
        >
          <ShoppingBag className="w-5 h-5" />
          Shop This Look
        </Button>

        {/* Product List Preview */}
        <div className="pt-2 space-y-2 border-t border-border">
          {products.slice(0, 3).map((product) => (
            <div key={product.id} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground truncate flex-1">
                {product.brand} · {product.name}
              </span>
              <span className="text-foreground font-semibold ml-2">${product.price}</span>
            </div>
          ))}
          {products.length > 3 && (
            <p className="text-xs text-muted-foreground text-center pt-1">
              +{products.length - 3} more {products.length - 3 === 1 ? "item" : "items"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
