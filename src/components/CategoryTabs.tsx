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
      <div className="px-3 sm:px-4 py-4 sm:py-5">
        <h1 className="text-2xl sm:text-3xl font-stolzl font-bold text-white mb-4 sm:mb-5">Главная</h1>
        <div className="flex overflow-x-auto hide-scrollbar gap-[2mm]">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "px-4 sm:px-6 py-2 sm:py-2.5 rounded-full whitespace-nowrap font-semibold text-sm sm:text-base transition-all duration-200 flex-shrink-0 font-stolzl relative",
                activeCategory === category.id
                  ? "bg-[#F8F8F8] text-[#1E1E1E] shadow-[2px_2px_4px_rgba(207,255,0,0.3),-2px_-2px_4px_rgba(207,255,0,0.3)] before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-transparent before:to-[#1E1E1E] before:opacity-[0.14] before:pointer-events-none"
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
