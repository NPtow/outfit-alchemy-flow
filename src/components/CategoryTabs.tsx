import { cn } from "@/lib/utils";

export type Category = "all" | "work" | "casual" | "evening" | "home";

interface CategoryTabsProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}

export const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  const categories = [
    { id: "all" as Category, label: "Общее" },
    { id: "work" as Category, label: "На работу" },
    { id: "casual" as Category, label: "Каждый день" },
    { id: "evening" as Category, label: "Вечернее" },
    { id: "home" as Category, label: "Домашнее" },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-b border-white/10">
      <div className="px-3 sm:px-4 py-3 sm:py-4">
        <h1 className="text-xl sm:text-2xl font-stolzl font-bold text-white mb-3 sm:mb-4">Главная</h1>
        <div className="flex overflow-x-auto hide-scrollbar gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "px-4 sm:px-6 py-1.5 sm:py-2 rounded-full whitespace-nowrap font-semibold text-xs sm:text-sm transition-all duration-200 flex-shrink-0 font-stolzl",
                activeCategory === category.id
                  ? "bg-white text-black"
                  : "bg-[#2a2a2a] text-white/70"
              )}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
