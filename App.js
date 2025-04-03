// Run this to create your project:
// npx create-expo-app StretchFlow && cd StretchFlow
// npx expo install react-native-screens react-native-safe-area-context @react-navigation/native @react-navigation/native-stack expo-ads-admob expo-in-app-purchases

// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import RoutineScreen from './screens/RoutineScreen';
import TimerScreen from './screens/TimerScreen';
import PremiumScreen from './screens/PremiumScreen';
import { UserProvider } from './context/UserContext';
import OnboardingScreen from './screens/onboarding';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import ProfileScreen from './screens/ProfileScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import BottomTabNavigator from './screens/bottomNav';
import { connectIAP, disconnectIAP } from './utils/iap';



const Stack = createNativeStackNavigator();
export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  useEffect(() => {
    const checkUser = async () => {
      const name = await AsyncStorage.getItem('userName');
      setInitialRoute(name ? 'Tabs' : 'Onboarding');
    };
    checkUser();
  }, []);

  if (!initialRoute) return null;

  return (
    <UserProvider>
      <SafeAreaView style={{flex:0.05, backgroundColor: '#F0F4F3' }} />
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
         
          <Stack.Screen name="Tabs" component={BottomTabNavigator} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name= "Routine" component={RoutineScreen} />
          <Stack.Screen name="Timer" component={TimerScreen} />
          <Stack.Screen name="Premium" component={PremiumScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}
