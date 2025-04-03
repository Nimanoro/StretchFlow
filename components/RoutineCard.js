import React, { useRef, useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkPremiumStatus } from '../utils/premium'; // Implement this or replace with hardcoded true/false
import { LayoutAnimation } from 'react-native';




const RoutineCard = ({ item, large = false, enablePressAnimation = false }) => {
  const navigation = useNavigation();
  const scale = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const MAX_VISIBLE_TAGS = 2;
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
  

  useEffect(() => {
    const loadStatus = async () => {
      const status = await checkPremiumStatus(); // Implement this to return true/false
      setIsPremium(status);

      const saved = await AsyncStorage.getItem('favorites');
      const favorites = saved ? JSON.parse(saved) : [];
      setIsFavorite(favorites.includes(item.id));
    };
    loadStatus();
  }, []);

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

  const toggleFavorite = async () => {
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }

    const saved = await AsyncStorage.getItem('favorites');
    const favorites = saved ? JSON.parse(saved) : [];

    let updated;
    if (favorites.includes(item.id)) {
      updated = favorites.filter((id) => id !== item.id);
    } else {
      updated = [...favorites, item.id];
      animateHeart();
    }

    await AsyncStorage.setItem('favorites', JSON.stringify(updated));
    setIsFavorite(updated.includes(item.id));
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

              <Pressable onPress={toggleFavorite}>
                <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                  <Ionicons
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    size={20}
                    color={isFavorite ? '#EF4444' : '#9CA3AF'}
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
      <Text style={[styles.tagText, { color: '#047857', fontWeight: '700' }]}>
        {showAllTags ? 'SHOW LESS' : `+${hiddenTagCount} MORE`}
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
      <Ionicons name="lock-closed-outline" size={36} color="#10B981" style={{ marginBottom: 12 }} />
      <Text style={styles.modalTitle}>Premium Feature</Text>
      <Text style={styles.modalText}>Favorites let you quickly access what works best for you. Get Premium to unlock this and more.

</Text>

      <Pressable style={styles.modalButton} onPress={() => {
        setShowUpgradeModal(false);
        navigation.navigate('Premium'); // Navigate to your premium screen
      }}>
        <Text style={styles.modalButtonText}>Upgrade Now</Text>
      </Pressable>

      <Pressable onPress={() => setShowUpgradeModal(false)}>
        <Text style={styles.modalCloseText}>Maybe later</Text>
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
  
  
});

export default RoutineCard;
