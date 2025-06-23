// app/api/items/route.ts
import { NextResponse } from 'next/server';
import { getItems } from '@/lib/db';

export async function GET() {
  try {
    const items = await getItems();
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
      
    return NextResponse.json(
      { error: 'Failed to fetch items', details: errorMessage },
      { status: 500 }
    );
  }
}