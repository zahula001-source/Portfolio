import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const info = await db.portfolioInfo.findFirst();
    
    if (!info) {
      return NextResponse.json({ error: 'Portfolio not configured' }, { status: 404 });
    }

    if (password === info.adminPassword) {
      return NextResponse.json({ authenticated: true });
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (error) {
    console.error('Error authenticating:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
