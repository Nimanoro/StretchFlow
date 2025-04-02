import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RoutineCard from '../components/RoutineCard';
import exercisesData from '../assets/exercises.json';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
const lowerCase = (str) => str.toLowerCase();
const routines = exercisesData.routines || exercisesData;

const difficultyOptions = ['Easy', 'Intermediate', 'Advanced'];
const durationOptions = ['<5 min', '5–10 min', '>10 min'];
const tagOptions = ['Morning', 'Desk', 'Yoga', 'Recovery', 'Mobility'];

const AllRoutinesScreen = () => {
  const [filters, setFilters] = useState({ difficulty: null, duration: null, tag: null });
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleToggleDropdown = (type) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenDropdown(prev => (prev === type ? null : type));
  };

  const handleSelectOption = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
    setOpenDropdown(null);
  };
  const chipColor = {
    difficulty: '#10B981',
   tags: '#FBBF24',
   muscles: '#3B82F6',
 };
  const clearFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilters({ difficulty: null, duration: null, tag: null });
    setOpenDropdown(null);
  };

  const filteredRoutines = routines.filter(routine => {
    const matchesDifficulty = !filters.difficulty || routine.difficulty === filters.difficulty;
    const matchesDuration = !filters.duration || (
      (filters.duration === '<5 min' && parseInt(routine.duration) < 5) ||
      (filters.duration === '5–10 min' && parseInt(routine.duration) >= 5 && parseInt(routine.duration) <= 10) ||
      (filters.duration === '>10 min' && parseInt(routine.duration) > 10)
    );
    const matchesTag = !filters.tag || (routine.tags && routine.tags.includes(lowerCase(filters.tag)));
    return matchesDifficulty && matchesDuration && matchesTag;
  });

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        <Pressable style={styles.filterBtn} onPress={() => handleToggleDropdown('difficulty')}>
          <Ionicons name="barbell" size={16} color="#047857" />
          <Text style={styles.filterText}>
            {filters.difficulty || 'Difficulty'}
          </Text>
          <Ionicons name={openDropdown === 'difficulty' ? 'chevron-up' : 'chevron-down'} size={16} color="#6B7280" />
        </Pressable>

        <Pressable style={styles.filterBtn} onPress={() => handleToggleDropdown('duration')}>
          <Ionicons name="time" size={16} color="#047857" />
          <Text style={styles.filterText}>
            {filters.duration || 'Duration'}
          </Text>
          <Ionicons name={openDropdown === 'duration' ? 'chevron-up' : 'chevron-down'} size={16} color="#6B7280" />
        </Pressable>

        <Pressable style={styles.filterBtn} onPress={() => handleToggleDropdown('tag')}>
          <Ionicons name="pricetags" size={16} color="#047857" />
          <Text style={styles.filterText}>
            {filters.tag || 'Tags'}
          </Text>
          <Ionicons name={openDropdown === 'tag' ? 'chevron-up' : 'chevron-down'} size={16} color="#6B7280" />
        </Pressable>
      </View>

      {openDropdown === 'difficulty' && (
        <View style={styles.dropdown}>
          {difficultyOptions.map(option => (
            <Pressable key={option} style={styles.option} onPress={() => handleSelectOption('difficulty', option)}>
              <Text style={styles.optionText}>{option}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {openDropdown === 'duration' && (
        <View style={styles.dropdown}>
          {durationOptions.map(option => (
            <Pressable key={option} style={styles.option} onPress={() => handleSelectOption('duration', option)}>
              <Text style={styles.optionText}>{option}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {openDropdown === 'tag' && (
        <View style={styles.dropdown}>
          {tagOptions.map(option => (
            <Pressable key={option} style={styles.option} onPress={() => handleSelectOption('tag', option)}>
              <Text style={styles.optionText}>{option}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {(filters.difficulty || filters.duration || filters.tag) && (
        <Pressable style={styles.clearBtn} onPress={clearFilters}>
          <Ionicons name="close-circle-outline" size={16} color="#6B7280" />
          <Text style={styles.clearText}>Clear Filters</Text>
        </Pressable>
      )}

      <FlatList
        data={filteredRoutines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 16 }}>
            <RoutineCard large={true} item={item} enablePressAnimation />
          </View>
        )}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={<Text style={styles.noResult}>No routines found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F3',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F0F4F3',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D1FAE5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#047857',
  },
  dropdown: {
    backgroundColor: '#F0F4F3',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 20,
    zIndex: 9,
  },
  option: {
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 15,
    color: '#374151',
  },
  clearBtn: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    margin: 12,
    padding: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    gap: 6,
  },
  clearText: {
    fontSize: 13,
    color: '#6B7280',
  },
  noResult: {
    textAlign: 'center',
    marginTop: 30,
    color: '#6B7280',
    fontSize: 15,
  },
});

export default AllRoutinesScreen;
