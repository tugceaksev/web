import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Yetkilendirme gerekli' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      surname: true,
      phone: true,
      address: true,
    },
  });
  if (!user) {
    return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });
  }
  return NextResponse.json(user);
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Yetkilendirme gerekli' }, { status: 401 });
    }
    const { name, surname, phone, address } = await request.json();
    if (!name || !surname || !phone || !address) {
      return NextResponse.json({ message: 'Tüm alanları doldurun' }, { status: 400 });
    }
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name, surname, phone, address },
    });
    return NextResponse.json({ message: 'Profil güncellendi' });
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Sunucu hatası veya beklenmedik bir hata oluştu.' }, { status: 500 });
  }
} 
