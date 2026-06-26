import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { getAccuracyMetrics, getModelRegistry } from '@/utils/supabase/dashboard';
import { AccuracyGates } from '@/components/dashboard/accuracy/AccuracyGates';
import { ModelRegistry } from '@/components/dashboard/accuracy/ModelRegistry';
import { RetrainControls } from '@/components/dashboard/accuracy/RetrainControls';

const customCubicBezier = [0.32, 0.72, 0, 1] as const;

export const metadata: Metadata = {
  title: 'Model Accuracy Dashboard — FlockIQ',
  description: 'Admin-only accuracy metrics dashboard. View 30-day MAPE, directional accuracy, conformal coverage, and model registry for poultry price predictions.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccuracyPage() {
  const supabase = await createClient();
  
  if (!supabase) {
    redirect('/?error=supabase_not_configured');
  }
  
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.phone) {
    redirect('/login?redirect=/dashboard/admin-accuracy');
  }

  // Fetch customer profile
  const { data: customer } = await supabase
    .from('customers')
    .select('id, role')
    .eq('phone', user.phone)
    .single();

  // CRITICAL: Admin only
  if (!customer || (customer as any).role !== 'admin') {
    redirect('/dashboard/403?required=admin');
  }

  // Fetch accuracy metrics and model registry
  const [accuracy, models] = await Promise.all([
    getAccuracyMetrics(),
    getModelRegistry(),
  ]);

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8 md:space-y-12">
      {/* Page Header */}
      <div>
        <span className="inline-block mb-3 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-black/5 text-neutral-600">
          Admin
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">Model Accuracy Dashboard</h1>
        <p className="text-base text-neutral-600 mt-2">
          View 30-day MAPE, directional accuracy, conformal coverage, and model registry for poultry price predictions
        </p>
      </div>

      {/* Critical Banner */}
      <div
        className={`bg-white/5 ring-1 ring-black/5 p-1.5 rounded-[2rem] ${
          accuracy.directional_accuracy_30d >= 95 &&
          accuracy.mape_30d < 6 &&
          accuracy.conformal_coverage_30d >= 78 &&
          accuracy.conformal_coverage_30d <= 82
            ? ''
            : ''
        }`}
        aria-live="assertive"
      >
        <div className={`bg-white/50 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] rounded-[calc(2rem-0.375rem)] p-4 ${
          accuracy.directional_accuracy_30d >= 95 &&
          accuracy.mape_30d < 6 &&
          accuracy.conformal_coverage_30d >= 78 &&
          accuracy.conformal_coverage_30d <= 82
            ? 'bg-emerald-50/50'
            : 'bg-red-50/50'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              accuracy.directional_accuracy_30d >= 95 &&
              accuracy.mape_30d < 6 &&
              accuracy.conformal_coverage_30d >= 78 &&
              accuracy.conformal_coverage_30d <= 82
                ? 'bg-emerald-200 text-emerald-700'
                : 'bg-red-200 text-red-700'
            }`}>
              {accuracy.directional_accuracy_30d >= 95 &&
              accuracy.mape_30d < 6 &&
              accuracy.conformal_coverage_30d >= 78 &&
              accuracy.conformal_coverage_30d <= 82 ? (
                '✓'
              ) : (
                '!'
              )}
            </div>
            <div className="flex-1">
              <h3 className={`text-base font-semibold mb-1 ${
                accuracy.directional_accuracy_30d >= 95 &&
                accuracy.mape_30d < 6 &&
                accuracy.conformal_coverage_30d >= 78 &&
                accuracy.conformal_coverage_30d <= 82
                  ? 'text-emerald-800'
                  : 'text-red-800'
              }`}>
                {accuracy.directional_accuracy_30d >= 95 &&
                accuracy.mape_30d < 6 &&
                accuracy.conformal_coverage_30d >= 78 &&
                accuracy.conformal_coverage_30d <= 82
                  ? 'All Accuracy Gates Passed'
                  : 'Accuracy Gate Breached - Action Required'}
              </h3>
              <p className={`text-sm ${
                accuracy.directional_accuracy_30d >= 95 &&
                accuracy.mape_30d < 6 &&
                accuracy.conformal_coverage_30d >= 78 &&
                accuracy.conformal_coverage_30d <= 82
                  ? 'text-emerald-700'
                  : 'text-red-700'
              }`}>
                {accuracy.directional_accuracy_30d >= 95 &&
                accuracy.mape_30d < 6 &&
                accuracy.conformal_coverage_30d >= 78 &&
                accuracy.conformal_coverage_30d <= 82
                  ? 'Model performance within acceptable thresholds'
                  : 'One or more accuracy metrics outside acceptable range'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Accuracy Gates */}
      <AccuracyGates accuracy={accuracy} />

      {/* Model Registry */}
      <ModelRegistry models={models} />

      {/* Retrain Controls */}
      <RetrainControls />
    </div>
  );
}
