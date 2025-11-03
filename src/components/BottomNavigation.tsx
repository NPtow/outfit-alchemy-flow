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
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4">
      <div className="relative rounded-full px-6 py-3 bg-gradient-to-r from-white/[0.32] to-black/[0.32] backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-center gap-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const iconSrc = isActive && item.activeIcon ? item.activeIcon : item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200",
                  isActive && "shadow-[0_0_20px_rgba(200,232,113,0.6)]"
                )}
              >
                <img src={iconSrc} alt={item.name} className="w-10 h-10" />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
