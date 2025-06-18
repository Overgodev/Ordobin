// lib/db.ts - Updated to match your existing schema
import { Pool } from 'pg';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
});

// Helper function to execute queries
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error', error);
    throw error;
  }
}

// Data access functions based on your actual schema

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

// For users
export async function getUsers() {
  try {
    const result = await query(`
      SELECT id, username, full_name, email, is_active, created_at, updated_at
      FROM users
      ORDER BY username
    `);
    return result.rows;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

// For cabinets
export async function getCabinets() {
  try {
    const result = await query(`
      SELECT id, label, location, slots_wide, slots_tall
      FROM cabinets
      ORDER BY label
    `);
    return result.rows;
  } catch (error) {
    console.error('Error fetching cabinets:', error);
    throw error;
  }
}

// For items
export async function getItems() {
  const result = await query(`
    SELECT id, name, type, unit_weight, description
    FROM items
    ORDER BY name
  `);
  return result.rows;
}

// For drawers with joined data
export async function getDrawers() {
  try {
    const result = await query(`
      SELECT d.id, d.cabinet_id, d.label, d.item_id, d.quantity, 
             d.nfc_tag, d.qr_code, d.slot_x, d.slot_y,
             c.label as cabinet_label, i.name as item_name
      FROM drawers d
      JOIN cabinets c ON d.cabinet_id = c.id
      JOIN items i ON d.item_id = i.id
      ORDER BY d.label
    `);
    return result.rows;
  } catch (error) {
    console.error('Error fetching drawers:', error);
    throw error;
  }
}

// For activity logs
export async function getActivityLogs() {
  try {
    // First check if the table exists and determine its correct name
    const tables = await listAllTables();
    console.log('Available tables:', tables);
    
    // Try different possible table names based on common naming conventions
    const possibleNames = ['activity_logs', 'activitylogs', 'activity_log', 'activitylog'];
    let tableName = null;
    
    for (const name of possibleNames) {
      if (tables.includes(name)) {
        tableName = name;
        console.log(`Found activity logs table as: ${tableName}`);
        break;
      }
    }
    
    if (!tableName) {
      throw new Error('Activity logs table not found in database. Available tables: ' + tables.join(', '));
    }
    
    // Use the correct table name in the query with double quotes to properly escape it
    const result = await query(`
      SELECT a.id, a.user_id, a.action, a.drawer_id, a.details, a.timestamp,
             u.full_name as user_name, d.label as drawer_label
      FROM "${tableName}" a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN drawers d ON a.drawer_id = d.id
      ORDER BY a.timestamp DESC
    `);
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    throw error;
  }
}


// For alerts
export async function getAlerts() {
  try {
    const result = await query(`
      SELECT a.id, a.drawer_id, a.alert_type, a.severity, a.message, a.resolved, a.created_at,
             d.label as drawer_label
      FROM alerts a
      LEFT JOIN drawers d ON a.drawer_id = d.id
      ORDER BY a.resolved, a.severity, a.created_at DESC
    `);
    return result.rows;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
}

// For weightlogs
export async function getWeightLogs() {
  try {
    const result = await query(`
      SELECT w.id, w.drawer_id, w.timestamp, w.measured_weight, w.note,
             d.label as drawer_label, i.name as item_name
      FROM weightlogs w
      JOIN drawers d ON w.drawer_id = d.id
      JOIN items i ON d.item_id = i.id
      ORDER BY w.timestamp DESC
    `);
    return result.rows;
  } catch (error) {
    console.error('Error fetching weight logs:', error);
    throw error;
  }
}

// Check if tables exist in the database
export async function checkTablesExist() {
  try {
    const expectedTables = ['users', 'cabinets', 'items', 'drawers', 'alerts', 'weightlogs'];
    const results: Record<string, boolean> = {}; // Cleaner syntax
    
    // Get all actual tables first (more efficient than querying for each one)
    const actualTables = await listAllTables();
    console.log('Actual tables in database:', actualTables);
    
    // Check each expected table
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

// Get column information for debugging
export async function getTableColumns(tableName: string) {
  try {
    const result = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = $1
      ORDER BY ordinal_position;
    `, [tableName]);
    
    return result.rows;
  } catch (error) {
    console.error(`Error getting columns for ${tableName}:`, error);
    throw error;
  }
}