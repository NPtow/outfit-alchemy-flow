// Outfit layout patterns based on clothing combinations

export type LayoutPosition = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type LayoutPattern = {
  [key: string]: LayoutPosition;
};

// Pattern 1: Top + Any Bottom + Midwear + Bag + Light Shoes
// TopAnyBottomMidwearBagLightShoesFramework
export const topBottomBagShoesLayout: LayoutPattern = {
  пиджак: { left: 0.12, top: 0.10, right: 0.65, bottom: 0.60 },
  жакет: { left: 0.12, top: 0.10, right: 0.65, bottom: 0.60 },
  топ: { left: 0.30, top: 0.10, right: 0.82, bottom: 0.60 },
  брюки: { left: 0.42, top: 0.42, right: 0.85, bottom: 0.88 },
  юбка: { left: 0.42, top: 0.42, right: 0.85, bottom: 0.88 },
  туфли: { left: 0.62, top: 0.65, right: 0.91, bottom: 0.94 },
  сумка: { left: 0.15, top: 0.5, right: 0.44, bottom: 0.79 },
};

// Pattern 2: Atomic Top + Any Bottom + Bag + Light Shoes
// AtomicTopAnyBottomBagLightShoesFramework (увеличенные TOP и BOTTOM с наслоением)
export const atomicTopBottomBagShoesLayout: LayoutPattern = {
  футболка: { left: 0.22, top: 0.08, right: 0.78, bottom: 0.58 },
  брюки: { left: 0.18, top: 0.30, right: 0.85, bottom: 0.96 },
  джинсы: { left: 0.18, top: 0.30, right: 0.85, bottom: 0.96 },
  обувь: { left: 0.54, top: 0.60, right: 0.86, bottom: 0.94 },
  кроссовки: { left: 0.54, top: 0.60, right: 0.86, bottom: 0.94 },
  сумка: { left: 0.1, top: 0.45, right: 0.37, bottom: 0.72 },
};

// Pattern 3: Dress + Midwear + Bag + Light Shoes
// DressMidwearBagLightShoesFramework
export const dressBagShoesLayout: LayoutPattern = {
  пиджак: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.5 },
  жакет: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.5 },
  платье: { left: 0.4, top: 0.15, right: 0.8, bottom: 0.83 },
  туфли: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9 },
  обувь: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9 },
  сумка: { left: 0.15, top: 0.5, right: 0.44, bottom: 0.79 },
};

// Pattern 4: Outerwear + Top + Bottom + Bag + Shoes
// TopBottomOutwearBagShoesFramework
export const outerTopBottomBagShoesLayout: LayoutPattern = {
  куртка: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.8 },
  пальто: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.8 },
  топ: { left: 0.35, top: 0.12, right: 0.79, bottom: 0.5 },
  брюки: { left: 0.46, top: 0.35, right: 0.8, bottom: 0.85 },
  юбка: { left: 0.46, top: 0.35, right: 0.8, bottom: 0.85 },
  туфли: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9 },
  обувь: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9 },
  сумка: { left: 0.15, top: 0.5, right: 0.44, bottom: 0.79 },
};

// Pattern 5: Outerwear + Top + Light Bottom + Bag + Long Shoes
// TopLightBottomOutwearBagLongShoesFramework
export const outerTopLightBottomBagLongShoesLayout: LayoutPattern = {
  куртка: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.8 },
  пальто: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.8 },
  топ: { left: 0.35, top: 0.12, right: 0.79, bottom: 0.5 },
  брюки: { left: 0.46, top: 0.35, right: 0.8, bottom: 0.85 },
  юбка: { left: 0.46, top: 0.35, right: 0.8, bottom: 0.85 },
  туфли: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9 },
  сумка: { left: 0.15, top: 0.5, right: 0.44, bottom: 0.79 },
};

// Pattern 6: Dress + Outerwear + Bag + Shoes
// DressOutwearBagShoesFramework
export const dressOuterBagShoesLayout: LayoutPattern = {
  куртка: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.8 },
  пальто: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.8 },
  платье: { left: 0.4, top: 0.15, right: 0.8, bottom: 0.83 },
  туфли: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9 },
  обувь: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9 },
  сумка: { left: 0.15, top: 0.5, right: 0.44, bottom: 0.79 },
};

// Pattern 7: Dress + Outerwear + Bag + Long Shoes
// DressOutwearBagLongShoesFramework
export const dressOuterBagLongShoesLayout: LayoutPattern = {
  куртка: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.8 },
  пальто: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.8 },
  платье: { left: 0.4, top: 0.15, right: 0.8, bottom: 0.83 },
  туфли: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9 },
  обувь: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9 },
  сумка: { left: 0.15, top: 0.5, right: 0.44, bottom: 0.79 },
};

export function getOutfitLayout(items: Array<{ category: string }>): LayoutPattern {
  const categories = items.map(item => item.category.toLowerCase());
  
  const hasDress = categories.some(cat => cat.includes('платье'));
  const hasOuterwear = categories.some(cat => cat.includes('куртка') || cat.includes('пальто'));
  const hasTShirt = categories.some(cat => cat.includes('футболка'));
  const hasMidwear = categories.some(cat => cat.includes('пиджак') || cat.includes('жакет'));
  
  // Pattern priority: Dress patterns first
  if (hasDress && hasOuterwear) {
    return dressOuterBagShoesLayout;
  }
  if (hasDress) {
    return dressBagShoesLayout;
  }
  
  // Then outerwear patterns
  if (hasOuterwear) {
    return outerTopBottomBagShoesLayout;
  }
  
  // T-shirt pattern (atomic top)
  if (hasTShirt) {
    return atomicTopBottomBagShoesLayout;
  }
  
  // Default: Top + Bottom pattern (with optional midwear like blazer)
  return topBottomBagShoesLayout;
}

export function getCategoryPosition(category: string, layout: LayoutPattern): LayoutPosition | null {
  const normalizedCategory = category.toLowerCase();
  
  // Direct match
  if (layout[normalizedCategory]) {
    return layout[normalizedCategory];
  }
  
  // Fuzzy matching for variations
  for (const [key, position] of Object.entries(layout)) {
    if (normalizedCategory.includes(key) || key.includes(normalizedCategory)) {
      return position;
    }
  }
  
  return null;
}
