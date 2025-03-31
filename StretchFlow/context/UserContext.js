import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [streak, setStreak] = useState(0);

  return (
    <UserContext.Provider value={{ isPremium, setIsPremium, streak, setStreak }}>
      {children}
    </UserContext.Provider>
  );
};
