import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // SEED:
  // 1. generate employees + 1 admin
  // 2. generate one cycle of attendance on one of the employees

  await prisma.employee.create({
    data: {
      name: 'Admin HR',
      email: 'administrator@dexa.co.id',
      passwordHash,
      position: 'HR Manager',
      phone: '081200000000',
      role: 'ADMIN',
    },
  });

  const daffa = await prisma.employee.create({
    data: {
      name: 'Daffa Pradana',
      email: 'daffa@dexa.co.id',
      passwordHash,
      position: 'Software Engineer',
      phone: '081200000001',
    },
  });

  await prisma.employee.create({
    data: {
      name: 'Maevy Marvella',
      email: 'maevy@dexa.co.id',
      passwordHash,
      position: 'Mobile Developer',
      phone: '081200000002',
    },
  });

  await prisma.employee.create({
    data: {
      name: 'Eko Khannedy',
      email: 'eko@dexa.co.id',
      passwordHash,
      position: 'Solution Architect',
      phone: '081200000003',
    },
  });

  await prisma.attendance.create({
    data: {
      employeeId: daffa.id,
      status: 'MASUK',
      recordedAt: new Date('2026-08-25T08:00:00+07:00'),
    },
  });

  await prisma.attendance.create({
    data: {
      employeeId: daffa.id,
      status: 'PULANG',
      recordedAt: new Date('2026-08-25T17:00:00+07:00'),
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
