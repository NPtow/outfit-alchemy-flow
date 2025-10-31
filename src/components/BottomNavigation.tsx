import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Brain } from "lucide-react";
import homeIcon from "@/assets/home-icon.png";
import bookmarkIcon from "@/assets/bookmark-icon.png";

export const BottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    {
      name: "Лента",
      icon: homeIcon,
      path: "/",
      isImage: true,
    },
    {
      name: "Мои образы",
      icon: bookmarkIcon,
      path: "/my-outfits",
      isImage: true,
    },
    {
      name: "ML",
      path: "/ml-insights",
      isImage: false,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t-2 border-border shadow-[0_-4px_6px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center justify-center flex-1 h-full transition-all duration-200",
                isActive ? "opacity-100 scale-110" : "opacity-70"
              )}
            >
              {item.isImage ? (
                <img 
                  src={item.icon} 
                  alt={item.name}
                  className="w-8 h-8"
                />
              ) : (
                <Brain className={cn(
                  "w-8 h-8",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
