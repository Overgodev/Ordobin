// app/api/drawers/route.ts
import { NextResponse } from 'next/server';
import { getDrawers } from '@/lib/db';

export async function GET() {
  try {
    const drawers = await getDrawers();
    return NextResponse.json(drawers);
  } catch (error) {
    console.error('Error fetching drawers:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
      
    return NextResponse.json(
      { error: 'Failed to fetch drawers', details: errorMessage },
      { status: 500 }
    );
  }
}