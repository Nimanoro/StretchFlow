// RoutineCard.js
import React, { useRef } from 'react';
import { View, Text, TouchableWithoutFeedback, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const RoutineCard = ({ item }) => {
  const navigation = useNavigation();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => navigation.navigate('Routine', { routine: item })}
    >
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.cardInfo}>Duration: {item.duration}</Text>
            <Text style={styles.cardInfo}>Difficulty: {item.difficulty}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6EE7B7" />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    width: 250,
    marginRight: 16,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  cardContent: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2A2E43',
    marginBottom: 12,
  },
  infoContainer: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  cardInfo: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
});

export default RoutineCard;
