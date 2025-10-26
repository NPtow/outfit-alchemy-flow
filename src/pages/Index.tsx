import { OutfitCard } from "@/components/OutfitCard";
import { Sparkles } from "lucide-react";

// Import product images
import jacketBrown from "@/assets/jacket-brown.jpg";
import turtleneckWhite from "@/assets/turtleneck-white.jpg";
import skirtPolka from "@/assets/skirt-polka.jpg";
import bagCream from "@/assets/bag-cream.jpg";
import sneakersWhite from "@/assets/sneakers-white.jpg";
import bootsBlack from "@/assets/boots-black.jpg";

const Index = () => {
  // Sample outfit collections
  const outfits = [
    {
      id: "date-night",
      occasion: "Date Night",
      products: [
        {
          id: "1",
          image: jacketBrown,
          brand: "AllSaints",
          name: "Corduroy Jacket",
          price: 295,
          shopUrl: "https://www.allsaints.com",
        },
        {
          id: "2",
          image: turtleneckWhite,
          brand: "COS",
          name: "Cashmere Turtleneck",
          price: 169,
          shopUrl: "https://www.cosstores.com",
        },
        {
          id: "3",
          image: skirtPolka,
          brand: "& Other Stories",
          name: "Polka Dot Skirt",
          price: 119,
          shopUrl: "https://www.stories.com",
        },
        {
          id: "4",
          image: bagCream,
          brand: "Charles & Keith",
          name: "Shoulder Bag",
          price: 79,
          shopUrl: "https://www.charleskeith.com",
        },
      ],
    },
    {
      id: "casual-chic",
      occasion: "Casual Chic",
      products: [
        {
          id: "5",
          image: turtleneckWhite,
          brand: "Everlane",
          name: "Merino Turtleneck",
          price: 88,
          shopUrl: "https://www.everlane.com",
        },
        {
          id: "6",
          image: sneakersWhite,
          brand: "Veja",
          name: "Campo Sneakers",
          price: 150,
          shopUrl: "https://www.veja-store.com",
        },
        {
          id: "7",
          image: bagCream,
          brand: "Mansur Gavriel",
          name: "Bucket Bag",
          price: 395,
          shopUrl: "https://www.mansurgavriel.com",
        },
        {
          id: "8",
          image: jacketBrown,
          brand: "Madewell",
          name: "Sherpa Jacket",
          price: 168,
          shopUrl: "https://www.madewell.com",
        },
      ],
    },
    {
      id: "work-ready",
      occasion: "Work Ready",
      products: [
        {
          id: "9",
          image: bootsBlack,
          brand: "Vagabond",
          name: "Leather Chelsea Boots",
          price: 180,
          shopUrl: "https://www.vagabond.com",
        },
        {
          id: "10",
          image: skirtPolka,
          brand: "Reiss",
          name: "Midi Skirt",
          price: 148,
          shopUrl: "https://www.reiss.com",
        },
        {
          id: "11",
          image: turtleneckWhite,
          brand: "Massimo Dutti",
          name: "Silk Blend Top",
          price: 129,
          shopUrl: "https://www.massimodutti.com",
        },
        {
          id: "12",
          image: jacketBrown,
          brand: "Sezane",
          name: "Wool Blend Coat",
          price: 290,
          shopUrl: "https://www.sezane.com",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[image:var(--gradient-primary)] flex items-center justify-center shadow-[var(--shadow-card)]">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
              StyleFeed
            </h1>
          </div>
        </div>
      </header>

      {/* Main Feed */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Outfit Suggestions</h2>
          <p className="text-sm text-muted-foreground">
            Curated looks tailored just for you
          </p>
        </div>

        {/* Outfit Feed */}
        <div className="space-y-6">
          {outfits.map((outfit, index) => (
            <div
              key={outfit.id}
              style={{
                animation: `fade-in 0.6s ease-out ${index * 0.15}s backwards`,
              }}
            >
              <OutfitCard occasion={outfit.occasion} products={outfit.products} />
            </div>
          ))}
        </div>

        {/* Bottom Padding */}
        <div className="h-20" />
      </main>
    </div>
  );
};

export default Index;
