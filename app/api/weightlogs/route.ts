// app/api/weightlogs/route.ts
import { NextResponse } from 'next/server';
import { getWeightLogs } from '@/lib/db';

export async function GET() {
  try {
    const weightLogs = await getWeightLogs();
    return NextResponse.json(weightLogs);
  } catch (error) {
    console.error('Error fetching weight logs:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
      
    return NextResponse.json(
      { error: 'Failed to fetch weight logs', details: errorMessage },
      { status: 500 }
    );
  }
}