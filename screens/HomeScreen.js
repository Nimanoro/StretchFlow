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
  Linking,
} from 'react-native';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { track } from '../utils/analytics';

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
  const { theme, toggleTheme, themeName } = useContext(ThemeContext);
  const isDark = themeName === 'dark';
  const themedStyles = getThemedStyles(isDark);

  const heroGradient = isDark
  ? ['#1F2937', '#111827']
  : ['#F0F0F0', 'rgba(224, 247, 241, 0.92)'];


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


    <SafeAreaView style={[{flex: 1 }, {backgroundColor: isDark ? '#1F2937' : '#F0F0F0'}]} edges={['top']}>
    <ScrollView style={[styles.container, themedStyles.container]}>
      {/* === HERO HEADER === */}
      <ImageBackground
        source={require('../assets/hero.png')}
        style={styles.heroHeader}
        imageStyle={{ resizeMode: 'cover' }}
      >
        <LinearGradient
          colors={heroGradient}
          style={[styles.gradientOverlay, themedStyles.gradientOverlay]}
        >
          <View style={styles.headerContent}>
            <Image source={require('../assets/hero.png')} style={styles.logo} />
            <Text style={[styles.brandTitle, themedStyles.brandTitle]}>StretchFlow</Text>
            <Text style={[styles.brandSubtitle, themedStyles.brandSubtitle]}>Find your flow, one stretch at a time</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
      <Pressable onPress={toggleTheme} style={{ position: 'absolute', top: 10, right: 16 }}>
  <Ionicons
    name={themeName === 'dark' ? 'sunny-outline' : 'moon-outline'}
    size={32}
    color={themeName === 'dark' ? '#FFF' : '#111827'}
  />
</Pressable>


      <View style={[styles.bodySection, themedStyles.bodySection]}>
        {/* === GREETING & MOTIVATION === */}
        <View style={[styles.greetingBox, themedStyles.greetingBox]}>
          <Text style={[styles.greetingText, themedStyles.greetingText]}>{greeting}</Text>
          <Text style={[styles.greetingSubtext, themedStyles.greetingSubtext]}>{motivation}</Text>
        </View>
        {/* === STREAK BAR === */}
        <View style={[styles.statusBar, themedStyles.statusBar]}>
          <View style={[styles.streakRow, themedStyles.streakRow]}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Ionicons name="flame" size={20} color="#F97316" />
            </Animated.View>
            <Text style={[styles.statusText, themedStyles.statusText]}>
              {' '}{streakDays}-day streak – Keep it up!
            </Text>
          </View>

          {(() => {
            const nextMilestone = getNextMilestone(streakDays);
            if (!nextMilestone) return null;

            return (
              <>
                <View style={[styles.dotRow, themedStyles.dotRow]}>
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
                <Text style={[styles.milestoneCaption, themedStyles.milestoneCaption]}>
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
            track('continue_routine_clicked', {
              routine_title: lastSession.title || 'Unknown',
              streak_days: streakDays,
            });
            navigation.navigate('Routine', {
              routine: lastSession,
            });
          }}
          style={[styles.resumeButton, themedStyles.resumeButton]}
        >
          <Ionicons name="play" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.resumeText}>Continue: {lastSession.title || 'Any Routine'}</Text>
        </Pressable>
        {/* === BETA FEEDBACK SECTION === */}
<View style={[styles.betaBox, themedStyles.betaBox]}>
  <Text style={[styles.betaTitle, themedStyles.betaTitle]}>Thanks for being an early user💚</Text>
  <Text style={[styles.betaSubtext, themedStyles.betaSubtext]}>
    Your feedback helps shape the future of StretchFlow.
  </Text>

  <View style={[styles.betaButtons]}>
    <Pressable
      style={[styles.betaButton, themedStyles.betaButton]}
      onPress={() => { track("Give_feedback_clicked");
        Linking.openURL('https://tally.so/r/w5Odzb')}} // or link to a feedback screen/web
    >
      <Ionicons name="chatbubble-ellipses-outline" size={16} color="#10B981" style={{ marginRight: 6 }} />
      <Text style={[styles.betaButtonText, themedStyles.betaButtonText]}>Give Feedback</Text>
    </Pressable>

    <Pressable
      style={[styles.betaButton, themedStyles.betaButton]}
      onPress={() => { {
        track('view_roadmap_clicked');
         Linking.openURL('https://plastic-fenugreek-00e.notion.site/StretchFlow-You-Build-It-Too-1d13eae17ff780afb4a1ec5950b94325');
      }}}
    >
      <Ionicons name="rocket-outline" size={16} color="#10B981" style={{ marginRight: 6 }} />
      <Text style={[styles.betaButtonText, themedStyles.betaButtonText]}>View Roadmap</Text>
    </Pressable>
  </View>
</View>

        {/* === TODAY’S RECOMMENDATION === */}
        <Text style={[styles.sectionTitle, themedStyles.sectionTitle]}>Today’s Recommendation</Text>
        <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
          <RoutineCard item={routines[0]} large enablePressAnimation />
        </View>

        {/* === POPULAR ROUTINES === */}
        <Text style={[styles.sectionTitle, themedStyles.sectionTitle]}>Popular Routines</Text>
        <FlatList
          data={routines}
          renderItem={({ item }) => <RoutineCard item={item} enablePressAnimation />}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          style={{ marginBottom: 30 }}
        />
      </View>
    </ScrollView>
    </SafeAreaView> 
  );
};


