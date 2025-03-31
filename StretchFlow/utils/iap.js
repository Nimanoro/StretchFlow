import * as InAppPurchases from 'expo-in-app-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUBSCRIPTION_ID = 'premium_monthly'; // Must match App Store Connect exactly

// Connect to IAP
export const connectIAP = async () => {
  try {
    await InAppPurchases.connectAsync();
  } catch (err) {
    console.error('IAP connect error:', err);
  }
};

// Get subscription products
export const getAvailableProducts = async () => {
  const { responseCode, results } = await InAppPurchases.getProductsAsync([SUBSCRIPTION_ID]);
  if (responseCode === InAppPurchases.IAPResponseCode.OK) {
    return results;
  }
  return [];
};

// Purchase subscription
export const buyPremiumSubscription = async () => {
  try {
    await InAppPurchases.purchaseItemAsync(SUBSCRIPTION_ID);
  } catch (err) {
    console.error('Purchase error:', err);
  }
};

// Check if user has active subscription
export const hasPremium = async () => {
  try {
    const history = await InAppPurchases.getPurchaseHistoryAsync();
    const active = history.results?.some((p) => {
      if (p.productId === SUBSCRIPTION_ID && p.expirationDate) {
        return new Date(p.expirationDate) > new Date(); // still valid
      }
      return false;
    });
    await AsyncStorage.setItem('hasPremium', active ? 'true' : 'false');
    return active;
  } catch (err) {
    console.error('Check premium error:', err);
    return false;
  }
};

// Restore purchases
export const restorePurchase = async () => {
  try {
    const { results } = await InAppPurchases.getPurchaseHistoryAsync();
    const valid = results?.some((p) => {
      return p.productId === SUBSCRIPTION_ID && (!p.expirationDate || new Date(p.expirationDate) > new Date());
    });
    await AsyncStorage.setItem('hasPremium', valid ? 'true' : 'false');
    return valid;
  } catch (err) {
    console.error('Restore error:', err);
    return false;
  }
};

// Get local flag (for quick access)
export const isPremiumLocally = async () => {
  const flag = await AsyncStorage.getItem('hasPremium');
  return flag === 'true';
};
