import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restorePurchase } from '../utils/iap';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isPremium, setIsPremium] = useState(__DEV__ ? true : false); // <- Optional: dev = premium
  const [iapInitialized, setIapInitialized] = useState(false);
  const [madeRoutine, setMadeRoutine] = useState(false);
  const testFlight = true; // <- Optional: testFlight = premium
  let InAppPurchases;
  if (!__DEV__ || !testFlight) {
    InAppPurchases = require('expo-in-app-purchases');
  }

  // ✅ Load from storage on app startup
  useEffect(() => {
    const checkStoredPremium = async () => {
      try {
        const stored = await AsyncStorage.getItem('hasPremium');
        if (stored === 'true') {
          setIsPremium(true);
        }
      } catch (err) {
        console.warn('Failed to load premium flag:', err);
      }
    };
    checkStoredPremium();
  }, []);

  // ✅ Setup purchase listener (only if not in dev mode)
  useEffect(() => {
    if (__DEV__ || !InAppPurchases || testFlight) return;

    const purchaseListener = InAppPurchases.setPurchaseListener(
      async ({ responseCode, results }) => {
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          for (const purchase of results) {
            if (!purchase.acknowledged) {
              try {
                await InAppPurchases.finishTransactionAsync(purchase, true);
                await AsyncStorage.setItem('hasPremium', 'true');
                setIsPremium(true);
              } catch (err) {
                console.warn('Failed to finish transaction:', err);
              }
            }
          }
        }
      }
    );

    return () => {
      InAppPurchases.disconnectAsync();
    };
  }, []);

  // ✅ Manual restore/init function (only runs in prod)
  const initIAP = async () => {
    if (__DEV__ || iapInitialized || !InAppPurchases || testFlight) return;
    try {
      await InAppPurchases.connectAsync();
      const restored = await restorePurchase();
      if (restored) {
        await AsyncStorage.setItem('hasPremium', 'true');
        setIsPremium(true);
      }
    } catch (err) {
      if (!err.message.includes('Already connected')) {
        console.error('IAP init error:', err);
      }
    } finally {
      setIapInitialized(true);
    }
  };

  return (
    <UserContext.Provider value={{ isPremium, setIsPremium, initIAP }}>
      {children}
    </UserContext.Provider>
  );
};
