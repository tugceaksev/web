import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Yetkilendirme gerekli' }, { status: 401 });
  }
  const { password, newPassword } = await request.json();
  if (!password || !newPassword) {
    return NextResponse.json({ message: 'Tüm alanları doldurun' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.password) {
    return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });
  }
  const isCorrect = await bcrypt.compare(password, user.password);
  if (!isCorrect) {
    return NextResponse.json({ message: 'Mevcut şifre yanlış' }, { status: 400 });
  }
  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: session.user.id }, data: { password: hashed } });
  return NextResponse.json({ message: 'Şifre başarıyla değiştirildi' });
} 
