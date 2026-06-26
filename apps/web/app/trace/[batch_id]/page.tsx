'use client';

import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { CheckCircle, XCircle, Calendar, Scales, Bird, Shield, MapPin } from '@phosphor-icons/react';

// @ts-ignore - process is available in Node.js environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// @ts-ignore - process is available in Node.js environment
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseKey;

interface TraceabilityPageProps {
  params: Promise<{
    batch_id: string;
  }>;
}

async function getBatchData(batchId: string) {
  if (!isSupabaseConfigured) {
    console.warn('[Traceability] Supabase not configured, cannot fetch batch data');
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch batch by batch_id (not UUID)
  const { data: batch, error: batchError } = await supabase
    .from('batches')
    .select('*')
    .eq('batch_id', batchId)
    .single();

  if (batchError || !batch) {
    return null;
  }

  // Fetch vaccination schedules
  const { data: vaccinations } = await supabase
    .from('vaccination_schedules')
    .select('*')
    .eq('batch_id', batch.id)
    .order('scheduled_day', { ascending: true });

  // Fetch medication logs (to check for antibiotics)
  const { data: medications } = await supabase
    .from('medication_logs')
    .select('*')
    .eq('batch_id', batch.id);

  // Fetch mortality logs
  const { data: mortalityLogs } = await supabase
    .from('mortality_logs')
    .select('count')
    .eq('batch_id', batch.id);

  // Calculate total deaths
  const totalDeaths = mortalityLogs?.reduce((sum, log) => sum + (log.count || 0), 0) || 0;
  const cumulativeRate = batch.doc_count > 0 ? (totalDeaths / batch.doc_count) * 100 : 0;

  // Check for antibiotics
  const hasAntibiotics = medications?.some(med => med.is_antibiotic) || false;

  // Determine FSSAI status
  const fssaiStatus = hasAntibiotics ? 'Non-Compliant' : 'Compliant';

  return {
    batchId: batch.batch_id,
    farmDistrict: (batch as any).district || 'Unknown',
    breed: batch.breed,
    harvestDate: batch.actual_harvest_date ? new Date(batch.actual_harvest_date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : null,
    docSupplier: batch.doc_supplier || 'Unknown',
    docPlacementDate: new Date(batch.doc_placement_date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    docCount: batch.doc_count,
    currentBirdCount: batch.current_bird_count,
    averageWeight: batch.actual_harvest_weight_kg || batch.current_avg_weight_kg,
    fcr: batch.current_fcr,
    vaccinations: vaccinations?.map(vac => ({
      vaccineName: vac.vaccine_name,
      administeredDate: vac.administered_date ? new Date(vac.administered_date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }) : null,
      status: vac.status
    })) || [],
    hasAntibiotics,
    fssaiStatus,
    mortalityRate: cumulativeRate,
    buyerName: batch.buyer_name,
    generatedDate: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  };
}

export default async function TraceabilityPage({ params }: TraceabilityPageProps) {
  const { batch_id } = await params;
  const batchData = await getBatchData(batch_id);

  if (!batchData) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle size={64} weight="regular" className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Batch Not Found</h1>
          <p className="text-neutral-600">The traceability information for this batch could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-brand-green-600 rounded-xl flex items-center justify-center">
                  <Bird size={24} weight="bold" className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900">FlockIQ</h1>
                  <p className="text-sm text-neutral-500">Batch Traceability Verification</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-brand-green-600">{batchData.batchId}</p>
                <p className="text-sm text-neutral-500 mt-1">
                  Generated on {batchData.generatedDate}
                </p>
              </div>
            </div>
            
            <div className={`px-4 py-2 rounded-full font-semibold ${
              batchData.fssaiStatus === 'Compliant' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {batchData.fssaiStatus === 'Compliant' ? (
                <span className="flex items-center gap-2">
                  <CheckCircle size={20} weight="bold" />
                  FSSAI Compliant
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <XCircle size={20} weight="bold" />
                  FSSAI Non-Compliant
                </span>
              )}
            </div>
          </div>

          {/* AB-Free Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
            batchData.hasAntibiotics 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {batchData.hasAntibiotics ? (
              <>
                <XCircle size={20} weight="bold" />
                <span className="font-semibold">Antibiotic Used</span>
              </>
            ) : (
              <>
                <CheckCircle size={20} weight="bold" />
                <span className="font-semibold">AB-Free Eligible</span>
              </>
            )}
          </div>
        </div>

        {/* Farm Information */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <MapPin size={24} weight="bold" className="text-brand-green-600" />
            Farm Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-neutral-500 mb-1">Farm District</p>
              <p className="text-lg font-semibold text-neutral-900">{batchData.farmDistrict}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">Breed</p>
              <p className="text-lg font-semibold text-neutral-900">{batchData.breed}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">DOC Supplier</p>
              <p className="text-lg font-semibold text-neutral-900">{batchData.docSupplier}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">Placement Date</p>
              <p className="text-lg font-semibold text-neutral-900">{batchData.docPlacementDate}</p>
            </div>
          </div>
        </div>

        {/* Batch Performance */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Scales size={24} weight="bold" className="text-brand-green-600" />
            Batch Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-neutral-50 rounded-xl p-4">
              <p className="text-sm text-neutral-500 mb-1">Birds Placed</p>
              <p className="text-2xl font-bold text-neutral-900">{batchData.docCount.toLocaleString()}</p>
            </div>
            <div className="bg-neutral-50 rounded-xl p-4">
              <p className="text-sm text-neutral-500 mb-1">Current Birds</p>
              <p className="text-2xl font-bold text-neutral-900">{batchData.currentBirdCount?.toLocaleString() || 'N/A'}</p>
            </div>
            <div className="bg-neutral-50 rounded-xl p-4">
              <p className="text-sm text-neutral-500 mb-1">Mortality Rate</p>
              <p className="text-2xl font-bold text-neutral-900">{batchData.mortalityRate.toFixed(2)}%</p>
            </div>
            {batchData.averageWeight && (
              <div className="bg-neutral-50 rounded-xl p-4">
                <p className="text-sm text-neutral-500 mb-1">Average Weight</p>
                <p className="text-2xl font-bold text-neutral-900">{batchData.averageWeight.toFixed(2)} kg</p>
              </div>
            )}
            {batchData.fcr && (
              <div className="bg-neutral-50 rounded-xl p-4">
                <p className="text-sm text-neutral-500 mb-1">FCR</p>
                <p className="text-2xl font-bold text-neutral-900">{batchData.fcr.toFixed(3)}</p>
              </div>
            )}
            {batchData.harvestDate && (
              <div className="bg-neutral-50 rounded-xl p-4">
                <p className="text-sm text-neutral-500 mb-1">Harvest Date</p>
                <p className="text-2xl font-bold text-neutral-900">{batchData.harvestDate}</p>
              </div>
            )}
          </div>
        </div>

        {/* Health & Vaccination */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Shield size={24} weight="bold" className="text-brand-green-600" />
            Health & Vaccination
          </h2>
          
          {batchData.vaccinations.length > 0 ? (
            <div className="space-y-3">
              {batchData.vaccinations.map((vaccination, index) => (
                <div key={index} className="flex items-center justify-between bg-neutral-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      vaccination.status === 'done' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-amber-100 text-amber-600'
                    }`}>
                      {vaccination.status === 'done' ? (
                        <CheckCircle size={16} weight="bold" />
                      ) : (
                        <Calendar size={16} weight="bold" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">{vaccination.vaccineName}</p>
                      <p className="text-sm text-neutral-500">
                        {vaccination.administeredDate || 'Not administered'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    vaccination.status === 'done' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {vaccination.status === 'done' ? 'Completed' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500">No vaccination records available</p>
          )}
        </div>

        {/* Certification */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <CheckCircle size={24} weight="bold" className="text-brand-green-600" />
            Certification Status
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <p className="font-semibold text-neutral-900">FSSAI Compliance</p>
                <p className="text-sm text-neutral-500">Food safety and standards</p>
              </div>
              <div className={`px-4 py-2 rounded-lg font-semibold ${
                batchData.fssaiStatus === 'Compliant' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {batchData.fssaiStatus}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <p className="font-semibold text-neutral-900">Antibiotic-Free Status</p>
                <p className="text-sm text-neutral-500">No antibiotic medications used</p>
              </div>
              <div className={`px-4 py-2 rounded-lg font-semibold ${
                batchData.hasAntibiotics 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {batchData.hasAntibiotics ? 'Not Eligible' : 'Eligible'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-neutral-500">
          <p>This traceability information is valid for 5 years from harvest date.</p>
          <p className="mt-2">
          Powered by <span className="font-semibold text-brand-green-600">FlockIQ</span> ·{' '}
            <a href="https://flockiq.com" className="text-brand-green-600 hover:underline">
              flockiq.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
