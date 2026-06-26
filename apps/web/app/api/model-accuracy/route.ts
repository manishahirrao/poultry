import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get accuracy metrics from database or return mock data
    // For now, return mock data
    const accuracyData = {
      mape_30d: 4.8,
      directional_accuracy_30d: 95.2,
      mape_7d: 3.2,
      directional_accuracy_7d: 96.5,
      total_predictions: 847,
      last_updated: new Date().toISOString(),
    };

    return NextResponse.json(accuracyData);
  } catch (error) {
    console.error('Error fetching model accuracy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
