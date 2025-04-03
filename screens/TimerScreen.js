import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Switch,
  Animated,
} from 'react-native';
import { Share } from 'react-native';
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
  const [showVoiceLimitModal, setShowVoiceLimitModal] = useState(false);
  const [silentMode, setSilentMode] = useState(false);
  const [voiceCreditsUsed, setVoiceCreditsUsed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [handleSkip, setHandleSkip] = useState(false);
  const [voiceChecked, setVoiceChecked] = useState(false);
  const [totalTime, setTotalTime] = useState(0);

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
    isSilentMode().then(setSilentMode);
  }, []);

  const toggleSilentMode = async () => {
    if (voiceCreditsUsed) return;
    const newVal = !silentMode;
    setSilentMode(newVal);
    await persistSilentMode(newVal);
  };

  const safeSpeak = async (text) => {
    const silent = await isSilentMode();
    const allowed = await checkVoiceAccess();
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
    Animated.loop(
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
    ).start();
  }, []);

  useEffect(() => {
    if (!isRunning || paused) return;
  
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
      setTotalTime((prev) => (prev>0? prev + 1 : prev))
    }, 1000);
  
    return () => clearInterval(interval);
  }, [isRunning, paused]);
  
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
        setShowConfetti(true);
      }
    }
  
    if (isResting && secondsLeft === 0) {
      const next = currentStep + 1;
      setIsResting(false);
      setCurrentStep(next);
      setSecondsLeft(stretches[next].duration);
      animateFade();
    }
  }, [secondsLeft, isRunning, voiceChecked, paused, isResting]);
  

  useEffect(() => {
    const initVoice = async () => {
      const allowed = await checkVoiceAccess();
      const s = stretches[currentStep];
      if (!allowed && !voiceCreditsUsed) {
        setShowVoiceLimitModal(true);
        setSilentMode(true);
        setVoiceCreditsUsed(true); // prevent re-showing
      }
       else {
        if (!silentMode) await incrementVoiceUsage();
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

  const backgroundStyle = isResting ? styles.restBackground : styles.container;

  return (
    <View style={backgroundStyle}>
      <View style={styles.topBar}>
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

      <Text style={styles.routineTitle}>{routine.title}</Text>

      {isRunning ? (
        <>
          <Text style={styles.stepProgress}>
            {`Step ${currentStep + 1} of ${stretches.length}`}
          </Text>

          {isResting ? (
  <>
  <LinearGradient
  colors={['#D1FAE5', '#ECFDF5']}
  style={[StyleSheet.absoluteFill, { zIndex: -1 }]}
/>
    
<Animated.Text style={[styles.stretchName, { opacity: fadeAnim }]}>
                resting...
              </Animated.Text>

              <Animated.View style={{ transform: [{ scale: pulseAnim }], marginBottom: 20 }}>
                <AnimatedCircularProgress
                  size={180}
                  width={12}
                  fill={(secondsLeft / 10) * 100}
                  tintColor="#10B981"
                  backgroundColor="#E5E7EB"
                  rotation={0}
                  lineCap="round"
                >
                  {() => <Text style={styles.timer}>{secondsLeft}s</Text>}
                </AnimatedCircularProgress>
              </Animated.View>
    {nextStretch && (
      <Text style={styles.nextUp}>Up Next: {nextStretch.name}</Text>
    )}

    <View style={styles.controlWrapper}>
      {/* Back icon - always disabled during rest */}
      <View style={[styles.skipCircle, styles.skipCircleDisabled]}>
        <Ionicons name="play-skip-back" size={22} color="#D1D5DB" />
      </View>

      {/* Center icon - peaceful resting symbol */}
      <View style={styles.playPauseCircle}>
        <Ionicons name="leaf-outline" size={26} color="#fff" />
      </View>

      {/* Skip Rest button */}
      <Pressable
        onPress={() => {
          const next = currentStep + 1;
          setIsResting(false);
          setCurrentStep(next);
          setSecondsLeft(stretches[next].duration);
          animateFade();
        }}
        style={styles.skipCircle}
      >
        <Ionicons name="play-skip-forward" size={22} color="#6B7280" />
      </Pressable>
    </View>
  </>

) : (
            <>
              <Animated.Text style={[styles.stretchName, { opacity: fadeAnim }]}>
                {currentStretch.name}
              </Animated.Text>

              <Animated.View style={{ transform: [{ scale: pulseAnim }], marginBottom: 20 }}>
                <AnimatedCircularProgress
                  size={180}
                  width={12}
                  fill={(secondsLeft / currentStretch.duration) * 100}
                  tintColor="#10B981"
                  backgroundColor="#E5E7EB"
                  rotation={0}
                  lineCap="round"
                >
                  {() => <Text style={styles.timer}>{secondsLeft}s</Text>}
                </AnimatedCircularProgress>
              </Animated.View>
              {currentStretch.instruction && (
                <Text style={styles.instructionText}>
                  {currentStretch.instruction}
                </Text>
              )}

          {nextStretch && !isResting && (
            <View style={styles.nextContainer}>
              <Text style={styles.nextUp}>Up Next: {nextStretch.name}</Text>
            </View>

          
          )}
          <View style={styles.controlWrapper}>
  <Pressable
    onPress={() => {
      if (currentStep > 0) {
        const prev = currentStep - 1;
        setCurrentStep(prev);
        setSecondsLeft(stretches[prev].duration);
        animateFade();
      }
    }}
    style={[
      styles.skipCircle,
      currentStep === 0 && styles.skipCircleDisabled,
    ]}
    disabled={currentStep === 0}
  >
    <Ionicons
      name="play-skip-back"
      size={22}
      color={currentStep === 0 ? '#D1D5DB' : '#6B7280'}
    />
  </Pressable>

  <Pressable
    onPress={() => setPaused((prev) => !prev)}
    style={({ pressed }) => [
      styles.playPauseCircle,
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
      currentStep === stretches.length - 1 && styles.skipCircleDisabled,
    ]}
    disabled={currentStep === stretches.length - 1}
  >
    <Ionicons
      name="play-skip-forward"
      size={22}
      color={currentStep === stretches.length - 1 ? '#D1D5DB' : '#6B7280'}
    />
  </Pressable>
</View>


            </>
          )}







        </>
      ) : (
        <>
  <Ionicons name="trophy-outline" size={48} color="#FBBF24" style={{ marginBottom: 12 }} />
  <Text style={styles.completeHeader}> Routine Complete!</Text>

    <RoutineSummaryCard
    title={routine.title}
    stretchCount={stretches.length}
    duration={`${totalTime}s`}
    muscleGroups={routine.muscleGroups}
    difficulty={routine.difficulty}
    tags={routine.tags}
    
  />
  <Text style={styles.quoteText}>
    “Small steps every day lead to big change.” 🧘
  </Text>

  <View style={styles.ctaRow}>
    <Pressable style={styles.ctaButtonOutline} onPress={() => {
      Share.share({
        message: `I just finished my '${routine.title}' stretch with StretchFlow! 💪 ${stretches.length} moves in ${totalTime}s. Feeling great!`,
      });
    }}>
      <Ionicons name="share-social-outline" size={16} color="#10B981" />
      <Text style={styles.ctaButtonTextAlt}>Share</Text>
    </Pressable>

    <Pressable style={styles.ctaButton} onPress={() => {
      setCurrentStep(0);
      setSecondsLeft(stretches[0].duration);
      setIsRunning(true);
      setPaused(false);
      setShowConfetti(false);
      setVoiceChecked(false);
      animateFade();
    }}>
      <Text style={styles.ctaButtonText}>Repeat</Text>
    </Pressable>
  </View>

  <Pressable style={styles.backButton} onPress={() => navigation.popToTop()}>
    <Text style={styles.backToHome}>← Back to Home</Text>
  </Pressable>
</>
      )}

      {showConfetti && <ConfettiCannon count={120} origin={{ x: 200, y: 0 }} fadeOut />}

      <View style={styles.bottomToggleContainer}>
</View>


      <Modal visible={showVoiceLimitModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Voice Guidance Locked</Text>
            <Text style={styles.modalText}>
            You've used your 3 free guided sessions this week. Go Premium for unlimited coaching.
            </Text>

            <Pressable
              style={styles.modalButton}
              onPress={() => {
                setShowVoiceLimitModal(false);
                navigation.navigate('Premium');
              }}
            >
              <Text style={styles.modalButtonText}>Upgrade Now</Text>
            </Pressable>
            <Pressable onPress={() => setShowVoiceLimitModal(false)}>
              <Text style={styles.modalSkipText}>Continue Without Voice</Text>
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
    position: 'absolute',
    top: 0,
    height: 6,
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
  nextSoon: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
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
  pauseBtn: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#34D399',
    borderRadius: 8,
  },
  pauseBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  complete: {
    fontSize: 28,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 30,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  instructionText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  
  backButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
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
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1F2937',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: '#047857',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  modalSkipText: {
    color: '#6B7280',
    fontSize: 13,
  },
  pauseBtn: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#34D399',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    transform: [{ scale: 1 }],
  },
  pauseBtnPressed: {
    transform: [{ scale: 0.97 }],
  },
  
  completeStats: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
  },

  completeHeader: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 8,
  },
  statsBox: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  statsText: {
    fontSize: 15,
    color: '#047857',
    marginVertical: 2,
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
  backToHome: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    marginTop: 10,
  }
  
  
});

export default TimerScreen;
