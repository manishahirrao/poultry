'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Warning, NavigationArrow } from '@phosphor-icons/react';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet to avoid SSR issues
const FarmRiskMap = dynamic(() => import('@/components/dashboard/alerts/FarmRiskMap'), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-neutral-100 rounded-lg animate-pulse" />,
});

export default function FarmRiskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const farmId = params.farmId as string;
  
  const [riskData, setRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRiskData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/alerts/risk/${farmId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch risk data');
        }

        setRiskData(data);
      } catch (err) {
        console.error('Error fetching risk data:', err);
        setError('Failed to load risk details');
      } finally {
        setLoading(false);
      }
    }

    if (farmId) {
      fetchRiskData();
    }
  }, [farmId]);

  // Risk badge component
  const RiskBadge = ({ score, level }: { score: number, level: string }) => {
    const colours = {
      LOW: 'bg-green-100 text-green-800 border-green-200',
      MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200',
      HIGH: 'bg-red-100 text-red-800 border-red-200'
    };
    const emojis = { LOW: '🟢', MEDIUM: '🟡', HIGH: '🔴' };
    
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${colours[level as keyof typeof colours]}`}>
        {emojis[level as keyof typeof emojis]} {level} {score.toFixed(1)}/10
      </span>
    );
  };

  if (loading) {
    return (
      <div className="py-8 md:py-12 lg:py-16 space-y-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-neutral-200 rounded" />
            <div className="h-4 w-full bg-neutral-200 rounded" />
            <div className="h-64 bg-neutral-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !riskData) {
    return (
      <div className="py-8 md:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{error || 'Risk data not found'}</p>
            <Link
              href="/dashboard/alerts"
              className="inline-flex items-center mt-4 text-red-700 hover:text-red-800 font-medium"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Alerts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { farm, overall_risk_level, highest_total_score, latest_scores, history } = riskData;
  const highestRisk = latest_scores.length > 0 
    ? latest_scores.reduce((max: any, r: any) => r.total_score > max.total_score ? r : max, latest_scores[0])
    : null;

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/dashboard/alerts"
          className="inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900 mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Alerts
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Warning size={24} className="text-red-600" weight="bold" />
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
              Farm Risk Assessment
            </h1>
          </div>
          <p className="text-lg text-neutral-600">{farm.name}</p>
        </div>

        {/* Risk Score Badge */}
        <div className="bg-white rounded-xl p-6 border border-neutral-100 shadow-sm mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-sm font-semibold text-neutral-600 uppercase tracking-wider mb-2">
                Overall Risk Score
              </h2>
              <RiskBadge score={highest_total_score} level={overall_risk_level} />
            </div>
            {highestRisk && (
              <div className="text-right">
                <p className="text-sm text-neutral-600">
                  Alert: {highestRisk.alerts?.title_english || 'Disease Alert'}
                </p>
                <p className="text-xs text-neutral-500">
                  Last updated: {new Date(highestRisk.calculated_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        {highestRisk && (
          <div className="bg-white rounded-xl p-6 border border-neutral-100 shadow-sm mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              <NavigationArrow size={20} className="inline mr-2" />
              Location Map
            </h3>
            <FarmRiskMap
              farmLat={highestRisk.alerts?.lat || 26.7}
              farmLng={highestRisk.alerts?.lng || 83.3}
              alertLat={highestRisk.alerts?.lat || 26.7}
              alertLng={highestRisk.alerts?.lng || 83.3}
              proximityKm={highestRisk.proximity_km || 0}
            />
          </div>
        )}

        {/* Risk Breakdown Table */}
        {highestRisk && (
          <div className="bg-white rounded-xl p-6 border border-neutral-100 shadow-sm mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Risk Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Risk Factor
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Reasoning
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-neutral-100">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-neutral-900">Proximity</div>
                      <div className="text-xs text-neutral-500">{highestRisk.proximity_km?.toFixed(1)} km</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-neutral-900">
                        {highestRisk.proximity_score}/4
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-neutral-600">
                        {getProximityReasoning(highestRisk.proximity_score)}
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-100">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-neutral-900">Flock Age</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-neutral-900">
                        {highestRisk.age_score}/2
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-neutral-600">
                        {getAgeReasoning(highestRisk.age_score)}
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-100">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-neutral-900">Vaccination Status</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-neutral-900">
                        {highestRisk.vaccination_score}/2
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-neutral-600">
                        {getVaccinationReasoning(highestRisk.vaccination_score)}
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-100">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-neutral-900">Biosecurity Level</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-neutral-900">
                        {highestRisk.biosecurity_score}/2
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-neutral-600">
                        {getBiosecurityReasoning(highestRisk.biosecurity_score)}
                      </div>
                    </td>
                  </tr>
                  <tr className="bg-neutral-50 font-semibold">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-neutral-900">TOTAL RISK SCORE</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-neutral-900">
                        {highestRisk.total_score.toFixed(1)}/10
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge score={highestRisk.total_score} level={highestRisk.risk_level} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* How to Reduce Your Risk */}
        {highestRisk && (
          <div className="bg-white rounded-xl p-6 border border-neutral-100 shadow-sm mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              How to Reduce Your Risk
            </h3>
            <div className="space-y-3">
              {highestRisk.proximity_score > 2 && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 text-xs font-bold">
                    1
                  </div>
                  <p className="text-sm text-neutral-700">
                    Consider moving birds to a more distant shed if possible or strengthening perimeter biosecurity.
                  </p>
                </div>
              )}
              {highestRisk.vaccination_score > 0 && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 text-xs font-bold">
                    2
                  </div>
                  <p className="text-sm text-neutral-700">
                    Ensure all Newcastle Disease vaccinations are completed and recorded in your Health tab.
                  </p>
                </div>
              )}
              {highestRisk.biosecurity_score > 1 && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 text-xs font-bold">
                    3
                  </div>
                  <p className="text-sm text-neutral-700">
                    Upgrade biosecurity: restrict external visitors, enforce footbath use at all shed entry points.
                  </p>
                </div>
              )}
              {highestRisk.age_score > 1.5 && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 text-xs font-bold">
                    4
                  </div>
                  <p className="text-sm text-neutral-700">
                    Young chicks are most vulnerable. Monitor health closely and maintain optimal shed conditions.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Official Recommendations */}
        {highestRisk?.alerts && (
          <div className="bg-white rounded-xl p-6 border border-neutral-100 shadow-sm mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Official Recommendations
            </h3>
            <div className="space-y-3">
              {highestRisk.alerts.external_url && (
                <a
                  href={highestRisk.alerts.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-brandGreen700 hover:text-brandGreen800 font-medium"
                >
                  View full government advisory →
                </a>
              )}
              <p className="text-sm text-neutral-600">
                UP Animal Husbandry Department helpline: 1800-180-5141
              </p>
            </div>
          </div>
        )}

        {/* Monitoring Frequency */}
        <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Monitoring Frequency
          </h3>
          <p className="text-sm text-neutral-600 mb-4">
            Risk score will be recalculated every 6 hours. You will receive WhatsApp notification if risk level changes.
          </p>
          
          {history && history.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-neutral-700 mb-2">Risk Score History</h4>
              <div className="space-y-2">
                {history.slice(0, 5).map((h: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm py-2 border-b border-neutral-200 last:border-0">
                    <span className="text-neutral-600">
                      {new Date(h.calculated_at).toLocaleString()}
                    </span>
                    <span className="font-medium text-neutral-900">
                      {h.total_score.toFixed(1)}/10 ({h.risk_level})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions for reasoning text
function getProximityReasoning(score: number): string {
  if (score >= 4) return 'Within 20km zone - Very high exposure risk';
  if (score >= 3) return 'Within 20-50km zone - High exposure risk';
  if (score >= 2) return 'Within 50-100km zone - Moderate exposure risk';
  if (score >= 1) return 'Within 100-200km zone - Low exposure risk';
  return 'Beyond 200km - Minimal exposure risk';
}

function getAgeReasoning(score: number): string {
  if (score >= 2) return 'D1-D7 chicks - Most susceptible to disease';
  if (score >= 1.5) return 'D8-D21 - Moderate susceptibility';
  if (score >= 1) return 'D22-D35 - Lower susceptibility';
  if (score >= 0.5) return 'D36+ - Near harvest, shorter exposure window';
  return 'No active batch - No exposure risk';
}

function getVaccinationReasoning(score: number): string {
  if (score >= 2) return 'ND not vaccinated - High vulnerability';
  if (score >= 1) return 'ND partially vaccinated - Moderate vulnerability';
  return 'ND fully vaccinated - Protected';
}

function getBiosecurityReasoning(score: number): string {
  if (score >= 2) return 'Low biosecurity - Open access, high risk';
  if (score >= 1) return 'Medium biosecurity - Basic controls in place';
  return 'High biosecurity - Full protocol, minimal risk';
}
