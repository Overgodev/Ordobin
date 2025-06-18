// app/api/cabinets/route.ts
import { NextResponse } from 'next/server';
import { getCabinets } from '@/lib/db';

export async function GET() {
  try {
    const cabinets = await getCabinets();
    return NextResponse.json(cabinets);
  } catch (error) {
    console.error('Error fetching cabinets:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
      
    return NextResponse.json(
      { error: 'Failed to fetch cabinets', details: errorMessage },
      { status: 500 }
    );
  }
}