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
export const topBottomBagShoesLayout: LayoutPattern = {
  пиджак: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.5, zIndex: 1 },
  жакет: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.5, zIndex: 1 },
  топ: { left: 0.35, top: 0.12, right: 0.79, bottom: 0.5, zIndex: 2 },
  брюки: { left: 0.46, top: 0.35, right: 0.8, bottom: 0.85, zIndex: 3 },
  юбка: { left: 0.46, top: 0.35, right: 0.8, bottom: 0.85, zIndex: 3 },
  джинсы: { left: 0.46, top: 0.35, right: 0.8, bottom: 0.85, zIndex: 3 },
  туфли: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9, zIndex: 4 },
  обувь: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9, zIndex: 4 },
  сумка: { left: 0.15, top: 0.5, right: 0.44, bottom: 0.79, zIndex: 5 },
};

// Pattern 2: Atomic Top + Any Bottom + Bag + Light Shoes
export const atomicTopBottomBagShoesLayout: LayoutPattern = {
  футболка: { left: 0.29, top: 0.064, right: 0.72, bottom: 0.45, zIndex: 1 },
  топ: { left: 0.29, top: 0.064, right: 0.72, bottom: 0.45, zIndex: 1 },
  брюки: { left: 0.33, top: 0.37, right: 0.68, bottom: 0.86, zIndex: 2 },
  джинсы: { left: 0.33, top: 0.37, right: 0.68, bottom: 0.86, zIndex: 2 },
  юбка: { left: 0.33, top: 0.37, right: 0.68, bottom: 0.86, zIndex: 2 },
  обувь: { left: 0.54, top: 0.54, right: 0.86, bottom: 0.9, zIndex: 4 },
  туфли: { left: 0.54, top: 0.54, right: 0.86, bottom: 0.9, zIndex: 4 },
  кроссовки: { left: 0.54, top: 0.54, right: 0.86, bottom: 0.9, zIndex: 4 },
  сумка: { left: 0.1, top: 0.4, right: 0.37, bottom: 0.68, zIndex: 5 },
};

// Pattern 3: Dress + Midwear + Bag + Light Shoes
export const dressBagShoesLayout: LayoutPattern = {
  пиджак: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.5, zIndex: 1 },
  жакет: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.5, zIndex: 1 },
  платье: { left: 0.4, top: 0.15, right: 0.8, bottom: 0.83, zIndex: 3 },
  туфли: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9, zIndex: 4 },
  обувь: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9, zIndex: 4 },
  кроссовки: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9, zIndex: 4 },
  сумка: { left: 0.15, top: 0.5, right: 0.44, bottom: 0.79, zIndex: 5 },
};

// Pattern 4: Outerwear + Top + Bottom + Bag + Shoes
export const outerTopBottomBagShoesLayout: LayoutPattern = {
  куртка: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.8, zIndex: 1 },
  пальто: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.8, zIndex: 1 },
  топ: { left: 0.35, top: 0.12, right: 0.79, bottom: 0.5, zIndex: 2 },
  брюки: { left: 0.46, top: 0.35, right: 0.8, bottom: 0.85, zIndex: 3 },
  юбка: { left: 0.46, top: 0.35, right: 0.8, bottom: 0.85, zIndex: 3 },
  джинсы: { left: 0.46, top: 0.35, right: 0.8, bottom: 0.85, zIndex: 3 },
  туфли: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9, zIndex: 4 },
  обувь: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9, zIndex: 4 },
  кроссовки: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9, zIndex: 4 },
  сумка: { left: 0.15, top: 0.5, right: 0.44, bottom: 0.79, zIndex: 5 },
};

// Pattern 5: Outerwear + Top + Light Bottom + Bag + Long Shoes (Boots)
export const outerTopLightBottomBagLongShoesLayout: LayoutPattern = {
  куртка: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.8, zIndex: 1 },
  пальто: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.8, zIndex: 1 },
  топ: { left: 0.35, top: 0.12, right: 0.79, bottom: 0.5, zIndex: 2 },
  брюки: { left: 0.46, top: 0.35, right: 0.8, bottom: 0.85, zIndex: 3 },
  юбка: { left: 0.46, top: 0.35, right: 0.8, bottom: 0.85, zIndex: 3 },
  джинсы: { left: 0.46, top: 0.35, right: 0.8, bottom: 0.85, zIndex: 3 },
  ботинки: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9, zIndex: 4 },
  сапоги: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9, zIndex: 4 },
  обувь: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9, zIndex: 4 },
  сумка: { left: 0.15, top: 0.5, right: 0.44, bottom: 0.79, zIndex: 5 },
};

// Pattern 6: Dress + Outerwear + Bag + Shoes
export const dressOuterBagShoesLayout: LayoutPattern = {
  куртка: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.8, zIndex: 1 },
  пальто: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.8, zIndex: 1 },
  платье: { left: 0.4, top: 0.15, right: 0.8, bottom: 0.83, zIndex: 3 },
  туфли: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9, zIndex: 4 },
  обувь: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9, zIndex: 4 },
  кроссовки: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9, zIndex: 4 },
  сумка: { left: 0.15, top: 0.5, right: 0.44, bottom: 0.79, zIndex: 5 },
};

// Pattern 7: Dress + Outerwear + Bag + Long Shoes (Boots)
export const dressOuterBagLongShoesLayout: LayoutPattern = {
  куртка: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.8, zIndex: 1 },
  пальто: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.8, zIndex: 1 },
  платье: { left: 0.4, top: 0.15, right: 0.8, bottom: 0.83, zIndex: 3 },
  ботинки: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9, zIndex: 4 },
  сапоги: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9, zIndex: 4 },
  обувь: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9, zIndex: 4 },
  сумка: { left: 0.15, top: 0.5, right: 0.44, bottom: 0.79, zIndex: 5 },
};

export function getOutfitLayout(items: Array<{ category: string }>): LayoutPattern {
  const categories = items.map(item => item.category.toLowerCase());
  
  const hasDress = categories.some(cat => cat.includes('платье') || cat.includes('dress'));
  const hasOuterwear = categories.some(cat => 
    cat.includes('куртка') || cat.includes('пальто') || 
    cat.includes('jacket') || cat.includes('coat') || cat.includes('down')
  );
  const hasTShirt = categories.some(cat => cat.includes('футболка') || cat.includes('tshirt'));
  const hasMidwear = categories.some(cat => cat.includes('пиджак') || cat.includes('жакет') || cat.includes('blazer'));
  const hasLongShoes = categories.some(cat => 
    cat.includes('ботинки') || cat.includes('сапоги') || 
    cat.includes('boots') || cat.includes('ankle')
  );
  
  // Pattern priority: Dress patterns first
  if (hasDress && hasOuterwear && hasLongShoes) {
    return dressOuterBagLongShoesLayout;
  }
  if (hasDress && hasOuterwear) {
    return dressOuterBagShoesLayout;
  }
  if (hasDress && hasMidwear) {
    return dressBagShoesLayout;
  }
  if (hasDress) {
    return dressBagShoesLayout;
  }
  
  // Outerwear patterns
  if (hasOuterwear && hasLongShoes) {
    return outerTopLightBottomBagLongShoesLayout;
  }
  if (hasOuterwear) {
    return outerTopBottomBagShoesLayout;
  }
  
  // T-shirt pattern (atomic top)
  if (hasTShirt) {
    return atomicTopBottomBagShoesLayout;
  }
  
  // Default: Top + Bottom pattern (with optional midwear)
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
