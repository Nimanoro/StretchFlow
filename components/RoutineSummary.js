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
  isDark = false,
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
  const themed= getThemedStyles(isDark);
  return (
    <View style={[styles.cardWrapper, themed.cardWrapper]}>
      <View style={[styles.card, themed.card]}>
        <Text style={[styles.title, themed.title]}>{title}</Text>

        <View style={[styles.statRow, themed.statRow]}>
          <View style={[styles.labelGroup, themed.labelGroup]}>
            <Ionicons name="flame" size={18} color="#F59E0B" />
            <Text style={[styles.label, themed.label]}>Streak</Text>
          </View>
          <Text style={[styles.value, themed.value]}>{streak}-Day</Text>
        </View>

        <View style={styles.divider} />

        <View style={[styles.statRow, themed.statRow]}>
          <View style={[styles.labelGroup, themed.labelGroup]}>
            <Ionicons name="barbell" size={18} color="#6366F1" />
            <Text style={[styles.label, themed.label]}>Difficulty</Text>
          </View>
          <Text style={[styles.value, themed.value]}>{difficulty}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statRow}>
          <View style={styles.labelGroup}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={[styles.label, themed.label]}>Stretches</Text>
          </View>
          <Text style={[styles.value, themed.value]}>{stretchCount}</Text>
        </View>

        <View style={styles.divider} />

        <View style={[styles.statRow, themed.statRow]}>
          <View style={[styles.labelGroup, themed.labelGroup]}>
            <Feather name="clock" size={18} color="#3B82F6" />
            <Text style={[styles.label, themed.label]}>Time</Text>
          </View>
          <Text style={[styles.value, themed.value]}>{duration}</Text>
        </View>

        {muscleGroups.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.statRow}>
              <View style={styles.labelGroup}>
                <MaterialCommunityIcons name="dumbbell" size={18} color="#06B6D4" />
                <Text style={[styles.label, themed.label]}>Muscles</Text>
              </View>
              <Text style={[styles.value, themed.value]} numberOfLines={2}
ellipsizeMode="tail"
>
                {muscleGroups.slice(0, 1).map(capitalize).join(', ')}, ...
              </Text>
            </View>
          </>
        )}
      </View>

      {tags.length > 0 && (
        <View style={[styles.hashtagWrap, themed.hashtagWrap]}>
          {tags.slice(0, 6).map((tag, idx) => (
            <Text key={idx} style={[styles.hashtag, themed.hashtag]}>#{capitalize(tag)}</Text>
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
    marginBottom: 20,
    width: '100%',
  },
  card: {
    borderRadius: 16,
    padding: 20,
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

const getThemedStyles = (isDark) =>
  StyleSheet.create({
    cardWrapper: {
      backgroundColor: isDark ? '#1E293B' : '#ECFDF5',
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? '#334155' : 'transparent',
    },
    title: {
      color: isDark ? '#F8FAFC' : '#111827',
    },
    label: {
      color: isDark ? '#CBD5E1' : '#374151',
    },
    value: {
      color: isDark ? '#F1F5F9' : '#111827',
    },
    divider: {
      height: 1,
      backgroundColor: isDark ? '#334155' : '#E5E7EB',
      marginVertical: 6,
    },
    hashtag: {
      backgroundColor: isDark ? '#78350F' : '#FEF3C7',
      color: isDark ? '#FCD34D' : '#92400E',
    },
  });


export default RoutineSummaryCard;

