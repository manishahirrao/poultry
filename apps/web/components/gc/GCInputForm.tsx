'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useSWR, { mutate } from 'swr'

const GCInputSchema = z.object({
  docCostTotal: z.number().min(0).optional(),
  litterCostTotal: z.number().min(0).optional(),
  fixedOverheadAlloc: z.number().min(0).optional(),
  medicineCostTotal: z.number().min(0).optional(),
  vaccineCostTotal: z.number().min(0).optional(),
  electricityCostTotal: z.number().min(0).optional(),
  waterCostTotal: z.number().min(0).optional(),
  labourCostTotal: z.number().min(0).optional(),
  miscCostTotal: z.number().min(0).optional(),
  notes: z.string().optional(),
})

type GCInputForm = z.infer<typeof GCInputSchema>

interface GCInputFormProps {
  farmId: string
  language?: string
  birdsPlaced?: number
  onSaved?: () => void
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function GCInputForm({ farmId, language = 'hi', birdsPlaced = 0, onSaved }: GCInputFormProps) {
  const isHindi = language === 'hi'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showQuickEntry, setShowQuickEntry] = useState(false)
  const [hasAssignedEmployees, setHasAssignedEmployees] = useState(false)

  const { data: gcData, isLoading } = useSWR(`/api/farms/${farmId}/gc`, fetcher)
  const { data: employeesData } = useSWR(`/api/employees?farmId=${farmId}`, fetcher)

  // Check if any employees are assigned to this farm
  useEffect(() => {
    if (employeesData?.employees) {
      const assigned = employeesData.employees.some((emp: any) => 
        emp.assigned_farm_ids?.includes(farmId)
      )
      setHasAssignedEmployees(assigned)
    }
  }, [employeesData, farmId])

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<GCInputForm>({
    resolver: zodResolver(GCInputSchema),
    defaultValues: {
      docCostTotal: gcData?.gc?.docCost || 0,
      litterCostTotal: gcData?.gc?.litterCost || 0,
      fixedOverheadAlloc: gcData?.gc?.fixedOverhead || 0,
      medicineCostTotal: gcData?.gc?.medicineCost || 0,
      vaccineCostTotal: gcData?.gc?.vaccineCost || 0,
      electricityCostTotal: gcData?.gc?.electricityCost || 0,
      waterCostTotal: gcData?.gc?.waterCost || 0,
      labourCostTotal: gcData?.gc?.labourCost || 0,
      miscCostTotal: gcData?.gc?.miscCost || 0,
      notes: '',
    },
  })

  // Watch form values for real-time calculations
  const formValues = watch()

