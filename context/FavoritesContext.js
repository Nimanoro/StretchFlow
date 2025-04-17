// contexts/FavoritesContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSavedRoutines, saveARoutine } from '../utils/userStorage';
import { track } from '../utils/analytics';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadFavorites = async () => {
      const saved = await getSavedRoutines();
      setFavorites(saved || []);
    };
    loadFavorites();
  }, []);

  const isFavorite = (id) => favorites.some((r) => r.id === id);

  const toggleFavorite = async (item) => {
    let updated;
    track('toggle_favorite', {
      itemName: item.name,
      itemFavorite: !isFavorite(item.id),
    });
    const already = isFavorite(item.id);

    if (already) {
      updated = favorites.filter((r) => r.id !== item.id);
    } else {
      updated = [...favorites, item];
    }

    setFavorites(updated);
    await saveARoutine(item, updated); // Update this function to accept optional override
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
