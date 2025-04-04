import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import RoutineCard from '../components/RoutineCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import exercisesData from '../assets/exercises.json';
import BottomTabNavigator from './bottomNav';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getUserData } from '../utils/userStorage';

const routines = exercisesData.routines || exercisesData;
const motivationalLines = [
  "Let’s unlock that energy today — just 5 minutes.",
  "Small steps, big progress.",
  "You’re just one stretch away from a better day.",
  "Consistency is your real strength 💪",
  "One stretch at a time — you got this.",
];

const streakMilestones = [3, 7, 14, 30, 60];
const getNextMilestone = (streak) => {
  return streakMilestones.find(m => m > streak) || null;
};


const HomeScreen = () => {
  const navigation = useNavigation();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [greeting, setGreeting] = useState('');
  const [motivation, setMotivation] = useState('');
  const [name, setName] = useState('');
  const [streakDays, setStreakDays] = useState(0);
  const [lastSession, setLastSession] = useState(routines[0]);

  useEffect(() => {
    const loadUser = async () => {
      const data = await getUserData();
      if (data) {
        setName(data.userName || '');
        setStreakDays(data.streak || 0);
        setLastSession(data.lastRoutine || exercisesData.routines[0]);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!name) return;

    const hour = new Date().getHours();
    setGreeting(
      hour < 12
        ? `Good morning, ${name}`
        : hour < 18
        ? `Good afternoon, ${name}`
        : `Good evening, ${name}`
    );

    const randomLine = motivationalLines[Math.floor(Math.random() * motivationalLines.length)];
    setMotivation(randomLine);
  }, [name]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <ScrollView style={styles.container}>

      <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F4F3' }}/> 
      {/* === HERO HEADER === */}
      <ImageBackground
        source={require('../assets/hero.png')}
        style={styles.heroHeader}
        imageStyle={{ resizeMode: 'cover' }}
      >
        <Image source={require('../assets/image.png')} style={styles.heroWatermark} />
        <LinearGradient
          colors={['#F0F0F0', 'rgba(224, 247, 241, 0.92)']}
          style={styles.gradientOverlay}
        >
          <View style={styles.headerContent}>
            <Image source={require('../assets/hero.png')} style={styles.logo} />
            <Text style={styles.brandTitle}>StretchFlow</Text>
            <Text style={styles.brandSubtitle}>Find your flow, one stretch at a time</Text>
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.bodySection}>
        {/* === GREETING & MOTIVATION === */}
        <View style={styles.greetingBox}>
          <Text style={styles.greetingText}>{greeting}</Text>
          <Text style={styles.greetingSubtext}>{motivation}</Text>
        </View>

        {/* === STREAK BAR === */}
        <View style={styles.statusBar}>
          <View style={styles.streakRow}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Ionicons name="flame" size={20} color="#F97316" />
            </Animated.View>
            <Text style={styles.statusText}>
              {' '}{streakDays}-day streak – Keep it up!
            </Text>
          </View>

          {(() => {
            const nextMilestone = getNextMilestone(streakDays);
            if (!nextMilestone) return null;

            return (
              <>
                <View style={styles.dotRow}>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        { backgroundColor: i < streakDays ? '#10B981' : '#D1D5DB' },
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.milestoneCaption}>
                  {nextMilestone - streakDays} more to {nextMilestone}-day badge!
                </Text>
              </>
            );
          })()}
        </View>

        {/* === CONTINUE BUTTON === */}
        <Pressable
          onPress={() => {
            const lastRoutine = routines.find(r => r.title === lastSession.title) || routines[0].title;
            navigation.navigate('Routine', {
              routine: lastSession,
            });
          }}
          style={styles.resumeButton}
        >
          <Ionicons name="play" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.resumeText}>Continue: {lastSession.title || 'Any Routine'}</Text>
        </Pressable>

        {/* === TODAY’S RECOMMENDATION === */}
        <Text style={styles.sectionTitle}>Today’s Recommendation</Text>
        <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
          <RoutineCard item={routines[0]} large enablePressAnimation />
        </View>

        {/* === POPULAR ROUTINES === */}
        <Text style={styles.sectionTitle}>Popular Routines</Text>
        <FlatList
          data={routines}
          renderItem={({ item }) => <RoutineCard item={item} enablePressAnimation />}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          style={{ marginBottom: 30 }}
        />

        {/* === PREMIUM BLOCK === */}
        <View style={styles.lockedCard}>
          <Text style={styles.lockedTitle}>Ready to Level Up?</Text>
          <Text style={styles.lockedSubtext}>Unlock the full StretchFlow experience:</Text>

          <View style={styles.bulletList}>
            <Text style={styles.lockedText}>✅ Unlimited sessions & routines</Text>
            <Text style={styles.lockedText}>🎵 Ambient music & relaxing themes</Text>
            <Text style={styles.lockedText}>🧠 Personalized daily suggestions</Text>
            <Text style={styles.lockedText}>💾 Save and build custom flows</Text>
          </View>

          <Pressable style={styles.lockedButton} onPress={() => navigation.navigate('Premium')}>
            <Text style={styles.lockedButtonText}>Unlock Premium</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F4F3',
  },
  heroHeader: {
    height: 260,
    marginBottom: 0,
    justifyContent: 'center',
    position: 'relative',
  },
  heroWatermark: {
    position: 'absolute',
    width: 250,
    height: 250,
    opacity: 0.04,
    top: -20,
    alignSelf: 'center',
    zIndex: 0,
  },
  gradientOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
    zIndex: 1,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 15,
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2A2E43',
  },
  brandSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },

  bodySection: {
    backgroundColor: '#F0FDF4',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 24,
    paddingBottom: 60,
  },

  greetingBox: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  greetingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },

  statusBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 8,
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10, // Was 15 before, 10 feels more elegant now
    marginBottom: 6, // Slightly tighter
  },
  
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D1D5DB',
  },
  milestoneCaption: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },

  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  resumeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#394150',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  lockedCard: {
    backgroundColor: '#F0FDFA',
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  lockedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#047857',
    marginBottom: 6,
  },
  lockedSubtext: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
  },
  bulletList: {
    marginBottom: 16,
  },
  lockedText: {
    fontSize: 14,
    color: '#065F46',
    marginBottom: 6,
  },
  lockedButton: {
    backgroundColor: '#047857',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 25,
    alignSelf: 'center',
  },
  lockedButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default HomeScreen;

