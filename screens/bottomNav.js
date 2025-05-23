
// BottomTabNavigator.js
import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import AllRoutinesScreen from './AllRoutine';
import BuildRoutineScreen from './BuildRoutine';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import HistoryScreen from './History';
import ExploreRoutinesScreen from './ExploreRoutine';

import { track } from '../utils/analytics';
const Tab = createBottomTabNavigator();

const CustomBuildButton = ({ children, onPress }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.buildButton,
      pressed && { opacity: 0.9 },
    ]}
  >
    {children}
  </Pressable>
);

export default function BottomTabNavigator() {
  const { themeName } = useContext(ThemeContext);
  const isDark = themeName === 'dark';
  const activeColor = '#10B981';
  const inactiveColor = isDark ? '#FFF2F0' : '#9CA3AF';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 80,
          paddingBottom: 8,
          backgroundColor: isDark ? '#1E293B' : '#fff',
          ...(!isDark && {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }),
          shadowColor: isDark ? '#000' : '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.3 : 0.06,
          shadowRadius: 10,
          elevation: 10,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <Ionicons name="home-outline" size={28} color={focused ? activeColor: inactiveColor} />

            </View>
          ),
        }}
        listeners={{
          tabPress: () => {
            track('Screen_viewed', { tab: 'Home' });
          },
        }}
      />

      <Tab.Screen
        name="Explore"
        component={ExploreRoutinesScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <Feather name="compass" size={28} color={focused ? activeColor: inactiveColor} />
            </View>
          ),
        }}
        listeners={{
          tabPress: () => {
            track('Screen_viewed', { tab: 'AllRoutines' });
          },
        }}
      />

      <Tab.Screen
        name="Build"
        component={BuildRoutineScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="plus-circle"
              size={30}
              color={focused ? activeColor: inactiveColor}
              style={styles.iconWrapper}
            />
          ),
        }}
        listeners={{
          tabPress: () => {
            track('Screen_viewed', { tab: 'Build' });
          },
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <Ionicons name="time-outline" size={28} color={focused ? activeColor: inactiveColor} />
            </View>
          ),
        }}
        listeners={{
          tabPress: () => {
            track('Screen_viewed', { tab: 'History' });
          },
        }}
        />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <Ionicons name="person-circle-outline" size={28} color={focused ? activeColor: inactiveColor} />
            </View>
          ),
        }}
        listeners={{
          tabPress: () => {
            track('Screen_viewed', { tab: 'Profile' });
          },
        }}
        
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

