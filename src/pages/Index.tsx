import { OutfitCollage, CollageItem } from "@/components/OutfitCollage";

// Import item images
import jacketBlack from "@/assets/jacket-black-2.png";
import topCream from "@/assets/top-cream-2.png";
import pantsBlack from "@/assets/pants-black-2.png";
import shoesBlack from "@/assets/shoes-black-2.png";
import bagBlack from "@/assets/bag-black-2.png";

const Index = () => {
  const outfitItems: CollageItem[] = [
    {
      id: "1",
      name: "Пиджак",
      brand: "KARL LAGERFELD",
      category: "Пиджак",
      itemNumber: "316111333",
      price: 3621,
      shopUrl: "https://www.wildberries.ru/catalog/316111333/detail.aspx",
      image: jacketBlack,
      position: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.8 },
    },
    {
      id: "2",
      name: "Топ",
      brand: "Wildberries",
      category: "Топ",
      itemNumber: "491770604",
      price: 2621,
      shopUrl: "https://www.wildberries.ru/catalog/491770604/detail.aspx",
      image: topCream,
      position: { left: 0.35, top: 0.12, right: 0.79, bottom: 0.5 },
    },
    {
      id: "3",
      name: "Брюки",
      brand: "Wildberries",
      category: "Брюки",
      itemNumber: "298659975",
      price: 5621,
      shopUrl: "https://www.wildberries.ru/catalog/298659975/detail.aspx",
      image: pantsBlack,
      position: { left: 0.46, top: 0.35, right: 0.8, bottom: 0.85 },
    },
    {
      id: "4",
      name: "Туфли",
      brand: "Wildberries",
      category: "Туфли",
      itemNumber: "283783392",
      price: 2721,
      shopUrl: "https://www.wildberries.ru/catalog/283783392/detail.aspx",
      image: shoesBlack,
      position: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9 },
    },
    {
      id: "5",
      name: "Сумка",
      brand: "Wildberries",
      category: "Сумка",
      itemNumber: "283783392",
      price: 2721,
      shopUrl: "https://www.wildberries.ru/catalog/283783392/detail.aspx",
      image: bagBlack,
      position: { left: 0.15, top: 0.5, right: 0.44, bottom: 0.79 },
    },
  ];

  return (
    <div className="h-screen w-full bg-background">
      <OutfitCollage items={outfitItems} outfitId="outfit-1" />
    </div>
  );
};

export default Index;
