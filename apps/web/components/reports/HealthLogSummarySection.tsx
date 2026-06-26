interface HealthLogSummarySectionProps {
  vaccinations: any[];
  dailyLogs: any[];
  isDataLocked: boolean;
}

export function HealthLogSummarySection({
  vaccinations,
  dailyLogs,
  isDataLocked,
}: HealthLogSummarySectionProps) {
  // Calculate vaccination compliance
  const totalVaccinations = vaccinations.length;
  const completedVaccinations = vaccinations.filter((v: any) => v.status === 'done').length;
  const overdueVaccinations = vaccinations.filter((v: any) => 
    v.status === 'pending' && new Date(v.scheduled_day) < new Date()
  ).length;
  const complianceRate = totalVaccinations > 0 ? (completedVaccinations / totalVaccinations) * 100 : 0;

  // Extract health events from daily logs
  const healthEvents = dailyLogs
    .filter((log: any) => log.health_issue)
    .map((log: any) => ({
      date: log.log_date,
      symptoms: log.health_symptoms || [],
      severity: log.health_severity || 'mild',
      notes: log.health_notes,
    }));

  // Group health events by severity
  const healthEventsBySeverity: Record<string, number> = {};
  healthEvents.forEach((event: any) => {
    const severity = event.severity || 'mild';
    healthEventsBySeverity[severity] = (healthEventsBySeverity[severity] || 0) + 1;
  });

  // Count symptom types
  const symptomCounts: Record<string, number> = {};
  healthEvents.forEach((event: any) => {
    event.symptoms.forEach((symptom: string) => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
  });

  return (
    <div className="border-b border-gray-200 pb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">5. Health Log Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vaccination Compliance */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Vaccination Compliance</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Vaccinations:</span>
              <span className="font-semibold">{totalVaccinations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed:</span>
              <span className="font-semibold text-green-600">{completedVaccinations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Overdue:</span>
              <span className={`font-semibold ${overdueVaccinations > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {overdueVaccinations}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Compliance Rate:</span>
              <span className={`font-semibold ${complianceRate >= 90 ? 'text-green-600' : complianceRate >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                {complianceRate.toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
            <strong>Status:</strong>{' '}
            {complianceRate >= 90 ? '🟢 Excellent vaccination compliance' :
             complianceRate >= 70 ? '🟡 Good compliance, some vaccinations pending' :
             '🔴 Poor compliance - review vaccination schedule'}
          </div>
        </div>

        {/* Health Events Overview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Health Events</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Health Events:</span>
              <span className="font-semibold">{healthEvents.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Severe Events:</span>
              <span className={`font-semibold ${healthEventsBySeverity.severe > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {healthEventsBySeverity.severe || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Moderate Events:</span>
              <span className="font-semibold">{healthEventsBySeverity.moderate || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mild Events:</span>
              <span className="font-semibold">{healthEventsBySeverity.mild || 0}</span>
            </div>
          </div>
        </div>

        {/* Vaccination Schedule */}
        {vaccinations.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-3">Vaccination Schedule</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Vaccine</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Scheduled Day</th>
                    <th className="text-left py-2">Administered Date</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vaccinations.map((vaccination: any, index: number) => (
                    <tr 
                      key={index} 
                      className={`border-b ${
                        vaccination.status === 'pending' && new Date(vaccination.scheduled_day) < new Date()
                          ? 'bg-red-50' 
                          : ''
                      }`}
                    >
                      <td className="py-2">{vaccination.vaccine_name}</td>
                      <td className="py-2 capitalize">{vaccination.vaccine_type}</td>
                      <td className="py-2">Day {vaccination.scheduled_day}</td>
                      <td className="py-2">
                        {vaccination.administered_date 
                          ? new Date(vaccination.administered_date).toLocaleDateString('en-IN')
                          : '-'}
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          vaccination.status === 'done' ? 'bg-green-100 text-green-800' :
                          vaccination.status === 'pending' && new Date(vaccination.scheduled_day) < new Date()
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {vaccination.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Symptom Breakdown */}
        {Object.keys(symptomCounts).length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-3">Symptom Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {Object.entries(symptomCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([symptom, count]) => (
                  <div key={symptom} className="bg-white p-2 rounded border">
                    <div className="font-semibold capitalize">{symptom}</div>
                    <div className="text-gray-600">{count} events</div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Health Recommendations */}
        <div className="bg-blue-50 rounded-lg p-4 ring-1 ring-blue-200 md:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-3">Health Management Insights</h3>
          <div className="text-sm text-gray-700 space-y-2">
            {complianceRate >= 90 && (
              <p>✅ Excellent vaccination compliance. Continue following the schedule.</p>
            )}
            {overdueVaccinations > 0 && (
              <p>⚠️ {overdueVaccinations} overdue vaccination(s). Schedule immediately to maintain flock health.</p>
            )}
            {healthEventsBySeverity.severe > 0 && (
              <p>🔴 {healthEventsBySeverity.severe} severe health event(s) detected. Review treatment protocols and biosecurity measures.</p>
            )}
            {healthEvents.length === 0 && (
              <p>✅ No health events recorded. Good flock health status.</p>
            )}
            {Object.keys(symptomCounts).length > 0 && symptomCounts['respiratory'] > 0 && (
              <p>🏥 Respiratory symptoms detected. Review ventilation and air quality in sheds.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
