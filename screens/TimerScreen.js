import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Switch,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Share } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { checkVoiceAccess, incrementVoiceUsage } from '../utils/voiceUsage';
import { isSilentMode, setSilentMode as persistSilentMode } from '../utils/voiceSetting';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import ConfettiCannon from 'react-native-confetti-cannon';
import { updateUserData, getUserData } from '../utils/userStorage';
import moment from 'moment'; // or native Date strings
import { Ionicons } from '@expo/vector-icons';
import RoutineSummaryCard from '../components/RoutineSummary';
import { UserContext } from '../context/UserContext';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';


import { Vibration } from 'react-native';


const TimerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { routine, stretches } = route.params;
  const [isPressed, setIsPressed] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(stretches?.[0]?.duration || 30);
  const [isRunning, setIsRunning] = useState(true);
  const [paused, setPaused] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [hasSwitchedSide, setHasSwitchedSide] = useState(false);
  const { themeName } = useContext(ThemeContext);
  const isDark = themeName === 'dark';

  const [showVoiceLimitModal, setShowVoiceLimitModal] = useState(false);
  const [silentMode, setSilentMode] = useState(false);
  const [voiceCreditsUsed, setVoiceCreditsUsed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [handleSkip, setHandleSkip] = useState(false);
  const [voiceChecked, setVoiceChecked] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const { isPremium } = useContext(UserContext);
  const cardRef = useRef(); // 📸 Reference to the card

  const nextFadeAnim = useRef(new Animated.Value(0)).current;
const restartRoutine = () => {
  setCurrentStep(0);
  setSecondsLeft(stretches[0].duration);
  setIsRunning(true);
  setPaused(false);
  setHasSwitchedSide(false);
  setIsResting(false);
  setTotalTime(0);
  setShowConfetti(false);
  setVoiceChecked(false);
  animateFade();
};
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const animateNext = () => {
  nextFadeAnim.setValue(0);
  Animated.timing(nextFadeAnim, {
    toValue: 1,
    duration: 400,
    useNativeDriver: true,
  }).start();
};
const handleShare = async () => {
  try {
    const uri = await captureRef(cardRef, {
      format: 'png',
      quality: 1,
    });

    if (!(await Sharing.isAvailableAsync())) {
      alert('Sharing is not available on this device');
      return;
    }

    await Sharing.shareAsync(uri);
  } catch (err) {
    console.error('Error sharing card:', err);
  }
};
const themed = getThemedStyles(isDark);

  const handleRoutineComplete = async (routine) => {
    const today = moment().format('YYYY-MM-DD');
    const user = await getUserData();
  
    let newStreak = 1;
    if (user?.lastCompleted) {
      const last = moment(user.lastCompleted);
      if (moment().diff(last, 'days') === 1) newStreak = (user.streak || 0) + 1;
      else if (moment().diff(last, 'days') === 0) newStreak = user.streak || 1;
    }
  
    const updated = await updateUserData({
      streak: newStreak,
      lastCompleted: today,
      lastRoutine: routine,
      history: {
        ...(user?.history || {}),
        [today]: routine.title,
      },
    });
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    pulseAnim.setValue(1);
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
  
    return () => pulseLoop.stop(); // Cleanup to prevent stacking
  }, [currentStep, isResting]);
  useEffect(() => {
    if (voiceChecked && currentStretch && isRunning && !paused && !isResting) {
      safeSpeak(`${currentStretch.name}. ${currentStretch.instruction}`);
    }
  }, [currentStep]);
  

  useEffect(() => {
    isSilentMode().then(setSilentMode);
  }, []);

  const toggleSilentMode = async () => {

    if (voiceCreditsUsed && !isPremium) {
      setShowVoiceLimitModal(true);
      return;
    }
    const newVal = !silentMode;
    setSilentMode(newVal);
    await persistSilentMode(newVal);
  };

  const safeSpeak = async (text) => {
    const silent = await isSilentMode();
    const allowed = await checkVoiceAccess(isPremium);
    if (!silent && allowed) {
      Speech.stop();
      Speech.speak(text, { language: 'en-US', pitch: 1.0, rate: 0.9 });
    }
  };

  const animateFade = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (!isRunning || paused) return;
  
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        const stretch = stretches[currentStep];
  
        if (
          stretch?.unilateral &&
          !hasSwitchedSide &&
          prev === Math.floor(stretch.duration / 2)
        ) {
          safeSpeak('Switch sides');
          Vibration.vibrate(300);
          setHasSwitchedSide(true);
        }
        if (
          !stretch?.unilateral &&
          prev === Math.floor(stretch.duration / 2)
        ) {
          safeSpeak('Halfway there');
          Vibration.vibrate(300);
        }
  
        return prev > 0 ? prev - 1 : 0;
      });
  
      setTotalTime((prev) => (secondsLeft > 0 ? prev + 1 : prev));
    }, 1000);
  
    return () => clearInterval(interval);
  }, [isRunning, paused, currentStep, hasSwitchedSide]);
  
  
  useEffect(() => {
    if (!isRunning || !voiceChecked || paused) return;
  
    if (!isResting && secondsLeft === 0) {
      const next = currentStep + 1;
      if (next < stretches.length) {
        setIsResting(true);
        setSecondsLeft(10); // enter rest
        safeSpeak('Rest for 10 seconds');
      } else {
        setIsRunning(false);
        safeSpeak('Routine complete. Great job!');
        handleRoutineComplete(routine);
        setTimeout(() => {
          setShowConfetti(true);
        }, 1000); 
      }
    }
  
    if (isResting && secondsLeft === 0) {
      const next = currentStep + 1;

      setIsResting(false);
      setCurrentStep(next);
      const s = stretches[next];
      if (s) {
        setSecondsLeft(s.duration);
        safeSpeak(`${s.name}. ${s.instruction}`);
      }
      animateFade();
    }
  }, [secondsLeft, isRunning, voiceChecked, paused, isResting]);
  

  useEffect(() => {
    const initVoice = async () => {
      const allowed = await checkVoiceAccess(isPremium);
      const s = stretches[currentStep];
      if (!allowed && !voiceCreditsUsed) {
        setShowVoiceLimitModal(true);
        setSilentMode(true);
        setVoiceCreditsUsed(true); // ✅ now gated correctly
        return;
      }      
       else {
        if (!silentMode && !isPremium) await incrementVoiceUsage();
        safeSpeak(`${s.name}. ${s.instruction}`);
        
      }
      setVoiceChecked(true);
    };
    initVoice();
    animateFade();

    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / stretches.length,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const currentStretch = stretches?.[currentStep];
  const nextStretch = stretches?.[currentStep + 1];

  const backgroundStyle = isResting ? [styles.restBackground, themed.restBackground] : [styles.container, themed.container];

  return (

    <View style={backgroundStyle}>

    <SafeAreaView style={{ backgroundColor: '#F0F4F3' }}/>  

      <View style={[styles.topBar, themed.topBar]}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
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

      <Text style={[styles.routineTitle, themed.routineTitle]}>{routine.title}</Text>

      {isRunning ? (
        <>
          <Text style={[styles.stepProgress, themed.stepProgress]}>
            {`Step ${currentStep + 1} of ${stretches.length}`}
          </Text>

          {isResting ? (
  <>
  <LinearGradient
  colors={['#ECFDF5', '#DBF4FF']}
  style={[StyleSheet.absoluteFill, { zIndex: -1 }]}
/>
<Animated.Text style={[styles.stretchName, { opacity: fadeAnim }, themed.stretchName]}>
  Time to Rest
</Animated.Text>
<Text style={styles.restSubLabel}>10 seconds to reset & refocus</Text>
            
              <Animated.View style={[styles.timerAura,  {transform: [{ scale: pulseAnim }]}, {marginBottom: 20 }, themed.timerAura]}>
                <AnimatedCircularProgress
                  size={180}
                  width={12}
                  fill={(secondsLeft / 10) * 100}
                  tintColor="#10B981"
                  backgroundColor="#E5E7EB"
                  rotation={0}
                  lineCap="round"
                >
                  {() => <Text style={[styles.timer, themed.timer]}>{secondsLeft}s</Text>}
                </AnimatedCircularProgress>
              </Animated.View>
    {nextStretch && (
      <Animated.View style={{ opacity: nextFadeAnim }}>
      <Text style={[styles.nextUp, themed.nextUp]}>Up Next: {nextStretch.name}</Text>
    </Animated.View>
    )}

    <View style={[styles.controlWrapper, themed.controlWrapper]}>
      {/* Back icon - always disabled during rest */}
      <View style={[styles.skipCircle,  themed.skipCircle, styles.skipCircleDisabled, themed.skipCircleDisabled]}>
        <Ionicons name="play-skip-back" size={22} color={themed.disabledSkip.color} />
      </View>

      {/* Center icon - peaceful resting symbol */}
<Pressable
  onPress={() => setPaused((prev) => !prev)}
  style={({ pressed }) => [
    styles.playPauseCircle,
    pressed && styles.playPauseCirclePressed,
    themed.playPauseCircle,
  ]}
>
  <Ionicons name={paused ? 'play' : 'pause'} size={28} color="#fff" />
</Pressable>

      {/* Skip Rest button */}
      <Pressable
        onPress={() => {
          const next = currentStep + 1;
          setIsResting(false);
          setCurrentStep(next);
          setSecondsLeft(stretches[next].duration);
          animateFade();
        }}
        style={[styles.skipCircle, themed.skipCircle]}
      >
        <Ionicons name="play-skip-forward" size={22} color={themed.Skip.color} />
      </Pressable>
    </View>


  
  </>

) : (
            <>
              <Animated.Text style={[styles.stretchName, { opacity: fadeAnim }, themed.stretchName]}>
                {currentStretch.name}
              </Animated.Text>

              <Animated.View style={[styles.timerAura,  {transform: [{ scale: pulseAnim }]}, {marginBottom: 20 }, themed.timerAura]}>
                <AnimatedCircularProgress
                  size={180}
                  width={12}
                  fill={
                    currentStretch.unilateral
                      ? (secondsLeft / currentStretch.duration) * 100
                      : (secondsLeft / currentStretch.duration) * 100
                  }
                  tintColor={
                    currentStretch.unilateral && secondsLeft <= currentStretch.duration / 2
                      ? '#60A5FA' // Indigo for side 2
                      : '#10B981' // Green for side 1
                  }
                  backgroundColor="#E5E7EB"
                  rotation={0}
                  lineCap="round"
                >
                  {() => <Text style={[styles.timer, themed.timer]}>{secondsLeft}</Text>}
                </AnimatedCircularProgress>
              </Animated.View>
              {currentStretch.instruction && (
                <Text style={[styles.instructionText, themed.instructionText]}>
                  {currentStretch.instruction}
                </Text>
              )}

          {nextStretch && !isResting && (
            <Animated.View style={{ opacity: nextFadeAnim }}>
            <View style={[styles.nextContainer, themed.nextContainer]}>
            <Text style={[styles.nextUp, themed.nextUp]}>Get ready for: {nextStretch.name}</Text>

            </View>
          </Animated.View>

          
          )}
          <View style={[styles.controlWrapper, themed.controlWrapper]}>
  <Pressable
    onPress={() => {
      if (currentStep > 0) {
        const prev = currentStep - 1;
        setCurrentStep(prev);
        setSecondsLeft(stretches[prev].duration);
        animateFade();
      }
    }}

    disabled={currentStep === 0}
    style={[
      styles.skipCircle,
      themed.skipCircle,
      currentStep === 0 && styles.skipCircleDisabled,
      currentStep === 0 && themed.skipCircleDisabled,
    ]}
  >
    <Ionicons
      name="play-skip-back"
      size={22}
      color={currentStep === 0 ? themed.disabledSkip.color : themed.Skip.color}
    />
  </Pressable>

  <Pressable
    onPress={() => setPaused((prev) => !prev)}
    style={({ pressed }) => [
      styles.playPauseCircle,
      themed.playPauseCircle,
      pressed && styles.playPauseCirclePressed,
      pressed && styles.playPauseCirclePressed,
    ]}
  >
    <Ionicons name={paused ? 'play' : 'pause'} size={28} color="#fff" />
  </Pressable>

  <Pressable
    onPress={() => {
      if (currentStep < stretches.length - 1) {
        const next = currentStep + 1;
        setCurrentStep(next);
        setSecondsLeft(stretches[next].duration);
        animateFade();
      }
    }}
    style={[
      styles.skipCircle,
      themed.skipCircle,
      currentStep === stretches.length - 1 && styles.skipCircleDisabled,
      currentStep === stretches.length - 1 && themed.skipCircleDisabled,

    ]}
    disabled={currentStep === stretches.length - 1}
  >
    <Ionicons
      name="play-skip-forward"
      size={22}
      color={currentStep === stretches.length - 1 ? themed.disabledSkip.color : themed.Skip.color}
    />
  </Pressable>
</View>



            </>
          )}






<View style={[styles.bottomToggleContainer, themed.bottomToggleContainer]}>
  <Text style={[styles.toggleLabel, themed.toggleLabel]}>Voice Guidance</Text>
  <Switch
    value={!silentMode}
    onValueChange={toggleSilentMode}
  />
</View>
        </>
        
      ) : (
        <>
  <Ionicons name="trophy-outline" size={48} color="#FBBF24" style={{ marginBottom: 12 }} />
  <Text style={[styles.completeHeader, themed.completeHeader]}> Routine Complete!</Text>
  <View ref={cardRef} collapsable={false}>
    <RoutineSummaryCard
    title={routine.title}
    stretchCount={stretches.length}
    duration={`${totalTime}s`}
    muscleGroups={routine.muscleGroups}
    difficulty={routine.difficulty}
    tags={routine.tags}
    isDark={isDark}
    
  />
  </View>
  <Text style={[styles.quoteText, themed.quoteText]}>
    “Small steps every day lead to big change.” 🧘
  </Text>

  <View style={[styles.ctaRow, themed.ctaRow]}>
    <Pressable style={[styles.ctaButtonOutline, themed.ctaButtonOutline]} onPress={handleShare}>
      <Ionicons name="share-social-outline" size={16} color="#10B981" />
      <Text style={[styles.ctaButtonTextAlt, themed.ctaButtonTextAlt]}>Share</Text>
    </Pressable>

    <Pressable style={[styles.ctaButton, themed.ctaButton]} onPress={() => {
      restartRoutine();
    }}>
      <Text style={[styles.ctaButtonText, themed.ctaButtonText]}>Repeat</Text>
    </Pressable>
  </View>

  <Pressable style={[styles.backButton, themed.backButton]} onPress={() => navigation.popToTop()}>
    <Text style={[styles.backToHome, themed.backToHome]}>Back to Home</Text>
  </Pressable>

</>
      )}

      {showConfetti && <ConfettiCannon count={120} origin={{ x: 200, y: 0 }} fadeOut />}
      


      <Modal visible={showVoiceLimitModal} transparent animationType="fade">
  <View style={[styles.modalBackdrop, themed.modalBackdrop]}>
    <View style={[styles.modalContent, themed.modalContent]}>
      {/* Premium Header Banner */}
      <LinearGradient
        colors={['#10B981', '#059669']}
        style={[styles.modalHeader, themed.modalHeader]}
      >
        <Ionicons name="sparkles-outline" size={32} color="#fff" />
        <Text style={[styles.modalHeaderText, themed.modalHeaderText]}>StretchFlow Premium</Text>
      </LinearGradient>

      <Text style={[styles.modalText, themed.modalText]}>
        You’ve used all 3 free voice sessions this week.
Stay focused and unlock unlimited guidance for just $2.99/month.


      </Text>

      {/* Feature bullets */}
      <View style={[styles.modalBulletList, themed.modalBulletList]}>
        <View style={[styles.bulletItem, themed.bulletItem]}>
          <Ionicons name="volume-high-outline" size={18} color="#10B981" />
          <Text style={[styles.bulletText, themed.bulletText]}>Unlimited Voice Guidance</Text>
        </View>
        <View style={styles.bulletItem}>
          <Ionicons name="checkmark-done-outline" size={18} color="#10B981" />
          <Text style={[styles.bulletText, themed.bulletText]}>Personalized Experience</Text>
        </View>
        <View style={styles.bulletItem}>
          <Ionicons name="heart-outline" size={18} color="#10B981" />
          <Text style={[styles.bulletText, themed.bulletText]}>Support App Growth</Text>
        </View>
      </View>

      <Pressable
        style={[styles.modalButton, themed.modalButton]}
        onPress={() => {
          setShowVoiceLimitModal(false);
          navigation.navigate('Premium');
        }}
      >
        <Text style={[styles.modalButtonText, themed.modalButtonText]}>Upgrade to Premium</Text>
      </Pressable>

      <Pressable onPress={() => setShowVoiceLimitModal(false)}>
        <Text style={[styles.modalSkipText, themed.modalSkipText]}>Maybe Later</Text>
      </Pressable>
    </View>
  </View>
</Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F3',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  restBackground: {
    flex: 1,
    backgroundColor: '#D0F4EA',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  topBar: {
    backgroundColor: '#E5E7EB',
    width: '100%',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#10B981',
  },
  routineTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 10,
    color: '#1F2937',
  },
  stepProgress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  stretchName: {
    fontSize: 26,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 12,
    textAlign: 'center',
  },
  restText: {
    fontSize: 26,
    fontWeight: '600',
    color: '#065F46',
    marginTop: 60,
    textAlign: 'center',
  },
  timer: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 10,
  },
  nextContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  controlWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 28,
    marginTop: 24,
  },
  playPauseCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  playPauseCirclePressed: {
    transform: [{ scale: 0.96 }],
  },
  skipCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextUp: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  instructionText: {
    marginTop: 18,
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },  
  bottomToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#ffffff',
    width: '100%',
    gap: 12,
  },
  toggleLabel: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  // 🟢 NEW Modal Style Cleanup Below 🟢

  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingTop: 28,
    paddingBottom: 16,
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    position: 'relative',
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeader: {
    position: 'absolute',
    top: -32,
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  modalHeaderText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  modalText: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    marginTop: 10,
  },
  modalBulletList: {
    width: '100%',
    marginBottom: 20,
    gap: 14,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bulletText: {
    fontSize: 14,
    color: '#374151',
  },
  modalButton: {
    backgroundColor: '#047857',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalSkipText: {
    color: '#6B7280',
    fontSize: 13,
    opacity: 0.9,
    marginTop: 2,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 1,
  },

  completeHeader: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 8,
  },
  quoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
    marginBottom: 16,
  },
  ctaButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  ctaButtonOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  ctaButtonTextAlt: {
    color: '#10B981',
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    marginTop: 10,
    marginBottom: 20,
  },
  backToHome: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
  },
  timerAura: {
    padding: 12,
    borderRadius: 999,
    backgroundColor: '#E0FDF4',
    shadowColor: '#10B981',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'center',

  shadowOffset: { width: 0, height: 0 },
  },
  restSubLabel: {
    fontSize: 15,
    color: '#4B5563',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  
});
const getThemedStyles = (isDark) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? '#0F172A' : '#F0F4F3',
    },
    restBackground: {
      backgroundColor: isDark ? '#1F2937' : '#D0F4EA',
    },
    topBar: {
      backgroundColor: isDark ? '#334155' : '#E5E7EB',
    },
    progressBar: {
      backgroundColor: '#10B981', // Keep consistent across themes
    },
    routineTitle: {
      color: isDark ? '#F3F4F6' : '#1F2937',
    },
    stepProgress: {
      color: isDark ? '#CBD5E1' : '#6B7280',
    },
    stretchName: {
      color: isDark ? '#6EE7B7' : '#047857',
    },
    restText: {
      color: isDark ? '#6EE7B7' : '#065F46',
    },
    timer: {
      color: isDark ? '#F3F4F6' : '#1F2937',
    },
    nextUp: {
      color: isDark ? '#94A3B8' : '#6B7280',
    },
    instructionText: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    bottomToggleContainer: {
      backgroundColor: isDark ? '#1E293B' : '#ffffff',
      borderColor: isDark ? '#334155' : '#E5E7EB',
    },
    toggleLabel: {
      color: isDark ? '#E5E7EB' : '#374151',
    },
    modalContent: {
      backgroundColor: isDark ? '#0F172A' : '#fff',
    },
    
    modalText: {
      color: isDark ? '#E5E7EB' : '#4B5563',
    },
    bulletText: {
      color: isDark ? '#E2E8F0' : '#374151',
    },
    modalSkipText: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    completeHeader: {
      color: isDark ? '#6EE7B7' : '#10B981',
    },
    quoteText: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    backButton: {
      backgroundColor: isDark ? '#1E293B' : '#E5E7EB',
    },
    backToHome: {
      color: isDark ? '#CBD5E1' : '#6B7280',
    },
    timerAura: {
      backgroundColor: isDark ? '#1E3A8A' : '#E0FDF4',
    },
    restSubLabel: {
      color: isDark ? '#CBD5E1' : '#4B5563',
    },
    skipCircle: {
      backgroundColor: isDark ? '#334155' : '#E5E7EB',
    },
    playPauseCircle: {
      backgroundColor: '#10B981', // Same across both
    },
    Skip: {
      color: isDark ? "#D1D5DB" : '#6B7280',
    },
    disabledSkip: {
      color: isDark ? '#6B7280' : '#D1D5DB',
    },
  });

export default TimerScreen;