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

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Routine" component={RoutineScreen} />
          <Stack.Screen name="Timer" component={TimerScreen} />
          <Stack.Screen name="Premium" component={PremiumScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}
