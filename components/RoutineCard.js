import React, { useRef, useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserContext } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkPremiumStatus } from '../utils/premium'; // Implement this or replace with hardcoded true/false
import { LayoutAnimation } from 'react-native';
import { getSavedRoutines, saveARoutine } from '../utils/userStorage';
import { useFavorites } from '../context/FavoritesContext';


const RoutineCard = ({ item, large = false, enablePressAnimation = false, initiallyFavorite= false}) => {
  const navigation = useNavigation();
  const scale = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const { isPremium } = useContext(UserContext);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const MAX_VISIBLE_TAGS = 2;
  const { isFavorite, toggleFavorite } = useFavorites();
  const visibleTags = showAllTags ? item.tags : item.tags?.slice(0, 1) || [];
const hiddenTagCount = item.tags?.length > 1 && !showAllTags ? item.tags.length - 1 : 0;
  
   const toggleTags = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAllTags(!showAllTags);
  };
  const [showAllTags, setShowAllTags] = useState(false);
  // Revised pastel background colors
const getTagColor = (tag) => {
    const lowerTag = tag.toLowerCase();
    if (["morning", "wake up", "relax"].includes(lowerTag)) return "#E0F2FE"; // blue-100
    if (["energize", "active break", "focus"].includes(lowerTag)) return "#FEF9C3"; // yellow-100
    if (["stretch", "mobility", "core"].includes(lowerTag)) return "#FEE2E2"; // red-100
    if (["post-workout", "wind down"].includes(lowerTag)) return "#DCFCE7"; // green-100
    if (["flow", "movement"].includes(lowerTag)) return "#EDE9FE"; // indigo-100
    return "#ECFDF5";
  };
  const handleHeartPress = async () => {
    if (!isPremium) {
      const saved = await getSavedRoutines();
    if (saved.length >= 1 && !isFavorite(item.id)) {
        setShowUpgradeModal(true);
        return;
      }
    }
  
    toggleFavorite(item);
    animateHeart();
  };
  
  
  const getTagIcon = (tag) => {
    const lower = tag.toLowerCase();
    if (lower.includes('mobility')) return 'walk-outline';
    if (lower.includes('posture')) return 'body-outline';
    if (lower.includes('energy') || lower.includes('energize')) return 'flash-outline';
    if (lower.includes('relax') || lower.includes('calm') || lower.includes('stress')) return 'cloud-outline';
    if (lower.includes('flexibility')) return 'accessibility-outline';
    if (lower.includes('office') || lower.includes('desk')) return 'laptop-outline';
    if (lower.includes('recovery')) return 'medkit-outline';
    if (lower.includes('core')) return 'grid-outline';
    if (lower.includes('yoga')) return 'fitness-outline';
    if (lower.includes('morning')) return 'sunny-outline';
    if (lower.includes('evening')) return 'moon-outline';
    if (lower.includes('stretch')) return 'body-outline';
    if (lower.includes('strength')) return 'barbell-outline';
    if (lower.includes('cardio')) return 'heart-outline';
    return 'pricetag-outline'; // Default
  };
  

  const onPressIn = () => {
    if (!enablePressAnimation) return;
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  const onPressOut = () => {
    if (!enablePressAnimation) return;
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  const animateHeart = () => {
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.2,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };


  return (
    
    <TouchableWithoutFeedback
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => navigation.navigate('Routine', { routine: item })}
    >
      <Animated.View style={[styles.shadowWrap, enablePressAnimation && { transform: [{ scale }] }]}>
        <LinearGradient
          colors={['#FFFFFF', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, large && styles.cardLarge]}
        >
          <View style={styles.content}>

            <View style={styles.headerRow}>
            <Text
  style={[styles.cardTitle, large && styles.cardTitleLarge]}
  numberOfLines={1}
  ellipsizeMode="tail"
>
  {item.title}
</Text>

              <Pressable onPress={handleHeartPress}>
                <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                  <Ionicons
                    name={isFavorite(item.id) ? 'heart' : 'heart-outline'}
                    size={20}
                    color={isFavorite(item.id) ? '#EF4444' : '#9CA3AF'}
                  />
                </Animated.View>
              </Pressable>
              </View>
              <View style={styles.metaContainer}>
                
              <View style={styles.tagsRow}>
  {(showAllTags ? item.tags : visibleTags).map((tag, idx) => (
    <View key={idx}   style={[styles.tag, { backgroundColor: getTagColor(tag) }]}
>
      <Ionicons name={getTagIcon(tag)} size={12} color="#047857" />
      <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
    </View>
  ))}

  {hiddenTagCount > 0 && (
    <Pressable onPress={() => toggleTags()} style={styles.tag}>
      <Ionicons name={showAllTags ? "chevron-up-outline":"chevron-down-outline"} size={12} color="#047857" />
      <Text style={[styles.tagText, { color: '#047857', fontWeight: '700' }]}>
        {showAllTags ? 'SHOW LESS' : ` +${hiddenTagCount}`}
      </Text>
    </Pressable>
  )}
</View>



        
        <View style={styles.metaDetails}>
        <View style={styles.durationRow}>
  <View style={styles.metaIconText}>
    <Ionicons name="time-outline" size={16} color="#10B981" />
    <Text style={styles.metaText}>{item.duration}</Text>
  </View>
  <View style={styles.metaIconText}>
    <Ionicons name="barbell-outline" size={16} color="#10B981" />
    <Text style={styles.metaText}>{item.difficulty}</Text>
  </View>
</View>

            <View style={styles.metaIconText}>
            <Ionicons name="albums-outline" size={16} color="#10B981" />
            <Text style={styles.metaText}>{item.category}</Text>
            </View>
            <View style={styles.metaIconText}>
            <Ionicons name="body-outline" size={16} color="#10B981" />
            <Text style={styles.metaText}>
                {item.muscleGroups?.join(', ')}
            </Text>
            </View>
        </View>
        </View>
        </View>
        <Modal
  transparent
  visible={showUpgradeModal}
  animationType="fade"
  onRequestClose={() => setShowUpgradeModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>

      {/* Animated lock bounce (optional but 🔥) */}
      <Ionicons name="lock-closed-outline" size={40} color="#10B981" style={{ marginBottom: 12 }} />

      {/* 💡 Emotion-First Title */}
      <Text style={styles.modalTitle}>Unlock Your Flow</Text>

      {/* 🧠 Benefit-Driven Subheading */}
      <Text style={styles.modalText}>
        Get deeper stretches, calming themes, and distraction-free sessions —
        all for just <Text style={{ fontWeight: 'bold' }}>$2.99/month</Text>.
      </Text>

      {/* ✅ Features List — Reordered by Power */}
      <View style={styles.perksList}>
        <View style={styles.perkItem}>
          <Ionicons name="infinite-outline" size={18} color="#10B981" style={{ marginRight: 8 }} />
          <Text style={styles.perkText}>Unlimited routines & favorites</Text>
        </View>
        <View style={styles.perkItem}>
          <Ionicons name="musical-notes-outline" size={18} color="#10B981" style={{ marginRight: 8 }} />
          <Text style={styles.perkText}>Voice guidance, music & themes</Text>
        </View>
        <View style={styles.perkItem}>
          <Ionicons name="sparkles-outline" size={18} color="#10B981" style={{ marginRight: 8 }} />
          <Text style={styles.perkText}>Early access to new features</Text>
        </View>
        <View style={styles.perkItem}>
          <Ionicons name="close-circle-outline" size={18} color="#10B981" style={{ marginRight: 8 }} />
          <Text style={styles.perkText}>No ads, ever</Text>
        </View>
      </View>

      {/* 🌱 Primary CTA */}
      <Pressable style={styles.modalButton} onPress={() => {
        setShowUpgradeModal(false);
        navigation.navigate('Premium');
      }}>
        <Text style={styles.modalButtonText}>Start My Flow</Text>
      </Pressable>

      {/* 👋 Softer Dismiss CTA */}
      <Pressable onPress={() => setShowUpgradeModal(false)} style={{ marginTop: 10 }}>
        <Text style={styles.modalCloseText}>Not right now</Text>
      </Pressable>

    </View>
  </View>
</Modal>


        </LinearGradient>
      </Animated.View>

    </TouchableWithoutFeedback>
    
  );
};

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: 20,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 260,
    minHeight: 200
  },
  
  
  cardLarge: {
    width: '100%',
    padding: 24,
  },
  content: {
    flex: 1,
    marginRight: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  cardTitleLarge: {
    fontSize: 22,
  },

  metaContainer: {
    marginTop: 10,
    flexDirection: 'column',
    gap: 8,
    flexShrink: 1,
  },
  
  
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE', // use dynamic from tag
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 6,
    marginBottom: 6,
    height: 28,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },   
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    color: '#334155', // Slate tone
    letterSpacing: 0.3,
  },  
  
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    minHeight: 60,
  },  
  
  metaDetails: {
    flexDirection: 'column',
    gap: 6,
  },
  
  metaIconText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#475569', // Slate-600
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  
  
  
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  
  chevronAlignWrap: {
    position: 'absolute',
    top: 60,
    right: -5,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCloseText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  
  
  chevronCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalCard: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  
  modalText: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  modalButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 10,
  },
  
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  
  modalCloseText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  perksList: {
    marginVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  perkText: {
    fontSize: 14,
    color: '#374151',
  },
  
  
});

export default RoutineCard;
