import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen'; // new screen
import { Ionicons } from '@expo/vector-icons';
import AllRoutinesScreen from './AllRoutine';
import BuildRoutineScreen from './BuildRoutine';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { height: 60, paddingBottom: 8 },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Profile') iconName = 'person-circle';
          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: { fontSize: 12 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
  name="Build"
  component={BuildRoutineScreen}
  options={{
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="construct" size={size} color={color} />
    ),
  }}
/>
      <Tab.Screen
  name="Explore"
  component={AllRoutinesScreen}
  options={{
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="list" size={size} color={color} />
    ),
  }}
/>

<Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
