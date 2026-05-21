import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create portfolio info if not exists
  const existing = await prisma.portfolioInfo.findFirst();
  if (!existing) {
    await prisma.portfolioInfo.create({ data: {} });
    console.log('Created portfolio info');
  }

  // Create default experiences if none
  const expCount = await prisma.experience.count();
  if (expCount === 0) {
    await prisma.experience.createMany({
      data: [
        { role: 'Senior Art Director', company: 'Fuse Integrated', location: 'Riyadh, Saudi Arabia', startDate: 'May 2024', endDate: 'Present', type: 'Full Time/Remote', order: 0 },
        { role: 'Art Director', company: 'FP7 McCann', location: 'Cairo, Egypt', startDate: 'Aug 2024', endDate: 'Sep 2024', type: 'Freelance/Remote', order: 1 },
        { role: 'Senior Visual Artist', company: 'Acquaint Communications', location: 'Spain', startDate: '2022', endDate: '2024', type: 'Full Time/Remote', order: 2 },
        { role: 'Visual Artist', company: 'Freelip', location: 'Ho Chi Minh City, Vietnam', startDate: '2018', endDate: '2022', type: 'Full Time', order: 3 },
      ],
    });
    console.log('Created default experiences');
  }

  // Create default clients if none
  const clientCount = await prisma.client.count();
  if (clientCount === 0) {
    await prisma.client.createMany({
      data: [
        { name: 'Audi', order: 0 },
        { name: 'Maserati', order: 1 },
        { name: 'Volkswagen', order: 2 },
        { name: 'Toyota', order: 3 },
        { name: 'Honda', order: 4 },
        { name: 'KIA', order: 5 },
        { name: 'Geely', order: 6 },
        { name: 'Samsung', order: 7 },
        { name: 'CIB', order: 8 },
        { name: 'Alfanar', order: 9 },
        { name: 'Budget', order: 10 },
        { name: 'Huawei', order: 11 },
      ],
    });
    console.log('Created default clients');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
