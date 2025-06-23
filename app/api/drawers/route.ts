// app/api/drawers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('Drawers API called');
    
    const drawers = await prisma.drawer.findMany({
      include: {
        cabinet: true,
        item: true,
        weightlogs: {
          orderBy: { timestamp: 'desc' },
          take: 1 // Get the most recent weight log
        },
        alerts: {
          where: { resolved: false },
          orderBy: { created_at: 'desc' }
        }
      }
    });

    console.log(`Found ${drawers.length} drawers in database`);

    // Transform to match your dashboard interface
    const transformedDrawers = drawers.map((drawer, index) => {
      const latestWeight = drawer.weightlogs[0]?.measured_weight || 0;
      const expectedWeight = drawer.item?.unit_weight 
        ? (drawer.item.unit_weight * (drawer.quantity || 1))
        : 100; // Default expected weight

      // Determine status based on weight and alerts
      let status: 'good' | 'low' | 'critical' = 'good';
      
      if (drawer.alerts.length > 0) {
        const hasCritical = drawer.alerts.some(alert => alert.severity === 'critical');
        const hasWarning = drawer.alerts.some(alert => alert.severity === 'warning');
        
        if (hasWarning) status = 'low';
        if (hasCritical) status = 'critical';
      } else {
        // Check weight-based status
        const fillPercentage = expectedWeight > 0 ? latestWeight / expectedWeight : 1;
        if (fillPercentage < 0.2) status = 'critical';
        else if (fillPercentage < 0.4) status = 'low';
      }

      return {
        id: index + 1,
        cabinetId: drawer.cabinet?.label || 'Unknown',
        drawerNumber: parseInt(drawer.label?.replace(/\D/g, '') || '1'),
        itemType: drawer.item?.name || drawer.item?.type || 'Unknown Item',
        expectedWeight: Math.round(expectedWeight),
        actualWeight: Math.round(latestWeight),
        quantity: drawer.quantity || 0,
        unitWeight: drawer.item?.unit_weight || 0,
        lastUpdated: drawer.weightlogs[0]?.timestamp?.toISOString() || new Date().toISOString(),
        status,
        location: drawer.cabinet?.location || 'Unknown Location',
        nfcTag: drawer.nfc_tag,
        qrCode: drawer.qr_code,
        hasAlerts: drawer.alerts.length > 0
      };
    });

    console.log(`Transformed ${transformedDrawers.length} drawers`);

    return NextResponse.json({
      success: true,
      data: transformedDrawers
    });
  } catch (error) {
    console.error('Drawers API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch drawers: ' + (error as Error).message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}