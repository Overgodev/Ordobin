// app/api/cabinets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('Cabinets API called');
    
    const cabinets = await prisma.cabinet.findMany({
      include: {
        drawers: {
          include: {
            alerts: {
              where: { resolved: false }
            },
            weightlogs: {
              orderBy: { timestamp: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    console.log(`Found ${cabinets.length} cabinets in database`);

    // Transform to match your dashboard interface
    const transformedCabinets = cabinets.map(cabinet => {
      // Count active drawers (those with recent weight logs)
      const activeDrawers = cabinet.drawers.filter(drawer => 
        drawer.weightlogs.length > 0 && 
        drawer.weightlogs[0].timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;

      // Count total alerts for this cabinet
      const alertCount = cabinet.drawers.reduce((count, drawer) => 
        count + drawer.alerts.length, 0
      );

      return {
        id: cabinet.id,
        name: cabinet.label,
        location: cabinet.location || 'Unknown Location',
        drawerCount: cabinet.drawers.length,
        slotsWide: cabinet.slots_wide || 4,
        slotsTall: cabinet.slots_tall || 2,
        activeDrawers: activeDrawers,
        alertCount: alertCount
      };
    });

    console.log(`Transformed ${transformedCabinets.length} cabinets`);

    return NextResponse.json({
      success: true,
      data: transformedCabinets
    });
  } catch (error) {
    console.error('Cabinets API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cabinets: ' + (error as Error).message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}