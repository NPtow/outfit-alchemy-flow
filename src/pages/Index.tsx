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
  const outfits = [
    {
      id: "outfit-1",
      occasion: "Деловой стиль",
      image: outfit1,
      items: [
        {
          id: "1",
          name: "Пиджак",
          brand: "KARL LAGERFELD",
          category: "Пиджак",
          itemNumber: "316111333",
          price: 3621,
          shopUrl: "https://www.wildberries.ru/catalog/316111333/detail.aspx",
          position: { top: "12%", left: "15.5%" },
          placement: "above" as const,
          image: outfitJacket1,
        },
        {
          id: "2",
          name: "Топ",
          brand: "Wildberries",
          category: "Топ",
          itemNumber: "491770604",
          price: 2621,
          shopUrl: "https://www.wildberries.ru/catalog/491770604/detail.aspx",
          position: { top: "12%", left: "35%" },
          placement: "above" as const,
          image: outfitTop1,
        },
        {
          id: "3",
          name: "Брюки",
          brand: "Wildberries",
          category: "Брюки",
          itemNumber: "298659975",
          price: 5621,
          shopUrl: "https://www.wildberries.ru/catalog/298659975/detail.aspx",
          position: { top: "35%", left: "46%" },
          placement: "below" as const,
          image: outfitPants1,
        },
        {
          id: "4",
          name: "Туфли",
          brand: "Wildberries",
          category: "Туфли",
          itemNumber: "283783392",
          price: 2721,
          shopUrl: "https://www.wildberries.ru/catalog/283783392/detail.aspx",
          position: { top: "57%", left: "62%" },
          placement: "below" as const,
          image: outfitShoes1,
        },
        {
          id: "5",
          name: "Сумка",
          brand: "Wildberries",
          category: "Сумка",
          itemNumber: "283783392",
          price: 2721,
          shopUrl: "https://www.wildberries.ru/catalog/283783392/detail.aspx",
          position: { top: "50%", left: "15%" },
          placement: "below" as const,
          image: outfitBag1,
        },
      ],
    },
  ];

  return <VerticalOutfitFeed outfits={outfits} />;
};

export default Index;
