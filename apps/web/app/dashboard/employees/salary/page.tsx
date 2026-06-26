import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SalaryManagement } from '@/components/employees/SalaryManagement';

async function getEmployees(integratorId: string) {
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

  const { data: employees, error } = await supabase
    .from('employees')
    .select(`
      id,
      employee_code,
      full_name,
      name_hindi,
      role,
      employment_type,
      base_salary_monthly,
      daily_wage_rate,
      is_active
    `)
    .eq('integrator_id', integratorId)
    .eq('is_active', true)
    .order('full_name');

  if (error) {
    console.error('Error fetching employees:', error);
    return [];
  }

  return employees || [];
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

export default async function SalaryManagementPage() {
  const integratorId = await getIntegratorId();
  
  if (!integratorId) {
    // If integratorId lookup fails, show empty state instead of redirecting to login
    console.warn('Integrator ID lookup failed, showing empty state');
  }

  const employees = await getEmployees(integratorId);

  return (
    <div className="p-6 md:p-8 lg:p-12">
      {/* Page Header */}
      <div className="mb-8 md:mb-12">
        <span className="inline-block mb-3 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-black/5 text-neutral-600">
          Farm Operations
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">Salary Management</h1>
        <p className="text-base text-neutral-600 mt-2">
          Process monthly salaries and track payments
        </p>
      </div>

      {/* Salary Management Component */}
      <SalaryManagement employees={employees} />
    </div>
  );
}
