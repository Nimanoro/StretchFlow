import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const RoutineCard = ({ item, large = false, enablePressAnimation = false }) => {
  const navigation = useNavigation();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    if (!enablePressAnimation) return;
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const onPressOut = () => {
    if (!enablePressAnimation) return;
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const cardStyles = [
    styles.card,
    large && styles.cardLarge,
    enablePressAnimation && { transform: [{ scale }] },
  ];

  const cardTitleStyle = [
    styles.cardTitle,
    large && styles.cardTitleLarge,
  ];

  const cardInfoStyle = [
    styles.cardInfo,
    large && styles.cardInfoLarge,
  ];

  return (
    <TouchableWithoutFeedback
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => navigation.navigate('Routine', { routine: item })}
    >
      <Animated.View style={cardStyles}>
        <View style={styles.cardContent}>
          <Text style={cardTitleStyle}>{item.title}</Text>
          <View style={styles.infoContainer}>
            <Text style={cardInfoStyle}>Duration: {item.duration}</Text>
            <Text style={cardInfoStyle}>Difficulty: {item.difficulty}</Text>
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
  cardLarge: {
    width: '100%',
    padding: 24,
    marginRight: 0,
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
  cardTitleLarge: {
    fontSize: 24,
  },
  cardInfo: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  cardInfoLarge: {
    fontSize: 16,
  },
  infoContainer: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
});

export default RoutineCard;