  const onSubmit = async (data: GCInputForm) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/farms/${farmId}/gc`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to update GC data')

      // Mutate to refresh the data
      mutate(`/api/farms/${farmId}/gc`)
      onSaved?.()
    } catch (error) {
      console.error('Error updating GC:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const feedCost = gcData?.gc?.feedCost || 0
  const birdsAlive = gcData?.gc?.birdsAlive || 0
  const avgWeightKg = gcData?.gc?.avgWeightKg || 0
  const liveKgs = birdsAlive * avgWeightKg

  // Per-bird calculations
  const docPerChick = birdsPlaced > 0 ? (formValues.docCostTotal || 0) / birdsPlaced : 0
  const litterPerChick = birdsPlaced > 0 ? (formValues.litterCostTotal || 0) / birdsPlaced : 0
  const medicinePerChick = birdsPlaced > 0 ? (formValues.medicineCostTotal || 0) / birdsPlaced : 0
  const vaccinePerChick = birdsPlaced > 0 ? (formValues.vaccineCostTotal || 0) / birdsPlaced : 0
  const electricityPerChick = birdsPlaced > 0 ? (formValues.electricityCostTotal || 0) / birdsPlaced : 0
  const waterPerChick = birdsPlaced > 0 ? (formValues.waterCostTotal || 0) / birdsPlaced : 0
  const labourPerChick = birdsPlaced > 0 ? (formValues.labourCostTotal || 0) / birdsPlaced : 0
  const miscPerChick = birdsPlaced > 0 ? (formValues.miscCostTotal || 0) / birdsPlaced : 0
  const fixedOverheadPerChick = birdsPlaced > 0 ? (formValues.fixedOverheadAlloc || 0) / birdsPlaced : 0

  // Per-kg calculations
  const docPerKg = liveKgs > 0 ? (formValues.docCostTotal || 0) / liveKgs : 0
  const litterPerKg = liveKgs > 0 ? (formValues.litterCostTotal || 0) / liveKgs : 0
  const medicinePerKg = liveKgs > 0 ? (formValues.medicineCostTotal || 0) / liveKgs : 0
  const vaccinePerKg = liveKgs > 0 ? (formValues.vaccineCostTotal || 0) / liveKgs : 0
  const electricityPerKg = liveKgs > 0 ? (formValues.electricityCostTotal || 0) / liveKgs : 0
  const waterPerKg = liveKgs > 0 ? (formValues.waterCostTotal || 0) / liveKgs : 0
  const labourPerKg = liveKgs > 0 ? (formValues.labourCostTotal || 0) / liveKgs : 0
  const miscPerKg = liveKgs > 0 ? (formValues.miscCostTotal || 0) / liveKgs : 0
  const fixedOverheadPerKg = liveKgs > 0 ? (formValues.fixedOverheadAlloc || 0) / liveKgs : 0
  const feedPerKg = liveKgs > 0 ? feedCost / liveKgs : 0

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-5 animate-pulse">
        <div className="space-y-4">
          {[0,1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-5">
      {/* Quick Entry Collapsible */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowQuickEntry(!showQuickEntry)}
          className="text-sm text-[#1A5C34] font-medium hover:underline"
        >
          {showQuickEntry ? '▼' : '▶'} {isHindi ? 'त्वरित प्रविष्टि' : 'Quick Entry'}
        </button>
        {showQuickEntry && (
          <div className="mt-3 p-4 bg-[#EDF7F1] rounded-lg text-sm">
            <p className="font-medium mb-2">{isHindi ? 'पहली बार सेटअप' : 'First-time Setup'}</p>
            <p className="text-gray-600 mb-3">
              {isHindi 
                ? 'अपने बैच के लिए प्रारंभिक लागत दर्ज करें। आप बाद में भी अपडेट कर सकते हैं।'
                : 'Enter initial costs for your batch. You can update later as costs accumulate.'
              }
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">{isHindi ? 'DOC कुल लागत (₹)' : 'DOC Total Cost (₹)'}</label>
                <input
                  type="number"
                  {...register('docCostTotal', { valueAsNumber: true })}
                  className="w-full mt-1 px-3 py-2 border border-[#E3EDE7] rounded-lg text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">{isHindi ? 'लिटर लागत (₹)' : 'Litter Cost (₹)'}</label>
                <input
                  type="number"
                  {...register('litterCostTotal', { valueAsNumber: true })}
                  className="w-full mt-1 px-3 py-2 border border-[#E3EDE7] rounded-lg text-sm"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* DOC Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isHindi ? 'DOC लागत (कुल ₹)' : 'DOC Cost (Total ₹)'}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
            <input
              type="number"
              {...register('docCostTotal', { valueAsNumber: true })}
              className="w-full pl-8 pr-3 py-2 border border-[#E3EDE7] rounded-lg text-sm"
              placeholder="0"
            />
          </div>
          <div className="flex gap-4 mt-1">
            {birdsPlaced > 0 && (
              <p className="text-[11px] text-gray-400">
                {isHindi ? 'प्रति चिक: ' : 'Per chick: '}₹{docPerChick.toFixed(2)}
              </p>
            )}
            {liveKgs > 0 && (
              <p className="text-[11px] text-gray-400">
                {isHindi ? 'प्रति किग्रा: ' : 'Per kg: '}₹{docPerKg.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {/* Feed Cost (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isHindi ? 'चारा लागत (ऑटो-कम्प्यूटेड)' : 'Feed Cost (Auto-computed)'}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
            <input
              type="number"
              value={feedCost.toFixed(2)}
              readOnly
              className="w-full pl-8 pr-3 py-2 border border-[#E3EDE7] rounded-lg text-sm bg-gray-50 text-gray-600"
            />
          </div>
          <div className="flex gap-4 mt-1">
            <p className="text-[11px] text-gray-400">
              {isHindi ? 'फीड पर्चेज लॉग से कम्प्यूटेड' : 'Computed from feed purchase log'}
            </p>
            {liveKgs > 0 && (
              <p className="text-[11px] text-gray-400">
                {isHindi ? 'प्रति किग्रा: ' : 'Per kg: '}₹{feedPerKg.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {/* Medicine & Vaccine */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isHindi ? 'दवाई लागत (₹)' : 'Medicine Cost (₹)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                {...register('medicineCostTotal', { valueAsNumber: true })}
                className="w-full pl-8 pr-3 py-2 border border-[#E3EDE7] rounded-lg text-sm"
                placeholder="0"
              />
            </div>
            <div className="flex gap-4 mt-1">
              {birdsPlaced > 0 && (
                <p className="text-[11px] text-gray-400">
                  {isHindi ? 'प्रति चिक: ' : 'Per chick: '}₹{medicinePerChick.toFixed(2)}
                </p>
              )}
              {liveKgs > 0 && (
                <p className="text-[11px] text-gray-400">
                  {isHindi ? 'प्रति किग्रा: ' : 'Per kg: '}₹{medicinePerKg.toFixed(2)}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isHindi ? 'टीका लागत (₹)' : 'Vaccine Cost (₹)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                {...register('vaccineCostTotal', { valueAsNumber: true })}
                className="w-full pl-8 pr-3 py-2 border border-[#E3EDE7] rounded-lg text-sm"
                placeholder="0"
              />
            </div>
            <div className="flex gap-4 mt-1">
              {birdsPlaced > 0 && (
                <p className="text-[11px] text-gray-400">
                  {isHindi ? 'प्रति चिक: ' : 'Per chick: '}₹{vaccinePerChick.toFixed(2)}
                </p>
              )}
              {liveKgs > 0 && (
                <p className="text-[11px] text-gray-400">
                  {isHindi ? 'प्रति किग्रा: ' : 'Per kg: '}₹{vaccinePerKg.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Litter Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isHindi ? 'लिटर लागत (₹)' : 'Litter Cost (₹)'}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
            <input
              type="number"
              {...register('litterCostTotal', { valueAsNumber: true })}
              className="w-full pl-8 pr-3 py-2 border border-[#E3EDE7] rounded-lg text-sm"
              placeholder="0"
            />
          </div>
          <div className="flex gap-4 mt-1">
            {birdsPlaced > 0 && (
              <p className="text-[11px] text-gray-400">
                {isHindi ? 'प्रति चिक: ' : 'Per chick: '}₹{litterPerChick.toFixed(2)}
              </p>
            )}
            {liveKgs > 0 && (
              <p className="text-[11px] text-gray-400">
                {isHindi ? 'प्रति किग्रा: ' : 'Per kg: '}₹{litterPerKg.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {/* Electricity & Water */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isHindi ? 'बिजली लागत (₹)' : 'Electricity Cost (₹)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                {...register('electricityCostTotal', { valueAsNumber: true })}
                className="w-full pl-8 pr-3 py-2 border border-[#E3EDE7] rounded-lg text-sm"
                placeholder="0"
              />
            </div>
            <div className="flex gap-4 mt-1">
              {birdsPlaced > 0 && (
                <p className="text-[11px] text-gray-400">
                  {isHindi ? 'प्रति चिक: ' : 'Per chick: '}₹{electricityPerChick.toFixed(2)}
                </p>
              )}
              {liveKgs > 0 && (
                <p className="text-[11px] text-gray-400">
                  {isHindi ? 'प्रति किग्रा: ' : 'Per kg: '}₹{electricityPerKg.toFixed(2)}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isHindi ? 'पानी लागत (₹)' : 'Water Cost (₹)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                {...register('waterCostTotal', { valueAsNumber: true })}
                className="w-full pl-8 pr-3 py-2 border border-[#E3EDE7] rounded-lg text-sm"
                placeholder="0"
              />
            </div>
            <div className="flex gap-4 mt-1">
              {birdsPlaced > 0 && (
                <p className="text-[11px] text-gray-400">
                  {isHindi ? 'प्रति चिक: ' : 'Per chick: '}₹{waterPerChick.toFixed(2)}
                </p>
              )}
              {liveKgs > 0 && (
                <p className="text-[11px] text-gray-400">
                  {isHindi ? 'प्रति किग्रा: ' : 'Per kg: '}₹{waterPerKg.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Labour Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isHindi ? 'मजदूरी लागत (₹)' : 'Labour Cost (₹)'}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
            <input
              type="number"
              {...register('labourCostTotal', { valueAsNumber: true })}
              className="w-full pl-8 pr-3 py-2 border border-[#E3EDE7] rounded-lg text-sm"
              placeholder="0"
            />
          </div>
          <div className="flex gap-4 mt-1">
            {hasAssignedEmployees && (
              <p className="text-[11px] text-[#3DAE72]">
                {isHindi ? '✓ कर्मचारी मॉड्यूल से ऑटो-पॉप्युलेटेड' : '✓ Auto-populated from Employee module'}
              </p>
            )}
            {birdsPlaced > 0 && (
              <p className="text-[11px] text-gray-400">
                {isHindi ? 'प्रति चिक: ' : 'Per chick: '}₹{labourPerChick.toFixed(2)}
              </p>
            )}
            {liveKgs > 0 && (
              <p className="text-[11px] text-gray-400">
                {isHindi ? 'प्रति किग्रा: ' : 'Per kg: '}₹{labourPerKg.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {/* Miscellaneous & Fixed Overhead */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isHindi ? 'अन्य लागत (₹)' : 'Miscellaneous Cost (₹)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                {...register('miscCostTotal', { valueAsNumber: true })}
                className="w-full pl-8 pr-3 py-2 border border-[#E3EDE7] rounded-lg text-sm"
                placeholder="0"
              />
            </div>
            <div className="flex gap-4 mt-1">
              {birdsPlaced > 0 && (
                <p className="text-[11px] text-gray-400">
                  {isHindi ? 'प्रति चिक: ' : 'Per chick: '}₹{miscPerChick.toFixed(2)}
                </p>
              )}
              {liveKgs > 0 && (
                <p className="text-[11px] text-gray-400">
                  {isHindi ? 'प्रति किग्रा: ' : 'Per kg: '}₹{miscPerKg.toFixed(2)}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isHindi ? 'स्थायी खर्च आवंटन (₹)' : 'Fixed Overhead (₹)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                {...register('fixedOverheadAlloc', { valueAsNumber: true })}
                className="w-full pl-8 pr-3 py-2 border border-[#E3EDE7] rounded-lg text-sm"
                placeholder="0"
              />
            </div>
            <div className="flex gap-4 mt-1">
              {birdsPlaced > 0 && (
                <p className="text-[11px] text-gray-400">
                  {isHindi ? 'प्रति चिक: ' : 'Per chick: '}₹{fixedOverheadPerChick.toFixed(2)}
                </p>
              )}
              {liveKgs > 0 && (
                <p className="text-[11px] text-gray-400">
                  {isHindi ? 'प्रति किग्रा: ' : 'Per kg: '}₹{fixedOverheadPerKg.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isHindi ? 'नोट्स' : 'Notes'}
          </label>
          <textarea
            {...register('notes')}
            className="w-full px-3 py-2 border border-[#E3EDE7] rounded-lg text-sm"
            rows={2}
            placeholder={isHindi ? 'कोई नोट्स दर्ज करें...' : 'Add any notes...'}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#1A5C34] text-white py-2.5 px-4 rounded-lg font-medium hover:bg-[#25874D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting 
            ? (isHindi ? 'सहेज रहा है...' : 'Saving...') 
            : (isHindi ? 'GC डेटा सहें' : 'Save GC Data')
          }
        </button>
      </form>
    </div>
  )
}
