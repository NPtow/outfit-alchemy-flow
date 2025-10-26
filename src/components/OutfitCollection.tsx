import { ProductCard } from "./ProductCard";
import { Badge } from "@/components/ui/badge";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Product {
  id: string;
  image: string;
  brand: string;
  name: string;
  price: number;
  shopUrl: string;
}

interface OutfitCollectionProps {
  occasion: string;
  products: Product[];
}

export const OutfitCollection = ({ occasion, products }: OutfitCollectionProps) => {
  const handleShare = () => {
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="space-y-4">
      {/* Collection Header */}
      <div className="flex items-center justify-between">
        <Badge variant="default" className="text-sm px-4 py-1.5">
          {occasion}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>

      {/* Collection Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-8" />
    </div>
  );
};
