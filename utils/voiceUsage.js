// utils/voiceUsage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext } from 'react';
import { UserContext } from '../context/UserContext';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const STORAGE_KEY = 'voice-usage';
export const checkVoiceAccess = async (isPremium) => {

  if (isPremium) {
    return true;
  }
  const now = Date.now();

  const data = await AsyncStorage.getItem(STORAGE_KEY);
  let usage = { lastReset: now, count: 0 };

  if (data) {
    usage = JSON.parse(data);

    // Reset if it's been more than a week
    if (now - usage.lastReset > WEEK_MS) {
      usage = { lastReset: now, count: 0 };
    }
  }

  return usage.count < 3;
};

export const incrementVoiceUsage = async () => {
  const now = Date.now();
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  let usage = { lastReset: now, count: 0 };

  if (data) {
    usage = JSON.parse(data);
    if (now - usage.lastReset > WEEK_MS) {
      usage = { lastReset: now, count: 0 };
    }
  }

  usage.count += 1;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
};
