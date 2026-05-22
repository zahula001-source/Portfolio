// Seed script for Render deployment
// This runs on every server start to populate the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Check if data already exists
  const existingInfo = await prisma.portfolioInfo.findFirst();
  if (existingInfo) {
    console.log('Database already has data, skipping seed...');
    return;
  }

  console.log('Seeding database...');

  // 1. Portfolio Info
  await prisma.portfolioInfo.create({
    data: {
      name: "PHAM VĂN MINH",
      title: "Senior Creative & Art Director",
      tagline: "250+ Clients. 12+ Years. One obsessive visual mind.",
      bio: "I'm not just an artist in advertising—I'm the one who makes people stop scrolling, start feeling, and actually remember.",
      email: "phamvanminh@gmail.com",
      phone: "+84123456789",
      location: "Ho Chi Minh City, Vietnam",
      behanceUrl: "https://www.behance.net/phamvanminh",
      profileImage: "/uploads/profile-1779283502788.png",
      profilePosX: 50,
      profilePosY: 50,
      profileScale: 100,
      cutoutImage: "/uploads/cutout-1779280841740.png",
      featherAmount: 26,
      cutoutScale: 100,
      cutoutPosY: 0,
      zaloLink: "https://zalo.me/84123456789",
      zaloIcon: "/uploads/zalo-icon.png",
      zaloQr: "/uploads/zalo-qr.jpg",
      adminPassword: "minh2024",
    }
  });

  // 2. Categories with items
  const cat1 = await prisma.category.create({
    data: { name: "Video Vlogs", slug: "video-vlogs", type: "video", order: 0 }
  });
  await prisma.mediaItem.createMany({
    data: [
      { title: "0517 (1)(2).png", type: "image", url: "/uploads/1779273637319-prwowm.png", categoryId: cat1.id, order: 0 },
      { title: "0517 (1).png", type: "image", url: "/uploads/1779273637989-7vf3ly.png", categoryId: cat1.id, order: 1 },
      { title: "IMG_1237.MP4", type: "video", url: "/uploads/1779273698459-u86fk8.MP4", categoryId: cat1.id, order: 2 },
    ]
  });

  const cat2 = await prisma.category.create({
    data: { name: "Video Spa", slug: "video-spa", type: "video", order: 1 }
  });
  await prisma.mediaItem.createMany({
    data: [
      { title: "tải xuống (5).jfif", type: "image", url: "/uploads/1779273634428-66hkii.jfif", categoryId: cat2.id, order: 0 },
      { title: "tải xuống (4).jfif", type: "image", url: "/uploads/1779273634917-6iwztt.jfif", categoryId: cat2.id, order: 1 },
      { title: "tải xuống (3).jfif", type: "image", url: "/uploads/1779273635336-7kfqo0.jfif", categoryId: cat2.id, order: 2 },
      { title: "tải xuống (2).jfif", type: "image", url: "/uploads/1779273635833-d0nbw3.jfif", categoryId: cat2.id, order: 3 },
      { title: "tải xuống (1).jfif", type: "image", url: "/uploads/1779273636328-50zjt9.jfif", categoryId: cat2.id, order: 4 },
      { title: "IMG_1237.MP4", type: "video", url: "/uploads/1779273693336-mwnyzk.MP4", categoryId: cat2.id, order: 5 },
    ]
  });

  const cat3 = await prisma.category.create({
    data: { name: "Ảnh Sản Phẩm", slug: "anh-san-pham", type: "image", order: 2 }
  });
  await prisma.mediaItem.createMany({
    data: [
      { title: "3_tạo_ảnh.jpg", type: "image", url: "/uploads/1779273653107-fnfhda.jpg", categoryId: cat3.id, order: 0 },
      { title: "2_tạo_ảnh.jpg", type: "image", url: "/uploads/1779273653355-934n6x.jpg", categoryId: cat3.id, order: 1 },
      { title: "1_tạo_ảnh.jpg", type: "image", url: "/uploads/1779273653655-z3524w.jpg", categoryId: cat3.id, order: 2 },
      { title: "IMG_1237.MP4", type: "video", url: "/uploads/1779273671624-fp0mwu.MP4", categoryId: cat3.id, order: 3 },
    ]
  });

  const cat4 = await prisma.category.create({
    data: { name: "Behind The Scenes", slug: "behind-the-scenes", type: "mixed", order: 3 }
  });
  await prisma.mediaItem.create({
    data: { title: "chào bạn", type: "embed", url: "https://www.youtube.com/embed/UmxYyUUqIkg?rel=0&modestbranding=1", categoryId: cat4.id, order: 0 }
  });

  // 3. Clients
  await prisma.client.createMany({
    data: [
      { name: "Audi", order: 0 },
      { name: "Toyota", order: 1 },
      { name: "Honda", order: 2 },
      { name: "KIA", order: 3 },
      { name: "Geely", order: 4 },
      { name: "Samsung", order: 5 },
      { name: "CIB", order: 6 },
      { name: "Alfanar", order: 7 },
      { name: "Budget", order: 8 },
      { name: "hip hop", logo: "/uploads/1779281293066-d83u5h.jpg", order: 9 },
    ]
  });

  // 4. Experience
  await prisma.experience.createMany({
    data: [
      { role: "Senior Art Director", company: "Fuse Integrated", location: "", startDate: "", endDate: "", type: "", order: 0 },
      { role: "Art Director", company: "FP7 McCann", location: "", startDate: "", endDate: "", type: "", order: 1 },
    ]
  });

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
