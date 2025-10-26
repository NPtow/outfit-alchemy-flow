import { VerticalOutfitFeed } from "@/components/VerticalOutfitFeed";

// Import outfit images
import outfitAthleisure from "@/assets/outfit-athleisure.png";
import outfitCasual from "@/assets/outfit-casual.png";
import outfitDate from "@/assets/outfit-date.png";
import outfitWork from "@/assets/outfit-work.png";
import outfitElegant from "@/assets/outfit-elegant.png";

const Index = () => {
  const outfits = [
    {
      id: "athleisure",
      occasion: "Athleisure Vibes",
      image: outfitAthleisure,
      items: [
        {
          id: "1",
          name: "Cropped Hoodie",
          brand: "Lululemon",
          price: 98,
          shopUrl: "https://shop.lululemon.com",
          position: { top: "15%", left: "20%" },
        },
        {
          id: "2",
          name: "Tank Top",
          brand: "Athleta",
          price: 54,
          shopUrl: "https://athleta.gap.com",
          position: { top: "20%", left: "65%" },
        },
        {
          id: "3",
          name: "Wide Leg Pants",
          brand: "Outdoor Voices",
          price: 88,
          shopUrl: "https://www.outdoorvoices.com",
          position: { top: "55%", left: "70%" },
        },
        {
          id: "4",
          name: "Canvas Tote",
          brand: "Baggu",
          price: 32,
          shopUrl: "https://baggu.com",
          position: { top: "68%", left: "15%" },
        },
        {
          id: "5",
          name: "Retro Sneakers",
          brand: "New Balance",
          price: 110,
          shopUrl: "https://www.newbalance.com",
          position: { top: "78%", left: "65%" },
        },
      ],
    },
    {
      id: "casual",
      occasion: "Casual Day Out",
      image: outfitCasual,
      items: [
        {
          id: "6",
          name: "Graphic Tee",
          brand: "Urban Outfitters",
          price: 42,
          shopUrl: "https://www.urbanoutfitters.com",
          position: { top: "18%", left: "50%" },
        },
        {
          id: "7",
          name: "Mom Jeans",
          brand: "Levi's",
          price: 98,
          shopUrl: "https://www.levi.com",
          position: { top: "45%", left: "55%" },
        },
        {
          id: "8",
          name: "Leopard Tote",
          brand: "Clare V",
          price: 285,
          shopUrl: "https://www.clarev.com",
          position: { top: "60%", left: "18%" },
        },
        {
          id: "9",
          name: "Platform Sneakers",
          brand: "Puma",
          price: 90,
          shopUrl: "https://us.puma.com",
          position: { top: "75%", left: "65%" },
        },
      ],
    },
    {
      id: "date-night",
      occasion: "Date Night",
      image: outfitDate,
      items: [
        {
          id: "10",
          name: "Corduroy Jacket",
          brand: "AllSaints",
          price: 295,
          shopUrl: "https://www.allsaints.com",
          position: { top: "20%", left: "25%" },
        },
        {
          id: "11",
          name: "Turtleneck Top",
          brand: "COS",
          price: 69,
          shopUrl: "https://www.cosstores.com",
          position: { top: "25%", left: "65%" },
        },
        {
          id: "12",
          name: "Polka Dot Skirt",
          brand: "& Other Stories",
          price: 119,
          shopUrl: "https://www.stories.com",
          position: { top: "52%", left: "70%" },
        },
        {
          id: "13",
          name: "Shoulder Bag",
          brand: "Charles & Keith",
          price: 79,
          shopUrl: "https://www.charleskeith.com",
          position: { top: "70%", left: "20%" },
        },
        {
          id: "14",
          name: "Block Heel Shoes",
          brand: "Everlane",
          price: 165,
          shopUrl: "https://www.everlane.com",
          position: { top: "82%", left: "68%" },
        },
      ],
    },
    {
      id: "work-ready",
      occasion: "Work Ready",
      image: outfitWork,
      items: [
        {
          id: "15",
          name: "Pinstripe Blazer",
          brand: "Mango",
          price: 149,
          shopUrl: "https://shop.mango.com",
          position: { top: "22%", left: "28%" },
        },
        {
          id: "16",
          name: "Sleeveless Turtleneck",
          brand: "Massimo Dutti",
          price: 79,
          shopUrl: "https://www.massimodutti.com",
          position: { top: "28%", left: "65%" },
        },
        {
          id: "17",
          name: "Tailored Trousers",
          brand: "Reiss",
          price: 195,
          shopUrl: "https://www.reiss.com",
          position: { top: "58%", left: "68%" },
        },
        {
          id: "18",
          name: "Leather Shoulder Bag",
          brand: "Strathberry",
          price: 495,
          shopUrl: "https://www.strathberry.com",
          position: { top: "68%", left: "18%" },
        },
        {
          id: "19",
          name: "Pointed Pumps",
          brand: "Sam Edelman",
          price: 150,
          shopUrl: "https://www.samedelman.com",
          position: { top: "80%", left: "70%" },
        },
      ],
    },
    {
      id: "elegant",
      occasion: "Elegant Evening",
      image: outfitElegant,
      items: [
        {
          id: "20",
          name: "Corduroy Blazer",
          brand: "Sezane",
          price: 290,
          shopUrl: "https://www.sezane.com",
          position: { top: "22%", left: "25%" },
        },
        {
          id: "21",
          name: "Knit Maxi Dress",
          brand: "H&M Studio",
          price: 129,
          shopUrl: "https://www2.hm.com",
          position: { top: "40%", left: "65%" },
        },
        {
          id: "22",
          name: "Structured Handbag",
          brand: "The Row",
          price: 850,
          shopUrl: "https://www.therow.com",
          position: { top: "72%", left: "18%" },
        },
        {
          id: "23",
          name: "Slingback Heels",
          brand: "Zara",
          price: 89,
          shopUrl: "https://www.zara.com",
          position: { top: "78%", left: "70%" },
        },
      ],
    },
  ];

  return <VerticalOutfitFeed outfits={outfits} />;
};

export default Index;
