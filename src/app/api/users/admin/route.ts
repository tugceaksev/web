import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Yetkiniz yok' }, { status: 403 });
    }
    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Tüm alanları doldurun' }, { status: 400 });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'Bu e-posta zaten kayıtlı' }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    return NextResponse.json({ message: 'Admin başarıyla eklendi' });
  } catch {
    return NextResponse.json({ message: 'Sunucu hatası veya beklenmeyen bir hata oluştu.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Yetkiniz yok' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Geçersiz istek' }, { status: 400 });
    }
    // Kendi hesabını silmeyi engelle
    if (id === session.user.id) {
      return NextResponse.json({ message: 'Kendi hesabınızı silemezsiniz.' }, { status: 403 });
    }
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: 'Admin silindi' });
  } catch {
    return NextResponse.json({ message: 'Sunucu hatası veya beklenmeyen bir hata oluştu.' }, { status: 500 });
  }
} 
