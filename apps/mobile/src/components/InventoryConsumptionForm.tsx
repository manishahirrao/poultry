// PoultryPulse AI — Inventory Consumption Form
// File: apps/mobile/src/components/InventoryConsumptionForm.tsx
// Version: v1.0 | June 2026
// Design Reference: Design Addendum §15.3
// Task: TASK-050

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TextInput, Modal, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getDatabase } from '../lib/database';
import { InventoryItem, InventoryConsumption } from '../database/schema';
import { Q } from '@nozbe/watermelondb';
import { Alert } from 'react-native';

interface InventoryConsumptionFormProps {
  visible: boolean;
  onClose: () => void;
  preselectedItemId?: string;
  preselectedItemName?: string;
  shedId: string;
  batchId?: string;
  onSuccess: () => void;
}

/**
 * Inventory Consumption Form Component
 * Allows supervisors to log inventory consumption after QR scan or manual selection
 * Design Addendum §15.3
 */
export default function InventoryConsumptionForm({
  visible,
  onClose,
  preselectedItemId,
  preselectedItemName,
  shedId,
  batchId,
  onSuccess,
}: InventoryConsumptionFormProps) {
  const { t } = useTranslation();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(preselectedItemId || null);
  const [selectedItemName, setSelectedItemName] = useState<string | null>(preselectedItemName || null);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [reason, setReason] = useState('');
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [db, setDb] = useState<any>(null);

  useEffect(() => {
    if (visible) {
      getDatabase().then(databaseInstance => {
        setDb(databaseInstance);
        loadInventoryItems(databaseInstance);
      });
    }
  }, [visible]);

  useEffect(() => {
    if (preselectedItemId && preselectedItemName) {
      setSelectedItemId(preselectedItemId);
      setSelectedItemName(preselectedItemName);
    }
  }, [preselectedItemId, preselectedItemName]);

  const loadInventoryItems = async (databaseInstance: any) => {
    setLoading(true);
    try {
      const collection = databaseInstance.get('inventory_items');
      const items = await collection.query().fetch();
      setInventoryItems(items);
    } catch (error) {
      console.error('Error loading inventory items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (item: any) => {
    setSelectedItemId(item.id);
    setSelectedItemName(item.name);
    setUnit(item.unit);
    setShowItemPicker(false);
  };

  const handleSubmit = async () => {
    if (!selectedItemId || !quantity || !shedId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const databaseInstance = db || await getDatabase();
      
      // Generate simple UUID
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      
      // Create inventory consumption record
      const consumptionCollection = databaseInstance.get('inventory_consumptions');
      await databaseInstance.write(async () => {
        await consumptionCollection.create((record: any) => {
          record.id = generateUUID();
          record.inventoryItemId = selectedItemId;
          record.batchId = batchId || null;
          record.quantity = parseFloat(quantity);
          record.unit = unit;
          record.reason = reason || 'Regular consumption';
          record.shedId = shedId;
          record.synced = false;
          record.createdAt = new Date();
          record.syncedAt = null;
        });
      });

      // Reset form
      setQuantity('');
      setReason('');
      setSelectedItemId(null);
      setSelectedItemName(null);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting consumption:', error);
      Alert.alert('Error', 'Failed to submit consumption. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>इन्वेंटरी उपभोग · Inventory Consumption</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Item Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>आइटम · Item</Text>
            <TouchableOpacity
              style={styles.itemSelector}
              onPress={() => setShowItemPicker(true)}
            >
              {selectedItemName ? (
                <Text style={styles.selectedItemText}>{selectedItemName}</Text>
              ) : (
                <Text style={styles.placeholderText}>Select item</Text>
              )}
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Quantity Input */}
          <View style={styles.section}>
            <Text style={styles.label}>मात्रा · Quantity</Text>
            <View style={styles.quantityContainer}>
              <TextInput
                style={styles.quantityInput}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="0"
                keyboardType="decimal-pad"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.unitLabel}>{unit}</Text>
            </View>
          </View>

          {/* Reason Input */}
          <View style={styles.section}>
            <Text style={styles.label}>कारण · Reason (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={reason}
              onChangeText={setReason}
              placeholder="Regular consumption"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Batch Info */}
          {batchId && (
            <View style={styles.section}>
              <Text style={styles.label}>बैच · Batch</Text>
              <Text style={styles.batchText}>{batchId}</Text>
            </View>
          )}

          {/* Shed Info */}
          <View style={styles.section}>
            <Text style={styles.label}>शेड · Shed</Text>
            <Text style={styles.shedText}>{shedId}</Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, (!selectedItemId || !quantity) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!selectedItemId || !quantity || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>दर्ज करें · Submit</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Item Picker Modal */}
        <Modal visible={showItemPicker} animationType="slide" transparent>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerContent}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Item</Text>
                <TouchableOpacity onPress={() => setShowItemPicker(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              {loading ? (
                <View style={styles.pickerLoading}>
                  <ActivityIndicator size="large" color="#1A6B3C" />
                </View>
              ) : (
                <ScrollView style={styles.itemList}>
                  {inventoryItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.itemRow,
                        selectedItemId === item.id && styles.itemRowSelected,
                      ]}
                      onPress={() => handleItemSelect(item)}
                    >
                      <View>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemCategory}>{item.category}</Text>
                      </View>
                      <Text style={styles.itemStock}>{item.currentStock} {item.unit}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAF8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#1A6B3C',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C2B22',
    marginBottom: 8,
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  itemSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedItemText: {
    fontSize: 16,
    color: '#1C2B22',
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontFamily: 'NotoSansDevanagari-Regular',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quantityInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#1C2B22',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  unitLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
    color: '#1C2B22',
    fontFamily: 'NotoSansDevanagari-Regular',
  },
  batchText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  shedText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A6B3C',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C2B22',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  pickerLoading: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  itemList: {
    maxHeight: 400,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemRowSelected: {
    backgroundColor: '#ECFDF5',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C2B22',
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  itemCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'NotoSansDevanagari-Regular',
  },
  itemStock: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A6B3C',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
});
