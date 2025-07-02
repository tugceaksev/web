import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PATCH( //Sipariş durumunu güncelleme
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') { //Admin yetkisi kontrolü
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { status } = await request.json(); //Sipariş durumunu al
  const { id } = await params;

  try {
    const order = await prisma.order.update({ //Sipariş durumunu güncelle
      where: { id },
      data: { status }
    });

    return NextResponse.json(order);
  } catch { //Hata durumunda hata mesajı döndür
    return NextResponse.json(
      { error: 'Error updating order' },
      { status: 500 } 
    );
  }
}

export async function DELETE( //Siparişi silme
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') { //Admin yetkisi kontrolü
    return NextResponse.json( 
      { error: 'Unauthorized' },
      { status: 401 } 
    );
  }

  const { id } = await params;

  try {
    await prisma.orderItem.deleteMany({
      where: { orderId: id }
    });

    await prisma.order.delete({
      where: { id }
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: 'Error deleting order' },
      { status: 500 }
    );
  }
} 