/**
 * Inspect actual Supabase table schemas to align our seed script
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xrzgixpopbkviytoznqd.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function inspect() {
  const tables = ['customers', 'license_keys', 'subscriptions', 'farms', 'batches', 'daily_logs', 'predictions'];
  
  for (const table of tables) {
    console.log(`\n=== ${table} ===`);
    try {
      // Try to select one row to see what columns exist
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`  ERROR: ${error.message}`);
      } else if (data && data.length > 0) {
        console.log('  Columns:', Object.keys(data[0]).join(', '));
        console.log('  Sample:', JSON.stringify(data[0], null, 2));
      } else {
        // Try to insert a dummy to see the error message with column names
        console.log('  Empty table. Attempting empty insert to discover schema...');
        const { error: insertErr } = await supabase.from(table).insert({});
        if (insertErr) {
          console.log(`  Schema hint: ${insertErr.message}`);
        }
      }
    } catch (e) {
      console.log(`  Exception: ${e.message}`);
    }
  }
}

inspect().catch(console.error);
