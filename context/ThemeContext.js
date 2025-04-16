// context/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import { Appearance, AppState } from 'react-native';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const getSystemTheme = () => Appearance.getColorScheme() || 'light';

  const [themeName, setThemeName] = useState(getSystemTheme());
  const [followSystem, setFollowSystem] = useState(true);

  // Update theme on system change if following system
  useEffect(() => {
    const appearanceSub = Appearance.addChangeListener(({ colorScheme }) => {
      if (followSystem) {
        setThemeName(colorScheme || 'light');
      }
    });

    return () => appearanceSub.remove();
  }, [followSystem]);

  // Reset theme to system when app comes back to foreground
  useEffect(() => {
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && followSystem) {
        const systemTheme = getSystemTheme();
        setThemeName(systemTheme);
      }
    });

    return () => appStateSub.remove();
  }, [followSystem]);

  const toggleTheme = () => {
    setFollowSystem(false); // stop following system
    setThemeName((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ themeName, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
