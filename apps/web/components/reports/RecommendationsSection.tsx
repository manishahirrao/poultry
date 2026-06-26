interface RecommendationsSectionProps {
  batch: any;
  dailyLogs: any[];
  mortalityPct: number;
  avgWeight: number;
  totalFeedConsumed: number;
  isDataLocked: boolean;
}

export function RecommendationsSection({
  batch,
  dailyLogs,
  mortalityPct,
  avgWeight,
  totalFeedConsumed,
  isDataLocked,
}: RecommendationsSectionProps) {
  // Generate rule-based recommendations
  const recommendations: string[] = [];

  // Mortality recommendations
  if (mortalityPct > 5) {
    recommendations.push('🔴 Critical mortality detected. Conduct thorough post-mortem analysis and review biosecurity protocols.');
  } else if (mortalityPct > 3) {
    recommendations.push('🟡 Elevated mortality. Monitor health closely and review vaccination schedule.');
  } else {
    recommendations.push('✅ Mortality within acceptable range. Continue current health management practices.');
  }

  // Weight recommendations
  if (avgWeight < 1800) {
    recommendations.push('🟡 Weight below target. Review feed formulation and consider increasing feed density.');
  } else if (avgWeight >= 2100) {
    recommendations.push('✅ Excellent weight achievement. Maintain current feeding program.');
  } else {
    recommendations.push('🟢 Weight on track. Continue current nutrition program.');
  }

  // Feed efficiency recommendations
  const birdsPlaced = batch.birds_placed || 1;
  const feedPerBird = (totalFeedConsumed * 1000) / birdsPlaced;
  if (feedPerBird > 2000) {
    recommendations.push('🟠 Feed conversion above target. Review feeder height, feed quality, and bird health.');
  } else if (feedPerBird < 1800) {
    recommendations.push('✅ Excellent feed efficiency. Document practices for future batches.');
  } else {
    recommendations.push('🟢 Feed efficiency within target range.');
  }

  // Health recommendations based on daily logs
  const healthIssueCount = dailyLogs.filter((log: any) => log.health_issue).length;
  if (healthIssueCount > 5) {
    recommendations.push('🔴 Multiple health events recorded. Review environmental conditions and disease prevention measures.');
  } else if (healthIssueCount > 0) {
    recommendations.push('🟡 Some health events recorded. Monitor closely and document treatments for future reference.');
  }

  // Environmental recommendations
  const highTempDays = dailyLogs.filter((log: any) => log.temp_max_c && log.temp_max_c > 32).length;
  if (highTempDays > 5) {
    recommendations.push('🟡 High temperature events detected. Improve ventilation and cooling systems, especially during summer months.');
  }

  // Vaccination recommendations
  const vaccinationCompliance = batch.vaccinations ? 
    batch.vaccinations.filter((v: any) => v.status === 'done').length / (batch.vaccinations.length || 1) * 100 : 0;
  if (vaccinationCompliance < 80) {
    recommendations.push('🟠 Vaccination compliance below 80%. Ensure all vaccinations are administered on schedule for optimal flock health.');
  }

  // General recommendations for next batch
  recommendations.push('💡 Document key learnings from this batch to improve performance in the next cycle.');
  recommendations.push('💡 Review and update biosecurity protocols based on this batch\'s health outcomes.');
  recommendations.push('💡 Consider benchmarking against industry standards for FCR, mortality, and weight gain.');

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">7. Recommendations for Next Batch</h2>
      
      <div className="bg-blue-50 rounded-lg p-6 ring-1 ring-blue-200">
        <h3 className="font-semibold text-gray-900 mb-4">Key Recommendations</h3>
        <div className="space-y-3">
          {recommendations.map((recommendation, index) => (
            <div key={index} className="text-sm text-gray-700 p-3 bg-white rounded border">
              {recommendation}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded">
          <p className="text-sm text-amber-800">
            <strong>📋 Note:</strong> These recommendations are based on rule-based analysis of this batch's performance data. 
            For specific veterinary advice or complex issues, consult with a poultry expert or veterinarian.
          </p>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h4 className="font-semibold text-gray-900 mb-2">Action Items for Next Batch</h4>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Review and update standard operating procedures based on this batch's outcomes</li>
            <li>Conduct pre-batch facility inspection and maintenance</li>
            <li>Secure feed and DOC suppliers in advance with confirmed pricing</li>
            <li>Update vaccination schedule based on veterinarian recommendations</li>
            <li>Set up environmental monitoring systems for temperature and humidity</li>
            <li>Train staff on biosecurity protocols and early disease detection</li>
            <li>Establish daily monitoring checklist for critical parameters</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
