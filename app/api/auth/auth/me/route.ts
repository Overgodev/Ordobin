import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/utils';
import { ApiResponse } from '@/lib/types';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const cabinets = await prisma.cabinet.findMany({
      include: {
        drawers: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                type: true,
                unit_weight: true
              }
            },
            alerts: {
              where: { resolved: false },
              select: {
                id: true,
                alert_type: true,
                severity: true,
                message: true,
                created_at: true
              }
            },
            _count: {
              select: {
                weightlogs: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: cabinets
    });

  } catch (error) {
    console.error('Cabinets fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
