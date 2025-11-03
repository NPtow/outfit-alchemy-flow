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

// Pattern 1: Top + Bottom + Bag + Shoes (with optional Midwear/Jacket)
export const topBottomBagShoesLayout: LayoutPattern = {
  пиджак: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.5 },
  топ: { left: 0.35, top: 0.12, right: 0.79, bottom: 0.5 },
  брюки: { left: 0.46, top: 0.35, right: 0.8, bottom: 0.85 },
  туфли: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9 },
  сумка: { left: 0.15, top: 0.5, right: 0.44, bottom: 0.79 },
};

// Pattern 2: Atomic Top (t-shirt) + Bottom + Bag + Shoes
export const atomicTopBottomBagShoesLayout: LayoutPattern = {
  футболка: { left: 0.29, top: 0.064, right: 0.72, bottom: 0.45 },
  брюки: { left: 0.33, top: 0.37, right: 0.68, bottom: 0.86 },
  обувь: { left: 0.54, top: 0.54, right: 0.86, bottom: 0.9 },
  сумка: { left: 0.1, top: 0.4, right: 0.37, bottom: 0.68 },
};

// Pattern 3: Dress + Bag + Shoes (with optional Midwear)
export const dressBagShoesLayout: LayoutPattern = {
  пиджак: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.5 },
  платье: { left: 0.4, top: 0.15, right: 0.8, bottom: 0.83 },
  туфли: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9 },
  сумка: { left: 0.15, top: 0.5, right: 0.44, bottom: 0.79 },
};

// Pattern 4: Outerwear + Top + Bottom + Bag + Shoes
export const outerTopBottomBagShoesLayout: LayoutPattern = {
  куртка: { left: 0.155, top: 0.12, right: 0.58, bottom: 0.8 },
  топ: { left: 0.35, top: 0.12, right: 0.79, bottom: 0.5 },
  брюки: { left: 0.46, top: 0.35, right: 0.8, bottom: 0.85 },
  туфли: { left: 0.62, top: 0.57, right: 0.91, bottom: 0.9 },
  сумка: { left: 0.15, top: 0.5, right: 0.44, bottom: 0.79 },
};

export function getOutfitLayout(items: Array<{ category: string }>): LayoutPattern {
  const categories = items.map(item => item.category.toLowerCase());
  
  // Check if outfit has dress
  if (categories.some(cat => cat.includes('платье'))) {
    return dressBagShoesLayout;
  }
  
  // Check if outfit has outerwear (jacket/coat)
  if (categories.some(cat => cat.includes('куртка') || cat.includes('пальто'))) {
    return outerTopBottomBagShoesLayout;
  }
  
  // Check if outfit has t-shirt (atomic top)
  if (categories.some(cat => cat.includes('футболка'))) {
    return atomicTopBottomBagShoesLayout;
  }
  
  // Default: Top + Bottom pattern (with optional jacket/blazer)
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
