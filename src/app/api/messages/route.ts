import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
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

    const message = await prisma.message.create({
      data: {
        content,
        sender: {
          connect: { id: session.user.id }
        },
        receiver: {
          connect: { id: receiverId }
        }
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

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Mesaj gönderilirken hata:', error)
    return NextResponse.json(
      { message: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
} 