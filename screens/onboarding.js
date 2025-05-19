import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Image,
  Keyboard,
  Alert,
  useWindowDimensions,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { saveUserData } from '../utils/userStorage';
import { Ionicons } from '@expo/vector-icons';

import build from '../assets/build.png';
import desk from '../assets/desk.png';

const slides = [
  {
    key: '1',
    title: 'Build Stretching Routines',
    description: 'Customize your own flows tailored to your body, time, and energy.',
    image: build,
  },
  {
    key: '2',
    title: 'Track Progress & Streaks',
    description: 'Stay consistent and motivated with daily streaks and history.',
    image: null, // optional: add image later or leave blank
    icon: "flame",
  },
  {
    key: '3',
    title: 'Voice-Guided Sessions',
    description: 'Follow relaxing, clear audio instructions while you stretch.',
    image: desk,
  },
];

export default function OnboardingScreen({ navigation }) {
  const [name, setName] = useState('');
  const [showSlides, setShowSlides] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const carouselRef = useRef(null);
  const indexRef = useRef(0);
  const { width } = useWindowDimensions();

  const handleContinue = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Hold on!', 'Please enter your name to continue.');
      return;
    }

    await saveUserData({
      userName: trimmedName,
      streak: 0,
      lastCompleted: null,
      lastRoutine: null,
      history: {},
    });

    Keyboard.dismiss();
    setShowSlides(true);
  };

  const handleNext = () => {
    const nextIndex = indexRef.current + 1;

    if (nextIndex < slides.length) {
      indexRef.current = nextIndex;
      setCurrentIndex(nextIndex);
      carouselRef.current?.scrollTo({ index: nextIndex, animated: true });
    } else {
      navigation.replace('Tabs', { screen: 'Home' });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {!showSlides ? (
          <>
            <Text style={styles.title}>Welcome to StretchFlow 👋</Text>
            <Text style={styles.subtitle}>What should we call you?</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
            <Pressable style={styles.button} onPress={handleContinue}>
              <Text style={styles.buttonText}>Continue</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Carousel
              ref={carouselRef}
              mode="parallax"
              width={width}
              height={500}
              data={slides}
              scrollAnimationDuration={600}
              onSnapToItem={(index) => {
                indexRef.current = index;
                setCurrentIndex(index);
              }}
              renderItem={({ item }) => (
                <View key={item.key} style={[styles.slideCard, { width: width * 0.85 }]}>
                  <Text style={styles.slideTitle}>{item.title}</Text>
                  <Text style={styles.slideDescription}>{item.description}</Text>
                  {item.image && (
                    <Image
                      source={item.image}
                      style={styles.slideImage}
                      resizeMode="contain"
                    />
                  )}
                  {item.icon && (
  <View style={styles.iconWrapper}>
    <Ionicons name={item.icon} size={100} marginTop={150} color="#F97316" />
  </View>
)}
                </View>
              )}
            />

            <View style={styles.dotsContainer}>
              {slides.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    currentIndex === i && styles.activeDot,
                  ]}
                />
              ))}
            </View>

            <Pressable style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>
                {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </Pressable>
          </>
        )}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#047857',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    color: '#374151',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    width: '100%',
    borderColor: '#A7F3D0',
    borderWidth: 1.5,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#047857',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  slideCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 24,
    marginTop: 40,
    marginBottom: 16,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#047857',
    marginBottom: 8,
    textAlign: 'center',
  },
  slideDescription: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
  },
  slideImage: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    marginTop: 24,
    backgroundColor: '#fff',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1FAE5',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#047857',
    width: 12,
    height: 12,
  },
});
