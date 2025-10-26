import { Heart, ShoppingBag, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

interface ProductCardProps {
  image: string;
  brand: string;
  name: string;
  price: number;
  shopUrl: string;
}

export const ProductCard = ({ image, brand, name, price, shopUrl }: ProductCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? "Removed from favorites" : "Added to favorites");
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Removed from saved items" : "Saved for later");
  };

  return (
    <div className="group relative bg-card rounded-2xl overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-300">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={`${brand} ${name}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Quick Actions Overlay */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleLike}
            className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-accent transition-colors"
            aria-label={isLiked ? "Unlike" : "Like"}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isLiked ? "fill-accent text-accent" : "text-foreground"
              }`}
            />
          </button>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-secondary/90 backdrop-blur-sm text-secondary-foreground font-bold text-base px-3 py-1">
            ${price}
          </Badge>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{brand}</p>
          <h3 className="font-semibold text-card-foreground line-clamp-1">{name}</h3>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="gradient"
            size="sm"
            className="flex-1"
            onClick={() => window.open(shopUrl, "_blank")}
          >
            <ShoppingBag className="w-4 h-4" />
            Shop
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={handleSave}
          >
            <ExternalLink
              className={`w-4 h-4 ${isSaved ? "text-primary" : ""}`}
            />
          </Button>
        </div>
      </div>
    </div>
  );
};
