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
import { SafeAreaView } from 'react-native-safe-area-context';
import {premiumpng} from '../assets/premium.png';
import {
  connectIAP,
  buyPremiumSubscription,
  getAvailableProducts,
  restorePurchase,
} from '../utils/iap';
import { Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const PremiumScreen = () => {
  const { isPremium, setIsPremium, initIAP } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState(null);
  const [productID, setProductID] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        await initIAP();
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
      console.error('Purchase Error:', err);
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
      console.error('Restore Error:', err);
      Alert.alert('Restore Failed', 'Could not restore purchases.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (isPremium) {
    return (
      <View style={styles.premiumActiveContainer}>
        <Ionicons name="trophy" size={72} color="#FBBF24" />
        <Text style={styles.thankYou}>You’re Premium 🎉</Text>
        <Text style={styles.description}>Thanks for supporting StretchFlow 🙌</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[{ flex: 1 }, {backgroundColor: '#FFFF'}]} edges={['top']}>
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ImageBackground
        source={premiumpng}
        style={styles.header}
        resizeMode="cover"
      >
      </ImageBackground>
      <Pressable
  onPress={() => navigation.goBack()}
  style={{
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 8,
    borderRadius: 30,
  }}
>
  <Ionicons name="arrow-back" size={22} color="#fff" />
</Pressable>

      <View style={styles.content}>
        
        <View style={styles.benefitsList}>
          {[ 
            ['checkmark-circle-outline', 'Unlimited Voice Guidance'],
            ['settings-outline', 'Build & Save Custom Routines'],
            ['sunny-outline', 'Unlock All Pre-Made Flows'],
            ['rocket-outline', 'Priority Feature Access'],
          ].map(([icon, text], idx) => (
            <View key={idx} style={styles.benefitItem}>
              <Ionicons name={icon} size={24} color="#10B981" />
              <Text style={styles.benefitText}>{text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
          <Text style={styles.purchaseButtonText}>{`Start Your Journey for ${price || '$2.99'}/month`}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
          <Text style={styles.restoreButtonText}>Restore Purchase</Text>
        </TouchableOpacity>

        <Text style={styles.legalText}>Cancel anytime in your Apple ID settings.</Text>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  contentContainer: { paddingBottom: 60 },
  header: {
    width: '100%',
    height: 240,
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  headerOverlay: { ...StyleSheet.absoluteFillObject },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0F2F1',
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  benefitsList: {
    width: '100%',
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  benefitText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  purchaseButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    width: '100%',
    marginBottom: 20,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  restoreButton: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
  },
  restoreButtonText: {
    color: '#047857',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  legalText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 24,
  },
  premiumActiveContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  thankYou: {
    fontSize: 28,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
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
