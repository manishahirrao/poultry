// PoultryPulse AI — Daily Mortality Form (Mobile)
// File: apps/mobile/src/components/DailyMortalityForm.tsx
// Version: v1.0 | May 2026
// TASK-038: Daily mortality entry form with stepper input

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Plus, Minus, Camera, Check } from 'phosphor-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { saveMortalityLogLocally } from '../lib/mortalityLogSync';

interface DailyMortalityFormProps {
  batchId: string;
  batchName: string;
  docPlacementDate: string;
  currentBirdCount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MORTALITY_CAUSES = [
  { id: 'unknown', label: 'अज्ञात', labelEn: 'Unknown' },
  { id: 'respiratory', label: 'श्वसन', labelEn: 'Respiratory' },
  { id: 'digestive', label: 'पेट', labelEn: 'Digestive' },
  { id: 'heat_stress', label: 'गर्मी', labelEn: 'Heat Stress' },
  { id: 'cold_stress', label: 'ठंड', labelEn: 'Cold Stress' },
  { id: 'injury', label: 'चोट', labelEn: 'Injury' },
  { id: 'predator', label: 'शिकारी', labelEn: 'Predator' },
  { id: 'other', label: 'अन्य', labelEn: 'Other' },
];

export default function DailyMortalityForm({
  batchId,
  batchName,
  docPlacementDate,
  currentBirdCount,
  onSuccess,
  onCancel,
}: DailyMortalityFormProps) {
  const [count, setCount] = useState(0);
  const [selectedCause, setSelectedCause] = useState('unknown');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate age at death
  const calculateAgeAtDeath = () => {
    const placementDate = new Date(docPlacementDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - placementDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleIncrement = () => {
    if (count < currentBirdCount) {
      setCount(count + 1);
    }
  };

  const handleDecrement = () => {
    if (count > 0) {
      setCount(count - 1);
    }
  };

  const handlePhotoUpload = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
      });

      if (result.assets && result.assets[0]) {
        setPhotoUri(result.assets[0].uri || null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select photo');
    }
  };

  const handleSubmit = async () => {
    if (count === 0) {
      Alert.alert('Required', 'कृपया मृत्यु की संख्या दर्ज करें');
      return;
    }

    setIsSubmitting(true);

    try {
      const ageAtDeath = calculateAgeAtDeath();
      const logDate = new Date().toISOString().split('T')[0];

      await saveMortalityLogLocally({
        batchId,
        logDate,
        count,
        cause: selectedCause,
        ageAtDeathDays: ageAtDeath,
        photoUrl: photoUri || undefined,
        notes: notes || undefined,
      });

      Alert.alert(
        'Success',
        `${batchName} - ${count} पक्षी दर्ज किए गए ✅`,
        [
          {
            text: 'OK',
            onPress: () => {
              setCount(0);
              setSelectedCause('unknown');
              setPhotoUri(null);
              setNotes('');
              onSuccess?.();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save mortality log');
      console.error('Error saving mortality log:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>आज की मृत्यु</Text>
        <Text style={styles.subtitle}>{batchName}</Text>
      </View>

      {/* Stepper Input */}
      <View style={styles.stepperContainer}>
        <Text style={styles.label}>कितने पक्षी मरे?</Text>
        <View style={styles.stepper}>
          <TouchableOpacity
            style={[styles.stepperButton, count === 0 && styles.stepperButtonDisabled]}
            onPress={handleDecrement}
            disabled={count === 0}
          >
            <Minus size={32} weight="bold" color={count === 0 ? '#9CA3AF' : '#1F2937'} />
          </TouchableOpacity>
          
          <View style={styles.countDisplay}>
            <Text style={styles.countText}>{count}</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.stepperButton, count >= currentBirdCount && styles.stepperButtonDisabled]}
            onPress={handleIncrement}
            disabled={count >= currentBirdCount}
          >
            <Plus size={32} weight="bold" color={count >= currentBirdCount ? '#9CA3AF' : '#1F2937'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Cause Selection */}
      <View style={styles.causeContainer}>
        <Text style={styles.label}>कारण:</Text>
        <View style={styles.causeGrid}>
          {MORTALITY_CAUSES.map((cause) => (
            <TouchableOpacity
              key={cause.id}
              style={[
                styles.causeButton,
                selectedCause === cause.id && styles.causeButtonSelected,
              ]}
              onPress={() => setSelectedCause(cause.id)}
            >
              <Text
                style={[
                  styles.causeButtonText,
                  selectedCause === cause.id && styles.causeButtonTextSelected,
                ]}
              >
                {cause.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Photo Upload */}
      <View style={styles.photoContainer}>
        <TouchableOpacity style={styles.photoButton} onPress={handlePhotoUpload}>
          <Camera size={24} color="#6B7280" />
          <Text style={styles.photoButtonText}>
            {photoUri ? 'फोटो बदलें' : '📷 फोटो (वैकल्पिक)'}
          </Text>
        </TouchableOpacity>
        {photoUri && (
          <View style={styles.photoPreview}>
            <Check size={16} color="#10B981" />
            <Text style={styles.photoPreviewText}>फोटो चुना गया</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {onCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>रद्द करें</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.submitButton, count === 0 && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={count === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>✓ दर्ज करें</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  stepperContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 8,
  },
  stepperButton: {
    width: 56,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stepperButtonDisabled: {
    opacity: 0.5,
  },
  countDisplay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
  },
  causeContainer: {
    marginBottom: 24,
  },
  causeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  causeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  causeButtonSelected: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  causeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  causeButtonTextSelected: {
    color: '#FFFFFF',
  },
  photoContainer: {
    marginBottom: 24,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  photoPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    padding: 8,
    backgroundColor: '#D1FAE5',
    borderRadius: 6,
  },
  photoPreviewText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    flex: 2,
    paddingVertical: 16,
    backgroundColor: '#10B981',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
