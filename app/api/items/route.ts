import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const items = await prisma.item.findMany({ include: { drawers: true } });
  return NextResponse.json(items);
}
