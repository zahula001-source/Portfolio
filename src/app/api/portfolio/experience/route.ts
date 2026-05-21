import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const experiences = await db.experience.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(experiences);
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return NextResponse.json({ error: 'Failed to fetch experiences' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const experience = await db.experience.create({ data });
    return NextResponse.json(experience);
  } catch (error) {
    console.error('Error creating experience:', error);
    return NextResponse.json({ error: 'Failed to create experience' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await db.experience.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting experience:', error);
    return NextResponse.json({ error: 'Failed to delete experience' }, { status: 500 });
  }
}
