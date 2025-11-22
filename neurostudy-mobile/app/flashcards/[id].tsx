import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { studyService } from '../../services/studyService';

const { width } = Dimensions.get('window');

export default function FlashcardsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const sessionId = params.id as string;
  
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      const result = await studyService.getStudySession(sessionId);
      setFlashcards(result.flashcards || []);
    } catch (error) {
      console.error('Failed to load flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    Animated.timing(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      flipAnim.setValue(0);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      flipAnim.setValue(0);
    }
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (flashcards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No flashcards available</Text>
      </View>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Flashcards</Text>
        <Text style={styles.counter}>
          {currentIndex + 1} / {flashcards.length}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentIndex + 1) / flashcards.length) * 100}%` },
          ]}
        />
      </View>

      {/* Flashcard */}
      <View style={styles.cardContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleFlip}
          style={styles.cardWrapper}
        >
          <Animated.View
            style={[
              styles.card,
              styles.cardFront,
              { transform: [{ rotateY: frontInterpolate }] },
            ]}
          >
            <Text style={styles.cardLabel}>Question</Text>
            <Text style={styles.cardText}>{currentCard.front}</Text>
            <Text style={styles.tapHint}>Tap to reveal answer</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              { transform: [{ rotateY: backInterpolate }] },
            ]}
          >
            <Text style={[styles.cardLabel, { color: Colors.white }]}>Answer</Text>
            <Text style={[styles.cardText, { color: Colors.white }]}>
              {currentCard.back}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          onPress={handlePrevious}
          disabled={currentIndex === 0}
          style={[
            styles.navButton,
            currentIndex === 0 && styles.navButtonDisabled,
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color={currentIndex === 0 ? Colors.textLight : Colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          style={[
            styles.navButton,
            currentIndex === flashcards.length - 1 &&
              styles.navButtonDisabled,
          ]}
        >
          <Ionicons
            name="chevron-forward"
            size={28}
            color={
              currentIndex === flashcards.length - 1
                ? Colors.textLight
                : Colors.primary
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    backgroundColor: Colors.white,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  counter: {
    fontSize: 16,
    color: Colors.textLight,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.white,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  cardWrapper: {
    width: width - 48,
    height: 400,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardFront: {},
  cardBack: {
    backgroundColor: Colors.primary,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  cardText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 32,
  },
  tapHint: {
    position: 'absolute',
    bottom: 32,
    fontSize: 14,
    color: Colors.textLight,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
});