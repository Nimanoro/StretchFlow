import AsyncStorage from '@react-native-async-storage/async-storage';

const VOICE_PREF_KEY = 'silent-mode';

export const isSilentMode = async () => {
  const value = await AsyncStorage.getItem(VOICE_PREF_KEY);
  return value === 'true'; // stored as string
};

export const setSilentMode = async (enabled) => {
  await AsyncStorage.setItem(VOICE_PREF_KEY, enabled ? 'true' : 'false');
};
