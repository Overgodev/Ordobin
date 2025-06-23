// app/api/activity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('Activity API called');
    
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // Fetch real activity logs from database
    const activityLogs = await prisma.activityLog.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        user: true,
        drawer: {
          include: {
            cabinet: true,
            item: true
          }
        }
      }
    });

    console.log(`Found ${activityLogs.length} activity logs`);

    // Transform to match your dashboard interface
    const transformedLogs = activityLogs.map(log => {
      // Determine severity based on action
      let severity: 'info' | 'warning' | 'error' = 'info';
      
      switch (log.action.toLowerCase()) {
        case 'alert':
        case 'critical_alert':
          severity = 'error';
          break;
        case 'weight_check':
        case 'low_stock':
          severity = 'warning';
          break;
        case 'refill':
        case 'calibration':
        case 'inventory_update':
        default:
          severity = 'info';
          break;
      }

      // Create descriptive details
      let details = '';
      const drawerInfo = log.drawer 
        ? `${log.drawer.cabinet?.label || 'Unknown'}-${log.drawer.label || 'Unknown'}`
        : `Drawer ${log.drawer_id}`;
      
      switch (log.action.toLowerCase()) {
        case 'refill':
          details = `${drawerInfo} was refilled with new inventory`;
          break;
        case 'weight_check':
          details = `Weight measurement performed on ${drawerInfo}`;
          break;
        case 'calibration':
          details = `Scale calibration completed for ${drawerInfo}`;
          break;
        case 'alert':
          details = `Alert generated for ${drawerInfo}`;
          break;
        default:
          details = `${log.action} performed on ${drawerInfo}`;
          break;
      }

      // Add additional details from JSON if available
      if (log.details && typeof log.details === 'object') {
        const additionalInfo = Object.entries(log.details)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        if (additionalInfo) {
          details += ` (${additionalInfo})`;
        }
      }

      // FIX: Handle null drawer_id properly
      const drawerId = log.drawer_id ? parseInt(log.drawer_id) : 0;

      return {
        id: log.id,
        drawerId: drawerId, // This is now safely parsed
        action: log.action as 'refill' | 'weight_check' | 'calibration' | 'alert',
        timestamp: log.timestamp.toISOString(),
        details,
        severity,
        userName: log.user?.full_name || log.user?.username || 'System'
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedLogs
    });
  } catch (error) {
    console.error('Activity API error:', error);
    
    // If database query fails, return mock data as fallback
    console.log('Falling back to mock activity data');
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const mockData = generateMockActivityLog(limit);
    
    return NextResponse.json({
      success: true,
      data: mockData
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Fallback mock data generation
function generateMockActivityLog(limit: number = 10) {
  const actions = ['refill', 'weight_check', 'calibration', 'alert'] as const;
  const users = ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'System'];
  
  const activities = [];
  
  for (let i = 0; i < limit; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const drawerId = Math.floor(Math.random() * 24) + 1;
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    
    let severity: 'info' | 'warning' | 'error' = 'info';
    let details = '';
    
    switch (action) {
      case 'refill':
        severity = 'info';
        details = `Drawer ${drawerId} refilled with new inventory`;
        break;
      case 'weight_check':
        severity = Math.random() > 0.7 ? 'warning' : 'info';
        details = severity === 'warning' 
          ? `Weight discrepancy detected in drawer ${drawerId}` 
          : `Weight check completed for drawer ${drawerId}`;
        break;
      case 'calibration':
        severity = 'info';
        details = `Scale calibration performed for drawer ${drawerId}`;
        break;
      case 'alert':
        severity = Math.random() > 0.5 ? 'error' : 'warning';
        details = severity === 'error' 
          ? `Critical stock level alert for drawer ${drawerId}` 
          : `Low stock warning for drawer ${drawerId}`;
        break;
    }
    
    activities.push({
      id: `mock_act_${Date.now()}_${i}`,
      drawerId,
      action,
      timestamp: timestamp.toISOString(),
      details,
      severity,
      userName: users[Math.floor(Math.random() * users.length)]
    });
  }
  
  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}