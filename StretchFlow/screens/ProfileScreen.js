import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { getUserData, updateUserData, resetUserData } from '../utils/userStorage';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [streak, setStreak] = useState(0);
  const [silentMode, setSilentMode] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const user = await getUserData();
      setName(user?.userName || '');
      setStreak(user?.streak || 0);
      setSilentMode(user?.silentMode || false);
    };
    loadData();
  }, []);

  const handleSave = async () => {
    await updateUserData({ userName: name.trim() });
    Alert.alert('Saved!', 'Your name has been updated.');
  };

  const toggleSilentMode = async () => {
    const newMode = !silentMode;
    setSilentMode(newMode);
    await updateUserData({ silentMode: newMode });
  };

  const handleReset = async () => {
    Alert.alert(
      'Reset All Data?',
      'This will clear your name, streak, and history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetUserData();
            setName('');
            setStreak(0);
            setSilentMode(false);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
        />
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="checkmark-circle" size={18} color="white" />
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>🔥 Current Streak</Text>
        <Text style={styles.streakText}>{streak}-day streak</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>🔕 Silent Mode</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleText}>Disable Voice Guidance</Text>
          <Switch value={silentMode} onValueChange={toggleSilentMode} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>🧼 Reset Data</Text>
        <Pressable onPress={handleReset} style={styles.resetButton}>
          <Text style={styles.resetText}>Reset App</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>💬 Feedback</Text>
        <Text style={styles.linkText}>support@stretchflow.app</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F3',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    color: '#111827',
  },
  section: {
    marginBottom: 28,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#374151',
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    fontSize: 15,
    marginBottom: 10,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 8,
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  streakText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F97316',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 15,
    color: '#374151',
  },
  resetButton: {
    marginTop: 6,
    backgroundColor: '#FECACA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  resetText: {
    color: '#991B1B',
    fontWeight: '600',
  },
  linkText: {
    color: '#2563EB',
    fontSize: 14,
    marginTop: 6,
  },
});

export default ProfileScreen;
