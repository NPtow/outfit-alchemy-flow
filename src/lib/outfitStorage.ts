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
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error reading saved outfits:", error);
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
