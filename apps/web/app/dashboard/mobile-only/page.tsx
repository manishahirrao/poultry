import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function MobileOnlyPage() {
  const supabase = await createClient();
  
  if (!supabase) {
    redirect('/?error=supabase_not_configured');
  }
  
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.phone) {
    redirect('/dashboard/403?required=authenticated');
  }

  // Fetch customer profile
  const { data: customer } = await supabase
    .from('customers')
    .select('id, segment')
    .eq('phone', user.phone)
    .single();

  // Only for S1 farmers
  if (!customer || (customer as any).segment !== 'S1') {
    redirect('/dashboard/overview');
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Chicken Illustration */}
        <div className="text-8xl">🐔</div>

        <h1 className="text-2xl font-bold text-neutral-900">
          डेस्कटॉप एक्सेस उपलब्ध नहीं
        </h1>

        <p className="text-lg text-neutral-600">
          आपकी योजना (PULSE_FARM) केवल मोबाइल ऐप तक सीमित है।
        </p>

        <p className="text-sm text-neutral-500">
          डेस्कटॉप सुविधाओं तक पहुंच के लिए, कृपया PULSE_PRO या उच्च योजना में अपग्रेड करें।
        </p>

        <div className="space-y-3">
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brandGreen700 text-white rounded-xl text-sm font-semibold hover:bg-brandGreen800 transition-colors"
          >
            अपग्रेड करें (WhatsApp)
          </a>

          <div>
            <a
              href="/dashboard/settings?tab=billing"
              className="text-sm text-brandGreen700 hover:text-brandGreen800 font-semibold"
            >
              या बिलिंग सेटिंग्स देखें →
            </a>
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-200">
          <p className="text-xs text-neutral-400">
            Need help? Contact support at hello@flockiq.com
          </p>
        </div>
      </div>
    </div>
  );
}
