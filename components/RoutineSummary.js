import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { getUserData } from '../utils/userStorage';

const RoutineSummaryCard = ({
  title,
  stretchCount,
  duration,
  muscleGroups = [],
  tags = [],
  difficulty = 'Easy',
}) => {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getUserData();
      if (userData?.streak) setStreak(userData.streak);
    };
    fetchUserData();
  }, []);

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.statRow}>
          <View style={styles.labelGroup}>
            <Ionicons name="flame" size={18} color="#F59E0B" />
            <Text style={styles.label}>Streak</Text>
          </View>
          <Text style={styles.value}>{streak}-Day</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statRow}>
          <View style={styles.labelGroup}>
            <Ionicons name="barbell" size={18} color="#6366F1" />
            <Text style={styles.label}>Difficulty</Text>
          </View>
          <Text style={styles.value}>{difficulty}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statRow}>
          <View style={styles.labelGroup}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={styles.label}>Stretches</Text>
          </View>
          <Text style={styles.value}>{stretchCount}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statRow}>
          <View style={styles.labelGroup}>
            <Feather name="clock" size={18} color="#3B82F6" />
            <Text style={styles.label}>Time</Text>
          </View>
          <Text style={styles.value}>{duration}</Text>
        </View>

        {muscleGroups.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.statRow}>
              <View style={styles.labelGroup}>
                <MaterialCommunityIcons name="dumbbell" size={18} color="#06B6D4" />
                <Text style={styles.label}>Muscles</Text>
              </View>
              <Text style={styles.value} numberOfLines={1}>
                {muscleGroups.slice(0, 1).map(capitalize).join(', ')}, ... 
              </Text>
            </View>
          </>
        )}
      </View>

      {tags.length > 0 && (
        <View style={styles.hashtagWrap}>
          {tags.slice(0, 6).map((tag, idx) => (
            <Text key={idx} style={styles.hashtag}>#{capitalize(tag)}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    marginTop: 20,
    width: '100%',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderTopWidth: 4,
    borderTopColor: '#A7F3D0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 18,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 6,
  },
  hashtagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 16,
  },
  hashtag: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
    backgroundColor: '#FEF3C7',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
});

export default RoutineSummaryCard;

