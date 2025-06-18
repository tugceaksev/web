import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { status } = await request.json();

  try {
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status }
    });

    return NextResponse.json(order);
  } catch {
    return new NextResponse('Error updating order', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await prisma.orderItem.deleteMany({
      where: { orderId: params.id }
    });

    await prisma.order.delete({
      where: { id: params.id }
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse('Error deleting order', { status: 500 });
  }
} 