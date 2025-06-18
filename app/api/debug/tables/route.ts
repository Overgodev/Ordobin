// app/api/debug/tables/route.ts
import { NextResponse } from 'next/server'; // Import NextResponse
import { query } from '@/lib/db'; // Import query function

// Define listAllTables function here if it's not imported
export async function listAllTables() {
  try {
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    return result.rows.map(row => row.table_name);
  } catch (error) {
    console.error('Error listing tables:', error);
    throw error;
  }
}

// Define checkTablesExist function here if it's not imported
export async function checkTablesExist() {
  try {
    const actualTables = await listAllTables();
    console.log('Actual tables in database:', actualTables);
    
    // Check expected tables
    const expectedTables = ['users', 'cabinets', 'items', 'drawers', 'alerts', 'weightlogs'];
    
    const results: Record<string, boolean> = {};
    
    for (const table of expectedTables) {
      results[table] = actualTables.includes(table);
    }
    
    // Check for activity logs table with various possible names
    const possibleActivityLogNames = ['activity_logs', 'activitylogs', 'activity_log', 'activitylog'];
    results['activity_logs'] = possibleActivityLogNames.some(name => actualTables.includes(name));
    
    return results;
  } catch (error) {
    console.error('Error checking tables:', error);
    throw error;
  }
}

// The GET handler function
export async function GET() {
  try {
    const tables = await listAllTables();
    const tableExists = await checkTablesExist();
    
    return NextResponse.json({
      all_tables: tables,
      expected_tables_exist: tableExists,
      database_url: process.env.DATABASE_URL ? 'Set (value hidden)' : 'Not set'
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