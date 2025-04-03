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
import {
  connectIAP,
  buyPremiumSubscription,
  getAvailableProducts,
  restorePurchase,
} from '../utils/iap';

const PremiumScreen = () => {
  const { isPremium, setIsPremium, initIAP } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState(null);
  const [productID, setProductID] = useState(null);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        await initIAP(); // <-- only now do we connect
        const products = await getAvailableProducts();
        if (products.length > 0) {
          setProductID(products[0].productId);
          setPrice(products[0].price);
        }
      } catch (err) {
        console.error('IAP Setup Error:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProducts();
  }, []);
  const handlePurchase = async () => {
    if (!productID) return Alert.alert('Please wait', 'Products are still loading.');
    try {
      await buyPremiumSubscription(productID);
    } catch (err) {
      console.error('❌ Purchase Error:', err);
      Alert.alert('Error', 'Could not complete purchase.');
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
      console.error('❌ Restore Error:', err);
      Alert.alert('Restore Failed', 'Could not restore purchases.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#888" />
      </View>
    );
  }

  if (isPremium) {
    return (
      <View style={styles.premiumActiveContainer}>
        <Ionicons name="star" size={60} color="#FFD700" />
        <Text style={styles.thankYou}>🎉 You’re Premium!</Text>
        <Text style={styles.description}>Thank you for supporting StretchFlow 🙌</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
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
          {[
            ['close-circle', 'Ad-Free Experience'],
            ['save', 'Save Custom Routines'],
            ['musical-notes', 'Exclusive Music & Themes'],
            ['flash', 'Priority Updates & Features'],
          ].map(([icon, text], idx) => (
            <View key={idx} style={styles.benefitItem}>
              <Ionicons name={icon} size={24} color="#047857" />
              <Text style={styles.benefitText}>{text}</Text>
            </View>
          ))}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { paddingBottom: 40 },
  header: {
    width: '100%',
    height: 220,
    justifyContent: 'flex-end',
  },
  headerOverlay: { ...StyleSheet.absoluteFillObject },
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PremiumScreen;
