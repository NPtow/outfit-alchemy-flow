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

// Pattern 1: Top + Bottom + Midwear + Bag + Light Shoes
// More compact and centered layout with larger items
export const topBottomBagShoesLayout: LayoutPattern = {
  пиджак: { left: 0.15, top: 0.08, right: 0.55, bottom: 0.48 },
  жакет: { left: 0.15, top: 0.08, right: 0.55, bottom: 0.48 },
  топ: { left: 0.30, top: 0.08, right: 0.70, bottom: 0.50 },
  брюки: { left: 0.35, top: 0.35, right: 0.75, bottom: 0.88 },
  юбка: { left: 0.35, top: 0.35, right: 0.75, bottom: 0.88 },
  туфли: { left: 0.58, top: 0.68, right: 0.88, bottom: 0.92 },
  сумка: { left: 0.08, top: 0.45, right: 0.35, bottom: 0.72 },
};

// Pattern 2: Atomic Top (t-shirt) + Bottom + Bag + Light Shoes
// Larger t-shirt, centered bottom, compact layout
export const atomicTopBottomBagShoesLayout: LayoutPattern = {
  футболка: { left: 0.25, top: 0.10, right: 0.75, bottom: 0.48 },
  брюки: { left: 0.32, top: 0.38, right: 0.70, bottom: 0.88 },
  джинсы: { left: 0.32, top: 0.38, right: 0.70, bottom: 0.88 },
  обувь: { left: 0.56, top: 0.68, right: 0.88, bottom: 0.92 },
  кроссовки: { left: 0.56, top: 0.68, right: 0.88, bottom: 0.92 },
  сумка: { left: 0.08, top: 0.42, right: 0.38, bottom: 0.68 },
};

// Pattern 3: Dress + Midwear + Bag + Shoes
// Larger dress as focal point, centered composition
export const dressBagShoesLayout: LayoutPattern = {
  пиджак: { left: 0.15, top: 0.08, right: 0.55, bottom: 0.48 },
  жакет: { left: 0.15, top: 0.08, right: 0.55, bottom: 0.48 },
  платье: { left: 0.30, top: 0.08, right: 0.72, bottom: 0.85 },
  туфли: { left: 0.58, top: 0.68, right: 0.88, bottom: 0.92 },
  сумка: { left: 0.08, top: 0.45, right: 0.35, bottom: 0.72 },
};

// Pattern 4: Outerwear + Top + Bottom + Bag + Shoes
// Layered look with larger, overlapping items
export const outerTopBottomBagShoesLayout: LayoutPattern = {
  куртка: { left: 0.12, top: 0.08, right: 0.58, bottom: 0.75 },
  топ: { left: 0.30, top: 0.10, right: 0.70, bottom: 0.50 },
  брюки: { left: 0.35, top: 0.38, right: 0.75, bottom: 0.88 },
  юбка: { left: 0.35, top: 0.38, right: 0.75, bottom: 0.88 },
  туфли: { left: 0.58, top: 0.68, right: 0.88, bottom: 0.92 },
  сумка: { left: 0.08, top: 0.45, right: 0.35, bottom: 0.72 },
};

// Pattern 5: Outerwear + Top + Light Bottom + Bag + Long Shoes
export const outerTopLightBottomBagLongShoesLayout: LayoutPattern = {
  куртка: { left: 0.12, top: 0.08, right: 0.58, bottom: 0.75 },
  топ: { left: 0.30, top: 0.10, right: 0.70, bottom: 0.50 },
  брюки: { left: 0.35, top: 0.38, right: 0.75, bottom: 0.88 },
  юбка: { left: 0.35, top: 0.38, right: 0.75, bottom: 0.88 },
  туфли: { left: 0.58, top: 0.68, right: 0.88, bottom: 0.92 },
  сумка: { left: 0.08, top: 0.45, right: 0.35, bottom: 0.72 },
};

// Pattern 6: Dress + Outerwear + Bag + Shoes
export const dressOuterBagShoesLayout: LayoutPattern = {
  куртка: { left: 0.12, top: 0.08, right: 0.58, bottom: 0.75 },
  платье: { left: 0.30, top: 0.10, right: 0.72, bottom: 0.85 },
  туфли: { left: 0.58, top: 0.68, right: 0.88, bottom: 0.92 },
  сумка: { left: 0.08, top: 0.45, right: 0.35, bottom: 0.72 },
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
