//Bu dosya, belirli bir kullanıcıya ait mesajları alır ve günceller.
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ userId: string }> }) { //Belirli bir kullanıcıya ait mesajları al
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) { //Kullanıcı yetkisi kontrolü
      return NextResponse.json(
        { message: 'Yetkilendirme gerekli' },
        { status: 401 }
      )
    }

    const { userId } = await params //Kullanıcı ID'sini al

    const messages = await prisma.message.findMany({ //Mesajları al
      where: {
        OR: [
          {
            senderId: session.user.id,
            receiverId: userId,
          },
          {
            senderId: userId,
            receiverId: session.user.id,
          },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Mesajlar yüklenirken hata:', error)
    return NextResponse.json(
      { message: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ userId: string }> }) { //Mesajları okundu yap
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) { //Kullanıcı yetkisi kontrolü
      return NextResponse.json(
        { message: 'Yetkilendirme gerekli' },
        { status: 401 }
      )
    }
    const { userId } = await params //Kullanıcı ID'sini al
    // Sadece karşıdan gelen ve okunmamış mesajları okundu yap
    const updated = await prisma.message.updateMany({ //Mesajları okundu yap
      where: {
        senderId: userId,
        receiverId: session.user.id,
        isRead: false,
      },
      data: { isRead: true },
    })
    return NextResponse.json({ updated: updated.count }) //Okundu yapılan mesajları döndür
  } catch (error) {
    console.error('Mesajlar okundu işaretlenirken hata:', error) //Hata durumunda hata mesajı döndür
    return NextResponse.json(
      { message: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
} 