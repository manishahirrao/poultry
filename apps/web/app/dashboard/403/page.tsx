import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { ErrorState } from '@/components/dashboard/ErrorState';

export default async function ForbiddenPage({
  searchParams,
}: {
  searchParams: Promise<{ required?: string }>;
}) {
  const supabase = await createClient();
  
  if (!supabase) {
    redirect('/?error=supabase_not_configured');
  }
  
  const { data: { user }, error } = await supabase.auth.getUser();

  // If user is not authenticated, redirect to login
  if (error || !user) {
    redirect('/login?redirect=/dashboard/overview');
  }

  const params = await searchParams;
  const required = params.required || '';

  // Hindi messages based on required parameter
  const getHindiMessage = () => {
    if (required === 'admin') {
      return 'यह पेज केवल एडमिन के लिए है। आपके पास एक्सेस नहीं है।';
    }
    if (required === 'S2+') {
      return 'यह पेज S2+ योजना के लिए है। अपनी योजना अपग्रेड करें।';
    }
    if (required === 'PULSE_INTEL') {
      return 'API एक्सेस केवल PULSE_INTEL योजना के लिए है।';
    }
    return 'आपके पास इस पेज तक पहुंच की अनुमति नहीं है।';
  };

  const getUpgradeCTA = () => {
    if (required === 'S2+') {
      return {
        label: 'Upgrade to S2',
        href: '/dashboard/settings?tab=billing',
      };
    }
    if (required === 'PULSE_INTEL') {
      return {
        label: 'Upgrade to PULSE_INTEL',
        href: '/dashboard/settings?tab=billing',
      };
    }
    return null;
  };

  const upgradeCTA = getUpgradeCTA();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <ErrorState
        variant="forbidden"
        requiredPlan={required}
      />
    </div>
  );
}
