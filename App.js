// Run this to create your project:
// npx create-expo-app StretchFlow && cd StretchFlow
// npx expo install react-native-screens react-native-safe-area-context @react-navigation/native @react-navigation/native-stack expo-ads-admob expo-in-app-purchases

// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import RoutineScreen from './screens/RoutineScreen';
import { ThemeProvider } from './context/ThemeContext';
import TimerScreen from './screens/TimerScreen';
import PremiumScreen from './screens/PremiumScreen';
import { UserProvider } from './context/UserContext';
import OnboardingScreen from './screens/onboarding';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import ProfileScreen from './screens/ProfileScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initAnalytics } from './utils/analytics';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } else {
    return false;
  }
}

import { useState } from 'react';
import BottomTabNavigator from './screens/bottomNav';
import { getUserData } from './utils/userStorage';
import { FavoritesProvider } from './context/FavoritesContext';
let Updates;
try {
  Updates = require('expo-updates');
} catch (e) {
  Updates = null;
}





Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
const Stack = createNativeStackNavigator();
export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  
  
  useEffect(() => {
    initAnalytics();
  }, []);
  useEffect(() => {
    const checkUser = async () => {
      const userData = null //await getUserData();
      if (userData) {
        setInitialRoute('Tabs');
      } else {
        setInitialRoute('Onboarding');
      }
    };
    checkUser();
  }, []);
  useEffect(() => {
    async function updateApp() {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync(); // reloads app with new update
      }
    }
    updateApp();
  }, []);
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
  const sub = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('🔔 User tapped notification:', response);
    // Navigate or log analytics here
  });

  return () => sub.remove();
}, []);

  
  
  useEffect(() => {
    const markFirstLaunch = async () => {
      try {
        const launched = await AsyncStorage.getItem('hasLaunchedOnce');
        if (!launched) {
          await AsyncStorage.setItem('hasLaunchedOnce', 'true');
        }
      } catch (error) {
        console.error("Error marking first launch:", error);
      }
    };
    markFirstLaunch();
  }, []);
  if (!initialRoute) return null;
  

  return (

    <UserProvider>
      <ThemeProvider>
      <FavoritesProvider>
      <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>

          <Stack.Screen name="Tabs" component={BottomTabNavigator} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name= "Routine" component={RoutineScreen} />
          <Stack.Screen name="Timer" component={TimerScreen} />
          <Stack.Screen name="Premium" component={PremiumScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      </FavoritesProvider>
      </ThemeProvider>
    </UserProvider>
  );
}
