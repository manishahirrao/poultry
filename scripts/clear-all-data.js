const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: './apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function clearData() {
  console.log('🧹 Clearing all application data for production deployment...');

  const tablesToClear = [
    'daily_logs',
    'batches',
    'sheds',
    'farms',
    'alerts',
    'predictions',
    'notifications',
    'farm_risk_scores'
  ];

  for (const table of tablesToClear) {
    console.log(`Clearing ${table}...`);
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      // If table doesn't exist or other error, just log and continue
      console.log(`  Note: Error clearing ${table} (might not exist): ${error.message}`);
    } else {
      console.log(`  ✓ ${table} cleared.`);
    }
  }

  console.log('✅ Database cleared successfully! Kept customers table intact for login.');
}

clearData().catch(console.error);
