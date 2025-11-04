// Local storage utilities for saved outfits

const STORAGE_KEY = "saved_outfits";

export interface SavedOutfit {
  id: string;
  occasion: string;
  items: Array<{
    id: string;
    name: string;
    brand: string;
    category: string;
    itemNumber: string;
    price: number;
    shopUrl: string;
    image?: string;
    position: {
      top: string;
      left: string;
    };
    placement: "above" | "below";
  }>;
  savedAt: number;
}

export const getSavedOutfits = (): SavedOutfit[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    
    const parsed = JSON.parse(saved);
    
    // Миграция старого формата (массив строк) к новому (массив объектов)
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
      console.log('Migrating old outfit storage format, clearing old data');
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error reading saved outfits:", error);
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
};

export const saveOutfit = (outfit: SavedOutfit): void => {
  try {
    const saved = getSavedOutfits();
    if (!saved.find(o => o.id === outfit.id)) {
      saved.push({ ...outfit, savedAt: Date.now() });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    }
  } catch (error) {
    console.error("Error saving outfit:", error);
  }
};

export const removeSavedOutfit = (outfitId: string): void => {
  try {
    const saved = getSavedOutfits();
    const filtered = saved.filter((outfit) => outfit.id !== outfitId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error removing saved outfit:", error);
  }
};

export const isOutfitSaved = (outfitId: string): boolean => {
  const saved = getSavedOutfits();
  return saved.some(outfit => outfit.id === outfitId);
};
