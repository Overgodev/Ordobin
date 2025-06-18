// app/api/alerts/route.ts
import { NextResponse } from 'next/server';
import { getAlerts } from '@/lib/db';

export async function GET() {
  try {
    const alerts = await getAlerts();
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
      
    return NextResponse.json(
      { error: 'Failed to fetch alerts', details: errorMessage },
      { status: 500 }
    );
  }
}