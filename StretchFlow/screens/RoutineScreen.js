import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const RoutineScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { routine } = route.params;
  const steps = routine.steps;

  const renderStep = ({ item, index }) => (
    <View style={styles.stepCard}>
      <View style={styles.stepNumberContainer}>
        <Text style={styles.stepNumber}>{index + 1}</Text>
      </View>
      <View style={styles.stepInfo}>
        <Text style={styles.stepName}>{item.name}</Text>
        <Text style={styles.stepDuration}>{item.duration} sec</Text>
      </View>
    </View>
  );
  const getTagColor = (tag) => {
    const lowerTag = tag.toLowerCase();
    if (["morning", "wake up", "relax"].includes(lowerTag)) return "#DBEAFE";
    if (["energize", "active break", "focus"].includes(lowerTag)) return "#FDE68A";
    if (["stretch", "mobility", "core"].includes(lowerTag)) return "#FECACA";
    if (["post-workout", "wind down"].includes(lowerTag)) return "#D1FAE5";
    if (["flow", "movement"].includes(lowerTag)) return "#EDE9FE";
    return "#ECFDF5"; // fallback mint
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* ✅ Header Image with gradient overlay */}
      <ImageBackground
        source={require('../assets/hero.png')} // Replace with your hero image
        style={styles.headerImage}
        imageStyle={{ resizeMode: 'cover', opacity: 0.55 }}

      >
        <Pressable
  onPress={() => navigation.goBack()}
  style={{
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 8,
    borderRadius: 30,
  }}
>
  <Ionicons name="arrow-back" size={22} color="#fff" />
</Pressable>
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent']}
          style={styles.gradientOverlay}
        />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={2}>{routine.title}</Text>
          <Text style={styles.headerSubtitle}>{routine.description}</Text>
        </View>
      </ImageBackground>

      {/* Routine Info */}
      <View style={styles.detailsSection}>

      <View style={styles.sectionRow}>
    <Ionicons name="time-outline" size={16} color="#047857" />
    <Text style={styles.sectionLabel}>{routine.duration}</Text>
  </View>

  <View style={styles.sectionRow}>
    <Ionicons name="barbell-outline" size={16} color="#047857" />
    <Text style={styles.sectionLabel}>{routine.difficulty}</Text>
  </View>
  <View style={styles.sectionRow}>
  <Ionicons name="layers-outline" size={16} color="#047857" />
  <Text style={styles.sectionLabel}>{routine.category}</Text>
</View>

<View style={styles.sectionRow}>
  <Ionicons name="fitness-outline" size={16} color="#047857" />
  <Text style={styles.sectionLabel}>
    {routine.muscleGroups.map((muscle, idx) => (
      <Text key={idx}>
        {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
        {idx < routine.muscleGroups.length - 1 ? ', ' : ''}
      </Text>
    ))}
  </Text>
</View>
        <View style={styles.tagsRow}>
          {routine.tags.map((tag, idx) => (
             <View key={idx}   style={[styles.tag, { backgroundColor: getTagColor(tag) }]}>
            <Ionicons name={getTagIcon(tag)} size={12} color="#047857" />
            <Text style={styles.tagText}>{tag.toUpperCase()}</Text>

            </View>
          ))}
        </View>
      </View>

      <FlatList
        data={steps}
        renderItem={renderStep}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.stepsList}
        scrollEnabled={false}
      />

      <Pressable
        style={styles.startButton}
        onPress={() => navigation.navigate('Timer', { routine, stretches: steps })}
      >
        <Text style={styles.startButtonText}>Start Routine</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerImage: {
    height: 220,
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  
  headerContent: {
    padding: 20,
      backgroundColor: 'rgba(0,0,0,0.4)',
      borderRadius: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#F3F4F6', // very light gray
    marginTop: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    gap: 16,
    marginTop: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#047857',
    fontWeight: '600',
  },
  detailsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    gap: 14, // 👈 makes rows breathe nicely
  },
  
  metaTitle: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#374151', // softer dark gray
    fontWeight: '500',
  },
  
  
  
  stepsList: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',

    
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
    
  },
  stepNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6EE7B7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepInfo: {
    flex: 1,
  },
  stepName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A2E43',
  },
  stepDuration: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  startButton: {
    backgroundColor: '#047857',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 30,
    marginHorizontal: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  

  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6, // add this instead of marginLeft inside icon
  },  
tagText: {
  fontSize: 13,
  color: '#047857',
  fontWeight: '600',
},

});

export default RoutineScreen;
