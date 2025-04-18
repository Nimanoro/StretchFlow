import React, { createContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { restorePurchase } from '../utils/iap';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [iapInitialized, setIapInitialized] = useState(false);

  const isDev = __DEV__;
  const testFlight = true; // 🔁 set this to true for beta testing

  let InAppPurchases;
  if (!isDev && !testFlight) {
    InAppPurchases = require('expo-in-app-purchases');
  }

  // 🔄 Load premium flag from SecureStore
  useEffect(() => {
    const loadPremiumFlag = async () => {
      try {
        const stored = await SecureStore.getItemAsync('hasPremium');
        if (stored === 'true') {
          setIsPremium(true);
        }
      } catch (err) {
        console.warn('❌ Failed to load premium flag:', err);
      }

      // ⛑ Dev override
      if (isDev || testFlight) {
        setIsPremium(true);
      }
    };

    loadPremiumFlag();
  }, []);

  // 🔄 Auto-init IAP & restore
  useEffect(() => {
    if (!isDev && !testFlight) {
      initIAP();
    }
  }, []);

  // 🧠 Purchase Listener
  useEffect(() => {
    if (isDev || testFlight || !InAppPurchases) return;

    const purchaseListener = InAppPurchases.setPurchaseListener(
      async ({ responseCode, results }) => {
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          for (const purchase of results) {
            if (!purchase.acknowledged) {
              try {
                await InAppPurchases.finishTransactionAsync(purchase, true);
                await SecureStore.setItemAsync('hasPremium', 'true');
                setIsPremium(true);
              } catch (err) {
                console.warn('❌ Failed to finish transaction:', err);
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

  // 🧪 Manual Restore or Initializer
  const initIAP = async () => {
    if (iapInitialized || isDev || testFlight || !InAppPurchases) return;

    try {
      await InAppPurchases.connectAsync();
      const restored = await restorePurchase();
      if (restored) {
        await SecureStore.setItemAsync('hasPremium', 'true');
        setIsPremium(true);
      }
    } catch (err) {
      if (!err.message.includes('Already connected')) {
        console.error('❌ IAP init error:', err);
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
