import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import RoutineCard from '../components/RoutineCard';
import { getMyRoutines, getSavedRoutines } from '../utils/userStorage';
import exercisesData from '../assets/exercises.json';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';


if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const routines = exercisesData.routines || exercisesData;

const difficultyOptions = ['Easy', 'Intermediate', 'Advanced'];
const durationOptions = ['<5 min', '5–10 min', '>10 min'];

const categoryLabels = {
  "Prep & Warm-Up": "Warm-Up",
  "Recovery & Relief": "Recovery",
  "Mobility & Flexibility": "Mobility",
  "Quick Boost": "Boost",
  "Balance & Stability": "Balance",
  "Mindfulness & Calm": "Calm",
};
const categoryIcons = {
  "Prep & Warm-Up": "flame-outline",
  "Recovery & Relief": "leaf-outline",
  "Mobility & Flexibility": "walk-outline",
  "Quick Boost": "flash-outline",
  "Balance & Stability": "accessibility-outline",
  "Mindfulness & Calm": "medkit-outline",
};

const AllRoutinesScreen = () => {
  const [activeTab, setActiveTab] = useState('app');
  const [filters, setFilters] = useState({ difficulty: null, duration: null, category: null });
  const [openDropdown, setOpenDropdown] = useState(null);
  const [myRoutines, setMyRoutines] = useState([]);
  const [savedRoutines, setSavedRoutines] = useState([]);
  const navigation = useNavigation();

  const { themeName } = useContext(ThemeContext);
const isDark = themeName === 'dark';
const themed = getThemedStyles(isDark);

useFocusEffect(
  useCallback(() => {
    const refresh = async () => {
      if (activeTab === 'user') {
        setMyRoutines(await getMyRoutines());
      }
      if (activeTab === 'saved') {
        setSavedRoutines(await getSavedRoutines());
      }
    };
    refresh();
  }, [activeTab])
);

useEffect(() => {
  const refresh = async () => {
    if (activeTab === 'user') {
      setMyRoutines(await getMyRoutines());
    } else if (activeTab === 'saved') {
      setSavedRoutines(await getSavedRoutines());
    }
  };
  refresh();
}, [activeTab]);

  
  const handleToggleDropdown = (type) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenDropdown(prev => (prev === type ? null : type));
  };

  const handleSelectOption = (type, value) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilters(prev => ({ ...prev, [type]: value }));
    setOpenDropdown(null);
  };

  const clearFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilters({ difficulty: null, duration: null, category: null });
    setOpenDropdown(null);
  };

  const filteredRoutines = routines.filter(routine => {
    const matchesDifficulty = !filters.difficulty || routine.difficulty === filters.difficulty;
    const matchesDuration = !filters.duration || (
      (filters.duration === '<5 min' && parseInt(routine.duration) < 5) ||
      (filters.duration === '5–10 min' && parseInt(routine.duration) >= 5 && parseInt(routine.duration) <= 10) ||
      (filters.duration === '>10 min' && parseInt(routine.duration) > 10)
    );
    const matchesCategory = !filters.category || routine.category === filters.category;
    return matchesDifficulty && matchesDuration && matchesCategory;
  });

  const renderDropdown = (type, options) => (
    openDropdown === type && (
      <View style={[styles.dropdown, themed.dropdown]}>
        {options.map((option, i) => (
          <Pressable
            key={`${option}-${i}`}
            style={[styles.option, themed.option]}
            onPress={() => handleSelectOption(type, option)}
          >
            {type === 'category' && (
              <Ionicons
                name={categoryIcons[option]}
                size={16}
                color={themed.iconColor.color}
                style={{ marginRight: 8 }}
              />
            )}
            <Text style={[styles.optionText, themed.optionText]}>
              {type === 'category' ? categoryLabels[option] : option}
            </Text>
          </Pressable>
        ))}
      </View>
    )
  );

  const renderTabButton = (label, key) => (
    <Pressable
      style={[
        styles.tabBtn,
        themed.tabBtn,
        activeTab === key && themed.activeTabBtn
      ]}
      onPress={() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setActiveTab(key);
      }}
    >
      <Text
        style={[
          styles.tabText,
          activeTab === key ? themed.activeTabText : themed.tabText
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
  
  return (
    <SafeAreaView style={[{ flex: 1 }, themed.container]} edges={['top']}>
      <View style={[styles.container, themed.container]}>
        <View style={[styles.tabContainer, themed.tabContainer]}>
          {renderTabButton('App Routines', 'app')}
          {renderTabButton('My Routines', 'user')}
          {renderTabButton('Saved Routines', 'saved')}
        </View>

        {activeTab === 'app' && (
          <>
            <View style={styles.filterBar}>
              <Pressable style={[styles.filterBtn, themed.filterBtn]} onPress={() => handleToggleDropdown('difficulty')}>
                <Ionicons name="barbell" size={16} color={themed.iconColor.color}/>
                <Text style={[styles.filterText, themed.filterText]}>{filters.difficulty || 'Difficulty'}</Text>
                <Ionicons name={openDropdown === 'difficulty' ? 'chevron-up' : 'chevron-down'} size={16} color="#6B7280" />
              </Pressable>

              <Pressable style={[styles.filterBtn, themed.filterBtn]} onPress={() => handleToggleDropdown('duration')}>
                <Ionicons name="time" size={16}color={themed.iconColor.color} />
                <Text style={[styles.filterText, themed.filterText]}>{filters.duration || 'Duration'}</Text>
                <Ionicons name={openDropdown === 'duration' ? 'chevron-up' : 'chevron-down'} size={16} color="#6B7280" />
              </Pressable>

              <Pressable style={[styles.filterBtn, themed.filterBtn]} onPress={() => handleToggleDropdown('category')}>
                <Ionicons name="pricetags" size={16} color={themed.iconColor.color} />
                <Text style={[styles.filterText, themed.filterText]}>
                  {filters.category ? categoryLabels[filters.category] : 'Category'}
                </Text>
                <Ionicons name={openDropdown === 'category' ? 'chevron-up' : 'chevron-down'} size={16} color="#6B7280" />
              </Pressable>
            </View>

            {renderDropdown('difficulty', difficultyOptions)}
            {renderDropdown('duration', durationOptions)}
            {renderDropdown('category', Object.keys(categoryLabels))}

            {(filters.difficulty || filters.duration || filters.category) && (
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
                  <RoutineCard
                    large={true}
                    item={item}
                    enablePressAnimation
                    initiallyFavorite={savedRoutines.some(r => r.id === item.id)}
                  />
                </View>
              )}
              contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 20 }}
              ListEmptyComponent={<View style={{ alignItems: 'center', marginTop: 40 }}>
              <Ionicons name="sad-outline" size={32} color="#9CA3AF" />
              <Text style={{ color: '#6B7280', marginTop: 8, fontSize: 15, textAlign: 'center' }}>
                No routines found with the current filters.
              </Text>
          
              <Pressable
                onPress={() => navigation.navigate("Build")}
                style={styles.secondaryBtn}
              >
                <Ionicons name="add-circle-outline" size={16} color="#10B981" />
                <Text style={styles.secondaryText}>Build Your Own Routine</Text>
              </Pressable>
            </View>
          }
            />
          </>
        )}

        {activeTab === 'user' && (
          <FlatList
            data={myRoutines}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ marginBottom: 16 }}>
                <RoutineCard
                  large={true}
                  item={item}
                  enablePressAnimation
                  initiallyFavorite={savedRoutines.some(r => r.id === item.id)}
                />
              </View>
            )}
            contentContainerStyle={{ padding: 20 }}
            ListEmptyComponent={<View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="sad-outline" size={32} color="#9CA3AF" />
            <Text style={{ color: '#6B7280', marginTop: 8, fontSize: 15, textAlign: 'center' }}>
              You haven't created any routines yet. (Try it - it's fun!)
            </Text>
        
            <Pressable
              onPress={() => navigation.navigate("Build")}
              style={styles.secondaryBtn}
            >
              <Ionicons name="add-circle-outline" size={16} color="#10B981" />
              <Text style={styles.secondaryText}>Build Your Own Routine</Text>
            </Pressable>
          </View>
        }
          />
        )}

        {activeTab === 'saved' && (
          <FlatList
            data={savedRoutines}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ marginBottom: 16 }}>
                <RoutineCard
                  large={true}
                  item={item}
                  enablePressAnimation
                  initiallyFavorite={true}
                />
              </View>
            )}
            contentContainerStyle={{ padding: 20 }}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Ionicons name="heart-outline" size={32} color="#9CA3AF" />
                <Text style={styles.noResult}>
                  You haven’t saved any routines yet.
                </Text>
              </View>
            }
            />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F3' },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#D1D5DB',
  },
  activeTabBtn: {
    backgroundColor: '#10B981',
  },
  tabText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  filterText: {
    fontWeight: '600',
    fontSize: 14,
  },
  
  dropdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: 16,
    marginTop: 6,
    paddingVertical: 4,
    gap: 8,
  },
  
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  
  optionText: {
    fontSize: 14,
    color: '#047857',
    fontWeight: '500',
  },
  
  clearBtn: {
    alignSelf: 'center',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  noResult: {
    textAlign: 'center',
    marginTop: 30,
    color: '#6B7280',
    fontSize: 15,
  },
  secondaryBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#34D399',
  },
  
  secondaryText: {
    marginLeft: 8,
    color: '#047857',
    fontSize: 14,
    fontWeight: '600',
  },
  
});

