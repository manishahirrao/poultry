import { createClient } from '@/utils/supabase/server';

interface SalaryRecord {
  net_salary: number;
  farm_allocations: Array<{ farm_id: string; allocation_pct: number }>;
  month: number;
  year: number;
  integrator_id: string;
}

interface Farm {
  id?: string;
  current_batch_id: string;
  integrator_id: string;
}

interface BatchGCCosts {
  labour_cost_total: number;
  batch_id: string;
  farm_id: string;
  integrator_id: string;
  updated_at: string;
}

/**
 * Sync labour cost from salary record to GC module
 * This utility is called when a salary record is marked as "Paid" or saved
 * It automatically updates GC for all farms affected by the salary allocation
 * 
 * @param salaryRecordId - The ID of the salary record that was just saved/paid
 * @returns Success status and details of updated farms
 */
export async function syncLabourCostToGC(
  salaryRecordId: string
): Promise<{ success: boolean; error?: string; updatedFarms?: string[] }> {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return { success: false, error: 'Database connection failed' };
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get the salary record with farm allocations
    const { data: record, error: recordError } = await supabase
      .from('salary_records')
      .select('net_salary, farm_allocations, month, year, integrator_id')
      .eq('id', salaryRecordId)
      .single();

    if (recordError || !record) {
      return { success: false, error: 'Salary record not found' };
    }

    const typedRecord = record as SalaryRecord;

    // Verify this salary record belongs to the current user
    if (typedRecord.integrator_id !== user.id) {
      return { success: false, error: 'Unauthorized access to salary record' };
    }

    if (!typedRecord.farm_allocations) {
      return { success: true, updatedFarms: [] }; // No farm allocations, nothing to sync
    }

    const allocations = typedRecord.farm_allocations;
    const updatedFarms: string[] = [];

    for (const alloc of allocations) {
      const farmLabourShare = typedRecord.net_salary * (alloc.allocation_pct / 100);

      // Get active batch for this farm
      const { data: farm, error: farmError } = await supabase
        .from('farms')
        .select('current_batch_id, integrator_id')
        .eq('id', alloc.farm_id)
        .single();

      if (farmError || !farm) {
        console.warn(`Farm ${alloc.farm_id} not found, skipping GC sync`);
        continue;
      }

      const typedFarm = farm as Farm;

      // Verify farm belongs to this integrator
      if (typedFarm.integrator_id !== user.id) {
        console.warn(`Farm ${alloc.farm_id} does not belong to current user, skipping GC sync`);
        continue;
      }

      if (!typedFarm.current_batch_id) {
        console.warn(`Farm ${alloc.farm_id} has no active batch, skipping GC sync`);
        continue;
      }

      // Sum ALL salary allocations for this farm for the current month/year
      // (we re-aggregate rather than adding incrementally to avoid double-counting)
      const { data: allSalaries, error: salariesError } = await supabase
        .from('salary_records')
        .select('net_salary, farm_allocations')
        .eq('month', typedRecord.month)
        .eq('year', typedRecord.year)
        .eq('payment_status', 'paid')
        .eq('integrator_id', user.id);

      if (salariesError) {
        console.error('Failed to fetch salary records for GC calculation:', salariesError);
        continue;
      }

      const totalFarmLabour = allSalaries?.reduce((sum: number, sr: any) => {
        const fa = sr.farm_allocations?.find((a: any) => a.farm_id === alloc.farm_id);
        return sum + (fa ? sr.net_salary * (fa.allocation_pct / 100) : 0);
      }, 0) ?? 0;

      // Update or create GC record for this batch
      const { error: gcError } = await supabase
        .from('batch_gc_costs')
        .upsert({
          labour_cost_total: totalFarmLabour,
          batch_id: typedFarm.current_batch_id,
          farm_id: alloc.farm_id,
          integrator_id: user.id,
          updated_at: new Date().toISOString(),
        } as any, {
          onConflict: 'batch_id'
        });

      if (gcError) {
        console.error('Failed to update GC record:', gcError);
        continue;
      }

      // Trigger GC recomputation
      const { error: rpcError } = await supabase.rpc('compute_batch_gc' as any, { 
        p_batch_id: typedFarm.current_batch_id 
      } as any);

      if (rpcError) {
        console.error('Failed to trigger GC recomputation:', rpcError);
        continue;
      }

      updatedFarms.push(alloc.farm_id);
    }

    return {
      success: true,
      updatedFarms,
    };
  } catch (error) {
    console.error('syncLabourCostToGC error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Sync labour cost for a specific farm and month
 * This is a utility function for manual sync or bulk operations
 * 
 * @param farmId - The ID of the farm to sync labour cost for
 * @param month - Month (1-12)
 * @param year - Year (e.g., 2026)
 * @returns Success status and updated labour cost
 */
export async function syncLabourCostForFarm(
  farmId: string,
  month: number,
  year: number
): Promise<{ success: boolean; error?: string; labourCost?: number }> {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return { success: false, error: 'Database connection failed' };
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify farm belongs to this integrator
    const { data: farm, error: farmError } = await supabase
      .from('farms')
      .select('id, current_batch_id, integrator_id')
      .eq('id', farmId)
      .eq('integrator_id', user.id)
      .single();

    if (farmError || !farm) {
      return { success: false, error: 'Farm not found' };
    }

    const typedFarm = farm as Farm;

    if (!typedFarm.current_batch_id) {
      return { success: false, error: 'No active batch for this farm' };
    }

    // Get all salary records for this month/year
    const { data: allSalaries, error: salariesError } = await supabase
      .from('salary_records')
      .select('net_salary, farm_allocations')
      .eq('month', month)
      .eq('year', year)
      .eq('payment_status', 'paid')
      .eq('integrator_id', user.id);

    if (salariesError) {
      return { success: false, error: 'Failed to fetch salary records' };
    }

    // Calculate total labour cost for this farm
    const totalFarmLabour = allSalaries?.reduce((sum: number, sr: any) => {
      const fa = sr.farm_allocations?.find((a: any) => a.farm_id === farmId);
      return sum + (fa ? sr.net_salary * (fa.allocation_pct / 100) : 0);
    }, 0) ?? 0;

    // Update GC record
    const { error: gcError } = await supabase
      .from('batch_gc_costs')
      .upsert({
        labour_cost_total: totalFarmLabour,
        batch_id: typedFarm.current_batch_id,
        farm_id: farmId,
        integrator_id: user.id,
        updated_at: new Date().toISOString(),
      } as any, {
        onConflict: 'batch_id'
      });

    if (gcError) {
      return { success: false, error: 'Failed to update GC record' };
    }

    // Trigger GC recomputation
    const { error: rpcError } = await supabase.rpc('compute_batch_gc' as any, { 
      p_batch_id: typedFarm.current_batch_id 
    } as any);

    if (rpcError) {
      return { success: false, error: 'Failed to trigger GC recomputation' };
    }

    return {
      success: true,
      labourCost: totalFarmLabour,
    };
  } catch (error) {
    console.error('syncLabourCostForFarm error:', error);
    return { success: false, error: 'Internal server error' };
  }
}
