'use client'

import React, { useState } from 'react'
import { IndianRupee, Printer, Download, Calculator, FileText } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react'
import Link from 'next/link'

export default function GCCalculationPage() {
  const [selectedFarm, setSelectedFarm] = useState('')
  const [selectedBatch, setSelectedBatch] = useState('')
  const [boilerCode, setBoilerCode] = useState('')
  const [calculatedGC, setCalculatedGC] = useState<number | null>(null)
  const [manualGC, setManualGC] = useState('')
  const [useManual, setUseManual] = useState(false)
  const [farmerName, setFarmerName] = useState('')
  const [farmLocation, setFarmLocation] = useState('')
  const [batchNumber, setBatchNumber] = useState('')
  const [placementDate, setPlacementDate] = useState('')
  const [harvestDate, setHarvestDate] = useState('')
  const [totalBirds, setTotalBirds] = useState('')
  const [avgWeight, setAvgWeight] = useState('')
  const [fcv, setFcv] = useState('')
  const [mortality, setMortality] = useState('')

  // Mock farms data
  const farms = [
    { id: '1', name: 'Sharma Farms', location: 'Gorakhpur' },
    { id: '2', name: 'Verma Poultry', location: 'Basti' },
    { id: '3', name: 'Singh Agro', location: 'Deoria' },
  ]

  // Mock batches data
  const batches = [
    { id: '1', number: 'BATCH-001', farmId: '1' },
    { id: '2', number: 'BATCH-002', farmId: '1' },
    { id: '3', number: 'BATCH-003', farmId: '2' },
  ]

  const handleCalculateGC = () => {
    // Mock calculation based on boiler code and performance metrics
    // In real implementation, this would use actual formulas
    const birds = parseFloat(totalBirds) || 0
    const weight = parseFloat(avgWeight) || 0
    const fcvValue = parseFloat(fcv) || 0
    
    // Simple mock calculation: GC = (birds * weight * fcv) / 100
    const calculatedValue = (birds * weight * fcvValue) / 100
    setCalculatedGC(calculatedValue)
    setUseManual(false)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Create a simple text report for download
    const reportContent = `
GROWER COMPENSATION (GC) REPORT
================================

Generated: ${new Date().toLocaleString()}

FARMER DETAILS
--------------
Farmer Name: ${farmerName || 'N/A'}
Farm Location: ${farmLocation || 'N/A'}
Farm: ${farms.find(f => f.id === selectedFarm)?.name || 'N/A'}

BATCH DETAILS
-------------
Batch Number: ${batchNumber || 'N/A'}
Placement Date: ${placementDate || 'N/A'}
Harvest Date: ${harvestDate || 'N/A'}

PERFORMANCE METRICS
-------------------
Total Birds: ${totalBirds || 'N/A'}
Average Weight (kg): ${avgWeight || 'N/A'}
FCR: ${fcv || 'N/A'}
Mortality %: ${mortality || 'N/A'}

GC CALCULATION
--------------
Boiler Code: ${boilerCode || 'N/A'}
GC Amount: ₹${useManual ? manualGC : (calculatedGC?.toFixed(2) || '0.00')}
Calculation Type: ${useManual ? 'Manual Entry' : 'Calculated'}

This is an official GC calculation report for the integrator records.
    `.trim()

    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gc-report-${batchNumber || 'draft'}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/dashboard/reports" className="text-sm text-gray-600 hover:text-gray-900">
            Reports
          </Link>
          <span className="text-gray-400">/</span>
          <h1 className="text-2xl font-bold text-gray-900">GC Calculation</h1>
        </div>
        <p className="text-sm text-gray-600">
          Calculate and print Grower Compensation (GC) for farmers based on boiler code and performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Input Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Farm and Batch Selection */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Farm & Batch Selection
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Farm</label>
                <select
                  value={selectedFarm}
                  onChange={(e) => {
                    setSelectedFarm(e.target.value)
                    const farm = farms.find(f => f.id === e.target.value)
                    setFarmLocation(farm?.location || '')
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select a farm</option>
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.name} - {farm.location}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Batch</label>
                <select
                  value={selectedBatch}
                  onChange={(e) => {
                    setSelectedBatch(e.target.value)
                    const batch = batches.find(b => b.id === e.target.value)
                    setBatchNumber(batch?.number || '')
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={!selectedFarm}
                >
                  <option value="">Select a batch</option>
                  {batches
                    .filter(b => !selectedFarm || b.farmId === selectedFarm)
                    .map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.number}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator size={20} />
              Performance Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Farmer Name</label>
                <input
                  type="text"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter farmer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Farm Location</label>
                <input
                  type="text"
                  value={farmLocation}
                  onChange={(e) => setFarmLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter farm location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter batch number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Boiler Code</label>
                <input
                  type="text"
                  value={boilerCode}
                  onChange={(e) => setBoilerCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter boiler code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Placement Date</label>
                <input
                  type="date"
                  value={placementDate}
                  onChange={(e) => setPlacementDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Harvest Date</label>
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Birds</label>
                <input
                  type="number"
                  value={totalBirds}
                  onChange={(e) => setTotalBirds(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter total birds"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Average Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={avgWeight}
                  onChange={(e) => setAvgWeight(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter average weight"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">FCR</label>
                <input
                  type="number"
                  step="0.01"
                  value={fcv}
                  onChange={(e) => setFcv(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter FCR"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mortality %</label>
                <input
                  type="number"
                  step="0.1"
                  value={mortality}
                  onChange={(e) => setMortality(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter mortality %"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={handleCalculateGC}
                className="flex items-center gap-2 px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
              >
                <Calculator size={18} />
                Calculate GC
              </button>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="manualGC"
                  checked={useManual}
                  onChange={(e) => setUseManual(e.target.checked)}
                  className="w-4 h-4 text-green-700 rounded focus:ring-green-500"
                />
                <label htmlFor="manualGC" className="text-sm text-gray-700">
                  Use manual GC entry
                </label>
              </div>
            </div>

            {useManual && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Manual GC Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={manualGC}
                  onChange={(e) => setManualGC(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter manual GC amount"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column - GC Summary */}
        <div className="space-y-6">
          {/* GC Summary Card */}
          <div className="bg-gradient-to-br from-green-700 to-green-600 rounded-lg p-6 text-white">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <IndianRupee size={20} />
              GC Summary
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-white/80 mb-1">Calculated GC Amount</p>
                <p className="text-3xl font-bold">
                  ₹{useManual ? (parseFloat(manualGC) || 0).toFixed(2) : (calculatedGC?.toFixed(2) || '0.00')}
                </p>
              </div>
              <div className="border-t border-white/20 pt-4">
                <p className="text-xs text-white/80 mb-1">Calculation Type</p>
                <p className="text-sm font-medium">
                  {useManual ? 'Manual Entry' : 'Auto-calculated'}
                </p>
              </div>
              <div className="border-t border-white/20 pt-4">
                <p className="text-xs text-white/80 mb-1">Boiler Code</p>
                <p className="text-sm font-medium">{boilerCode || 'N/A'}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-green-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Printer size={18} />
                Print Report
              </button>
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                <Download size={18} />
                Download Report
              </button>
            </div>
          </div>

          {/* Quick Info Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">GC Calculation Info</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <p>• GC is calculated based on boiler code and performance metrics</p>
              <p>• You can manually enter GC amount if needed</p>
              <p>• Reports can be printed or downloaded for records</p>
              <p>• Ensure all batch details are accurate before calculation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
