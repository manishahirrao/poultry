import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { BusinessExpenses } from '@/components/employees/BusinessExpenses';

async function getExpenses(integratorId: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: expenses, error } = await supabase
    .from('business_expenses')
    .select(`
      id,
      expense_date,
      category,
      description,
      amount,
      payment_mode,
      is_tax_deductible,
      gst_amount,
      notes,
      created_at
    `)
    .eq('integrator_id', integratorId)
    .order('expense_date', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }

  return expenses || [];
}

async function getIntegratorId() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.phone) {
    return null;
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('phone', user.phone)
    .single();

  return customer?.id || null;
}

export default async function BusinessExpensesPage() {
  const integratorId = await getIntegratorId();
  
  if (!integratorId) {
    // If integratorId lookup fails, show empty state instead of redirecting to login
    console.warn('Integrator ID lookup failed, showing empty state');
  }

  const expenses = await getExpenses(integratorId);

  return (
    <div className="p-6 md:p-8 lg:p-12">
      {/* Page Header */}
      <div className="mb-8 md:mb-12">
        <span className="inline-block mb-3 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-black/5 text-neutral-600">
          Farm Operations
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">Business Expenses</h1>
        <p className="text-base text-neutral-600 mt-2">
          Track and manage operational expenses
        </p>
      </div>

      {/* Business Expenses Component */}
      <BusinessExpenses expenses={expenses} />
    </div>
  );
}
