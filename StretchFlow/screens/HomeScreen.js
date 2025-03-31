// screens/HomeScreen.js
import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import RoutineCard from '../components/RoutineCard'; // adjust the import path
import exercisesData from '../assets/exercises.json'; // our complete JSON database


const routines = exercisesData.routines || exercisesData;



const HomeScreen = () => {
  const navigation = useNavigation();
  const streakDays = 5;
  const lastSession = 'Full Body Flow';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Hero Header with Background Image and Gradient */}
      <ImageBackground
        source={require('../assets/logo.png')}
        style={styles.heroHeader}
        imageStyle={{ borderRadius: 20 }}
      >
        <LinearGradient
          colors={['rgba(224, 247, 241, 0.9)', 'rgba(240, 244, 243, 0.9)']}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.gradientOverlay}
        >
          <View style={styles.headerContent}>
            <Image source={require('../assets/logo.png')} style={styles.logo} />
            <Text style={styles.brandTitle}>StretchFlow</Text>
            <Text style={styles.brandSubtitle}>Find your flow, one stretch at a time</Text>
          </View>
          <Pressable style={styles.promoCard} onPress={() => navigation.navigate('Premium')}>
            <Ionicons name="star" size={16} color="#047857" style={{ marginRight: 6 }} />
            <Text style={styles.promoText}>Upgrade to Premium</Text>
          </Pressable>
        </LinearGradient>
      </ImageBackground>

      {/* Daily Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <Ionicons name="flame" size={20} color="#F97316" />
          <Text style={styles.statusText}> {streakDays}-day streak</Text>
        </View>
        <View style={styles.statusItem}>
          <Ionicons name="play-circle" size={20} color="#3B82F6" />
          <Text style={styles.statusText}> Last: {lastSession}</Text>
        </View>
      </View>

      {/* Section Title for Routines */}
      <Text style={styles.sectionTitle}>Popular Routines</Text>

      {/* Routine Cards List */}
      <FlatList
        data={routines}
        renderItem={({ item }) => <RoutineCard item={item} />}
        keyExtractor={(item) => item.id}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        style={{ marginBottom: 20 }}
      />

      {/* Locked Premium Features Card */}
      <View style={styles.lockedCard}>
        <Text style={styles.lockedTitle}>Unlock Exclusive Features</Text>
        <Text style={styles.lockedText}>• Save and customize routines</Text>
        <Text style={styles.lockedText}>• Personalized recommendations</Text>
        <Text style={styles.lockedText}>• Ambient music & themes</Text>
        <Pressable style={styles.lockedButton} onPress={() => navigation.navigate('Premium')}>
          <Text style={styles.lockedButtonText}>Upgrade Now</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F3',
  },
  heroHeader: {
    height: 240,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  gradientOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 15,
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2A2E43',
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginBottom: 10,
  },
  promoText: {
    color: '#047857',
    fontWeight: '600',
    fontSize: 14,
  },
  statusBar: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#394150',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 20,
  },
  lockedCard: {
    backgroundColor: '#F9FAFB',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
  },
  lockedText: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 6,
    textAlign: 'center',
  },
  lockedButton: {
    marginTop: 12,
    backgroundColor: '#D1FAE5',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  lockedButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#047857',
  },
});

export default HomeScreen;
