import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    let info = await db.portfolioInfo.findFirst();
    if (!info) {
      info = await db.portfolioInfo.create({ data: {} });
    }
    return NextResponse.json(info);
  } catch (error) {
    console.error('Error fetching portfolio info:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio info' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    let info = await db.portfolioInfo.findFirst();
    if (!info) {
      info = await db.portfolioInfo.create({ data });
    } else {
      info = await db.portfolioInfo.update({
        where: { id: info.id },
        data,
      });
    }
    return NextResponse.json(info);
  } catch (error) {
    console.error('Error updating portfolio info:', error);
    return NextResponse.json({ error: 'Failed to update portfolio info' }, { status: 500 });
  }
}
