import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import homeDefault from "@/assets/icon_home_mode_default.png";
import homeActive from "@/assets/icon_home_mode_active.svg";
import bookmarkIcon from "@/assets/icon_saving_mode_default.png";
import bookmarkActiveIcon from "@/assets/icon_saving_mode_active.svg";
import basketDefault from "@/assets/icon_basket_mode_default.png";
import basketActive from "@/assets/icon_basket_mode_active.svg";
import avatarDefault from "@/assets/icon_avatar_mode_default.png";
import avatarActive from "@/assets/icon_avatar_mode_active.svg";

export const BottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    {
      name: "Главная",
      icon: homeDefault,
      activeIcon: homeActive,
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
      icon: basketDefault,
      activeIcon: basketActive,
      path: "/basket",
    },
    {
      name: "Профиль",
      icon: avatarDefault,
      activeIcon: avatarActive,
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
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
