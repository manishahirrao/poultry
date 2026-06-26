// PoultryPulse AI — Supervisor My Reports Screen
// File: apps/mobile/app/(tabs)/supervisor/my-reports.tsx
// Version: v1.0 | June 2026
// Design Reference: Design Addendum §15.2
// Task: TASK-045

import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../src/lib/supabase';

interface SubmissionRecord {
  date: string;
  healthChecklist: boolean;
  mortalityLog: boolean;
  feedLog: boolean;
  waterReading: boolean;
}

/**
 * My Reports Screen for Supervisors
 * Shows last 7 days of submissions with sync status
 * Design Addendum §15.2
 */
export default function MyReportsScreen() {
  const { t } = useTranslation();
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissionHistory();
  }, []);

  const loadSubmissionHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch supervisor info
      const { data: supervisor } = await supabase
        .from('supervisors')
        .select('*')
        .eq('supervisor_user_id', user.id)
        .eq('is_active', true)
        .single();

      if (supervisor) {
        // Fetch last 7 days of tasks
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);

        const { data: tasksData } = await supabase
          .from('supervisor_daily_tasks')
          .select('*')
          .eq('supervisor_id', supervisor.id)
          .gte('task_date', startDate.toISOString().split('T')[0])
          .lte('task_date', endDate.toISOString().split('T')[0])
          .order('task_date', { ascending: false });

        // Group tasks by date
        const submissionsMap = new Map<string, SubmissionRecord>();

        tasksData?.forEach(task => {
          const date = task.task_date;
          if (!submissionsMap.has(date)) {
            submissionsMap.set(date, {
              date,
              healthChecklist: false,
              mortalityLog: false,
              feedLog: false,
              waterReading: false
            });
          }

          const record = submissionsMap.get(date)!;
          switch (task.task_type) {
            case 'health_checklist':
              record.healthChecklist = task.status === 'completed';
              break;
            case 'mortality_log':
              record.mortalityLog = task.status === 'completed';
              break;
            case 'feed_log':
              record.feedLog = task.status === 'completed';
              break;
            case 'water_reading':
              record.waterReading = task.status === 'completed';
              break;
          }
        });

        // Fill missing dates
        const submissions: SubmissionRecord[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          if (submissionsMap.has(dateStr)) {
            submissions.push(submissionsMap.get(dateStr)!);
          } else {
            submissions.push({
              date: dateStr,
              healthChecklist: false,
              mortalityLog: false,
              feedLog: false,
              waterReading: false
            });
          }
        }

        setSubmissions(submissions);
      }
    } catch (error) {
      console.error('Error loading submission history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }
  };

  const getCompletionPercentage = (record: SubmissionRecord) => {
    const tasks = ['healthChecklist', 'mortalityLog', 'feedLog', 'waterReading'];
    const completed = tasks.filter(task => record[task as keyof SubmissionRecord]).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage === 100) return '#10B981';
    if (percentage >= 50) return '#F59E0B';
    return '#EF4444';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A6B3C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Reports</Text>
        <Text style={styles.headerSubtitle}>Submitted reports from last 7 days</Text>
      </View>

      <ScrollView style={styles.content}>
        {submissions.map((record) => {
          const percentage = getCompletionPercentage(record);
          const color = getCompletionColor(percentage);

          return (
            <View key={record.date} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordDate}>{formatDate(record.date)}</Text>
                <View style={[styles.completionBadge, { backgroundColor: color + '20' }]}>
                  <Text style={[styles.completionText, { color }]}>
                    {percentage}%
                  </Text>
                </View>
              </View>

              <View style={styles.taskList}>
                <View style={styles.taskItem}>
                  <Ionicons 
                    name={record.healthChecklist ? 'checkmark-circle' : 'radio-button-off'} 
                    size={20} 
                    color={record.healthChecklist ? '#10B981' : '#D1D5DB'} 
                  />
                  <Text style={[
                    styles.taskLabel,
                    !record.healthChecklist && styles.taskLabelIncomplete
                  ]}>
                    Health Checklist
                  </Text>
                </View>

                <View style={styles.taskItem}>
                  <Ionicons 
                    name={record.mortalityLog ? 'checkmark-circle' : 'radio-button-off'} 
                    size={20} 
                    color={record.mortalityLog ? '#10B981' : '#D1D5DB'} 
                  />
                  <Text style={[
                    styles.taskLabel,
                    !record.mortalityLog && styles.taskLabelIncomplete
                  ]}>
                    Mortality Log
                  </Text>
                </View>

                <View style={styles.taskItem}>
                  <Ionicons 
                    name={record.feedLog ? 'checkmark-circle' : 'radio-button-off'} 
                    size={20} 
                    color={record.feedLog ? '#10B981' : '#D1D5DB'} 
                  />
                  <Text style={[
                    styles.taskLabel,
                    !record.feedLog && styles.taskLabelIncomplete
                  ]}>
                    Feed Log
                  </Text>
                </View>

                <View style={styles.taskItem}>
                  <Ionicons 
                    name={record.waterReading ? 'checkmark-circle' : 'radio-button-off'} 
                    size={20} 
                    color={record.waterReading ? '#10B981' : '#D1D5DB'} 
                  />
                  <Text style={[
                    styles.taskLabel,
                    !record.waterReading && styles.taskLabelIncomplete
                  ]}>
                    Water Reading
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAF8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAF8',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C2B22',
    fontFamily: 'NotoSansDevanagari-Bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'NotoSansDevanagari-Regular',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C2B22',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  completionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completionText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'NotoSansDevanagari-Bold',
  },
  taskList: {
    gap: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C2B22',
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  taskLabelIncomplete: {
    color: '#9CA3AF',
  },
});
