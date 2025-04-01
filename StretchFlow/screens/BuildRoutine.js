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
} from 'react-native';
import stretchesData from '../assets/stretches.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import comingsoon from '../assets/image.png';
import { ScrollView, Modal, TextInput as RNTextInput, View as RNView, Pressable as RNPressable } from 'react-native';


const BuildRoutineScreen = () => {
    const categories = ['All', 'Easy', 'Intermediate', 'Advanced'];
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isNamingModalVisible, setNamingModalVisible] = useState(false);
    const [routineName, setRoutineName] = useState('');
    const [selected, setSelected] = useState([]);
    
    

    const stretches = stretchesData || [];
    const filteredStretches = stretches.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
        selectedCategory === 'All' || item.difficulty.toLowerCase() === selectedCategory.toLowerCase();
        return matchesSearch && matchesCategory;
    });
  

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
              {item.duration}s • {item.position} • {item.difficulty}
            </Text>
            <Text style={styles.tagText}>🎯 {item.muscleGroups.join(', ')}</Text>
            <Text style={styles.tagText}>🏷️ {item.tags.join(', ')}</Text>
            <Text style={styles.benefits}>✨ {item.benefits.join(', ')}</Text>
          </View>
          <View style={styles.addButton}>
            <Text style={styles.addButtonText}>{isSelected ? '✓' : '+'}</Text>
          </View>
        </View>

        <Image
          source={comingsoon}
          style={styles.previewImage}
          resizeMode="contain"
        />
        {!item.image && (
          <Text style={styles.imageCaption}>Visual preview coming soon</Text>
        )}
      </Pressable>
    );
  };

  return (
    
    <View style={styles.container}>
        <Modal visible={isNamingModalVisible} animationType="slide" transparent>
  <RNView style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
    <RNView style={{ backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Name Your Routine</Text>
      <RNTextInput
        placeholder="e.g., Morning Mobility"
        placeholderTextColor="#9CA3AF"
        value={routineName}
        onChangeText={setRoutineName}
        style={{ borderColor: '#D1D5DB', borderWidth: 1, padding: 12, borderRadius: 10, fontSize: 16, marginBottom: 16 }}
      />
      <RNPressable
        onPress={() => {
          if (routineName.trim()) {
            saveRoutine();
            setNamingModalVisible(false);
          } else {
            Alert.alert('Please enter a routine name.');
          }
        }}
        style={{ backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>Save</Text>
      </RNPressable>
    </RNView>
  </RNView>
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
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    {categories.map((cat) => (
      <Pressable
        key={cat}
        onPress={() => setSelectedCategory(cat)}
        style={[styles.categoryButton, selectedCategory === cat && styles.categoryButtonActive]}
      >
        <Text
          style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}
        >
          {cat}
        </Text>
      </Pressable>
    ))}
  </ScrollView>
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

      {selected.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {selected.length} stretch{selected.length > 1 ? 'es' : ''} • {calculateDuration()}
          </Text>
        </View>
      )}
    
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
        <Text style={styles.saveText}>Save Routine ({selected.length})</Text>
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
  input: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    color: '#111827',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
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
    fontSize: 12,
    color: '#047857',
    marginTop: 4,
  },
  benefits: {
    fontSize: 12,
    color: '#065F46',
    marginTop: 4,
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
  
  previewImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginTop: 12,
  },
  imageCaption: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
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
  
  summary: {
    position: 'absolute',
    bottom: 80,
    left: 20,
  },
  summaryText: {
    fontSize: 13,
    color: '#4B5563',
  },
  saveButton: {
    position: 'absolute',
    bottom: 20,
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
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
    color: '#6B7280',
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
  }  
});

export default BuildRoutineScreen;
