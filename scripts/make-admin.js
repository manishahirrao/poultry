require('dotenv').config({ path: './apps/web/.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Run via: node make-admin.js your-email@example.com

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Error: Missing Supabase credentials in apps/web/.env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  const identifier = process.argv[2];
  if (!identifier) {
    console.error("Please provide an email address or phone number (e.g. 9876543210).");
    console.log("Usage: node make-admin.js <user-email-or-phone>");
    process.exit(1);
  }

  console.log(`Looking up user by: ${identifier}...`);
  
  // 1. Get user ID from Auth using Admin API
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error("Error fetching users:", userError);
    process.exit(1);
  }

  // Normalize identifier for phone numbers
  let searchPhone = identifier;
  if (/^\d{10}$/.test(identifier)) {
    searchPhone = `+91${identifier}`;
  } else if (/^\d{12}$/.test(identifier) && identifier.startsWith('91')) {
    searchPhone = `+${identifier}`;
  }

  const user = userData.users.find(u => 
    u.email === identifier || 
    u.phone === searchPhone || 
    u.phone === identifier
  );
  
  if (!user) {
    console.error(`\n❌ User '${identifier}' not found in Auth system.`);
    console.log("\nAvailable users in your database:");
    userData.users.forEach(u => {
      console.log(`- ID: ${u.id} | Email: ${u.email || 'N/A'} | Phone: ${u.phone || 'N/A'}`);
    });
    console.log("\nPlease run the command again with one of the Emails or Phones listed above.");
    process.exit(1);
  }

  const userId = user.id;
  console.log(`Found user ID: ${userId}`);

  // 2. Ensure user exists in customers table (to satisfy integrator_id foreign key)
  console.log("Ensuring user exists in customers table...");
  const { error: customerError } = await supabase.from('customers').upsert({
    id: userId,
    email: user.email || `${searchPhone.replace('+', '')}@flockiq.dev`,
    name: 'Admin User',
    district: 'Admin HQ',
    poultry_type: 'broiler',
    subscription_tier: 'PULSE_INTEL',
    subscription_status: 'active',
  }, { onConflict: 'id' });

  if (customerError) {
    console.warn("Could not insert into customers (might already exist or permission error):", customerError.message);
  }

  // 3. Grant admin privileges in user_privileges table
  console.log("Granting admin role in user_privileges...");
  const { error: privError } = await supabase.from('user_privileges').upsert({
    user_id: userId,
    integrator_id: userId, // Self-assigned as integrator for simplicity
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

  if (privError) {
    console.error("Error setting privileges:", privError);
    process.exit(1);
  }

  console.log(`\n✅ Success! User ${identifier} is now a System Admin.`);
  console.log("If you are currently logged in, please log out and log back in to refresh your session cookie.");
  
  // Force clean exit to prevent Windows async assertion error
  process.exit(0);
}

main();
