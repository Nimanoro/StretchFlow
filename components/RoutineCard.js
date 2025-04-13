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

import { ThemeContext } from '../context/ThemeContext';
// ...

const RoutineCard = ({ item, large = false, enablePressAnimation = false, initiallyFavorite= false}) => {
  const navigation = useNavigation();
  const scale = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const { isPremium } = useContext(UserContext);

  const { themeName } = useContext(ThemeContext);
  const isDark = themeName === 'dark';

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const themed = getRoutineCardStyles(isDark);
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
  const getTagColors = (tag, isDark) => {
    const lowerTag = tag.toLowerCase();
  
    if (["energize", "boost", "energy", "happy", "feel good", "morning", "wake up", "activation", "prep", "warm-up"].includes(lowerTag))
      return isDark ? { bg: '#FBBF24', icon: '#1E293B' } // amber-400
    : { bg: '#FEF9C3', icon: '#047857' };

  
    if (["mobility", "stretch", "flexibility", "flow", "yoga", "control", "balance"].includes(lowerTag))
      return isDark ? { bg: 	"#FB7185", icon: '#1E293B' } : { bg: '#FECACA', icon: '#047857' };
  
    if (["refresh", "quick", "office", "desk", "posture", "circulation", "movement"].includes(lowerTag))
      return isDark ? { bg: '#047857', icon: '#F0FDF4' } // emerald-800 (deeper, grounded tone)
    : { bg: '#D1FAE5', icon: '#047857' };
  
    if (["calm", "relax", "recovery", "relief", "cooldown", "release", "sleep", "night", "stress", "anxiety", "mindful"].includes(lowerTag))
      return isDark ? { bg: 	"#A78BFA", icon: '#1E293B' } : { bg: '#E9D5FF', icon: '#047857' };
  
    if (["seniors", "joint safe", "low impact", "back pain", "spine", "neck", "shoulders", "hips", "sitting"].includes(lowerTag))
      return isDark ? { bg: '#F472B6', icon: '#1E293B' } : { bg: '#FCE7F3', icon: '#047857' };
  
    return isDark ? { bg: '#94A3B8', icon: '#1E293B' } : { bg: '#ECFDF5', icon: '#047857' };
  };
  
  
  const categoryIcons = {
    "Prep & Warm-Up": "flame-outline",
    "Recovery & Relief": "leaf-outline",
    "Mobility & Flexibility": "walk-outline",
    "Quick Boost": "flash-outline",
    "Balance & Stability": "accessibility-outline",
    "Mindfulness & Calm": "medkit-outline",
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
    const lowerTag = tag.toLowerCase();
    if (["calm", "relax", "recovery", "relief", "cooldown", "release", "sleep", "night", "stress", "anxiety", "mindful"].includes(lowerTag)){
      return 'cloud-outline';
    }
    if (["energize", "boost", "energy", "happy", "feel good", "morning", "wake up", "activation", "prep", "warm-up"].includes(lowerTag))
      return 'flash-outline';
  
    if (["mobility", "stretch", "flexibility", "flow", "yoga", "control", "balance"].includes(lowerTag))
      return 'body-outline';
    if (["refresh", "quick", "office", "desk", "posture", "circulation", "movement"].includes(lowerTag))
      return 'laptop-outline';
    if (["calm", "relax", "recovery", "relief", "cooldown", "release", "sleep", "night", "stress", "anxiety", "mindful"].includes(lowerTag))
      return 'medkit-outline';
    if (["seniors", "joint safe", "low impact", "back pain", "spine", "neck", "shoulders", "hips", "sitting"].includes(lowerTag))
      return 'leaf-outline';
    
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
      <Animated.View style={[styles.shadowWrap, (isDark && {
  shadowColor: '#000',
  shadowOpacity: 0.3,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 4 },
  elevation: 8,
}), enablePressAnimation && { transform: [{ scale }] }]}>
        <LinearGradient
colors={isDark 
  ? ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)'] 
  : ['#FFFFFF', '#FFFFFF']}
  

          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, large && styles.cardLarge, themed.cardBackground]}
        >
          <View style={styles.content}>
            <View style={styles.headerRow}>
              <Text
                style={[
                  styles.cardTitle,
                  large && styles.cardTitleLarge,
                  themed.cardTitle,
                  isDark && {
                    textShadowColor: 'rgba(255, 255, 255, 0.1)',
textShadowOffset: { width: 0, height: 1 },
textShadowRadius: 2,
                  },
                
                ]}
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
              {(showAllTags ? item.tags : visibleTags).map((tag, idx) => {
  const { bg, icon } = getTagColors(tag, isDark);
  return (
    <View key={idx} style={[styles.tag, { backgroundColor: bg }]}>
      <Ionicons name={getTagIcon(tag)} size={12} color={icon} />
      <Text style={[styles.tagText, themed.tagText]}>{tag.toUpperCase()}</Text>
    </View>
  );
})}

                {hiddenTagCount > 0 && (
                  <Pressable onPress={toggleTags} style={styles.tag}>
                    <Text style={[styles.tagText, { color: '#047857', fontWeight: '700' }]}>
                      {showAllTags ? 'SHOW LESS' : ` +${hiddenTagCount}`}
                    </Text>
                    <Ionicons
                      name={showAllTags ? 'chevron-up-outline' : 'chevron-down-outline'}
                      size={12}
                      color="#047857"
                    />
                  </Pressable>
                )}
              </View>
  
              <View style={styles.metaDetails}>
                <View style={styles.durationRow}>
                  <View style={styles.metaIconText}>
                    <Ionicons name="time-outline" size={16} color={themed.iconColor.color} />
                    <Text style={[styles.metaText, themed.metaText]}>{item.duration}</Text>
                  </View>
                  <View style={styles.metaIconText}>
                    <Ionicons name="barbell-outline" size={16}color={themed.iconColor.color} />
                    <Text style={[styles.metaText, themed.metaText]}>{item.difficulty}</Text>
                  </View>
                </View>
                <View style={styles.metaIconText}>
                  <Ionicons name={categoryIcons[item.category]} size={16} color={themed.iconColor.color} />
                  <Text style={[styles.metaText, themed.metaText]}>{item.category}</Text>
                </View>
                <View style={styles.metaIconText}>
                  <Ionicons name="body-outline" size={16} color={themed.iconColor.color} />
                  <Text style={[styles.metaText, themed.metaText]}>
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
              <View style={[styles.modalCard, themed.modalCard]}>
                <Ionicons name="lock-closed-outline" size={40} color="#10B981" style={{ marginBottom: 12 }} />
                <Text style={[styles.modalTitle, themed.modalTitle]}>Unlock Your Flow</Text>
                <Text style={[styles.modalText, themed.modalText]}>
                  Get deeper stretches, calming themes, and distraction-free sessions —
                  all for just <Text style={{ fontWeight: 'bold' }}>$2.99/month</Text>.
                </Text>
  
                <View style={styles.perksList}>
                  <View style={styles.perkItem}>
                    <Ionicons name="infinite-outline" size={18} color="#10B981" style={{ marginRight: 8 }} />
                    <Text style={[styles.perkText, themed.perkText]}>Unlimited routines & favorites</Text>
                  </View>
                  <View style={styles.perkItem}>
                    <Ionicons name="musical-notes-outline" size={18} color="#10B981" style={{ marginRight: 8 }} />
                    <Text style={[styles.perkText, themed.perkText]}>Voice guidance, music & themes</Text>
                  </View>
                  <View style={styles.perkItem}>
                    <Ionicons name="sparkles-outline" size={18} color="#10B981" style={{ marginRight: 8 }} />
                    <Text style={[styles.perkText, themed.perkText]}>Early access to new features</Text>
                  </View>
                  <View style={styles.perkItem}>
                    <Ionicons name="close-circle-outline" size={18} color="#10B981" style={{ marginRight: 8 }} />
                    <Text style={[styles.perkText, themed.perkText]}>No ads, ever</Text>
                  </View>
                </View>
  
                <Pressable
                  style={styles.modalButton}
                  onPress={() => {
                    setShowUpgradeModal(false);
                    navigation.navigate('Premium');
                  }}
                >
                  <Text style={styles.modalButtonText}>Start My Flow</Text>
                </Pressable>
  
                <Pressable onPress={() => setShowUpgradeModal(false)} style={{ marginTop: 10 }}>
                  <Text style={[styles.modalCloseText, themed.modalCloseText]}>Not right now</Text>
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

const getRoutineCardStyles = (isDark) =>
  StyleSheet.create({
    cardBackground: {
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    },
    cardTitle: {
      color: isDark ? '#F9FAFB' : '#1F2937',
      
    },
    metaText: {
      color: isDark ? '#CBD5E1' : '#475569',
    },
    tagText: {
      color: isDark ? '#FFF' : '#334155',
    },
    modalCard: {
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    },
    modalTitle: {
      color: isDark ? '#F9FAFB' : '#1F2937',
    },
    modalText: {
      color: isDark ? '#94A3B8' : '#6B7280',
    },
    modalCloseText: {
      color: isDark ? '#64748B' : '#9CA3AF',
    },
    perkText: {
      color: isDark ? '#E2E8F0' : '#374151',
    },

  iconColor: {
    color: isDark ? "#6EE7B7": "#047857",
  },  
  });


export default RoutineCard;
