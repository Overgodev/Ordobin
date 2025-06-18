// app/api/activity-logs/route.ts
import { NextResponse } from 'next/server';
import { getActivityLogs } from '@/lib/db';

export async function GET() {
  try {
    const logs = await getActivityLogs();
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
      
    return NextResponse.json(
      { error: 'Failed to fetch activity logs', details: errorMessage },
      { status: 500 }
    );
  }
}