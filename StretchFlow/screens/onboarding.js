import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {BottomTabNavigator} from './bottomNav';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveUserData } from '../utils/userStorage';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';

const OnboardingScreen = ({ navigation }) => {
  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert('Hold on!', 'Please enter your name before continuing.');
      return;
    }
  
    await saveUserData({
      userName: name.trim(),
      streak: 0,
      lastCompleted: null,
      lastRoutine: null,
      history: {},
    });
  
    await AsyncStorage.setItem('isPremium', 'false');
    navigation.replace('Tabs', { screen: 'Home' });
  };

  const [name, setName] = useState('');

  
  

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Welcome to StretchFlow 👋</Text>
      <Text style={styles.subtitle}>What should we call you?</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />
      <Pressable style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </KeyboardAvoidingView>
    </TouchableWithoutFeedback>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#047857',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderColor: '#D1FAE5',
    borderWidth: 1,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#047857',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default OnboardingScreen;
