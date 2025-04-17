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
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { track } from '../utils/analytics';
const RoutineScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { routine } = route.params;
  const { themeName } = useContext(ThemeContext);
  const isDark = themeName === 'dark';
  const steps = routine.steps;
  const themed = getThemedStyles(isDark);

  const renderStep = ({ item, index }) => (
    <View style={[ styles.stepCard, themed.stepCard]}>
      <View style={[styles.stepNumberContainer, themed.stepNumberContainer,]}>
        <Text style={[ styles.stepNumber, themed.stepNumber]}>{index + 1}</Text>
      </View>
      <View style={[styles.stepInfo, themed.stepInfo]}>
        <Text style={[styles.stepName, themed.stepName]}>{item.name}</Text>
        <Text style={[styles.stepDuration, themed.stepDuration]}>{item.duration} sec</Text>
      </View>
    </View>
  );
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
  

  return (
    <ScrollView style={[styles.container, themed.container]} contentContainerStyle={{ paddingBottom: 30 }}>
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
  colors={isDark
    ? ['rgba(15,23,42,0.95)', 'rgba(15,23,42,0.7)', 'transparent']
    : ['rgba(255,255,255,0.85)', 'rgba(255,255,255,0.5)', 'transparent']}
  style={styles.gradientOverlay}
/>
        <View style={[styles.headerContent, themed.headerContent]}>
          <Text style={[styles.headerTitle, themed.headerTitle]} numberOfLines={2}>{routine.title}</Text>
          <Text style={[styles.headerSubtitle, themed.headerSubtitle]}>{routine.description}</Text>
        </View>
      </ImageBackground>

      {/* Routine Info */}
      <View style={[styles.detailsSection, themed.detailsSection]}>

      <View style={[styles.sectionRow, themed.sectionRow]}>
    <Ionicons name="time-outline" size={16} color={themed.iconColor.color} />
    <Text style={[styles.sectionLabel, themed.sectionLabel]}>{routine.duration}</Text>
  </View>

  <View style={[styles.sectionRow, themed.sectionRow]}>
    <Ionicons name="barbell-outline" size={16} color={themed.iconColor.color} />
    <Text style={[styles.sectionLabel, themed.sectionLabel]}>{routine.difficulty}</Text>
  </View>
  <View style={[styles.sectionRow, themed.sectionRow]}>
  <Ionicons name="layers-outline" size={16} color={themed.iconColor.color} />
  <Text style={[styles.sectionLabel, themed.sectionLabel]}>{routine.category}</Text>
</View>

<View style={[styles.sectionRow, themed.sectionRow]}>
  <Ionicons name="fitness-outline" size={16} color={themed.iconColor.color} />
  <Text style={[styles.sectionLabel, themed.sectionLabel]}>
    {routine.muscleGroups.map((muscle, idx) => (
      <Text key={idx}>
        {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
        {idx < routine.muscleGroups.length - 1 ? ', ' : ''}
      </Text>
    ))}
  </Text>
</View>
        <View style={[styles.tagsRow,themed.tagsRow]}>
        {routine.tags.map((tag, idx) => {
  const { bg, icon } = getTagColors(tag, isDark);
  return (
    <View key={idx} style={[styles.tag, { backgroundColor: bg }]}>
      <Ionicons name={getTagIcon(tag)} size={12} color={icon} />
      <Text style={[styles.tagText, themed.tagText]}>{tag.toUpperCase()}</Text>
    </View>
  );
})}
        </View>
      </View>

      <FlatList
        data={steps}
        renderItem={renderStep}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={[styles.stepsList, themed.stepsList]}
        scrollEnabled={false}
      />

      <Pressable
        style={[styles.startButton, themed.startButton]}
        onPress={() => {track('Routine Started', { routine: routine.title });
            navigation.navigate('Timer', { routine, stretches: steps })}
}
      >
        <Text style={[styles.startButtonText, themed.startButtonText]}>Start Routine</Text>
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
  backgroundColor: 'rgba(255,255,255,0.05)', // soft background
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 999,
  gap: 6,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)', // subtle border for glow
},



tagText: {
  fontSize: 13,
  color: '#047857',
  fontWeight: '600',
},

});
const getThemedStyles = (isDark) => StyleSheet.create({
  container: {
    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
  },
  tagText: {
    color: isDark ? '#FFF' : '#047857',
    },
  iconColor: {
    color: isDark ? "#6EE7B7": "#047857",
  },  
  detailsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    gap: 14,
    backgroundColor: isDark ? '#1E293B' : 'transparent',
  },
  sectionLabel: {
    fontSize: 14,
    color: isDark ? '#E5E7EB' : '#374151',
    fontWeight: '500',
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#1E293B' : '#F9FAFB',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  stepNumberContainer: {
    backgroundColor: isDark ? '#10B981' : '#6EE7B7', // emerald-600
  },
  stepNumber: {
    color: '#fff',
  },
  stepName: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#F3F4F6' : '#2A2E43',
  },
  stepDuration: {
    fontSize: 14,
    color: isDark ? '#9CA3AF' : '#6B7280',
    marginTop: 4,
  },
});

export default RoutineScreen;
