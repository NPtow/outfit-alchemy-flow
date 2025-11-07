import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import homeDefault from "@/assets/icon_home_mode_default.png";
import homeActive from "@/assets/icon_home_mode_active.svg";
import bookmarkIcon from "@/assets/icon_saving_mode_default.png";
import bookmarkActiveIcon from "@/assets/icon_saving_mode_active_new.svg";
import basketDefault from "@/assets/icon_basket_mode_default.png";
import basketActive from "@/assets/icon_basket_mode_active_new.svg";
import avatarDefault from "@/assets/icon_avatar_mode_default.png";
import avatarActive from "@/assets/icon_avatar_mode_active_new.svg";

export const BottomNavigation = () => {
  const location = useLocation();

  // Preload all icons on mount
  useEffect(() => {
    [homeDefault, homeActive, bookmarkIcon, bookmarkActiveIcon, basketDefault, basketActive, avatarDefault, avatarActive].forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const navItems = [
    {
      name: "Главная",
      icon: homeDefault,
      activeIcon: homeActive,
      path: "/feed",
    },
    {
      name: "Мои образы",
      icon: bookmarkIcon,
      activeIcon: bookmarkActiveIcon,
      path: "/my-outfits",
    },
    {
      name: "Корзина",
      icon: basketDefault,
      activeIcon: basketActive,
      path: "/basket",
    },
    {
      name: "Профиль",
      icon: avatarDefault,
      activeIcon: avatarActive,
      path: "/profile",
    },
  ];

  return (
    <nav className="fixed bottom-[2mm] left-[2mm] right-[2mm] z-50">
      <div className="relative rounded-full p-[2mm] bg-white/90 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-around gap-[2mm]">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const iconSrc = isActive && item.activeIcon ? item.activeIcon : item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center justify-center rounded-full transition-all duration-200 flex-1 aspect-square"
              >
                <img 
                  src={iconSrc} 
                  alt={item.name} 
                  className="w-full h-full object-contain" 
                  loading="eager"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
