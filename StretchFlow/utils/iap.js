import * as InAppPurchases from 'expo-in-app-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUBSCRIPTION_ID = 'premium_monthly'; // match App Store Connect exactly

// Connect to IAP service
export const connectIAP = async () => {
  try {
    await InAppPurchases.connectAsync();
  } catch (error) {
    console.error('❌ IAP connection error:', error);
  }
};

// Fetch available products
export const getAvailableProducts = async () => {
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
  try {
    if (!productId) throw new Error('No Product ID provided');
    await InAppPurchases.purchaseItemAsync(productId);
  } catch (error) {
    console.error('❌ Purchase error:', error);
  }
};

// Restore previous purchases
export const restorePurchase = async () => {
  try {
    const { results } = await InAppPurchases.getPurchaseHistoryAsync();
    const valid = results?.some((purchase) =>
      purchase.productId === SUBSCRIPTION_ID &&
      (!purchase.expirationDate || new Date(purchase.expirationDate) > new Date())
    );
    await AsyncStorage.setItem('hasPremium', valid ? 'true' : 'false');
    return valid;
  } catch (error) {
    console.error('❌ Restore error:', error);
    return false;
  }
};

// Quick local check
export const isPremiumLocally = async () => {
  const flag = await AsyncStorage.getItem('hasPremium');
  return flag === 'true';
};
