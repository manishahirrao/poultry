import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import POEntryForm from '@/components/inventory/POEntryForm';

export const metadata: Metadata = {
  title: 'PO Entry — FlockIQ',
  description: 'Create and manage purchase orders for feed, medicine, and other inventory items.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function POEntryPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/inventory/po');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/inventory/po');
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Purchase Order Entry</h1>
          <p className="mt-2 text-gray-600">
            Create purchase orders for feed, medicine, and other inventory items
          </p>
        </div>

        <POEntryForm />
      </div>
    </div>
  );
}
