// Local storage utilities for saved outfits

const STORAGE_KEY = "saved_outfits";

export const getSavedOutfits = (): string[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error reading saved outfits:", error);
    return [];
  }
};

export const saveOutfit = (outfitId: string): void => {
  try {
    const saved = getSavedOutfits();
    if (!saved.includes(outfitId)) {
      saved.push(outfitId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    }
  } catch (error) {
    console.error("Error saving outfit:", error);
  }
};

export const removeSavedOutfit = (outfitId: string): void => {
  try {
    const saved = getSavedOutfits();
    const filtered = saved.filter((id) => id !== outfitId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error removing saved outfit:", error);
  }
};

export const isOutfitSaved = (outfitId: string): boolean => {
  const saved = getSavedOutfits();
  return saved.includes(outfitId);
};
