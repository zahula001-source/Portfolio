import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { url, title, categoryId } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    // Determine embed type and extract info
    let embedUrl = '';
    let thumbnailUrl = '';
    let embedType = 'embed';
    let autoTitle = title || '';

    // YouTube patterns
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      const videoId = ytMatch[1];
      // Use youtube.com/embed (not nocookie which causes Lỗi 153)
      // Store base embed URL without autoplay - lightbox will add it on click
      embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
      thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      if (!autoTitle) autoTitle = `YouTube Video`;
    }

    // TikTok patterns
    const ttMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
    if (ttMatch) {
      const videoId = ttMatch[1];
      embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;
      thumbnailUrl = '';
      if (!autoTitle) autoTitle = `TikTok Video`;
    }

    // If no pattern matched, try to use URL as-is in iframe
    if (!embedUrl) {
      embedUrl = url;
      if (!autoTitle) autoTitle = 'Embedded Video';
    }

    const mediaItem = await db.mediaItem.create({
      data: {
        title: autoTitle,
        description: url, // Store original URL in description
        type: embedType,
        url: embedUrl,       // Embed URL for iframe
        thumbnail: thumbnailUrl, // YouTube thumbnail
        categoryId: categoryId || undefined,
      },
    });

    return NextResponse.json(mediaItem);
  } catch (error) {
    console.error('Error creating embed:', error);
    return NextResponse.json({ error: 'Failed to create embed' }, { status: 500 });
  }
}
