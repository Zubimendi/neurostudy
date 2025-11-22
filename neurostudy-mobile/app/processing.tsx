import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/colors';
import { studyService } from '../services/studyService';

export default function ProcessingScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { sessionId, imageUrl } = params as { sessionId: string; imageUrl: string };
  
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Uploading...');
  const fadeAnim = new Animated.Value(0);

  const steps = [
    'Analyzing image...',
    'Extracting text...',
    'Generating summaries...',
    'Creating flashcards...',
    'Building quiz...',
    'Almost done...',
  ];

  useEffect(() => {
    processImage();
    animateProgress();
  }, []);

  const animateProgress = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const processImage = async () => {
    try {
      let stepIndex = 0;
      
      const progressInterval = setInterval(() => {
        if (stepIndex < steps.length) {
          setCurrentStep(steps[stepIndex]);
          setProgress(((stepIndex + 1) / steps.length) * 100);
          stepIndex++;
        }
      }, 2000);

      await studyService.processImage(sessionId, imageUrl);

      clearInterval(progressInterval);
      setProgress(100);
      setCurrentStep('Complete!');

      setTimeout(() => {
        router.replace(`/results/${sessionId}`);
      }, 500);

    } catch (error) {
      console.error('Processing failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        
        <Text style={styles.title}>Processing Your Content</Text>
        <Text style={styles.step}>{currentStep}</Text>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>

        <Text style={styles.hint}>
          This usually takes 10-15 seconds...
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  step: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 32,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.white,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  progressText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
  },
  hint: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 24,
    textAlign: 'center',
  },
});
