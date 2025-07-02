import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (existingAdmin) {
    console.log('Admin zaten mevcut:', existingAdmin.email);
    return;
  }

  const password = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'ar-el Catering',
      email: 'admin@arel.com',
      password,
      role: 'ADMIN',
    },
  });
  console.log('Admin oluşturuldu:', admin.email);
}

main().finally(() => prisma.$disconnect()); 