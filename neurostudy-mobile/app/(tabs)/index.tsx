import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Card from '../../components/Card';
import { Colors } from '@/constants/colors';
import { studyService } from '../../services/studyService';
import { useAuth } from '@/contexts/authContext';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [recentSessions, setRecentSessions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRecentSessions();
  }, []);

  const loadRecentSessions = async () => {
    try {
      const sessions = await studyService.getRecentSessions();
      setRecentSessions(sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecentSessions();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.full_name}! 👋</Text>
        <Text style={styles.subtitle}>Ready to learn something new?</Text>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/scan')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#4B4BFF20' }]}>
            <Ionicons name="camera" size={28} color={Colors.primary} />
          </View>
          <Text style={styles.actionTitle}>Scan Page</Text>
          <Text style={styles.actionSubtitle}>Take a photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/history')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#6EE6FF20' }]}>
            <Ionicons name="time" size={28} color={Colors.secondary} />
          </View>
          <Text style={styles.actionTitle}>History</Text>
          <Text style={styles.actionSubtitle}>View past scans</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Study Sessions</Text>

        {recentSessions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No study sessions yet</Text>
            <Text style={styles.emptySubtext}>
              Scan a textbook page to get started!
            </Text>
          </Card>
        ) : (
          recentSessions.map((session: any) => (
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
      </View>
    </ScrollView>
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
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 32,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
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
