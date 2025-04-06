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
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor="#9CA3AF"
        />
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="checkmark-circle" size={18} color="white" />
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>
  
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="flame" size={20} color="#F97316" />
          <Text style={styles.infoText}>Current Streak</Text>
        </View>
        <Text style={styles.streakText}>{streak}-day streak</Text>
      </View>
  
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="volume-mute" size={20} color="#6B7280" />
          <Text style={styles.infoText}>Silent Mode</Text>
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleText}>Disable Voice Guidance</Text>
          <Switch value={silentMode} onValueChange={toggleSilentMode} />
        </View>
      </View>
  
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="refresh-circle" size={20} color="#991B1B" />
          <Text style={styles.infoText}>Reset Data</Text>
        </View>

        <Pressable onPress={handleReset} style={styles.resetButton}>
          <Text style={styles.resetText}>Reset App</Text>
        </Pressable>
        <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 12 }}>
  Caution: This will delete your name, streak, and saved routines.
</Text>

      </View>
  
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#3B82F6" />
          <Text style={styles.infoText}>Feedback</Text>
        </View>
        <Text style={styles.linkText}>support@stretchflow.app</Text>
      </View>
    </View>
    </SafeAreaView>
  );
}  

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F0F4F3',
      padding: 20,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: '#1F2937',
      marginBottom: 24,
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      marginBottom: 18,
      shadowColor: '#00000020',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    label: {
      fontSize: 15,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 8,
    },
    input: {
      backgroundColor: '#F9FAFB',
      borderRadius: 12,
      padding: 12,
      fontSize: 15,
      color: '#111827',
      marginBottom: 10,
    },
    saveButton: {
      flexDirection: 'row',
      backgroundColor: '#10B981',
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 25,
      alignSelf: 'flex-start',
      alignItems: 'center',
      gap: 6,
    },
    saveText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    infoText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#374151',
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
      marginTop: 8,
    },
    toggleText: {
      fontSize: 15,
      color: '#374151',
    },
    resetButton: {
      marginTop: 8,
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
      marginTop: 4,
    },
});
export default ProfileScreen;