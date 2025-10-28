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
    <div className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="flex overflow-x-auto hide-scrollbar py-3 px-4 gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "px-6 py-2 rounded-full whitespace-nowrap font-semibold text-sm transition-all duration-200 flex-shrink-0",
              activeCategory === category.id
                ? "bg-secondary text-secondary-foreground"
                : "bg-card border-2 border-border text-foreground hover:border-primary"
            )}
          >
            {category.label}
          </button>
        ))}
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
