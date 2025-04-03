import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
  Image,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView, TextInput as RNTextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import stretchesData from '../assets/stretches.json';
import comingsoon from '../assets/image.png';

const BuildRoutineScreen = () => {
  const categories = ['All', 'Easy', 'Intermediate', 'Advanced'];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isNamingModalVisible, setNamingModalVisible] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [selected, setSelected] = useState([]);
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedDiff, setSelectedDiff] = useState(null);
  const [muscleFilters, setMuscleFilters] = useState([]);
  const [tagFilters, setTagFilters] = useState([]);
  const [diffFilters, setDiffFilters] = useState([]);
  const getChipLabel = (type) => {
    if (type === 'muscles' && muscleFilters.length) return capitalize(muscleFilters[0]);
    if (type === 'tags' && tagFilters.length) return capitalize(tagFilters[0]);
    if (type === 'difficulty' && diffFilters.length) return capitalize(diffFilters[0]);
    return type.charAt(0).toUpperCase() + type.slice(1); // fallback
  };

  const chipColor = {
     difficulty: '#10B981',
    tags: '#FBBF24',
    muscles: '#3B82F6',
  };
  const stringToFilter = (str) => {
    if (str === 'muscles') return muscleFilters;
    if (str === 'tags') return tagFilters;
    if (str === 'difficulty') return diffFilters;
    return [];
  };

  

  const allMuscles = [
    "neck", "shoulders", "hamstrings", "quadriceps", "calves", "hip flexors", "spine", "inner thighs",
    "glutes", "hips", "abdominals", "chest", "lats", "groin", "lower back", "forearms", "obliques", "quads", "ankles"
  ]
  
  const allTags = [
    "warm-up", "mobility", "flexibility", "relaxation", "recovery", "posture", "deep stretch"
  ]
  
  const allDifficulties = ['Easy', 'Intermediate', 'Advanced'];

  
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const stretches = stretchesData || [];
  const filteredStretches = stretches.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
  
    const matchesCategory = selectedCategory === 'All' || item.difficulty.toLowerCase() === selectedCategory.toLowerCase();
  
    const matchesMuscle = muscleFilters.length === 0 ||
      item.muscleGroups.some((g) => muscleFilters.includes((g)));
  
    const matchesTag = tagFilters.length === 0 ||
      item.tags.some((t) => tagFilters.includes((t)));
  
    const matchesDiff = diffFilters.length === 0 ||
      diffFilters.includes((item.difficulty));
  
    return matchesSearch && matchesCategory && matchesMuscle && matchesTag && matchesDiff;
  });
  
  const [chipsOpen, setChipsOpen] = useState({ muscles: false, tags: false, difficulty: false });

  const stringToFilterSetter = (str) => {
    if (str === 'muscles') return setMuscleFilters;
    if (str === 'tags') return setTagFilters;
    if (str === 'difficulty') return setDiffFilters;
    return () => {};
  };

  const toggleStretch = (stretch) => {
    setSelected((prev) =>
      prev.find((s) => s.id === stretch.id)
        ? prev.filter((s) => s.id !== stretch.id)
        : [...prev, stretch]
    );
  };

  const calculateDuration = () => {
    const totalSeconds = selected.reduce((sum, s) => sum + (s.duration || 0), 0);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;
  };

  const saveRoutine = async () => {
    if (!routineName.trim() || selected.length === 0) {
      Alert.alert('Incomplete', 'Please name your routine and add at least one stretch.');
      return;
    }

    const routine = {
      id: Date.now().toString(),
      title: routineName.trim(),
      steps: selected,
      duration: calculateDuration(),
      difficulty: 'Custom',
    };

    try {
      const saved = await AsyncStorage.getItem('myRoutines');
      const parsed = saved ? JSON.parse(saved) : [];
      await AsyncStorage.setItem('myRoutines', JSON.stringify([...parsed, routine]));

      Alert.alert('✅ Routine Saved', `"${routine.title}" is ready!`);
      setSelected([]);
      setRoutineName('');
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while saving your routine.');
    }
  };

  const renderStretch = ({ item }) => {
    const isSelected = !!selected.find((s) => s.id === item.id);

    return (
      <Pressable
        onPress={() => toggleStretch(item)}
        style={({ pressed }) => [
          styles.card,
          isSelected && styles.cardSelected,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.textGroup}>
            <Text style={styles.stretchTitle}>{item.name}</Text>
            <Text style={styles.metaText}>
              {item.duration}s • {capitalize(item.position)} • {capitalize(item.difficulty)}
            </Text>
            <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Ionicons name="body-outline" size={16} color="#6366F1" />
          <Text style={styles.tagText}>
            {item.muscleGroups.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')}
          </Text>
        </View>
        <View style={styles.sectionRow}>
          <Ionicons name="pricetag-outline" size={16} color="#F59E0B" />
          <Text style={styles.tagText}>
            {item.tags.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}
          </Text>
        </View>
        <View style={styles.sectionRow}>
          <Ionicons name="star-outline" size={16} color="#10B981" />
          <Text style={styles.tagText}>
            {item.benefits.map(b => b.charAt(0).toUpperCase() + b.slice(1)).join(', ')}
          </Text>
        </View>
      </View>

          </View>
          <View style={styles.addButton}>
            <Text style={styles.addButtonText}>{isSelected ? '✓' : '+'}</Text>
          </View>
        </View>

        <View style={styles.previewWrapper}>
          <Image
            source={comingsoon}
            style={styles.previewImage}
            resizeMode="contain"
          />
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Modal visible={isNamingModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Name Your Routine</Text>
            <RNTextInput
              placeholder="e.g., Morning Mobility"
              placeholderTextColor="#9CA3AF"
              value={routineName}
              onChangeText={setRoutineName}
              style={styles.modalInput}
            />
            <Pressable
              onPress={() => {
                if (routineName.trim()) {
                  saveRoutine();
                  setNamingModalVisible(false);
                } else {
                  Alert.alert('Please enter a routine name.');
                }
              }}
              style={styles.modalSaveButton}
            >
              <Text style={styles.modalSaveButtonText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Text style={styles.title}>Build Your Routine</Text>

      <View style={styles.filterContainer}>
        <TextInput
          placeholder="Search stretches..."
          placeholderTextColor="#9CA3AF"
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.searchInput}
        />
        <View style={{ marginVertical: 8 }}>
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
  {['muscles', 'tags', 'difficulty'].map((filterKey) => (
  <Pressable
    key={filterKey}
    onPress={() =>
      setChipsOpen((prev) => {
        const updated = { muscles: false, tags: false, difficulty: false };
        updated[filterKey] = !prev[filterKey];
        return updated;
      })
    }
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: chipColor[filterKey],
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      marginRight: 8,
    }}

  >
    <Text style={{ fontSize: 13, color: '#fff', fontWeight: '500' }}>
      {getChipLabel(filterKey)}
    </Text>

    {stringToFilter(filterKey).length> 0 && (
  <Pressable onPress={() => 
  stringToFilterSetter(filterKey)([])} style={{ marginLeft: 6 }}
  hitSlop={8}>
    <Ionicons name="close-circle" size={16} color="#fff" />
  </Pressable>
)}

  </Pressable>
))}



    {(muscleFilters.length || tagFilters.length || diffFilters.length) > 0 && (
      <Pressable
      onPress={() => {
        setMuscleFilters([]);
        setTagFilters([]);
        setDiffFilters([]);
      }}
      style={styles.clearAllButton}
    >
      <Text style={styles.clearAllText}>Clear All</Text>
    </Pressable>
    
    )}
  </View>

  {/* Collapsible Options */}
  {chipsOpen.muscles && (
    <ScrollView horizontal style={{ marginTop: 8 }}>
      {allMuscles.map((m) => (
        <Pressable
          key={m}
          onPress={() => {
            setMuscleFilters([m]); // single select
            setChipsOpen({ muscles: false, tags: false, difficulty: false }); // close after select
          }
          
          }
          style={{
            backgroundColor: muscleFilters.includes(m) ? '#10B981' : '#E5E7EB',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 16,
            marginRight: 8,
          }}
        >
          <Text
            style={{
              color: muscleFilters.includes(m) ? '#fff' : '#374151',
              fontSize: 13,
            }}
          >
            {capitalize(m)}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  )}
  {chipsOpen.tags && (
    <ScrollView horizontal style={{ marginTop: 8 }}>
      {allTags.map((t) => (
        <Pressable
          key={t}
          onPress={() => {
            setTagFilters([t]); // single select
            setChipsOpen({ muscles: false, tags: false, difficulty: false }); // close after select
          }}
          
          style={{
            backgroundColor: tagFilters.includes(t) ? '#FBBF24' : '#E5E7EB',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 16,
            marginRight: 8,
          }}
        >
          <Text
            style={{
              color: tagFilters.includes(t) ? '#fff' : '#374151',
              fontSize: 13,
            }}
          >
            {capitalize(t)}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  )}
  {chipsOpen.difficulty && (
    <ScrollView horizontal style={{ marginTop: 8 }}>
      {allDifficulties.map((d) => (
        <Pressable
          key={d}
          onPress={() => {
            setDiffFilters([d]); // single select
            setChipsOpen({ muscles: false, tags: false, difficulty: false }); // close after select
          }}
          
          style={{
            backgroundColor: diffFilters.includes(d) ? '#3B82F6' : '#E5E7EB',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 16,
            marginRight: 8,
          }}
        >
          <Text
            style={{
              color: diffFilters.includes(d) ? '#fff' : '#374151',
              fontSize: 13,
            }}
          >
            {capitalize(d)}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  )}

</View>



      </View>

      <FlatList
        data={filteredStretches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 140 }}
        renderItem={renderStretch}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No stretches found.</Text>
        }
      />

<Pressable
    style={styles.saveButton}
    onPress={() => {
      if (selected.length === 0) {
        Alert.alert('Please select at least one stretch.');
      } else {
        setNamingModalVisible(true);
      }
    }}
  >      
      <Text style={styles.saveText}>Save Routine ({selected.length} stretch{selected.length > 1 ? 'es' : ''} • {calculateDuration()})</Text>

  </Pressable>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F3',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  filterContainer: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 8,
  },
  categoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#10B981',
  },
  categoryText: {
    fontSize: 13,
    color: '#374151',
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardSelected: {
    borderColor: '#10B981',
    borderWidth: 2,
    backgroundColor: '#ECFDF5',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textGroup: {
    flex: 1,
    paddingRight: 12,
  },
  stretchTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  tagText: {
    fontSize: 13,
    color: '#047857',
    marginLeft: 6,
  },
  section: {
    marginTop: 10,
    gap: 6,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#10B981',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  previewWrapper: {
    alignItems: 'center',
    marginTop: 12,
  },
  previewImage: {
    width: 160,
    height: 90,
  },
  summary: {
    position: 'absolute',
    bottom: 80,
    left: 20,

  },
  summaryText: {
    fontSize: 13,
    color: '#ECFDF5',
    fontWeight: '500',
  },
  
  saveButton: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    alignContent: 'center',
    alignSelf: 'center',

  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalInput: {
    borderColor: '#D1D5DB',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  modalSaveButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  filterText: {
    fontSize: 13,
    color: '#374151',
  },
  filterTextActive: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    width: 200,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  dropdownText: {
    fontSize: 16,
    paddingVertical: 8,
    color: '#111827',
    textAlign: 'center',
  },
  selectedLabel: {
    fontSize: 13,
    color: '#6B7280',
    backgroundColor: '#E5E7EB',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
  },

  clearAllButton: {
    backgroundColor: '#F87171',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    opacity: 0.9,
  },
  clearAllText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  
  
});

export default BuildRoutineScreen;
