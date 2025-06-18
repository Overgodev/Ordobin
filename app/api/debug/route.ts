// app/api/debug/route.ts - A helper endpoint for debugging database issues
import { NextResponse } from 'next/server';
import { checkTablesExist, getTableColumns } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Get the URL parameters
    const url = new URL(request.url);
    const table = url.searchParams.get('table');
    
    // Check if all tables exist
    const tablesExist = await checkTablesExist();
    
    // If a specific table is requested, get its columns
    let columns = null;
    if (table) {
      columns = await getTableColumns(table);
    }
    
    return NextResponse.json({
      tablesExist,
      columns,
      database_url_exists: !!process.env.DATABASE_URL,
      node_env: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
      
    return NextResponse.json(
      { error: 'Debug operation failed', details: errorMessage },
      { status: 500 }
    );
  }
}