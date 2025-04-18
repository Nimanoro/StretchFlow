let InAppPurchases;
if (!__DEV__) {
  InAppPurchases = require('expo-in-app-purchases');
}

import AsyncStorage from '@react-native-async-storage/async-storage';

const SUBSCRIPTION_ID = 'premium_monthly'; // match App Store Connect exactly

// Connect to IAP service
export const connectIAP = async () => {
  if (__DEV__ || !InAppPurchases) return;

  try {
    await InAppPurchases.connectAsync();
  } catch (error) {
    console.error('❌ IAP connection error:', error);
  }
};

// Fetch available products
export const getAvailableProducts = async () => {
  if (__DEV__ || !InAppPurchases) return;

  try {
    const { responseCode, results } = await InAppPurchases.getProductsAsync([SUBSCRIPTION_ID]);
    if (responseCode === InAppPurchases.IAPResponseCode.OK) {
      return results;
    } else {
      console.warn('⚠️ Failed to fetch products:', responseCode);
      return [];
    }
  } catch (error) {
    console.error('❌ Product fetch error:', error);
    return [];
  }
};

// Initiate purchase flow
export const buyPremiumSubscription = async (productId) => {
  if (__DEV__ || !InAppPurchases) return;

  try {
    if (!productId) throw new Error('No Product ID provided');
    await InAppPurchases.purchaseItemAsync(productId);
  } catch (error) {
    console.error('❌ Purchase error:', error);
  }
};

// Restore previous purchases
// utils/iap.js

export const restorePurchase = async () => {
  try {
    const { responseCode, results } = await InAppPurchases.getPurchaseHistoryAsync();
    if (responseCode === InAppPurchases.IAPResponseCode.OK && results.length > 0) {
      return results.some(p => p.productId === 'premium_monthly'); // 🔁 your SKU
    }
    return false;
  } catch (e) {
    console.warn('❌ Restore failed:', e);
    return false;
  }
};


// Quick local check
export const isPremiumLocally = async () => {
  const flag = await AsyncStorage.getItem('hasPremium');
  return flag === 'true';
};
