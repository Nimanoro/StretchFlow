import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, Linking, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FeedbackModal = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkIfShouldShow = async () => {
      const launched = await AsyncStorage.getItem('hasLaunchedOnce');
      const seen = await AsyncStorage.getItem('hasSeenFeedbackModal');

      if (launched === 'true' && seen !== 'true') {
        setTimeout(() => {
          setVisible(true);
        }, 3000); // ⏱️ Delay in ms
      }
    };

    checkIfShouldShow();
  }, []);

  const handleClose = async () => {
    setVisible(false);
    await AsyncStorage.setItem('hasSeenFeedbackModal', 'true');
  };

  const openEmail = async () => {
    await AsyncStorage.setItem('hasSeenFeedbackModal', 'true');
    Linking.openURL('mailto:stretchflow.app@gmail.com?subject=StretchFlow Feedback');
    setVisible(false);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Thank You for Trying StretchFlow 💚</Text>
          <Text style={styles.message}>
          We truly appreciate you taking the time to try StretchFlow. Your feedback means a lot to us and helps us improve the app for everyone! Whether it’s a suggestion, bug report, or your overall thoughts, we’d love to hear from you.
          </Text>

          <View style={styles.buttonRow}>
            <Pressable style={styles.button} onPress={openEmail}>
              <Text style={styles.buttonText}>Send Feedback</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.secondary]} onPress={handleClose}>
              <Text style={[styles.buttonText, styles.secondaryText]}>Maybe Later</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FeedbackModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#00000050',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    color: '#111827',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    color: '#4B5563',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  secondary: {
    backgroundColor: '#F3F4F6',
  },
  secondaryText: {
    color: '#374151',
  },
});
