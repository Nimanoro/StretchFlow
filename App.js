// Run this to create your project:
// npx create-expo-app StretchFlow && cd StretchFlow
// npx expo install react-native-screens react-native-safe-area-context @react-navigation/native @react-navigation/native-stack expo-ads-admob expo-in-app-purchases
import 'react-native-reanimated';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoutineScreen from './screens/RoutineScreen';
import { ThemeProvider } from './context/ThemeContext';
import TimerScreen from './screens/TimerScreen';
import PremiumScreen from './screens/PremiumScreen';
import { View, Text } from 'react-native';
import { UserProvider } from './context/UserContext';
import OnboardingScreen from './screens/onboarding';
import { useEffect } from 'react';
import { initAnalytics } from './utils/analytics';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AllRoutinesScreen from './screens/AllRoutine';
import { useState } from 'react';
import BottomTabNavigator from './screens/bottomNav';
import { getUserData } from './utils/userStorage';
import { FavoritesProvider } from './context/FavoritesContext';

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
      const userData = await getUserData();
      if (initialRoute === null) {
        if (userData) setInitialRoute('Tabs');
        else setInitialRoute('Onboarding');
      }
    };
    checkUser();
  }, []);
  


  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  

  return (
    <UserProvider>
      <ThemeProvider>
        <FavoritesProvider>
          <NavigationContainer>
            {initialRoute ? (
              <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Tabs" component={BottomTabNavigator} />
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="Routine" component={RoutineScreen} />
                <Stack.Screen name="Timer" component={TimerScreen} />
                <Stack.Screen name="Premium" component={PremiumScreen} />
                <Stack.Screen name="AllRoutines" component={AllRoutinesScreen} />
              </Stack.Navigator>
            ) : (
              // Optional: Show loading screen while determining route
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading...</Text>
              </View>
            )}
          </NavigationContainer>
        </FavoritesProvider>
      </ThemeProvider>
    </UserProvider>
  );
};