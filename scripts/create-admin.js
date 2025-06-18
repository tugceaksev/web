const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // MongoDB bağlantısını test et
    await prisma.$connect();
    console.log('MongoDB bağlantısı başarılı!');

    // Admin şifresini hash'le
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Şifre hash\'lendi');

    // Admin kullanıcısını oluştur veya güncelle
    const admin = await prisma.user.upsert({
      where: {
        email: 'admin@admin.com',
      },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
        name: 'Admin',
      },
      create: {
        email: 'admin@admin.com',
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    
    console.log('Admin kullanıcısı başarıyla oluşturuldu:');
    console.log('ID:', admin.id);
    console.log('Email:', admin.email);
    console.log('Name:', admin.name);
    console.log('Role:', admin.role);
    console.log('Password Hash:', admin.password.substring(0, 20) + '...');
    console.log('Created At:', admin.createdAt);

    // Tüm kullanıcıları listele
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    console.log('\nVeritabanındaki tüm kullanıcılar:');
    allUsers.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - ${user.name}`);
    });

  } catch (error) {
    console.error('Hata oluştu:', error);
    
    if (error.code === 'P2010') {
      console.error('MongoDB bağlantı hatası. DATABASE_URL\'i kontrol edin.');
    } else if (error.code === 'P2002') {
      console.error('Bu e-posta adresi zaten kullanılıyor.');
    }
  } finally {
    await prisma.$disconnect();
    console.log('\nMongoDB bağlantısı kapatıldı.');
  }
}

main(); 