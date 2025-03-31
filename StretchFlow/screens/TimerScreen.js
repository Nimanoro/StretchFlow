import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Modal, Pressable, Switch } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { checkVoiceAccess, incrementVoiceUsage } from '../utils/voiceUsage';
import { isSilentMode, setSilentMode as persistSilentMode } from '../utils/voiceSetting';

const TimerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { routine, stretches } = route.params;

  const [currentStep, setCurrentStep] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(stretches?.[0]?.duration || 30);
  const [isRunning, setIsRunning] = useState(true);
  const [showVoiceLimitModal, setShowVoiceLimitModal] = useState(false);
  const [silentMode, setSilentMode] = useState(false);
  const spokenRef = useRef(false);

  useEffect(() => {
    isSilentMode().then(setSilentMode);
  }, []);

  const toggleSilentMode = async () => {
    const newValue = !silentMode;
    setSilentMode(newValue);
    await persistSilentMode(newValue);
  };

  const safeSpeak = async (text) => {
    const silent = await isSilentMode();
    const allowed = await checkVoiceAccess();

    if (!silent && allowed) {
      Speech.stop();
      Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
      });
    } else if (!silent && !allowed) {
      setShowVoiceLimitModal(true);
    }
  };

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;

    if (secondsLeft === 3) safeSpeak('3');
    if (secondsLeft === 2) safeSpeak('2');
    if (secondsLeft === 1) safeSpeak('1');

    if (secondsLeft === 0) {
      const nextStep = currentStep + 1;
      if (nextStep < stretches.length) {
        const next = stretches[nextStep];
        safeSpeak(`Next up: ${next.name}. ${next.instruction}`);
        const timeout = setTimeout(() => {
          setCurrentStep(nextStep);
          setSecondsLeft(next.duration);
          spokenRef.current = false;
        }, 2000);
        return () => clearTimeout(timeout);
      } else {
        setIsRunning(false);
        safeSpeak('Routine complete. Great job!');
      }
    }
  }, [secondsLeft, isRunning]);

  useEffect(() => {
    const startVoice = async () => {
      const s = stretches[currentStep];
      if (isRunning && !spokenRef.current) {
        const allowed = await checkVoiceAccess();
        if (!allowed) {
            setSilentMode(true);
        }
        if (!silentMode && allowed && currentStep === 0) {
          await incrementVoiceUsage(); // Count only once per session
        }
        safeSpeak(`${s.name}. ${s.instruction}`);
        spokenRef.current = true;
      }
    };
    startVoice();
  }, [currentStep, isRunning]);

  return (
    <View style={styles.container}>
      <Text style={styles.routineTitle}>{routine.title}</Text>

      {isRunning ? (
        <>
          <Text style={styles.label}>Now Stretching</Text>
          <Text style={styles.stretchName}>{stretches[currentStep].name}</Text>
          <Text style={styles.timer}>{secondsLeft}s</Text>
        </>
      ) : (
        <>
          <Text style={styles.complete}>✅ Routine Complete!</Text>

          <View style={styles.premiumCard}>
            <Text style={styles.premiumTitle}>Unlock the Full Experience</Text>
            <Text style={styles.premiumDescription}>
              Go Premium to remove ads, save custom routines, and access guided voice flows.
            </Text>
            <Pressable style={styles.premiumButton} onPress={() => navigation.navigate('Premium')}>
              <Text style={styles.premiumButtonText}>💎 Go Premium</Text>
            </Pressable>
          </View>

          <Pressable style={styles.backButton} onPress={() => navigation.popToTop()}>
            <Text style={styles.backButtonText}>← Back to Home</Text>
          </Pressable>
        </>
      )}

      {/* 👇 Silent Mode Toggle at the Bottom */}
      <View style={styles.bottomToggleContainer}>
        <Text style={styles.toggleLabel}>Silent Mode</Text>
        <Switch
          value={silentMode}
          onValueChange={toggleSilentMode}
          trackColor={{ false: '#d1d5db', true: '#34D399' }}
          thumbColor={silentMode ? '#047857' : '#f4f3f4'}
        />
      </View>

      <Modal visible={showVoiceLimitModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Voice Limit Reached</Text>
            <Text style={styles.modalText}>
              You've used your 3 free voice sessions this week. Go Premium to unlock unlimited voice guidance.
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
    paddingHorizontal: 20,
    paddingTop: 80,
    justifyContent: 'space-between',
  },
  routineTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1F2937',
  },
  label: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 6,
  },
  stretchName: {
    fontSize: 26,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 8,
    textAlign: 'center',
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 30,
  },
  complete: {
    fontSize: 28,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 30,
  },
  premiumCard: {
    backgroundColor: '#D1FAE5',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
    width: '100%',
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 6,
  },
  premiumDescription: {
    fontSize: 14,
    color: '#065F46',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  premiumButton: {
    backgroundColor: '#047857',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  premiumButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  backButton: {
    marginTop: 10,
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
});

export default TimerScreen;
