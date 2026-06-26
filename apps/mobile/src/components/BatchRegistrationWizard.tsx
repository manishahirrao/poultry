import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import breedStandards from '../lib/data/breedStandards.json';

interface BatchFormData {
  shedId: string;
  docPlacementDate: string;
  docCount: number;
  docSupplier: string;
  breed: string;
  targetHarvestWeightKg: number;
  initialFeedBrand: string;
  initialFeedType: string;
  initialFeedQuantity: number;
}

interface DocSupplier {
  id: string;
  name: string;
  location: string;
  avg_rating: number;
  total_batches_supplied: number;
}

type WizardStep = 1 | 2 | 3 | 4;

interface BatchRegistrationWizardProps {
  onSuccess?: (batchId: string) => void;
  onCancel?: () => void;
  initialShedId?: string;
}

export default function BatchRegistrationWizard({ 
  onSuccess, 
  onCancel,
  initialShedId = 'Shed 1'
}: BatchRegistrationWizardProps) {
  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
  );
  
  // Form state
  const [formData, setFormData] = useState<BatchFormData>({
    shedId: initialShedId,
    docPlacementDate: new Date().toISOString().split('T')[0],
    docCount: 25000,
    docSupplier: '',
    breed: breedStandards.default_breed,
    targetHarvestWeightKg: 2.2,
    initialFeedBrand: '',
    initialFeedType: 'starter',
    initialFeedQuantity: 0,
  });

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [loading, setLoading] = useState(false);
  const [docSuppliers, setDocSuppliers] = useState<DocSupplier[]>([]);
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdBatchId, setCreatedBatchId] = useState<string>('');
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  // Load DOC suppliers on mount and check network status
  useEffect(() => {
    loadDocSuppliers();
    checkPendingSync();
    
    // Network status monitoring
    const unsubscribe = () => {
      // In a real app, you'd use NetInfo here
      // For now, we'll assume online
      setIsOnline(true);
    };
    
    return unsubscribe;
  }, []);

  const checkPendingSync = async () => {
    try {
      const pending = await AsyncStorage.getItem('pending_batches');
      const pendingBatches = pending ? JSON.parse(pending) : [];
      setPendingSyncCount(pendingBatches.length);
    } catch (err) {
      console.error('Failed to check pending sync:', err);
    }
  };

  const saveBatchForSync = async (batchData: any) => {
    try {
      const pending = await AsyncStorage.getItem('pending_batches');
      const pendingBatches = pending ? JSON.parse(pending) : [];
      pendingBatches.push({
        ...batchData,
        timestamp: new Date().toISOString(),
        synced: false
      });
      await AsyncStorage.setItem('pending_batches', JSON.stringify(pendingBatches));
      setPendingSyncCount(pendingBatches.length);
    } catch (err) {
      console.error('Failed to save batch for sync:', err);
    }
  };

  const syncPendingBatches = async () => {
    try {
      const pending = await AsyncStorage.getItem('pending_batches');
      const pendingBatches: any[] = pending ? JSON.parse(pending) : [];
      
      if (pendingBatches.length === 0) return;

      const syncedBatches: any[] = [];
      
      for (const batch of pendingBatches) {
        try {
          // Attempt to sync each batch
          const { data, error } = await supabase
            .rpc('create_batch_with_id', {
              p_district: batch.district || 'UNK',
              p_doc_placement_date: batch.docPlacementDate,
              p_doc_count: batch.docCount,
              p_doc_supplier: batch.docSupplier,
              p_breed: batch.breed,
              p_target_harvest_weight_kg: batch.targetHarvestWeightKg,
              p_shed_id: batch.shedId,
              p_initial_feed_brand: batch.initialFeedBrand || null,
              p_initial_feed_type: batch.initialFeedType || null,
            });

          if (!error) {
            syncedBatches.push(batch);
          }
        } catch (err) {
          console.error('Failed to sync batch:', err);
        }
      }

      // Remove synced batches from pending
      const remainingBatches = pendingBatches.filter(
        (b: any) => !syncedBatches.some((s: any) => s.timestamp === b.timestamp)
      );
      
      await AsyncStorage.setItem('pending_batches', JSON.stringify(remainingBatches));
      setPendingSyncCount(remainingBatches.length);
      
    } catch (err) {
      console.error('Failed to sync pending batches:', err);
    }
  };

  const loadDocSuppliers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('doc_suppliers')
        .select('*')
        .eq('customer_id', user.id)
        .order('avg_rating', { ascending: false, nullsFirst: false });

      if (error) throw error;
      setDocSuppliers(data || []);
    } catch (err) {
      console.error('Failed to load DOC suppliers:', err);
    }
  };

  // Handle breed selection - auto-populate target weight
  const handleBreedChange = (breedName: string) => {
    const selectedBreed = breedStandards.breeds.find(b => b.name === breedName);
    if (selectedBreed) {
      setFormData(prev => ({
        ...prev,
        breed: breedName,
        targetHarvestWeightKg: selectedBreed.target_harvest_weight_kg,
      }));
    }
  };

  // Render star rating
  const renderStarRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push('⭐');
      } else if (i - 0.5 <= rating) {
        stars.push('✫');
      } else {
        stars.push('☆');
      }
    }
    return stars.join('');
  };

  // Validate current step
  const validateStep = (step: WizardStep): boolean => {
    switch (step) {
      case 1:
        if (!formData.shedId) {
          Alert.alert('Error', 'शेड चुनें (Select shed)');
          return false;
        }
        if (!formData.docPlacementDate) {
          Alert.alert('Error', 'DOC तारीख चुनें (Select DOC date)');
          return false;
        }
        if (formData.docCount < 1000 || formData.docCount > 100000) {
          Alert.alert('Error', 'DOC संख्या 1,000 से 100,000 के बीच होनी चाहिए');
          return false;
        }
        if (!formData.docSupplier.trim()) {
          Alert.alert('Error', 'DOC सप्लायर नाम दर्ज करें');
          return false;
        }
        return true;
      case 2:
        if (!formData.breed) {
          Alert.alert('Error', 'नस्ल चुनें (Select breed)');
          return false;
        }
        return true;
      case 3:
        return true; // Feed details are optional
      case 4:
        return true; // Confirmation step
      default:
        return false;
    }
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep((prev) => (prev + 1) as WizardStep);
      }
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  };

  // Form submission
  const handleSubmit = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get customer district for batch ID generation
      const { data: customerData } = await supabase
        .from('customers')
        .select('district')
        .eq('id', user.id)
        .single();

      const district = customerData?.district || 'UNK';

      // Check if offline - save for sync
      if (!isOnline) {
        await saveBatchForSync({
          district,
          ...formData,
          userId: user.id,
        });
        Alert.alert('Offline Mode', 'Batch saved for sync when connection is restored');
        setLoading(false);
        return;
      }

      // Call Supabase function to generate batch ID and create batch
      const { data: batchData, error: batchError } = await supabase
        .rpc('create_batch_with_id', {
          p_district: district,
          p_doc_placement_date: formData.docPlacementDate,
          p_doc_count: formData.docCount,
          p_doc_supplier: formData.docSupplier,
          p_breed: formData.breed,
          p_target_harvest_weight_kg: formData.targetHarvestWeightKg,
          p_shed_id: formData.shedId,
          p_initial_feed_brand: formData.initialFeedBrand || null,
          p_initial_feed_type: formData.initialFeedType || null,
        });

      if (batchError) throw batchError;

      // Save/update DOC supplier if new
      if (formData.docSupplier && !docSuppliers.find(s => s.name === formData.docSupplier)) {
        await supabase
          .from('doc_suppliers')
          .insert({
            customer_id: user.id,
            name: formData.docSupplier,
            total_batches_supplied: 1,
          });
      } else {
        // Update existing supplier batch count
        const existingSupplier = docSuppliers.find(s => s.name === formData.docSupplier);
        if (existingSupplier) {
          await supabase
            .from('doc_suppliers')
            .update({ 
              total_batches_supplied: existingSupplier.total_batches_supplied + 1 
            })
            .eq('id', existingSupplier.id);
        }
      }

      setCreatedBatchId(batchData);
      setSuccess(true);

      // Call success callback after delay
      setTimeout(() => {
        if (onSuccess) onSuccess(batchData);
      }, 2000);

    } catch (err) {
      // If network error, save for sync
      if (err instanceof Error && err.message.includes('network') || err instanceof Error && err.message.includes('fetch')) {
        await saveBatchForSync({
          ...formData,
          userId: (await supabase.auth.getUser()).data.user?.id,
        });
        Alert.alert('Offline Mode', 'Batch saved for sync when connection is restored');
      } else {
        Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create batch');
      }
    } finally {
      setLoading(false);
    }
  };

  // Progress indicator
  const renderProgressIndicator = () => {
    const steps = [1, 2, 3, 4];
    return (
      <View style={styles.progressIndicator}>
        {steps.map((step) => (
          <View key={step} style={styles.stepContainer}>
            <View
              style={[
                styles.stepCircle,
                currentStep >= step ? styles.stepCircleActive : styles.stepCircleInactive
              ]}
            >
              <Text style={[
                styles.stepText,
                currentStep >= step ? styles.stepTextActive : styles.stepTextInactive
              ]}>
                {currentStep > step ? '✓' : step}
              </Text>
            </View>
            {step < 4 && (
              <View
                style={[
                  styles.stepLine,
                  currentStep > step ? styles.stepLineActive : styles.stepLineInactive
                ]}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  // Success state
  if (success) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIconContainer}>
          <Ionicons name="checkmark-circle" size={32} color="#16a34a" />
        </View>
        <Text style={styles.successTitle}>
          बैच सफलतापूर्वक बनाया गया
        </Text>
        <Text style={styles.successBatchId}>
          {createdBatchId} बनाया गया ✅
        </Text>
        <Text style={styles.successSubtitle}>
          Batch created successfully
        </Text>
      </View>
    );
  }

  // Step 1: Batch Info
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>
        बैच जानकारी (Batch Info)
      </Text>

      <View style={styles.formSection}>
        <Text style={styles.label}>
          शेड नंबर · Shed Number
        </Text>
        <View style={styles.shedSelector}>
          {['Shed 1', 'Shed 2', 'Shed 3', 'Shed 4'].map((shed) => (
            <TouchableOpacity
              key={shed}
              onPress={() => setFormData(prev => ({ ...prev, shedId: shed }))}
              style={[
                styles.shedOption,
                formData.shedId === shed ? styles.shedOptionSelected : styles.shedOptionDefault,
                shed === 'Shed 4' && styles.lastOption
              ]}
            >
              <Text style={[
                styles.shedOptionText,
                formData.shedId === shed ? styles.shedOptionTextSelected : styles.shedOptionTextDefault
              ]}>
                {shed}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>
          DOC तारीख · DOC Placement Date
        </Text>
        <TextInput
          value={formData.docPlacementDate}
          onChangeText={(text) => setFormData(prev => ({ ...prev, docPlacementDate: text }))}
          placeholder="YYYY-MM-DD"
          style={styles.input}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>
          DOC संख्या · DOC Count (birds)
        </Text>
        <TextInput
          value={formData.docCount.toString()}
          onChangeText={(text) => setFormData(prev => ({ ...prev, docCount: Number(text) }))}
          placeholder="25000"
          keyboardType="numeric"
          style={styles.input}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>
          DOC सप्लायर · DOC Supplier
        </Text>
        <TextInput
          value={formData.docSupplier}
          onChangeText={(text) => setFormData(prev => ({ ...prev, docSupplier: text }))}
          placeholder="Enter supplier name..."
          style={styles.input}
        />
        {docSuppliers.length > 0 && (
          <View style={styles.supplierSuggestions}>
            <Text style={styles.supplierSuggestionsLabel}>Saved suppliers:</Text>
            {docSuppliers.slice(0, 3).map((supplier) => (
              <TouchableOpacity
                key={supplier.id}
                onPress={() => setFormData(prev => ({ ...prev, docSupplier: supplier.name }))}
                style={styles.supplierSuggestion}
              >
                <Text style={styles.supplierName}>{supplier.name}</Text>
                {supplier.avg_rating && (
                  <Text style={styles.supplierRating}>
                    {renderStarRating(supplier.avg_rating)} ({supplier.total_batches_supplied} batches)
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  // Step 2: Breed Selection
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>
        नस्ल (Breed)
      </Text>

      <View style={styles.breedSelector}>
        {breedStandards.breeds.map((breed, index) => (
          <TouchableOpacity
            key={breed.name}
            onPress={() => handleBreedChange(breed.name)}
            style={[
              styles.breedOption,
              formData.breed === breed.name ? styles.breedOptionSelected : styles.breedOptionDefault,
              index === breedStandards.breeds.length - 1 && styles.lastOption
            ]}
          >
            <Text style={[
              styles.breedOptionText,
              formData.breed === breed.name ? styles.breedOptionTextSelected : styles.breedOptionTextDefault
            ]}>
              {breed.name}
            </Text>
            <Text style={styles.breedOptionSubtext}>
              Target: {breed.target_harvest_weight_kg}kg · {breed.target_harvest_age_days} days
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.targetWeightContainer}>
        <Text style={styles.label}>
          टारगेट हार्वेस्ट वजन · Target Harvest Weight
        </Text>
        <View style={styles.targetWeightInputContainer}>
          <TextInput
            value={formData.targetHarvestWeightKg.toString()}
            onChangeText={(text) => setFormData(prev => ({ ...prev, targetHarvestWeightKg: Number(text) }))}
            keyboardType="decimal-pad"
            style={styles.targetWeightInput}
          />
          <Ionicons name="sparkles" size={20} color="#16a34a" style={styles.sparklesIcon} />
        </View>
        <Text style={styles.helperText}>
          Auto-populated from breed standard
        </Text>
      </View>
    </View>
  );

  // Step 3: Feed Details
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>
        चारा (Feed)
      </Text>

      <View style={styles.formSection}>
        <Text style={styles.label}>
          प्रारंभिक चारा ब्रांड · Initial Feed Brand
        </Text>
        <TextInput
          value={formData.initialFeedBrand}
          onChangeText={(text) => setFormData(prev => ({ ...prev, initialFeedBrand: text }))}
          placeholder="e.g., Godrej Agrovet"
          style={styles.input}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>
          चारा प्रकार · Feed Type
        </Text>
        <View style={styles.feedTypeSelector}>
          {['starter', 'grower', 'finisher', 'pre-starter'].map((type, index) => (
            <TouchableOpacity
              key={type}
              onPress={() => setFormData(prev => ({ ...prev, initialFeedType: type }))}
              style={[
                styles.feedTypeOption,
                formData.initialFeedType === type ? styles.feedTypeOptionSelected : styles.feedTypeOptionDefault,
                index === 3 && styles.lastOption
              ]}
            >
              <Text style={[
                styles.feedTypeOptionText,
                formData.initialFeedType === type ? styles.feedTypeOptionTextSelected : styles.feedTypeOptionTextDefault
              ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>
          स्टार्टर चारा · Starter Feed (kg)
        </Text>
        <TextInput
          value={formData.initialFeedQuantity.toString()}
          onChangeText={(text) => setFormData(prev => ({ ...prev, initialFeedQuantity: Number(text) }))}
          placeholder="0"
          keyboardType="numeric"
          style={styles.input}
        />
      </View>
    </View>
  );

  // Step 4: Confirmation
  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>
        पुष्टि (Confirm)
      </Text>

      <View style={styles.confirmationContainer}>
        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Batch ID:</Text>
          <Text style={styles.confirmationValue}>Will be generated</Text>
        </View>
        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Shed:</Text>
          <Text style={styles.confirmationValue}>{formData.shedId}</Text>
        </View>
        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>DOC Count:</Text>
          <Text style={styles.confirmationValue}>{formData.docCount.toLocaleString()} birds</Text>
        </View>
        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>DOC Date:</Text>
          <Text style={styles.confirmationValue}>{formData.docPlacementDate}</Text>
        </View>
        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Supplier:</Text>
          <Text style={styles.confirmationValue}>{formData.docSupplier}</Text>
        </View>
        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Breed:</Text>
          <Text style={styles.confirmationValue}>{formData.breed}</Text>
        </View>
        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Target Weight:</Text>
          <Text style={styles.confirmationValue}>{formData.targetHarvestWeightKg} kg</Text>
        </View>
        {formData.initialFeedBrand && (
          <View style={styles.confirmationRow}>
            <Text style={styles.confirmationLabel}>Feed Brand:</Text>
            <Text style={styles.confirmationValue}>{formData.initialFeedBrand}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        style={styles.submitButton}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>
            ✓ बैच शुरू करें
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          नया बैच दर्ज करें
        </Text>
        <Text style={styles.headerSubtitle}>
          Register new batch
        </Text>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {renderProgressIndicator()}
      </View>

      {/* Step Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        {currentStep > 1 && (
          <TouchableOpacity
            onPress={handlePrevious}
            style={styles.previousButton}
          >
            <Ionicons name="chevron-back" size={20} color="#374151" style={styles.chevronLeft} />
            <Text style={styles.previousButtonText}>पिछला</Text>
          </TouchableOpacity>
        )}
        {currentStep < 4 ? (
          <TouchableOpacity
            onPress={handleNext}
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>अगला</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" style={styles.chevronRight} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  progressContainer: {
    padding: 24,
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#16A34A',
  },
  stepCircleInactive: {
    backgroundColor: '#D1D5DB',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepTextActive: {
    color: '#FFFFFF',
  },
  stepTextInactive: {
    color: '#4B5563',
  },
  stepLine: {
    flex: 1,
    height: 4,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#16A34A',
  },
  stepLineInactive: {
    backgroundColor: '#D1D5DB',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  successIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#DCFCE7',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  successBatchId: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  stepContentContainer: {
    gap: 16,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  formSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  shedSelector: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  shedOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  shedOptionSelected: {
    backgroundColor: '#F0FDF4',
  },
  shedOptionDefault: {
    backgroundColor: '#FFFFFF',
  },
  shedOptionText: {
    fontWeight: '500',
  },
  shedOptionTextSelected: {
    color: '#15803D',
  },
  shedOptionTextDefault: {
    color: '#111827',
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  supplierSuggestions: {
    marginTop: 8,
  },
  supplierSuggestionsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  supplierSuggestion: {
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 4,
  },
  supplierName: {
    fontWeight: '500',
    color: '#111827',
  },
  supplierRating: {
    fontSize: 12,
    color: '#4B5563',
  },
  breedSelector: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  breedOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  breedOptionSelected: {
    backgroundColor: '#F0FDF4',
  },
  breedOptionDefault: {
    backgroundColor: '#FFFFFF',
  },
  breedOptionText: {
    fontWeight: '600',
  },
  breedOptionTextSelected: {
    color: '#15803D',
  },
  breedOptionTextDefault: {
    color: '#111827',
  },
  breedOptionSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  targetWeightContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  targetWeightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetWeightInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  feedTypeSelector: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  feedTypeOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  feedTypeOptionSelected: {
    backgroundColor: '#F0FDF4',
  },
  feedTypeOptionDefault: {
    backgroundColor: '#FFFFFF',
  },
  feedTypeOptionText: {
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  feedTypeOptionTextSelected: {
    color: '#15803D',
  },
  feedTypeOptionTextDefault: {
    color: '#111827',
  },
  confirmationContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmationLabel: {
    color: '#6B7280',
  },
  confirmationValue: {
    fontWeight: '600',
    color: '#111827',
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  navigationButtons: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    gap: 12,
  },
  previousButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  previousButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  chevronLeft: {
    marginRight: 8,
  },
  chevronRight: {
    marginLeft: 8,
  },
  sparklesIcon: {
    marginLeft: 8,
  },
});
