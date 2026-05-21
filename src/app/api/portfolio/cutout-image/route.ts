import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || '.png';
    const filename = `cutout-${Date.now()}${ext}`;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;

    let info = await db.portfolioInfo.findFirst();
    if (info) {
      info = await db.portfolioInfo.update({
        where: { id: info.id },
        data: { cutoutImage: url },
      });
    }

    return NextResponse.json({ url, info });
  } catch (error) {
    console.error('Error uploading cutout image:', error);
    return NextResponse.json({ error: 'Failed to upload cutout image' }, { status: 500 });
  }
}
