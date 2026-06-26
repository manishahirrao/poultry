const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrzgixpopbkviytoznqd.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const USER_ID = '9329c467-ff71-4b01-afe2-4e42c57ad9d7';

async function main() {
  const { error } = await supabase.from('user_privileges').upsert({
    user_id: USER_ID,
    integrator_id: USER_ID,
    role_name: 'admin',
    can_view_dashboard: true,
    can_view_farms: true,
    can_edit_farms: true,
    can_view_inventory: true,
    can_edit_inventory: true,
    can_view_accounts: true,
    can_edit_accounts: true,
    can_view_payroll: true,
    can_edit_payroll: true,
    can_view_reports: true,
    can_manage_users: true,
    can_approve_payments: true,
  });
  
  if (error) console.error('Privileges Error:', error);
  else console.log('Successfully upserted user privileges.');

  // Also check if farms table has a status column
  const { data: farms, error: farmErr } = await supabase.from('farms').select('status').limit(1);
  if (farmErr) console.error('Farm Error:', farmErr);
  console.log('Farm status sample:', farms);
}
main();
