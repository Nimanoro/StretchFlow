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
  await AsyncStorage.removeItem("myRoutines");
  await AsyncStorage.removeItem("savedRoutines");
  await AsyncStorage.removeItem("favorites");

};

export const getMyRoutines = async () => {
  const myRoutines = await AsyncStorage.getItem("myRoutines");
  return myRoutines ? JSON.parse(myRoutines) : [];
};

export const saveMyRoutines = async (routines) => {
  let myRoutines = await AsyncStorage.getItem("myRoutines");
  myRoutines = myRoutines ? JSON.parse(myRoutines) : [];
  myRoutines.push(routines);
  await AsyncStorage.setItem("myRoutines", JSON.stringify(myRoutines));
  return myRoutines;
};


export const getSavedRoutines = async () => {
  const savedRoutines = await AsyncStorage.getItem("savedRoutines");
  return savedRoutines ? JSON.parse(savedRoutines) : [];
};

export const saveARoutine = async (routines) => {
  let savedRoutines = await AsyncStorage.getItem("savedRoutines");
  savedRoutines = savedRoutines ? JSON.parse(savedRoutines) : [];
  // Check if the routine already exists
  const exists = savedRoutines.some((routine) => routine.id === routines.id);
  if (exists) {
    // If it exists, remove it from the array
    savedRoutines = savedRoutines.filter((routine) => routine.id !== routines.id);
  }
  else {
    // If it doesn't exist, add it to the array
    savedRoutines.push(routines);
  }
  await AsyncStorage.setItem("savedRoutines", JSON.stringify(savedRoutines));
  return savedRoutines;
};

