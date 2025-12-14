import { useState, useEffect, useCallback } from 'react';
const FAVORITES_KEY = 'ge-nexus-favorites';
const getFavoritesFromStorage = (): number[] => {
  try {
    const item = window.localStorage.getItem(FAVORITES_KEY);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error('Error reading favorites from localStorage', error);
    return [];
  }
};
export const useFavorites = () => {
  const [favorites, setFavorites] = useState<number[]>([]);
  useEffect(() => {
    setFavorites(getFavoritesFromStorage());
  }, []);
  const saveFavorites = (ids: number[]) => {
    try {
      setFavorites(ids);
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
    } catch (error) {
      console.error('Error saving favorites to localStorage', error);
    }
  };
  const toggleFavorite = useCallback((id: number) => {
    const currentFavorites = getFavoritesFromStorage();
    const isFavorited = currentFavorites.includes(id);
    let newFavorites;
    if (isFavorited) {
      newFavorites = currentFavorites.filter(favId => favId !== id);
    } else {
      newFavorites = [...currentFavorites, id];
    }
    saveFavorites(newFavorites);
  }, []);
  const isFavorited = useCallback((id: number) => {
    return favorites.includes(id);
  }, [favorites]);
  return { favorites, toggleFavorite, isFavorited };
};