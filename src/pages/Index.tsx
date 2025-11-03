import { VerticalOutfitFeed } from "@/components/VerticalOutfitFeed";

// Import outfit images
import outfit1 from "@/assets/outfit-1.png";

// Import item images for outfit 1
import outfitJacket1 from "@/assets/outfit-jacket-1.png";
import outfitTop1 from "@/assets/outfit-top-1.png";
import outfitPants1 from "@/assets/outfit-pants-1.png";
import outfitShoes1 from "@/assets/outfit-shoes-1.png";
import outfitBag1 from "@/assets/outfit-bag-1.png";

const Index = () => {
  const outfits = [];

  return <VerticalOutfitFeed outfits={outfits} />;
};

export default Index;
