const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const crypto = require('crypto');

// Load environment variables from apps/web/.env.local
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

// The user ID from previous steps
const USER_ID = '5c01e14e-aa45-4f57-92e5-7f4c6b84e8ad'; 

function generateUUID() {
  return crypto.randomUUID();
}

// Fixed UUIDs to prevent duplicates on re-runs
const FARM1_ID = 'bdbda976-ce00-41cc-8635-47d1a50e748c'; 
const FARM2_ID = 'a12ba976-ce00-41cc-8635-47d1a50e748d'; 
const BATCH1_ID = 'e3bda976-ce00-41cc-8635-47d1a50e748e';
const BATCH2_ID = 'f4bda976-ce00-41cc-8635-47d1a50e748f';
const SHED1_ID = 'b3bda976-ce00-41cc-8635-47d1a50e748e';
const SHED2_ID = 'c4bda976-ce00-41cc-8635-47d1a50e748f';
const SHED3_ID = 'd5bda976-ce00-41cc-8635-47d1a50e748f';

async function seedData() {
  console.log('🌱 Starting comprehensive data seed...');

  // 1. Clear old test data for this user
  console.log('Clearing old test data...');
  await supabase.from('daily_logs').delete().in('batch_id', [BATCH1_ID, BATCH2_ID]);
  await supabase.from('batches').delete().in('id', [BATCH1_ID, BATCH2_ID]);
  await supabase.from('sheds').delete().in('id', [SHED1_ID, SHED2_ID, SHED3_ID]);
  await supabase.from('farms').delete().in('id', [FARM1_ID, FARM2_ID]);
  await supabase.from('alerts').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all alerts
  await supabase.from('predictions').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 3. Create Farms
  console.log('Creating Farms...');
  const farmsToInsert = [
    {
      id: FARM1_ID,
      integrator_id: USER_ID,
      name: 'Sunrise Broiler Unit',
      farm_type: 'broiler',
      district: 'Pune',
      state: 'Maharashtra',
      total_capacity: 15000,
      status: 'active'
    },
    {
      id: FARM2_ID,
      integrator_id: USER_ID,
      name: 'Green Valley Poultry Farm',
      farm_type: 'broiler',
      district: 'Nashik',
      state: 'Maharashtra',
      total_capacity: 20000,
      status: 'active'
    }
  ];

  const { error: farmErr } = await supabase.from('farms').insert(farmsToInsert);
  if (farmErr) {
    console.error('Failed to create farms:', farmErr);
    return;
  }

  // 4. Create Sheds
  console.log('Creating Sheds...');
  const shedsToInsert = [
    { id: SHED1_ID, farm_id: FARM1_ID, shed_number: 1, name: 'Shed 1 - East', capacity: 7500, shed_type: 'open_sided', floor_type: 'litter' },
    { id: SHED2_ID, farm_id: FARM1_ID, shed_number: 2, name: 'Shed 2 - West', capacity: 7500, shed_type: 'open_sided', floor_type: 'litter' },
    { id: SHED3_ID, farm_id: FARM2_ID, shed_number: 1, name: 'Main Env Shed', capacity: 20000, shed_type: 'env_controlled', floor_type: 'slat' },
  ];
  const { error: shedErr } = await supabase.from('sheds').insert(shedsToInsert);
  if (shedErr) console.error('Failed to create sheds:', shedErr);

  // 5. Create Batches
  console.log('Creating Batches...');
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const placementDate1 = thirtyDaysAgo.toISOString().split('T')[0];

  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
  const placementDate2 = fifteenDaysAgo.toISOString().split('T')[0];

  // ONLY inserting columns added by our SQL script, to avoid "column does not exist" errors
  const batchesToInsert = [
    {
      id: BATCH1_ID,
      farm_id: FARM1_ID,
      customer_id: USER_ID,
      integrator_id: USER_ID,
      batch_number: 101,
      batch_id: 'B101',
      breed: 'Cobb 430',
      status: 'growing',
      placement_date: placementDate1,
      doc_placement_date: placementDate1,
      birds_placed: 15000,
      doc_count: 15000,
      target_harvest_age: 42
    },
    {
      id: BATCH2_ID,
      farm_id: FARM2_ID,
      customer_id: USER_ID,
      integrator_id: USER_ID,
      batch_number: 102,
      batch_id: 'B102',
      breed: 'Ross 308',
      status: 'growing',
      placement_date: placementDate2,
      doc_placement_date: placementDate2,
      birds_placed: 20000,
      doc_count: 20000,
      target_harvest_age: 40
    }
  ];
  
  const { error: batchErr } = await supabase.from('batches').insert(batchesToInsert);
  if (batchErr) {
    console.error('Failed to create batches:', batchErr);
    return;
  }

  // 6. Generate Daily Logs (FCR, Mortality, Feed)
  console.log('Generating 45 days of Daily Logs for metrics...');
  const logsToInsert = [];
  
  // Batch 1 (Day 1 to 30)
  for (let day = 1; day <= 30; day++) {
    const logDate = new Date(thirtyDaysAgo);
    logDate.setDate(logDate.getDate() + day);
    
    logsToInsert.push({
      batch_id: BATCH1_ID,
      farm_id: FARM1_ID,
      log_date: logDate.toISOString().split('T')[0],
      batch_day: day,
      deaths_today: Math.floor(Math.random() * 5),
      feed_consumed_kg: 50 + (day * 4)
    });
  }

  // Batch 2 (Day 1 to 15)
  for (let day = 1; day <= 15; day++) {
    const logDate = new Date(fifteenDaysAgo);
    logDate.setDate(logDate.getDate() + day);
    
    logsToInsert.push({
      batch_id: BATCH2_ID,
      farm_id: FARM2_ID,
      log_date: logDate.toISOString().split('T')[0],
      batch_day: day,
      deaths_today: Math.floor(Math.random() * 3),
      feed_consumed_kg: 70 + (day * 4.5)
    });
  }

  const { error: logErr } = await supabase.from('daily_logs').insert(logsToInsert);
  if (logErr) {
    console.error('Failed to create daily logs:', logErr);
  }

  // 8. Alerts
  console.log('Creating active alerts...');
  await supabase.from('alerts').insert([
    {
      type: 'disease',
      severity: 'HIGH',
      districts: ['Pune', 'Nashik'],
      title_en: 'Avian Flu Outbreak detected in nearby district',
      title_hi: 'Avian Flu Outbreak detected in nearby district',
      body_en: 'Strict biosecurity measures required immediately.',
      body_hi: 'Strict biosecurity measures required immediately.',
      is_active: true,
      issued_at: new Date().toISOString()
    },
    {
      type: 'weather',
      severity: 'MEDIUM',
      districts: ['Nashik'],
      title_en: 'Heatwave Warning (40°C+ expected)',
      title_hi: 'Heatwave Warning (40°C+ expected)',
      body_en: 'Ensure proper ventilation and cooling pads are operational.',
      body_hi: 'Ensure proper ventilation and cooling pads are operational.',
      is_active: true,
      issued_at: new Date().toISOString()
    }
  ]);

  // 9. Market Predictions
  console.log('Creating market predictions...');
  const todayStr = new Date().toISOString().split('T')[0];
  await supabase.from('predictions').insert([
    {
      mandi: 'Pune',
      prediction_date: todayStr,
      predicted_at: new Date().toISOString(),
      p10: 95, p50: 98, p90: 102,
      sell_signal: 'HOLD',
      confidence: 85,
      model_version: 'v2.1',
      is_demo: false
    }
  ]);

  console.log('✅ Success! The dashboard should now be fully populated.');
}

seedData();
