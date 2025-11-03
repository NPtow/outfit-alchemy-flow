// Local storage utilities for basket items

const STORAGE_KEY = "basket_items";

export interface BasketItem {
  id: string;
  name: string;
  category: string;
  price: number;
  outfitId: string;
  image?: string;
}

export const getBasketItems = (): BasketItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error reading basket items:", error);
    return [];
  }
};

export const addToBasket = (item: BasketItem): void => {
  try {
    const items = getBasketItems();
    if (!items.find((i) => i.id === item.id)) {
      items.push(item);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  } catch (error) {
    console.error("Error adding to basket:", error);
  }
};

export const removeFromBasket = (itemId: string): void => {
  try {
    const items = getBasketItems();
    const filtered = items.filter((item) => item.id !== itemId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error removing from basket:", error);
  }
};

export const isInBasket = (itemId: string): boolean => {
  const items = getBasketItems();
  return items.some((item) => item.id === itemId);
};

export const clearBasket = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing basket:", error);
  }
};
