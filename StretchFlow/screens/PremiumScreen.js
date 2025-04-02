import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { UserContext } from '../context/UserContext';
import * as InAppPurchases from 'expo-in-app-purchases';
import {
  connectIAP,
  buyPremiumSubscription,
  getAvailableProducts,
  restorePurchase,
} from '../utils/iap';

const PremiumScreen = () => {
  const { isPremium, setIsPremium } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState(null);
  const [productID, setProductID] = useState(null);
  const [productsLoaded, setProductsLoaded] = useState(false);

  useEffect(() => {
    let purchaseListener;

    const setup = async () => {
      try {
        await connectIAP();
        const products = await getAvailableProducts();

        if (products.length > 0) {
          setProductID(products[0].productId);
          setPrice(products[0].price);
          setProductsLoaded(true);
        }

        purchaseListener = InAppPurchases.setPurchaseListener(
          async ({ responseCode, results }) => {
            if (responseCode === InAppPurchases.IAPResponseCode.OK) {
              for (const purchase of results) {
                if (!purchase.acknowledged) {
                  await InAppPurchases.finishTransactionAsync(purchase, true);
                  setIsPremium(true);
                  Alert.alert('✅ Premium Unlocked!');
                }
              }
            } else {
              console.warn('Purchase failed or cancelled');
            }
          }
        );
      } catch (err) {
        console.error('IAP Setup Error:', err);
        Alert.alert('IAP Error', 'Something went wrong with setting up In-App Purchases.');
      } finally {
        setLoading(false);
      }
    };

    setup();

    return () => {
      InAppPurchases.disconnectAsync();
      if (purchaseListener?.remove) purchaseListener.remove();
    };
  }, []);

  const handlePurchase = async () => {
    if (!productID || !productsLoaded) {
      Alert.alert('Please wait', 'Products are still loading.');
      return;
    }

    try {
      await buyPremiumSubscription(productID);
    } catch (error) {
      console.error('Purchase failed:', error);
      Alert.alert('Error', 'Purchase could not be completed.');
    }
  };

  const handleRestore = async () => {
    try {
      const restored = await restorePurchase();
      if (restored) {
        setIsPremium(true);
        Alert.alert('🔄 Purchase Restored!');
      } else {
        Alert.alert('No active subscription found.');
      }
    } catch (err) {
      console.error('Restore error:', err);
      Alert.alert('Restore Failed', 'Could not restore purchases.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#888" />
      ) : isPremium ? (
        <View style={styles.premiumActiveContainer}>
          <Ionicons name="star" size={60} color="#FFD700" />
          <Text style={styles.thankYou}>🎉 You’re Premium!</Text>
          <Text style={styles.description}>Thank you for supporting StretchFlow 🙌</Text>
        </View>
      ) : (
        <>
          <ImageBackground
            source={require('../assets/logo.png')}
            style={styles.header}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'transparent']}
              style={styles.headerOverlay}
            />
            <Text style={styles.headerTitle}>Unlock Premium</Text>
          </ImageBackground>

          <View style={styles.content}>
            <Text style={styles.copyTitle}>Why Go Premium?</Text>

            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="close-circle" size={24} color="#047857" />
                <Text style={styles.benefitText}>Ad-Free Experience</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="save" size={24} color="#047857" />
                <Text style={styles.benefitText}>Save Custom Routines</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="musical-notes" size={24} color="#047857" />
                <Text style={styles.benefitText}>Exclusive Music & Themes</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="flash" size={24} color="#047857" />
                <Text style={styles.benefitText}>Priority Updates & Features</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
              <Text style={styles.purchaseButtonText}>
                {`Subscribe for ${price || '$2.99/month'}`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
              <Text style={styles.restoreButtonText}>Restore Purchase</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    width: '100%',
    height: 220,
    justifyContent: 'flex-end',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  copyTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2A2E43',
    marginBottom: 20,
  },
  benefitsList: {
    width: '100%',
    marginBottom: 30,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  benefitText: {
    fontSize: 18,
    color: '#444',
    marginLeft: 12,
  },
  purchaseButton: {
    backgroundColor: '#047857',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 40,
    marginBottom: 20,
    width: '100%',
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  restoreButton: {
    backgroundColor: '#e0f7fa',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 40,
    width: '100%',
  },
  restoreButtonText: {
    color: '#047857',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  premiumActiveContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  thankYou: {
    fontSize: 28,
    fontWeight: '600',
    color: '#2e7d32',
    marginTop: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: '#444',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default PremiumScreen;
