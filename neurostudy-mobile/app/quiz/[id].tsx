import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Colors } from '@/constants/colors';
import { studyService } from '../../services/studyService';

export default function QuizScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const sessionId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    try {
      const result = await studyService.getStudySession(sessionId);
      setQuestions(result.quiz_questions || []);
    } catch (error) {
      console.error('Failed to load quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (!showExplanation) {
      setSelectedAnswer(answer);
      setShowExplanation(true);
      
      if (answer === questions[currentQuestion].correct_answer) {
        setScore(score + 1);
      }
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizComplete(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No quiz questions available</Text>
      </View>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Quiz Complete!</Text>
        </View>

        <View style={styles.resultContainer}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreText}>{percentage}%</Text>
          </View>
          
          <Text style={styles.scoreLabel}>
            You scored {score} out of {questions.length}
          </Text>

          {percentage >= 80 && (
            <Text style={styles.congratsText}>🎉 Excellent work!</Text>
          )}
          {percentage >= 60 && percentage < 80 && (
            <Text style={styles.congratsText}>👍 Good job!</Text>
          )}
          {percentage < 60 && (
            <Text style={styles.congratsText}>📚 Keep practicing!</Text>
          )}

          <View style={styles.resultActions}>
            <Button
              title="Retry Quiz"
              onPress={handleRetry}
              style={styles.actionButton}
            />
            <Button
              title="Back to Results"
              onPress={() => router.back()}
              variant="outline"
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    );
  }

  const question = questions[currentQuestion];
  const options = Object.entries(question.options);

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
        <Text style={styles.title}>Quiz</Text>
        <Text style={styles.counter}>
          {currentQuestion + 1} / {questions.length}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentQuestion + 1) / questions.length) * 100}%` },
          ]}
        />
      </View>

      <ScrollView style={styles.content}>
        {/* Question */}
        <Card style={styles.questionCard}>
          <Text style={styles.questionText}>{question.question}</Text>
        </Card>

        {/* Options */}
        {options.map(([key, value]) => {
          const isSelected = selectedAnswer === key;
          const isCorrect = key === question.correct_answer;
          const showResult = showExplanation;

          let optionStyle = styles.option;
          if (showResult && isCorrect) {
            optionStyle = styles.optionCorrect;
          } else if (showResult && isSelected && !isCorrect) {
            optionStyle = styles.optionWrong;
          }

          return (
            <TouchableOpacity
              key={key}
              style={[styles.option, optionStyle]}
              onPress={() => handleAnswerSelect(key)}
              disabled={showExplanation}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionKey}>{key}</Text>
                <Text style={styles.optionText}>{value as string}</Text>
              </View>
              {showResult && isCorrect && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
              )}
              {showResult && isSelected && !isCorrect && (
                <Ionicons name="close-circle" size={24} color={Colors.error} />
              )}
            </TouchableOpacity>
          );
        })}

        {/* Explanation */}
        {showExplanation && (
          <Card style={styles.explanationCard}>
            <Text style={styles.explanationTitle}>Explanation</Text>
            <Text style={styles.explanationText}>
              {question.explanation}
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Next Button */}
      {showExplanation && (
        <View style={styles.footer}>
          <Button
            title={
              currentQuestion < questions.length - 1
                ? 'Next Question'
                : 'Finish Quiz'
            }
            onPress={handleNext}
          />
        </View>
      )}
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
  content: {
    flex: 1,
    padding: 16,
  },
  questionCard: {
    marginBottom: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 26,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  optionCorrect: {
    borderColor: Colors.success,
    backgroundColor: '#10B98110',
  },
  optionWrong: {
    borderColor: Colors.error,
    backgroundColor: '#EF444410',
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionKey: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginRight: 12,
    minWidth: 24,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
  },
  explanationCard: {
    marginTop: 8,
    backgroundColor: Colors.primary + '10',
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.white,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.white,
  },
  scoreLabel: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 16,
  },
  congratsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 32,
  },
  resultActions: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    marginBottom: 0,
  },
});