import * as SecureStore from 'expo-secure-store';

const USER_KEY = 'stretchflow_user';
const MY_ROUTINES_KEY = 'myRoutines';
const SAVED_ROUTINES_KEY = 'savedRoutines';

// === USER DATA ===
export const getUserData = async () => {
  const json = await SecureStore.getItemAsync(USER_KEY);
  return json ? JSON.parse(json) : null;
};

export const saveUserData = async (data) => {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data));
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
  await SecureStore.deleteItemAsync("favorites"); // if used elsewhere
};

// === MY ROUTINES ===
export const getMyRoutines = async () => {
  const json = await SecureStore.getItemAsync(MY_ROUTINES_KEY);
  return json ? JSON.parse(json) : [];
};

export const saveMyRoutines = async (routine) => {
  let myRoutines = await getMyRoutines();
  myRoutines.push(routine);
  await SecureStore.setItemAsync(MY_ROUTINES_KEY, JSON.stringify(myRoutines));
  return myRoutines;
};

// === SAVED ROUTINES ===
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

export const saveScheduleNotification = async (notification) => {
  await SecureStore.setItemAsync('scheduledNotification', JSON.stringify(notification));
};

export const getScheduleNotification = async () => {
  const json = await SecureStore.getItemAsync('scheduledNotification');
  return json ? JSON.parse(json) : null;
};


