import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create example categories if none
  const catCount = await prisma.category.count();
  if (catCount === 0) {
    await prisma.category.createMany({
      data: [
        { name: 'Video Vlogs', slug: 'video-vlogs', icon: '🎬', type: 'video', description: 'Video vlog đời sống hàng ngày', order: 0 },
        { name: 'Video Spa', slug: 'video-spa', icon: '🧖', type: 'video', description: 'Video về các dịch vụ spa', order: 1 },
        { name: 'Ảnh Sản Phẩm', slug: 'anh-san-pham', icon: '📸', type: 'image', description: 'Hình ảnh sản phẩm chất lượng cao', order: 2 },
        { name: 'Behind The Scenes', slug: 'behind-the-scenes', icon: '🎥', type: 'mixed', description: 'Hậu trường sáng tạo', order: 3 },
      ],
    });
    console.log('Created example categories');
  } else {
    console.log('Categories already exist:', catCount);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
