/**
 * E2E Seed Script v3 — fixed FK ordering, required fields
 */
require('dotenv').config({ path: './apps/web/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_SERVICE_KEY || !SUPABASE_URL) { console.error('Set SUPABASE credentials'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const TEST_PHONE = '919022217637';
const USER_ID = '5c01e14e-aa45-4f57-92e5-7f4c6b84e8ad';

async function main() {
  console.log('=== FlockIQ E2E Seed v3 ===\n');

  // 1. Customer — must come first (FK parent)
  console.log('1. Upserting customer...');
  // Check if exists first
  const { data: existingCust } = await supabase.from('customers').select('id').eq('id', USER_ID).single();
  if (existingCust) {
    console.log('  Customer already exists, updating...');
    const { error } = await supabase.from('customers').update({
      phone: TEST_PHONE,
      name: 'Rajesh Yadav Poultry Farm',
      farm_name: 'Rajesh Yadav Farms',
      district: 'Gorakhpur',
      state: 'Uttar Pradesh',
      subscription_tier: 'FLOCKIQ_PRO',
      subscription_status: 'active',
      subscription_start_date: new Date().toISOString().split('T')[0],
      subscription_end_date: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      whatsapp_verified: true,
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
      poultry_type: 'broiler',
    }).eq('id', USER_ID);
    console.log(error ? `  Error: ${error.message}` : '  ✅ Customer updated');
  } else {
    const { error } = await supabase.from('customers').insert({
      id: USER_ID,
      email: 'rajesh.yadav@flockiq.dev',
      phone: TEST_PHONE,
      name: 'Rajesh Yadav Poultry Farm',
      farm_name: 'Rajesh Yadav Farms',
      district: 'Gorakhpur',
      state: 'Uttar Pradesh',
      subscription_tier: 'FLOCKIQ_PRO',
      subscription_status: 'active',
      subscription_start_date: new Date().toISOString().split('T')[0],
      subscription_end_date: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      whatsapp_verified: true,
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
      poultry_type: 'broiler',
    });
    console.log(error ? `  Error: ${error.message}` : '  ✅ Customer created');
  }

  // 2. Subscription
  console.log('2. Creating subscription...');
  const { data: existingSub } = await supabase.from('subscriptions').select('id').eq('user_id', USER_ID).single();
  if (existingSub) {
    const { error } = await supabase.from('subscriptions').update({
      plan_name: 'FLOCKIQ_PRO',
      subscription_type: 'annual',
      status: 'active',
      billing_period_months: 12,
      next_renewal_date: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      amount_paid_inr: 100000,
    }).eq('user_id', USER_ID);
    console.log(error ? `  Error: ${error.message}` : '  ✅ Subscription updated');
  } else {
    const { error } = await supabase.from('subscriptions').insert({
      user_id: USER_ID,
      plan_name: 'FLOCKIQ_PRO',
      subscription_type: 'annual',
      status: 'active',
      billing_period_months: 12,
      next_renewal_date: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      amount_paid_inr: 100000,
    });
    console.log(error ? `  Error: ${error.message}` : '  ✅ Subscription created');
  }

  // 3. Farms (FK: integrator_id → customers.id)
  console.log('3. Creating farms...');
  const farmDefs = [
    { name: 'Green Valley Poultry Farm', location: 'Sahjanwa, Gorakhpur', district: 'Gorakhpur', state: 'Uttar Pradesh', total_sheds: 4, total_capacity: 10000 },
    { name: 'Sunrise Broiler Unit', location: 'Rudrapur, Deoria', district: 'Deoria', state: 'Uttar Pradesh', total_sheds: 2, total_capacity: 5000 },
  ];
  const farmIds = [];
  for (const f of farmDefs) {
    // Check if farm already exists
    const { data: existingFarm } = await supabase.from('farms').select('id').eq('integrator_id', USER_ID).eq('name', f.name).single();
    if (existingFarm) {
      farmIds.push({ id: existingFarm.id, capacity: f.total_capacity, name: f.name });
      console.log(`  Farm "${f.name}" already exists (${existingFarm.id})`);
      continue;
    }
    const { data, error } = await supabase.from('farms').insert({
      integrator_id: USER_ID,
      name: f.name,
      location: f.location,
      district: f.district,
      state: f.state,
      total_sheds: f.total_sheds,
      total_capacity: f.total_capacity,
      farm_type: 'broiler',
      contact_person: 'Rajesh Yadav',
      contact_phone: TEST_PHONE,
      is_active: true,
    }).select('id').single();
    if (error) { console.log(`  Farm error: ${error.message}`); continue; }
    farmIds.push({ id: data.id, capacity: f.total_capacity, name: f.name });
    console.log(`  ✅ Farm: ${f.name} (${data.id})`);
  }

  // 4. Batches + daily logs
  for (const farm of farmIds) {
    console.log(`4. Creating batch for ${farm.name}...`);
    // Check if batch already exists
    const { data: existingBatch } = await supabase.from('batches').select('id').eq('customer_id', USER_ID).eq('status', 'active').limit(1);

    const batchId = `RY-${rand(4)}`;
    const { data: batch, error: batchErr } = await supabase.from('batches').insert({
      customer_id: USER_ID,
      batch_id: batchId,
      batch_type: 'broiler',
      status: 'growing',
      doc_placement_date: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0],
      doc_count: farm.capacity,
      breed: 'Cobb 500',
      doc_supplier: 'Venkateshwara Hatcheries',
      initial_feed_brand: 'Godrej Agrovet',
      initial_feed_type: 'Starter',
      current_bird_count: farm.capacity - 35,
      current_avg_weight_kg: 1.85,
      current_fcr: 1.65,
      current_age_days: 25,
      target_harvest_weight_kg: 2.4,
      target_harvest_age_days: 38,
    }).select('id').single();

    if (batchErr) { console.log(`  Batch error: ${batchErr.message}`); continue; }
    console.log(`  ✅ Batch: ${batchId} (${batch.id})`);

    // Daily logs
    console.log(`5. Seeding daily logs...`);
    const logs = [];
    for (let d = 9; d >= 0; d--) {
      const logDate = new Date(Date.now() - d * 86400000).toISOString().split('T')[0];
      const dayNum = 25 - d;
      const feedKg = Math.round((farm.capacity * 0.085 + dayNum * 8) * 10) / 10;
      logs.push({
        farm_id: farm.id,
        batch_id: batch.id,
        log_date: logDate,
        birds_dead: Math.floor(Math.random() * 3),
        morning_mortality: Math.floor(Math.random() * 2),
        evening_mortality: Math.floor(Math.random() * 2),
        total_mortality: Math.floor(Math.random() * 3),
        feed_given_kg: feedKg,
        feed_per_bird_g: Math.round((feedKg * 1000) / farm.capacity * 10) / 10,
        water_consumed_litres: Math.round(feedKg * 1.8),
        temperature_c: Math.round((28 + Math.random() * 4) * 10) / 10,
        source: 'manual',
        synced: true,
      });
    }
    const { error: logErr } = await supabase.from('daily_logs').insert(logs);
    console.log(logErr ? `  Logs error: ${logErr.message}` : `  ✅ ${logs.length} daily logs seeded`);
  }

  // 6. Price predictions
  console.log('6. Seeding predictions...');
  const preds = [];
  for (let d = 13; d >= 0; d--) {
    const date = new Date(Date.now() - d * 86400000);
    const basePrice = 155 + Math.random() * 15;
    preds.push({
      customer_id: USER_ID,
      district: 'Gorakhpur',
      prediction_date: date.toISOString().split('T')[0],
      prediction_status: 'completed',
      predicted_price: Math.round(basePrice * 10) / 10,
      confidence_interval_lower: Math.round((basePrice - 5) * 10) / 10,
      confidence_interval_upper: Math.round((basePrice + 8) * 10) / 10,
      model_version: 'ensemble_v3',
    });
  }
  const { error: predErr } = await supabase.from('predictions').insert(preds);
  console.log(predErr ? `  Predictions error: ${predErr.message}` : `  ✅ ${preds.length} predictions seeded`);

  console.log('\n=== ✅ Seed Complete ===');
  console.log(`User: Rajesh Yadav | Phone: ${TEST_PHONE} | ID: ${USER_ID}`);
}

function rand(len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

main().catch(e => { console.error(e); process.exit(1); });
