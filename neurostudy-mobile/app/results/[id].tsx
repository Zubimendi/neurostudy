import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Colors } from '@/constants/colors';
import { studyService } from '../../services/studyService';

export default function ResultsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const sessionId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const result = await studyService.getStudySession(sessionId);
      setData(result);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const tabs = [
    { id: 'summary', label: 'Summary', icon: 'document-text' },
    { id: 'explanation', label: 'Explain', icon: 'bulb' },
    { id: 'concepts', label: 'Concepts', icon: 'list' },
  ];

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
        <Text style={styles.title}>{data?.topic || 'Study Results'}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.id ? Colors.primary : Colors.textLight}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'summary' && (
          <View>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Quick Summary</Text>
              <Text style={styles.cardContent}>
                {data?.short_summary}
              </Text>
            </Card>

            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Detailed Summary</Text>
              <Text style={styles.cardContent}>
                {data?.detailed_summary}
              </Text>
            </Card>
          </View>
        )}

        {activeTab === 'explanation' && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Simplified Explanation</Text>
            <Text style={styles.cardContent}>
              {data?.simplified_explanation}
            </Text>
          </Card>
        )}

        {activeTab === 'concepts' && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Key Concepts</Text>
            {data?.key_concepts?.map((concept: string, index: number) => (
              <View key={index} style={styles.conceptItem}>
                <View style={styles.conceptBullet} />
                <Text style={styles.conceptText}>{concept}</Text>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          title="Practice Flashcards"
          onPress={() => router.push(`/flashcards/${sessionId}`)}
          style={styles.actionButton}
        />
        <Button
          title="Take Quiz"
          onPress={() => router.push(`/quiz/${sessionId}`)}
          variant="outline"
          style={styles.actionButton}
        />
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  cardContent: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  conceptItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  conceptBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
    marginRight: 12,
  },
  conceptText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  actions: {
    padding: 16,
    backgroundColor: Colors.white,
    gap: 12,
  },
  actionButton: {
    marginBottom: 0,
  },
});
