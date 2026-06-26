'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { HACCPChecklist } from '@/components/enterprise/HACCPChecklist';
import { HACCPAuditPDFDownload } from '@/components/enterprise/HACCPAuditPDF';
import { HACCPAuditReport, HACCPChecklistItem, HACCPDeviation } from '@/lib/haccpTypes';
import { useSearchParams } from 'next/navigation';

function HACCPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const batchId = searchParams.get('batchId') || undefined;
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Role-based access control - only enterprise and admin roles
  useEffect(() => {
    // In production, this would check the actual user role from auth
    // For demo purposes, we'll check if the user has enterprise or admin role
    const checkAuthorization = () => {
      // Mock role check - in production, this would come from auth context
      const userRole = localStorage.getItem('user_role') || 'user';
      
      if (userRole === 'enterprise' || userRole === 'admin') {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        router.push('/dashboard/403');
      }
      setIsLoading(false);
    };

    checkAuthorization();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect to 403
  }
  
  const [processingRunId] = useState(() => `HACCP-${Date.now()}`);
  const [checklistItems, setChecklistItems] = useState<HACCPChecklistItem[]>([]);
  const [deviations, setDeviations] = useState<HACCPDeviation[]>([]);
  const [auditComplete, setAuditComplete] = useState(false);
  const [auditReport, setAuditReport] = useState<HACCPAuditReport | null>(null);

  // Mock supervisor data - in production, this would come from auth
  const supervisorId = 'supervisor-001';
  const supervisorName = 'Rajesh Kumar';

  // Mock facility data - in production, this would come from customer profile
  const facilityName = 'Gorakhpur Poultry Processing Unit';
  const facilityAddress = 'Industrial Area, Phase II, Gorakhpur, UP - 273015';
  const fssaiLicenseNumber = '100123456789';

  const handleChecklistComplete = (items: HACCPChecklistItem[], devs: HACCPDeviation[]) => {
    setChecklistItems(items);
    setDeviations(devs);
    setAuditComplete(true);

    // Determine overall status
    const hasUnresolvedDeviations = devs.some(d => !d.resolved);
    const hasCriticalDeviations = devs.some(d => d.deviationType === 'critical' && !d.resolved);
    
    let overallStatus: 'compliant' | 'non_compliant' | 'partial_compliance';
    if (hasCriticalDeviations) {
      overallStatus = 'non_compliant';
    } else if (hasUnresolvedDeviations) {
      overallStatus = 'partial_compliance';
    } else {
      overallStatus = 'compliant';
    }

    // Create audit report
    const report: HACCPAuditReport = {
      processingRunId,
      batchId,
      processingDate: new Date().toISOString(),
      facilityName,
      facilityAddress,
      fssaiLicenseNumber,
      checklistItems: items,
      deviations: devs,
      overallStatus,
      auditorName: supervisorName,
      auditorId: supervisorId,
      auditDate: new Date().toISOString()
    };

    setAuditReport(report);
  };

  const handleNewAudit = () => {
    setChecklistItems([]);
    setDeviations([]);
    setAuditComplete(false);
    setAuditReport(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">HACCP Compliance Module</h1>
        <p className="text-gray-600 mt-1">
          Hazard Analysis Critical Control Point audit for broiler processing
        </p>
      </div>

      {!auditComplete ? (
        <HACCPChecklist
          processingRunId={processingRunId}
          batchId={batchId}
          supervisorId={supervisorId}
          supervisorName={supervisorName}
          onComplete={handleChecklistComplete}
        />
      ) : (
        <div className="space-y-6">
          {/* Audit Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Audit Complete</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Processing Run: {processingRunId}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {auditReport && (
                  <HACCPAuditPDFDownload data={auditReport} />
                )}
                <button
                  onClick={handleNewAudit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Start New Audit
                </button>
              </div>
            </div>

            {/* Overall Status */}
            <div className={`p-4 rounded-lg ${
              auditReport?.overallStatus === 'compliant' 
                ? 'bg-green-50 border border-green-200' 
                : auditReport?.overallStatus === 'non_compliant'
                ? 'bg-red-50 border border-red-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {auditReport?.overallStatus === 'compliant' ? '✅' : 
                   auditReport?.overallStatus === 'non_compliant' ? '❌' : '⚠️'}
                </span>
                <div>
                  <p className="font-semibold text-gray-900">
                    {auditReport?.overallStatus === 'compliant' ? 'COMPLIANT' : 
                     auditReport?.overallStatus === 'non_compliant' ? 'NON-COMPLIANT' : 'PARTIAL COMPLIANCE'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {checklistItems.length} CCPs checked · {deviations.length} deviations recorded
                  </p>
                </div>
              </div>
            </div>

            {/* CCP Summary */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">CCP Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {checklistItems.map((item) => {
                  const ccpDeviations = deviations.filter(d => d.ccpId === item.ccpId);
                  return (
                    <div key={item.ccpId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{item.ccpId}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'compliant' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {item.status === 'compliant' ? '✓' : '⚠'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Supervisor: {item.supervisorName}
                      </p>
                      {ccpDeviations.length > 0 && (
                        <p className="text-sm text-red-600 mt-1">
                          {ccpDeviations.length} deviation(s)
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Deviations Summary */}
            {deviations.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Deviations Summary</h3>
                <div className="space-y-3">
                  {deviations.map((deviation) => (
                    <div key={deviation.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-red-900">{deviation.ccpName}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          deviation.deviationType === 'critical' 
                            ? 'bg-red-200 text-red-800' 
                            : deviation.deviationType === 'major'
                            ? 'bg-orange-200 text-orange-800'
                            : 'bg-yellow-200 text-yellow-800'
                        }`}>
                          {deviation.deviationType.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-red-800">
                        {deviation.parameter}: {deviation.actualValue} (limit: {deviation.limitValue})
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        Corrective Action: {deviation.correctiveAction}
                      </p>
                      <div className="mt-2 text-xs text-red-600">
                        <span>Recorded by: {deviation.supervisorName} at </span>
                        {new Date(deviation.timestamp).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Facility Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Facility Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Facility Name</p>
                <p className="font-medium text-gray-900">{facilityName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">FSSAI License Number</p>
                <p className="font-medium text-gray-900">{fssaiLicenseNumber}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium text-gray-900">{facilityAddress}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HACCPPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <HACCPContent />
    </Suspense>
  );
}
