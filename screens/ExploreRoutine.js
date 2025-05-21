import React, { useContext } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';

const goals = [
  {
    label: 'Just Finished Desk Work',
    icon: 'walk-outline',
    filters: { tags: ['desk', 'work', 'office', 'refresh', 'posture', 'sitting'] },
    bg: '#F0FDF4',
    color: '#10B981',
  },
  {
    label: 'Winding Down for Bed',
    icon: 'leaf-outline',
    filters: { tags: ['sleep', 'relax', 'wind down', 'calm', 'night'] },
    bg: '#E0F2FE',
    color: '#3B82F6',
  },
  {
    label: 'Starting My Day',
    icon: 'flame-outline',
    filters: { tags: ['morning', 'wake up', 'energize', 'boost', 'movement', 'happy'] },
    bg: '#FEF3C7',
    color: '#F59E0B',
  },
  {
    label: 'Need a Mental Reset',
    icon: 'medkit-outline',
    filters: { tags: ['mindfulness', 'calm', 'reset', 'relax', 'meditation'] },
    bg: '#FAE8FF',
    color: '#D946EF',
  },
  {
    label: 'Just Finished Workout',
    icon: 'barbell-outline',
    filters: { category: 'Recovery & Relief', tags: ['fitness', 'exercise', 'workout', 'stretching', 'recovery'] },
    bg: '#EDE9FE',
    color: '#8B5CF6',
  },
  {
    label: 'Feeling Off-Balance',
    icon: 'accessibility-outline',
    filters: { category: 'Balance & Stability' },
    bg: '#FAF5FF',
    color: '#A855F7',
  },
  {
    label: 'Your Routine',
    icon: 'person-outline',
    filters: { from: 'user' },
    bg: '#FDF2F8',
    color: '#DB2777',
  },
  {
    label: 'Liked Routines',
    icon: 'heart-outline',
    filters: { from: 'saved' },
    bg: '#EFF6FF',
    color: '#2563EB',
  },
];

export default function ExploreRoutinesScreen() {
  const navigation = useNavigation();
  const { themeName } = useContext(ThemeContext);
  const isDark = themeName === 'dark';

  const renderGoal = ({ item }) => (
    <Pressable
      style={[
        styles.card,
        { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : item.bg },
        isDark && styles.cardDark,
      ]}
      onPress={() =>
        navigation.navigate('AllRoutines', {
          filters: item.filters,
          label: item.label,
        })
      }
    >
      <Ionicons name={item.icon} size={26} color={item.color} />
      <Text style={[styles.label, { color: item.color }]}>{item.label}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? '#0F172A' : '#F9FAFB' }]}>
      <Text style={[styles.title, { color: isDark ? '#F9FAFB' : '#111827' }]}>What’s your goal today?</Text>
      <FlatList
        data={goals}
        keyExtractor={(item) => item.label}
        renderItem={renderGoal}
        contentContainerStyle={styles.grid}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  grid: {
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  cardDark: {
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  label: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
