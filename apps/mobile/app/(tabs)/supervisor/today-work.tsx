// PoultryPulse AI — Supervisor Today's Work Screen
// File: apps/mobile/app/(tabs)/supervisor/today-work.tsx
// Version: v1.0 | June 2026
// Design Reference: Design Addendum §15.2
// Task: TASK-045, TASK-050, TASK-055

import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../src/lib/supabase';
import QRInventoryScanner from '../../../src/components/QRInventoryScanner';
import InventoryConsumptionForm from '../../../src/components/InventoryConsumptionForm';
import { getSyncStatus, formatOldestTimestamp, setupAutoSync, type SyncStatus } from '../../../src/lib/offlineQueueManager';

interface Task {
  id: string;
  taskType: string;
  batchId?: string;
  shedId: string;
  status: 'pending' | 'completed' | 'missed';
  completedAt?: string;
}

interface SupervisorInfo {
  id: string;
  name: string;
  assignedSheds: string[];
}

/**
 * Today's Work Screen for Supervisors
 * Shows checklist of assigned daily tasks with completion status
 * Design Addendum §15.2
 * TASK-055: Optimized for < 1 second cold start render
 */
export default function TodayWorkScreen() {
  const { t } = useTranslation();
  const [supervisorInfo, setSupervisorInfo] = useState<SupervisorInfo | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    totalPending: 0,
    oldestPendingTimestamp: null,
    byType: {
      health_checklist: 0,
      mortality_log: 0,
      feed_log: 0,
      inventory_consumption: 0,
    },
  });
  
  // TASK-050: QR Scanner and Inventory Consumption state
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showConsumptionForm, setShowConsumptionForm] = useState(false);
  const [scannedItemId, setScannedItemId] = useState<string | null>(null);
  const [scannedItemName, setScannedItemName] = useState<string | null>(null);
  const [selectedShedForConsumption, setSelectedShedForConsumption] = useState<string | null>(null);

  // TASK-055: Performance optimization - use useCallback for expensive operations
  const loadSupervisorData = useCallback(async () => {
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
        setSupervisorInfo(supervisor);

        // Fetch today's tasks
        const today = new Date().toISOString().split('T')[0];
        const { data: tasksData } = await supabase
          .from('supervisor_daily_tasks')
          .select('*')
          .eq('supervisor_id', supervisor.id)
          .eq('task_date', today)
          .order('task_type');

        if (tasksData && tasksData.length > 0) {
          setTasks(tasksData);
        } else {
          // Create default tasks for today if none exist
          await createDefaultTasks(supervisor.id, supervisor.assigned_sheds, today);
        }

        // TASK-055: Use unified sync status from offline queue manager
        const status = await getSyncStatus();
        setSyncStatus(status);
      }
    } catch (error) {
      console.error('Error loading supervisor data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // TASK-055: Setup auto-sync on mount
  useEffect(() => {
    const unsubscribe = setupAutoSync();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // TASK-055: Initial data load
  useEffect(() => {
    loadSupervisorData();
  }, [loadSupervisorData]);

  const createDefaultTasks = async (supervisorId: string, sheds: string[], date: string) => {
    const defaultTasks: Array<{
      supervisor_id: string;
      task_date: string;
      task_type: string;
      shed_id: string;
      status: string;
    }> = [];
    
    sheds.forEach(shed => {
      defaultTasks.push({
        supervisor_id: supervisorId,
        task_date: date,
        task_type: 'health_checklist',
        shed_id: shed,
        status: 'pending'
      });
      defaultTasks.push({
        supervisor_id: supervisorId,
        task_date: date,
        task_type: 'mortality_log',
        shed_id: shed,
        status: 'pending'
      });
      defaultTasks.push({
        supervisor_id: supervisorId,
        task_date: date,
        task_type: 'feed_log',
        shed_id: shed,
        status: 'pending'
      });
    });

    const { data: createdTasks } = await supabase
      .from('supervisor_daily_tasks')
      .insert(defaultTasks)
      .select();

    if (createdTasks) {
      setTasks(createdTasks);
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('supervisor_daily_tasks')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (!error) {
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { ...task, status: 'completed', completedAt: new Date().toISOString() }
            : task
        ));
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case 'health_checklist':
        return 'heart';
      case 'mortality_log':
        return 'skull';
      case 'feed_log':
        return 'restaurant';
      case 'water_reading':
        return 'water';
      default:
        return 'list';
    }
  };

  const getTaskLabel = (taskType: string) => {
    switch (taskType) {
      case 'health_checklist':
        return 'Health Checklist';
      case 'mortality_log':
        return 'Mortality Log';
      case 'feed_log':
        return 'Feed Log';
      case 'water_reading':
        return 'Water Reading';
      default:
        return taskType;
    }
  };

  // TASK-050: QR Scanner handlers
  const handleQRScanSuccess = (itemId: string, itemName: string) => {
    setScannedItemId(itemId);
    setScannedItemName(itemName);
    setShowQRScanner(false);
    
    // If supervisor has only one shed, auto-select it
    if (supervisorInfo && supervisorInfo.assignedSheds.length === 1) {
      setSelectedShedForConsumption(supervisorInfo.assignedSheds[0]);
      setShowConsumptionForm(true);
    } else {
      // Show shed selection (simplified - just use first shed for now)
      setSelectedShedForConsumption(supervisorInfo?.assignedSheds[0] || null);
      setShowConsumptionForm(true);
    }
  };

  const handleOpenQRScanner = () => {
    if (supervisorInfo && supervisorInfo.assignedSheds.length > 0) {
      setSelectedShedForConsumption(supervisorInfo.assignedSheds[0]);
      setShowQRScanner(true);
    } else {
      Alert.alert('Error', 'No sheds assigned');
    }
  };

  const handleConsumptionSuccess = async () => {
    setShowConsumptionForm(false);
    setScannedItemId(null);
    setScannedItemName(null);
    // TASK-055: Refresh sync status using unified queue manager
    const status = await getSyncStatus();
    setSyncStatus(status);
  };

  const handleManualInventoryEntry = () => {
    setShowConsumptionForm(true);
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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.supervisorName}>{supervisorInfo?.name || 'Supervisor'}</Text>
        </View>
        <View style={styles.shedBadges}>
          {supervisorInfo?.assignedSheds.slice(0, 2).map((shed, idx) => (
            <View key={idx} style={styles.shedBadge}>
              <Text style={styles.shedBadgeText}>{shed}</Text>
            </View>
          ))}
          {supervisorInfo && supervisorInfo.assignedSheds.length > 2 && (
            <View style={styles.shedBadge}>
              <Text style={styles.shedBadgeText}>+{supervisorInfo.assignedSheds.length - 2}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Sync Status Bar */}
      <View style={[
        styles.syncBar,
        syncStatus.totalPending > 0 ? styles.syncBarPending : styles.syncBarSynced
      ]}>
        <Ionicons 
          name={syncStatus.totalPending > 0 ? 'cloud-outline' : 'cloud-done'} 
          size={16} 
          color={syncStatus.totalPending > 0 ? '#F59E0B' : '#10B981'} 
        />
        <Text style={[
          styles.syncText,
          syncStatus.totalPending > 0 ? styles.syncTextPending : styles.syncTextSynced
        ]}>
          {syncStatus.totalPending > 0 
            ? `${syncStatus.totalPending} records pending sync • ${formatOldestTimestamp(syncStatus.oldestPendingTimestamp)}` 
            : 'All synced'}
        </Text>
      </View>

      {/* Tasks List */}
      <ScrollView style={styles.tasksContainer}>
        <Text style={styles.sectionTitle}>Today's Work</Text>
        
        {tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            <Text style={styles.emptyText}>All work completed! 🎉</Text>
          </View>
        ) : (
          tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={[
                styles.taskCard,
                task.status === 'completed' && styles.taskCardCompleted
              ]}
              onPress={() => task.status === 'pending' && handleTaskComplete(task.id)}
              disabled={task.status === 'completed'}
            >
              <View style={styles.taskLeft}>
                <View style={[
                  styles.taskIcon,
                  task.status === 'completed' && styles.taskIconCompleted
                ]}>
                  <Ionicons 
                    name={getTaskIcon(task.taskType) as any} 
                    size={24} 
                    color={task.status === 'completed' ? '#FFFFFF' : '#1A6B3C'} 
                  />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={[
                    styles.taskLabel,
                    task.status === 'completed' && styles.taskLabelCompleted
                  ]}>
                    {getTaskLabel(task.taskType)}
                  </Text>
                  <Text style={styles.taskShed}>{task.shedId}</Text>
                </View>
              </View>
              <View style={styles.taskRight}>
                {task.status === 'completed' ? (
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                ) : (
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>Pending</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* TASK-050: QR Scanner FAB */}
      <TouchableOpacity style={styles.qrFab} onPress={handleOpenQRScanner}>
        <Ionicons name="qr-code" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* TASK-050: QR Scanner Modal */}
      <QRInventoryScanner
        visible={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScanSuccess={handleQRScanSuccess}
        shedId={selectedShedForConsumption || ''}
      />

      {/* TASK-050: Inventory Consumption Form Modal */}
      <InventoryConsumptionForm
        visible={showConsumptionForm}
        onClose={() => {
          setShowConsumptionForm(false);
          setScannedItemId(null);
          setScannedItemName(null);
        }}
        preselectedItemId={scannedItemId || undefined}
        preselectedItemName={scannedItemName || undefined}
        shedId={selectedShedForConsumption || ''}
        onSuccess={handleConsumptionSuccess}
      />
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
  greeting: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'NotoSansDevanagari-Regular',
  },
  supervisorName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C2B22',
    fontFamily: 'NotoSansDevanagari-Bold',
    marginTop: 4,
  },
  shedBadges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  shedBadge: {
    backgroundColor: '#1A6B3C',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  shedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  syncBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    margin: 16,
    borderRadius: 8,
  },
  syncBarPending: {
    backgroundColor: '#FEF3C7',
  },
  syncBarSynced: {
    backgroundColor: '#D1FAE5',
  },
  syncText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  syncTextPending: {
    color: '#92400E',
  },
  syncTextSynced: {
    color: '#065F46',
  },
  tasksContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C2B22',
    fontFamily: 'NotoSansDevanagari-Bold',
    marginBottom: 16,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  taskCardCompleted: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskIconCompleted: {
    backgroundColor: '#10B981',
  },
  taskInfo: {
    flex: 1,
  },
  taskLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C2B22',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  taskLabelCompleted: {
    color: '#065F46',
  },
  taskShed: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'NotoSansDevanagari-Regular',
    marginTop: 2,
  },
  taskRight: {
    alignItems: 'center',
  },
  pendingBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'NotoSansDevanagari-Medium',
    marginTop: 16,
  },
  qrFab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1A6B3C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
