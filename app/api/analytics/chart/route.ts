// app/api/analytics/chart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('Analytics API called');
    
    const url = new URL(request.url);
    const range = url.searchParams.get('range') || '24h';
    
    console.log('Generating chart data for range:', range);
    
    // For now, we'll generate realistic mock data
    // In the future, you can replace this with real analytics from your database
    const chartData = await generateChartData(range);

    return NextResponse.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics data: ' + (error as Error).message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function generateChartData(range: string) {
  const now = new Date();
  const data = [];
  
  let intervals: number, stepMs: number;
  
  switch (range) {
    case '24h':
      intervals = 24;
      stepMs = 60 * 60 * 1000; // 1 hour
      break;
    case '7d':
      intervals = 7;
      stepMs = 24 * 60 * 60 * 1000; // 1 day
      break;
    case '30d':
      intervals = 30;
      stepMs = 24 * 60 * 60 * 1000; // 1 day
      break;
    case '90d':
      intervals = 90;
      stepMs = 24 * 60 * 60 * 1000; // 1 day
      break;
    default:
      intervals = 24;
      stepMs = 60 * 60 * 1000;
  }
  
  try {
    // Get some real data to base our analytics on
    const totalDrawers = await prisma.drawer.count();
    const baseWeight = totalDrawers * 150; // Assume 150g average per drawer
    
    for (let i = intervals - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * stepMs));
      
      // Generate realistic data with trends and variance
      const timeProgress = (intervals - i) / intervals;
      const trend = Math.sin(timeProgress * Math.PI * 2) * 0.2; // 20% trend variation
      const noise = (Math.random() - 0.5) * 0.1; // 10% random noise
      
      const totalWeight = Math.floor(baseWeight * (1 + trend + noise));
      const expectedWeight = Math.floor(baseWeight * 1.1); // 10% buffer
      
      // Generate stock level data
      const lowStockBase = Math.max(0, Math.floor(totalDrawers * 0.15)); // 15% low stock
      const criticalStockBase = Math.max(0, Math.floor(totalDrawers * 0.05)); // 5% critical
      
      const lowStockVariation = Math.floor((Math.random() - 0.5) * 4);
      const criticalStockVariation = Math.floor((Math.random() - 0.5) * 2);
      
      data.push({
        timestamp: timestamp.toISOString(),
        date: timestamp.toLocaleDateString(),
        totalWeight,
        expectedWeight,
        discrepancy: Math.abs(totalWeight - expectedWeight),
        lowStockCount: Math.max(0, lowStockBase + lowStockVariation),
        criticalStockCount: Math.max(0, criticalStockBase + criticalStockVariation)
      });
    }
  } catch (dbError) {
    console.warn('Could not fetch real data for analytics, using defaults:', dbError);
    
    // Fallback to default mock data if database query fails
    const defaultBaseWeight = 12000;
    
    for (let i = intervals - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * stepMs));
      const baseWeight = defaultBaseWeight + Math.sin(i / intervals * Math.PI * 2) * 2000;
      const noise = (Math.random() - 0.5) * 1000;
      const totalWeight = Math.floor(baseWeight + noise);
      const expectedWeight = Math.floor(baseWeight * 1.1);
      
      data.push({
        timestamp: timestamp.toISOString(),
        date: timestamp.toLocaleDateString(),
        totalWeight,
        expectedWeight,
        discrepancy: Math.abs(totalWeight - expectedWeight),
        lowStockCount: Math.max(0, Math.floor(3 + (Math.random() - 0.5) * 2)),
        criticalStockCount: Math.max(0, Math.floor(1 + (Math.random() - 0.5)))
      });
    }
  }
  
  return data;
}