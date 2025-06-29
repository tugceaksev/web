import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { message: 'Yetkilendirme gerekli' },
        { status: 401 }
      )
    }

    let users;
    if (session.user.role === 'ADMIN') {
      // Admin ise tüm kullanıcıları görsün
      users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
        orderBy: {
          name: 'asc',
        },
      })
    } else {
      // Kullanıcı ise sadece adminleri görsün
      users = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
        orderBy: {
          name: 'asc',
        },
      })
    }

    return NextResponse.json(users)
  } catch (error) {
    console.error('Kullanıcılar yüklenirken hata:', error)
    return NextResponse.json(
      { message: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
} 
