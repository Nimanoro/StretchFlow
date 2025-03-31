import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ImageBackground, 
  Pressable, 
  ScrollView 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const RoutineScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { routine } = route.params; // routine now comes from the new JSON database

  // Use the steps array from the routine object in the database
  const steps = routine.steps;

  const renderStep = ({ item, index }) => (
    <View style={styles.stepCard}>
      <View style={styles.stepNumberContainer}>
        <Text style={styles.stepNumber}>{index + 1}</Text>
      </View>
      <View style={styles.stepInfo}>
        <Text style={styles.stepName}>{item.name}</Text>
        <Text style={styles.stepDuration}>{item.duration}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6EE7B7" />
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Header Image with Gradient Overlay */}
      <ImageBackground 
        source={require('../assets/logo.png')} // update this asset as needed
        style={styles.headerImage}
      >
        <LinearGradient 
          colors={['rgba(0,0,0,0.7)', 'transparent']}
          style={styles.gradientOverlay}
        />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{routine.title}</Text>
          <Text style={styles.headerSubtitle}>Stretch Routine</Text>
        </View>
      </ImageBackground>

      {/* Routine Details */}
      <View style={styles.routineDetails}>
        <Text style={styles.routineDescription}>{routine.description}</Text>
        <View style={styles.routineInfoRow}>
          <Text style={styles.routineInfo}>Duration: {routine.duration}</Text>
          <Text style={styles.routineInfo}>Difficulty: {routine.difficulty}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <FlatList
          data={steps}
          renderItem={renderStep}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.stepsList}
          scrollEnabled={false}
        />

        {/* Custom Styled Start Button */}
        <Pressable 
          style={styles.startButton} 
          onPress={() => navigation.navigate('Timer', { routine, stretches: steps })}
        >
          <Text style={styles.startButtonText}>Start Routine</Text>
        </Pressable>
      </View>
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContent: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ddd',
    marginTop: 4,
  },
  routineDetails: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F0F4F3',
  },
  routineDescription: {
    fontSize: 16,
    color: '#2A2E43',
    marginBottom: 10,
  },
  routineInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  routineInfo: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  stepsList: {
    paddingBottom: 20,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F3',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
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
    marginTop: 20,
    marginHorizontal: 20,
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default RoutineScreen;
