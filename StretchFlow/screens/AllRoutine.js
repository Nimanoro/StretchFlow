import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import exercisesData from '../assets/exercises.json';
import RoutineCard from '../components/RoutineCard';

const routines = exercisesData.routines || exercisesData;

const AllRoutinesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Routines</Text>
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 16 }}>
            <RoutineCard item={item} enablePressAnimation />
          </View>
        )}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F3',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    padding: 20,
    color: '#111827',
  },
});

export default AllRoutinesScreen;
