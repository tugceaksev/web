import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Yetkilendirme gerekli' },
        { status: 401 }
      )
    }

    const { receiverId, content } = await req.json()

    if (!receiverId || !content) {
      return NextResponse.json(
        { message: 'Alıcı ve mesaj içeriği gerekli' },
        { status: 400 }
      )
    }

    // Kullanıcılar sadece admin ile mesajlaşabilsin
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } })
    if (session.user.role !== 'ADMIN' && receiver?.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Sadece yönetici ile mesajlaşabilirsiniz.' },
        { status: 403 }
      )
    }

    // Admin gönderiyorsa isim "ar-el Catering" olarak güncellenecek
    let message;
    if (session.user.role === 'ADMIN') {
      message = await prisma.message.create({
        data: {
          content,
          sender: { connect: { id: session.user.id } },
          receiver: { connect: { id: receiverId } },
        },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          receiver: { select: { id: true, name: true, email: true } },
        },
      })
      // sender adını override et
      message.sender.name = 'ar-el Catering'
    } else {
      message = await prisma.message.create({
        data: {
          content,
          sender: { connect: { id: session.user.id } },
          receiver: { connect: { id: receiverId } },
        },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          receiver: { select: { id: true, name: true, email: true } },
        },
      })
    }

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Mesaj gönderilirken hata:', error)
    return NextResponse.json(
      { message: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Yetkilendirme gerekli' },
        { status: 401 }
      )
    }
    let messages;
    if (session.user.role === 'ADMIN') {
      messages = await prisma.message.findMany({
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          receiver: { select: { id: true, name: true, email: true } },
        },
      })
    } else {
      messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.user.id },
            { receiverId: session.user.id },
          ],
        },
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          receiver: { select: { id: true, name: true, email: true } },
        },
      })
    }
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Mesajlar yüklenirken hata:', error)
    return NextResponse.json(
      { message: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
} 
