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
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { checkVoiceAccess, incrementVoiceUsage } from '../utils/voiceUsage';
import { isSilentMode, setSilentMode as persistSilentMode } from '../utils/voiceSetting';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import ConfettiCannon from 'react-native-confetti-cannon';
import { updateUserData, getUserData } from '../utils/userStorage';
import moment from 'moment'; // or native Date strings
import { Ionicons } from '@expo/vector-icons';

const TimerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { routine, stretches } = route.params;

  const [currentStep, setCurrentStep] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(stretches?.[0]?.duration || 30);
  const [isRunning, setIsRunning] = useState(true);
  const [paused, setPaused] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [showVoiceLimitModal, setShowVoiceLimitModal] = useState(false);
  const [silentMode, setSilentMode] = useState(false);
  const [voiceCreditsUsed, setVoiceCreditsUsed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [voiceChecked, setVoiceChecked] = useState(false);
  const totalTime = stretches.reduce((sum, s) => sum + s.duration, 0) + 10 * (stretches.length - 1);
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
      lastRoutine: routine.title,
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
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
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
  <View style={{ alignItems: 'center' }}>
    <Text style={styles.restText}>🧘‍♂️ Resting... {secondsLeft}s</Text>

    <Pressable
      onPress={() => {
        const next = currentStep + 1;
        setIsResting(false);
        setCurrentStep(next);
        setSecondsLeft(stretches[next].duration);
        animateFade();
      }}
      style={{ marginTop: 16 }}
    >
      <Pressable
  onPress={() => {
    const next = currentStep + 1;
    setIsResting(false);
    setCurrentStep(next);
    setSecondsLeft(stretches[next].duration);
    animateFade();
  }}
  style={styles.skipRestBtn}
>
  <Text style={styles.skipRestBtnText}>Skip Rest</Text>
</Pressable>

    </Pressable>
  </View>
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

            </>
          )}

          {nextStretch && !isResting && (
            <View style={styles.nextContainer}>
              <Text style={styles.nextSoon}>SOON</Text>
              <Text style={styles.nextUp}>Up Next: {nextStretch.name}</Text>
            </View>
          )}

          <Pressable
            style={styles.pauseBtn}
            onPress={() => setPaused((prev) => !prev)}
          >
            <Text style={styles.pauseBtnText}>{paused ? 'Resume' : 'Pause'}</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.complete}>🎉 Routine Complete!</Text>

<Text style={styles.completeStats}>
  You completed {stretches.length} stretches in {totalTime} seconds.
</Text>

<Pressable
  style={styles.pauseBtn}
  onPress={() => {
    setCurrentStep(0);
    setSecondsLeft(stretches[0].duration);
    setIsRunning(true);
    setPaused(false);
    setShowConfetti(false);
    setVoiceChecked(false);
    animateFade();
  }}
>
  <Text style={styles.pauseBtnText}>Repeat Routine</Text>
</Pressable>

<Pressable style={styles.backButton} onPress={() => navigation.popToTop()}>
  <Text style={styles.backButtonText}>← Back to Home</Text>
</Pressable>
        </>
      )}

      {showConfetti && <ConfettiCannon count={120} origin={{ x: 200, y: 0 }} fadeOut />}

      <View style={styles.bottomToggleContainer}>
    
    <Text style={styles.toggleLabel}>Voice Guidance </Text>
  

  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <Ionicons name="headset-outline" size={16} color="#34D399" style={{ marginRight: 6 }} />
  <Switch
    value={silentMode}
    onValueChange={toggleSilentMode}
    trackColor={{ false: '#d1d5db', true: '#34D399' }}
    thumbColor={silentMode ? '#047857' : '#f4f3f4'}
    disabled={voiceCreditsUsed}
  />
  </View>
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
  completeStats: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
  },

  skipRestBtn: {
    marginTop: 16,
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#34D399',
  },
  skipRestBtnText: {
    fontSize: 14,
    color: '#047857',
    fontWeight: '600',
    textAlign: 'center',
  },
  
  
});

export default TimerScreen;
