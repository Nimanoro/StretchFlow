import React, { createContext, useEffect, useState } from 'react';
import * as InAppPurchases from 'expo-in-app-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restorePurchase } from '../utils/iap';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [iapInitialized, setIapInitialized] = useState(false);

  useEffect(() => {
    const setupListener = () => {
      InAppPurchases.setPurchaseListener(async ({ responseCode, results }) => {
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          for (const purchase of results) {
            if (!purchase.acknowledged) {
              await InAppPurchases.finishTransactionAsync(purchase, true);
              await AsyncStorage.setItem('hasPremium', 'true');
              setIsPremium(true);
            }
          }
        }
      });
    };

    setupListener();
    return () => {
      InAppPurchases.disconnectAsync();
    };
  }, []);

  // lazy-restore on demand (e.g. from PremiumScreen, not startup)
  const initIAP = async () => {
    if (iapInitialized) return;
    try {
      await InAppPurchases.connectAsync();
      const restored = await restorePurchase();
      if (restored) setIsPremium(true);
      setIapInitialized(true);
    } catch (err) {
      if (!err.message.includes('Already connected')) {
        console.log('IAP init error:', err);
      }
    }
  };

  return (
    <UserContext.Provider value={{ isPremium, setIsPremium, initIAP }}>
      {children}
    </UserContext.Provider>
  );
};
