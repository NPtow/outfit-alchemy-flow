import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Bookmark, ShoppingCart, User } from "lucide-react";
import { getBasketItems } from "@/lib/basketStorage";
import { useState, useEffect } from "react";

export const BottomNavigation = () => {
  const location = useLocation();
  const [basketCount, setBasketCount] = useState(0);

  useEffect(() => {
    const updateBasketCount = () => {
      setBasketCount(getBasketItems().length);
    };
    
    updateBasketCount();
    window.addEventListener('storage', updateBasketCount);
    
    return () => window.removeEventListener('storage', updateBasketCount);
  }, []);

  const navItems = [
    {
      name: "Главная",
      icon: Home,
      path: "/",
    },
    {
      name: "Мои образы",
      icon: Bookmark,
      path: "/my-outfits",
    },
    {
      name: "Корзина",
      icon: ShoppingCart,
      path: "/basket",
      badge: basketCount,
    },
    {
      name: "Профиль",
      icon: User,
      path: "/auth",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] border-t border-white/10">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200 relative",
                isActive ? "text-[#C8E871]" : "text-white/50"
              )}
            >
              <Icon className="w-6 h-6" />
              {item.badge && item.badge > 0 && (
                <span className="absolute top-1 right-1/4 bg-pink-400 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
