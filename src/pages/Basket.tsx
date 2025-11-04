import { useState, useEffect } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ShoppingCart, Trash2 } from "lucide-react";
import { getBasketItems, removeFromBasket } from "@/lib/basketStorage";
import { useToast } from "@/hooks/use-toast";

interface BasketItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
}

const Basket = () => {
  const [basketItems, setBasketItems] = useState<BasketItem[]>([]);
  const { toast } = useToast();

  const loadBasketItems = () => {
    const items = getBasketItems();
    setBasketItems(items);
  };

  useEffect(() => {
    loadBasketItems();
  }, []);

  const handleRemoveItem = (itemId: string, itemName: string) => {
    removeFromBasket(itemId);
    loadBasketItems();
    toast({
      title: "Удалено из корзины",
      description: itemName,
    });
  };

  return (
    <div className="min-h-screen w-full bg-black pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-stolzl font-bold text-white">
            Корзина
          </h1>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-pink-400" />
            <span className="text-sm font-stolzl font-semibold text-pink-400">
              {basketItems.length}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {basketItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
            <ShoppingCart className="w-20 h-20 text-white/30 mb-4" />
            <h2 className="text-xl font-stolzl font-semibold mb-2 text-white">
              Корзина пуста
            </h2>
            <p className="font-stolzl text-white/60">
              Добавьте товары из образов в корзину
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {basketItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#2a2a2a] rounded-2xl p-4 flex gap-4 items-center"
              >
                <div className="w-20 h-20 bg-white rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-stolzl font-semibold text-white mb-1">
                    Название
                  </h3>
                  <p className="text-sm text-white/60 font-stolzl mb-2">
                    {item.category}
                  </p>
                  <p className="text-lg font-stolzl font-bold text-[#C8E871]">
                    {item.price.toLocaleString()} ₽
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id, item.name)}
                  className="p-2 text-white/60 hover:text-red-400 transition-colors"
                  aria-label="Удалить"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Basket;
