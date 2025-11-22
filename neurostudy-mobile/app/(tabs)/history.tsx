import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import { Colors } from '@/constants/colors';
import { studyService } from '../../services/studyService';

export default function HistoryScreen() {
  const [sessions, setSessions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await studyService.getRecentSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Study History</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {sessions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="folder-open-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>No study sessions yet</Text>
            <Text style={styles.emptySubtext}>
              Your scanned pages will appear here
            </Text>
          </Card>
        ) : (
          sessions.map((session: any) => (
            <Card
              key={session.id}
              style={styles.sessionCard}
              onPress={() => router.push(`/results/${session.id}`)}
            >
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionTitle}>
                  {session.title || 'Study Session'}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.textLight}
                />
              </View>
              <Text style={styles.sessionTopic}>{session.topic}</Text>
              <Text style={styles.sessionDate}>
                {new Date(session.created_at).toLocaleDateString()}
              </Text>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyCard: {
    padding: 48,
    alignItems: 'center',
    marginTop: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  sessionCard: {
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  sessionTopic: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
});