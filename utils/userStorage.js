import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = 'stretchflow_user';

export const getUserData = async () => {
  const json = await AsyncStorage.getItem(USER_KEY);
  return json ? JSON.parse(json) : null;
};

export const saveUserData = async (data) => {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(data));
};

export const updateUserData = async (updates) => {
  const user = await getUserData() || {};
  const updated = { ...user, ...updates };
  await saveUserData(updated);
  return updated;
};

export const resetUserData = async () => {
  await AsyncStorage.removeItem(USER_KEY);
};
