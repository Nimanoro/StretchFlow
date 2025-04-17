// utils/userStorage.js

import * as SecureStore from 'expo-secure-store';

const USER_KEY = 'stretchflow_user';
const MY_ROUTINES_KEY = 'myRoutines';
const SAVED_ROUTINES_KEY = 'savedRoutines';

export const getUserData = async () => {
  try {
    const json = await SecureStore.getItemAsync(USER_KEY);
    return json ? JSON.parse(json) : null;
  } catch (e) {
    console.error('Error loading user data:', e);
    return null;
  }
};

export const saveUserData = async (data) => {
  try {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving user data:', e);
  }
};

export const updateUserData = async (updates) => {
  const user = await getUserData() || {};
  const updated = { ...user, ...updates };
  await saveUserData(updated);
  return updated;
};

export const resetUserData = async () => {
  await SecureStore.deleteItemAsync(USER_KEY);
  await SecureStore.deleteItemAsync(MY_ROUTINES_KEY);
  await SecureStore.deleteItemAsync(SAVED_ROUTINES_KEY);
};

export const getMyRoutines = async () => {
  const json = await SecureStore.getItemAsync(MY_ROUTINES_KEY);
  return json ? JSON.parse(json) : [];
};

export const saveMyRoutines = async (newRoutine) => {
  const current = await getMyRoutines();
  const updated = [...current, newRoutine];
  await SecureStore.setItemAsync(MY_ROUTINES_KEY, JSON.stringify(updated));
  return updated;
};

export const getSavedRoutines = async () => {
  const json = await SecureStore.getItemAsync(SAVED_ROUTINES_KEY);
  return json ? JSON.parse(json) : [];
};

export const saveARoutine = async (routine) => {
  let savedRoutines = await getSavedRoutines();

  const exists = savedRoutines.some((r) => r.id === routine.id);
  if (exists) {
    savedRoutines = savedRoutines.filter((r) => r.id !== routine.id);
  } else {
    savedRoutines.push(routine);
  }

  await SecureStore.setItemAsync(SAVED_ROUTINES_KEY, JSON.stringify(savedRoutines));
  return savedRoutines;
};
