// Outfit layout patterns based on clothing combinations

export type LayoutPosition = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  zIndex?: number;
};

export type LayoutPattern = {
  [key: string]: LayoutPosition;
};

// Pattern 1: Top + Any Bottom + Midwear + Bag + Light Shoes
// Aesty-style: overlapping, shoes & bags are BIGGER
export const topBottomBagShoesLayout: LayoutPattern = {
  пиджак: { left: 0.08, top: 0.08, right: 0.48, bottom: 0.52, zIndex: 1 },
  жакет: { left: 0.08, top: 0.08, right: 0.48, bottom: 0.52, zIndex: 1 },
  топ: { left: 0.35, top: 0.08, right: 0.75, bottom: 0.48, zIndex: 2 },
  брюки: { left: 0.08, top: 0.45, right: 0.45, bottom: 0.88, zIndex: 1 },
  юбка: { left: 0.08, top: 0.45, right: 0.45, bottom: 0.88, zIndex: 1 },
  туфли: { left: 0.55, top: 0.60, right: 0.92, bottom: 0.95, zIndex: 4 },
  обувь: { left: 0.55, top: 0.60, right: 0.92, bottom: 0.95, zIndex: 4 },
  сумка: { left: 0.52, top: 0.30, right: 0.92, bottom: 0.65, zIndex: 5 },
};

// Pattern 2: Atomic Top + Any Bottom + Bag + Light Shoes
// Aesty-style: T-shirt big, bottom overlaps, large shoes & bag
export const atomicTopBottomBagShoesLayout: LayoutPattern = {
  футболка: { left: 0.08, top: 0.08, right: 0.52, bottom: 0.55, zIndex: 1 },
  топ: { left: 0.08, top: 0.08, right: 0.52, bottom: 0.55, zIndex: 1 },
  брюки: { left: 0.38, top: 0.35, right: 0.78, bottom: 0.92, zIndex: 2 },
  джинсы: { left: 0.38, top: 0.35, right: 0.78, bottom: 0.92, zIndex: 2 },
  обувь: { left: 0.55, top: 0.62, right: 0.92, bottom: 0.95, zIndex: 4 },
  туфли: { left: 0.55, top: 0.62, right: 0.92, bottom: 0.95, zIndex: 4 },
  кроссовки: { left: 0.55, top: 0.62, right: 0.92, bottom: 0.95, zIndex: 4 },
  сумка: { left: 0.08, top: 0.50, right: 0.42, bottom: 0.80, zIndex: 5 },
};

// Pattern 3: Dress + Midwear + Bag + Light Shoes
// Aesty-style: Large dress left, midwear overlaps, big accessories
export const dressBagShoesLayout: LayoutPattern = {
  пиджак: { left: 0.35, top: 0.08, right: 0.72, bottom: 0.48, zIndex: 2 },
  жакет: { left: 0.35, top: 0.08, right: 0.72, bottom: 0.48, zIndex: 2 },
  платье: { left: 0.05, top: 0.08, right: 0.48, bottom: 0.92, zIndex: 1 },
  туфли: { left: 0.55, top: 0.62, right: 0.92, bottom: 0.95, zIndex: 4 },
  обувь: { left: 0.55, top: 0.62, right: 0.92, bottom: 0.95, zIndex: 4 },
  сумка: { left: 0.52, top: 0.30, right: 0.92, bottom: 0.65, zIndex: 5 },
};

// Pattern 4: Outerwear + Top + Bottom + Bag + Shoes
// Aesty-style: Outerwear overlaps top, large shoes & bag
export const outerTopBottomBagShoesLayout: LayoutPattern = {
  куртка: { left: 0.08, top: 0.08, right: 0.45, bottom: 0.65, zIndex: 2 },
  пальто: { left: 0.08, top: 0.08, right: 0.45, bottom: 0.65, zIndex: 2 },
  топ: { left: 0.32, top: 0.08, right: 0.68, bottom: 0.50, zIndex: 1 },
  брюки: { left: 0.08, top: 0.52, right: 0.42, bottom: 0.92, zIndex: 1 },
  юбка: { left: 0.08, top: 0.52, right: 0.42, bottom: 0.92, zIndex: 1 },
  туфли: { left: 0.55, top: 0.62, right: 0.92, bottom: 0.95, zIndex: 4 },
  обувь: { left: 0.55, top: 0.62, right: 0.92, bottom: 0.95, zIndex: 4 },
  сумка: { left: 0.52, top: 0.30, right: 0.92, bottom: 0.65, zIndex: 5 },
};

// Pattern 5: Outerwear + Top + Light Bottom + Bag + Long Shoes
// Aesty-style: Similar to pattern 4 but with boots
export const outerTopLightBottomBagLongShoesLayout: LayoutPattern = {
  куртка: { left: 0.08, top: 0.08, right: 0.45, bottom: 0.65, zIndex: 2 },
  пальто: { left: 0.08, top: 0.08, right: 0.45, bottom: 0.65, zIndex: 2 },
  топ: { left: 0.32, top: 0.08, right: 0.68, bottom: 0.50, zIndex: 1 },
  брюки: { left: 0.08, top: 0.52, right: 0.42, bottom: 0.92, zIndex: 1 },
  юбка: { left: 0.08, top: 0.52, right: 0.42, bottom: 0.92, zIndex: 1 },
  туфли: { left: 0.55, top: 0.58, right: 0.92, bottom: 0.95, zIndex: 4 },
  обувь: { left: 0.55, top: 0.58, right: 0.92, bottom: 0.95, zIndex: 4 },
  сумка: { left: 0.52, top: 0.30, right: 0.92, bottom: 0.65, zIndex: 5 },
};

// Pattern 6: Dress + Outerwear + Bag + Shoes
// Aesty-style: Large dress, overlapping outerwear, big accessories
export const dressOuterBagShoesLayout: LayoutPattern = {
  куртка: { left: 0.32, top: 0.08, right: 0.68, bottom: 0.58, zIndex: 2 },
  пальто: { left: 0.32, top: 0.08, right: 0.68, bottom: 0.58, zIndex: 2 },
  платье: { left: 0.05, top: 0.08, right: 0.45, bottom: 0.92, zIndex: 1 },
  туфли: { left: 0.55, top: 0.62, right: 0.92, bottom: 0.95, zIndex: 4 },
  обувь: { left: 0.55, top: 0.62, right: 0.92, bottom: 0.95, zIndex: 4 },
  сумка: { left: 0.52, top: 0.30, right: 0.92, bottom: 0.65, zIndex: 5 },
};

// Pattern 7: Dress + Outerwear + Bag + Long Shoes
// Aesty-style: Same as pattern 6 but with boots
export const dressOuterBagLongShoesLayout: LayoutPattern = {
  куртка: { left: 0.32, top: 0.08, right: 0.68, bottom: 0.58, zIndex: 2 },
  пальто: { left: 0.32, top: 0.08, right: 0.68, bottom: 0.58, zIndex: 2 },
  платье: { left: 0.05, top: 0.08, right: 0.45, bottom: 0.92, zIndex: 1 },
  туфли: { left: 0.55, top: 0.58, right: 0.92, bottom: 0.95, zIndex: 4 },
  обувь: { left: 0.55, top: 0.58, right: 0.92, bottom: 0.95, zIndex: 4 },
  сумка: { left: 0.52, top: 0.30, right: 0.92, bottom: 0.65, zIndex: 5 },
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
