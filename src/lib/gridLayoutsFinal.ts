// src/lib/gridLayoutsFinal.ts

export interface CollageItem {
  id: string;
  name: string;
  brand?: string;
  category: string;
  itemNumber: string;
  price: number;
  shopUrl: string;
  image: string;
  position: {
    left: number;
    top: number;
    right: number;
    bottom: number;
    zIndex?: number;
  };
}

// 1. Определяем 3 паттерна с координатами
const pattern1_TopBottom = {
  TOP:    { left: 0.05, top: 0.08, right: 0.58, bottom: 0.55 },
  BOTTOM: { left: 0.05, top: 0.57, right: 0.58, bottom: 0.92 },
  BAG:    { left: 0.62, top: 0.08, right: 0.95, bottom: 0.38 },
  SHOES:  { left: 0.62, top: 0.45, right: 0.95, bottom: 0.75 },
};

const pattern2_OuterTopBottom = {
  OUTER:  { left: 0.05, top: 0.05, right: 0.58, bottom: 0.28 },
  TOP:    { left: 0.05, top: 0.30, right: 0.58, bottom: 0.62 },
  BOTTOM: { left: 0.05, top: 0.64, right: 0.58, bottom: 0.92 },
  BAG:    { left: 0.62, top: 0.08, right: 0.95, bottom: 0.38 },
  SHOES:  { left: 0.62, top: 0.45, right: 0.95, bottom: 0.75 },
};

const pattern3_DressOuter = {
  OUTER: { left: 0.05, top: 0.05, right: 0.58, bottom: 0.28 },
  DRESS: { left: 0.05, top: 0.30, right: 0.58, bottom: 0.92 },
  BAG:   { left: 0.62, top: 0.08, right: 0.95, bottom: 0.38 },
  SHOES: { left: 0.62, top: 0.45, right: 0.95, bottom: 0.75 },
};

// 2. Определяем типы категорий
const categoryRules = {
  DRESS: ["платье", "dress"],
  OUTER: ["куртка", "пиджак", "пальто", "jacket", "coat", "down", "winter"],
  TOP:   ["топ", "футболка", "блузка", "свитер", "tshirt", "blouse", "sweater", "jumper", "shirt"],
  BOTTOM:["брюки", "юбка", "джинсы", "pants", "skirt", "jeans"],
  BAG:   ["сумка", "bag"],
  SHOES: ["обувь", "туфли", "кроссовки", "ботинки", "shoes", "boots", "ankle"],
};

function getCategoryType(category: string): keyof typeof categoryRules | null {
  const normalized = category.toLowerCase();
  for (const [type, keywords] of Object.entries(categoryRules)) {
    if (keywords.some(kw => normalized.includes(kw))) {
      return type as keyof typeof categoryRules;
    }
  }
  return null;
}

// 3. Главная функция для назначения позиций
export function assignFinalGridLayout(items: CollageItem[]): CollageItem[] {
  const has = (type: keyof typeof categoryRules) => items.some(i => getCategoryType(i.category) === type);

  let pattern: any;
  if (has("DRESS") && has("OUTER")) {
    pattern = pattern3_DressOuter;
  } else if (has("OUTER")) {
    pattern = pattern2_OuterTopBottom;
  } else {
    pattern = pattern1_TopBottom;
  }

  return items.map(item => {
    const type = getCategoryType(item.category);
    // Находим позицию по типу, если она есть в паттерне
    const position = (type && pattern[type]) 
      ? pattern[type] 
      : { left: 0.3, top: 0.3, right: 0.7, bottom: 0.7 };
    return { ...item, position };
  });
}
