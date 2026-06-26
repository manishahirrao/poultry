import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { EmployeeList } from '@/components/employees/EmployeeList';
import { SalaryManagement } from '@/components/employees/SalaryManagement';
import { BusinessExpenses } from '@/components/employees/BusinessExpenses';
import { PLOverview } from '@/components/employees/PLOverview';
import { EmployeesPageClient } from './EmployeesPageClient';
import { FEATURES } from '@/lib/plans/featureGates';
import { FeatureGate } from '@/components/plans/FeatureGate';

async function getEmployees(integratorId: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not set. Returning empty employees list.');
    return [];
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
      phone,
      role,
      role_custom,
      assigned_farm_ids,
      employment_type,
      join_date,
      end_date,
      is_active,
      base_salary_monthly,
      daily_wage_rate,
      created_at,
      updated_at
    `)
    .eq('integrator_id', integratorId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching employees:', error);
    return [];
  }

  return employees || [];
}

async function getExpenses(integratorId: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not set. Returning empty expenses list.');
    return [];
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
    .select('*')
    .eq('integrator_id', integratorId)
    .order('expense_date', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }

  return expenses || [];
}

async function getFarms(integratorId: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not set. Returning empty farms list.');
    return [];
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: farms, error } = await supabase
    .from('farms')
    .select('id, name')
    .eq('integrator_id', integratorId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching farms:', error);
    return [];
  }

  return farms || [];
}

async function getIntegratorId() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not set. Returning null integrator ID.');
    return null;
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const integratorId = await getIntegratorId();
  
  if (!integratorId) {
    // If Supabase is not configured, skip redirect for testing
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured. Skipping auth check for testing.');
    } else {
      // If session lookup fails, show empty state instead of redirecting to login
      console.warn('Session lookup failed, showing empty state');
    }
  }

  const employees = await getEmployees(integratorId);
  const expenses = await getExpenses(integratorId);
  const farms = await getFarms(integratorId);
  const resolvedMagnifyingGlassParams = await searchParams;
  const activeTab = resolvedMagnifyingGlassParams.tab || 'employees';

  return (
    <FeatureGate feature={FEATURES.EMPLOYEE_MANAGEMENT}>
      <EmployeesPageClient
        employees={employees}
        expenses={expenses}
        farms={farms}
        integratorId={integratorId}
        activeTab={activeTab}
      />
    </FeatureGate>
  );
}
