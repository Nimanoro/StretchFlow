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
import NotificationSettings from '../components/NotificationSetting';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Linking } from 'react-native';
import { useContext } from 'react';
import { ScrollView } from 'react-native';

import { ThemeContext } from '../context/ThemeContext';
const ProfileScreen = () => {
  
  const [name, setName] = useState('');
  const [streak, setStreak] = useState(0);
  const [silentMode, setSilentMode] = useState(false);

  const { themeName, toggleTheme} = useContext(ThemeContext);
  const isDark = themeName === 'dark';
  const themed = getThemedStyles(isDark);

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
    <SafeAreaView style={[{ flex: 1 }, themed.container]} edges={['top']}>
      <ScrollView style={[styles.container, themed.container]}>
        <View style={[styles.card, themed.card]}>
          <Text style={[styles.label, themed.text]}>Your Name</Text>
          <TextInput
            style={[styles.input, themed.input]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          />
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark-circle" size={18} color="white" />
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </View>
  
        <View style={[styles.card, themed.card]}>
          <View style={styles.row}>
            <Ionicons name="flame" size={20} color="#F97316" />
            <Text style={[styles.infoText, themed.text]}>Current Streak</Text>
          </View>
          <Text style={[styles.streakText, themed.text]}>{streak}-day streak</Text>
        </View>
  
        <View style={[styles.card, themed.card]}>
          <View style={styles.row}>
            <Ionicons name="volume-mute" size={20} color="#6B7280" />
            <Text style={[styles.infoText, themed.text]}>Silent Mode</Text>
          </View>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleText, themed.text]}>Disable Voice Guidance</Text>
            <Switch value={silentMode} onValueChange={toggleSilentMode} />
          </View>
        </View>
        <View style={[styles.card, themed.card]}>
  <View style={styles.row}>
    <Ionicons name="contrast" size={20} color="#6366F1" />
    <Text style={[styles.infoText, themed.text]}>Theme</Text>
  </View>
  <View style={styles.toggleRow}>
    <Text style={[styles.toggleText, themed.text]}>
      {`Using ${themeName} mode`}
    </Text>
    <Pressable
      onPress={toggleTheme}
      style={{
        backgroundColor: isDark ? '#334155' : '#E0E7FF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <Text style={{ color: isDark ? '#F3F4F6' : '#1E3A8A', fontWeight: '600' }}>
        Toggle Theme
      </Text>
    </Pressable>
  </View>
</View>
<NotificationSettings />
  
        <View style={[styles.card, themed.card]}>
          <View style={styles.row}>
            <Ionicons name="chatbubble-ellipses" size={20} color="#3B82F6" />
            <Text style={[styles.infoText, themed.text]}>Feedback</Text>
          </View>
          <Pressable onPress={() => Linking.openURL('mailto:stretchflow.app@gmail.com')}>
            <Text style={[styles.linkText, themed.link]}>stretchflow.app@gmail.com</Text>
          </Pressable>
        </View>
      </ScrollView>
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
      shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
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
const getThemedStyles = (isDark) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? '#0F172A' : '#F0F4F3',
    },
    card: {
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderColor: isDark ? '#334155' : '#E5E7EB',
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },
    text: {
      color: isDark ? '#F3F4F6' : '#111827',
    },
    input: {
      backgroundColor: isDark ? '#1E293B' : '#fff',
      borderColor: isDark ? '#475569' : '#D1D5DB',
      color: isDark ? '#F3F4F6' : '#111827',
      borderWidth: 1,
      borderRadius: 10,
      padding: 10,
      marginTop: 8,
    },
    link: {
      color: isDark ? '#93C5FD' : '#3B82F6',
    },
    subtleWarning: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
  });

export default ProfileScreen;