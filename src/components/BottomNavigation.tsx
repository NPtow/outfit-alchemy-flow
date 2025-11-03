import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getBasketItems } from "@/lib/basketStorage";
import { useState, useEffect } from "react";
import homeIcon from "@/assets/home-icon.png";
import bookmarkIcon from "@/assets/icon_saving_mode_default.png";
import bookmarkActiveIcon from "@/assets/icon_saving_mode_active.svg";
import basketIcon from "@/assets/icon_basket_mode_active.svg";

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
      icon: homeIcon,
      path: "/",
    },
    {
      name: "Мои образы",
      icon: bookmarkIcon,
      activeIcon: bookmarkActiveIcon,
      path: "/my-outfits",
    },
    {
      name: "Корзина",
      icon: basketIcon,
      path: "/basket",
      badge: basketCount,
    },
    {
      name: "Профиль",
      icon: homeIcon,
      path: "/auth",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] border-t border-white/10">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const iconSrc = isActive && item.activeIcon ? item.activeIcon : item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200 relative"
            >
              <img src={iconSrc} alt={item.name} className="w-[52px] h-[52px]" />
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