const getThemedStyles = (isDark) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? '#0F172A' : '#F0F4F3',
    },
    text: {
      color: isDark ? '#F3F4F6' : '#111827',
    },
    tabBtn: {
      backgroundColor: isDark ? '#334155' : '#D1D5DB',
    },
    activeTabBtn: {
      backgroundColor: '#10B981',
    },
    activeTabText: {
      color: '#fff',
    },
    filterBtn: {
      backgroundColor: isDark ? "#022C22" : '#ECFDF5',
      borderColor: isDark ? '#4ADE80' : '#A7F3D0',
    },
    option: {
      backgroundColor: isDark ? "#022C22" : '#ECFDF5',
      borderColor: isDark ? '#4ADE80' : '#A7F3D0',
    },
    optionText: {
      color: isDark ? '#6EE7B7' : '#047857',
    },
    clearBtn: {
      backgroundColor: isDark ? '#374151' : '#E5E7EB',
    },
    iconColor: {
      color: isDark ? "#6EE7B7": "#047857",
    },  
    clearText: {
      color: isDark ? '#CBD5E1' : '#6B7280',
    },
    secondaryBtn: {
      backgroundColor: isDark ? '#064E3B' : '#D1FAE5',
      borderColor: isDark ? '#10B981' : '#34D399',
    },
    secondaryText: {
      color: '#10B981',
    },
    optionText: {
      color: isDark ? '#A7F3D0' : '#047857', // was #6EE7B7, softened for readability
    },
    
    option: {
      backgroundColor: isDark ? '#134E4A' : '#ECFDF5', // darker bg for dark mode
      borderColor: isDark ? '#10B981' : '#A7F3D0',
    },
    
    tabText: {
      color: isDark ? '#F1F5F9' : '#374151',
    },
    activeTabText: {
      color: '#FFFFFF',
    },
    filterText: {
      color: isDark ? '#A7F3D0' : '#047857',
    },
    
  });


export default AllRoutinesScreen;