const styles = StyleSheet.create({
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
    backgroundColor: '#ECFDF5', // lighter mint tone, more premium wellness feel
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 48,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  
  lockedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#047857', // deep emerald (consistent with your CTA)
    marginBottom: 6,
    textAlign: 'center',
  },
  
  lockedSubtext: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  bulletList: {
    alignSelf: 'stretch',
    paddingLeft: 12,
    marginBottom: 20,
  },
  
  lockedText: {
    fontSize: 14,
    color: '#065F46',
    marginBottom: 8,
    lineHeight: 20,
  },
  
  lockedButton: {
    backgroundColor: '#047857',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 25,
    alignSelf: 'center',
    shadowColor: '#047857',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  
  lockedButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  betaBox: {
    backgroundColor: '#F0FDF4',
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  betaTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#047857',
    marginBottom: 6,
    textAlign: 'center',
  },
  betaSubtext: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 18,
    textAlign: 'center',
    lineHeight: 20,
  },
  betaButtons: {
    flexDirection: 'row',
    marginLeft: 20,
    justifyContent: 'center',
    gap: 12,
  },
  betaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 24,
    marginHorizontal: 0,
    shadowColor: '#047857',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  betaButtonText: {
    color: '#047857',
    fontWeight: '600',
    fontSize: 15,
  },
  
  
  
});

export default HomeScreen;

const getThemedStyles = (isDark) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? '#111827' : '#F0F4F3',
    },
    bodySection: {
      backgroundColor: isDark ? '#1F2937' : '#F0FDF4',
    },
    greetingText: {
      color: isDark ? '#F9FAFB' : '#111827',
    },
    greetingSubtext: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    statusBar: {
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      ...(isDark && {
        borderColor: '#374151',
        borderWidth: 1,
      }
      )
    },
    statusText: {
      color: isDark ? '#9CA3AF' : '#374151',
    },
    brandTitle: {
      color: isDark ? '#F9FAFB' : '#2A2E43',
    },
    brandSubtitle: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    dot: {
      backgroundColor: isDark ? '#374151' : '#D1D5DB',
    },
    sectionTitle: {
      color: isDark ? '#F9FAFB' : '#394150',
    },
    milestoneCaption: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    betaBox: {
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)'  : '#F0FDF4',
    },
    betaTitle: {
      color: '#10B981',
    },
    betaSubtext: {
      color: isDark ? '#9CA3AF' : '#4B5563',
    },
    betaButtonText: {
      color: isDark ? '#10B981' : '#047857',
    },
    betaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: '#10B981',
      backgroundColor: 'transparent',
    },
  });
