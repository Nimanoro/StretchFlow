// context/ThemeContext.js
import React, { createContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('default'); // 'default', 'light', or 'dark'

  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem('theme');
      setThemeName(saved || 'light');
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme =
      themeName === 'light' ? 'dark' : 'light';
    setThemeName(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
    console.log(`Theme changed to ${newTheme}`);
  };

  const systemTheme = Appearance.getColorScheme();
  return (
    <ThemeContext.Provider value={{toggleTheme, themeName }}>
      {children}
    </ThemeContext.Provider>
  );
};
