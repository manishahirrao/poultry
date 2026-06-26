import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric') || 'fcr';

    // Industry averages for broiler production in India
    // These are benchmark values based on industry standards
    const industryAverages: Record<string, any> = {
      fcr: {
        'day-7': 1.1,
        'day-14': 1.3,
        'day-21': 1.5,
        'day-28': 1.65,
        'day-35': 1.75,
        'day-42': 1.85,
        'day-49': 1.95,
      },
      mortality: {
        'day-7': 0.5,
        'day-14': 1.0,
        'day-21': 1.5,
        'day-28': 2.0,
        'day-35': 2.5,
        'day-42': 3.0,
        'day-49': 3.5,
      },
      weight: {
        'day-7': 150,
        'day-14': 350,
        'day-21': 650,
        'day-28': 1000,
        'day-35': 1400,
        'day-42': 1800,
        'day-49': 2100,
      },
      feed_per_bird: {
        'day-7': 200,
        'day-14': 500,
        'day-21': 900,
        'day-28': 1400,
        'day-35': 1950,
        'day-42': 2550,
        'day-49': 3200,
      },
    };

    if (!industryAverages[metric]) {
      return NextResponse.json({ error: 'Invalid metric' }, { status: 400 });
    }

    return NextResponse.json({
      metric,
      averages: industryAverages[metric],
      source: 'Industry benchmarks for Indian broiler production',
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in industry averages API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
