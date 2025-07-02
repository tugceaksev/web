//Bu dosya, adminin sipariş, ürün ve bekleyen sipariş istatistiklerini alır.

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() { //Admin istatistiklerini al
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') { //Admin yetkisi kontrolü
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const [totalProducts, totalOrders, pendingOrders, orders] = await Promise.all([ //Ürün, sipariş, bekleyen sipariş ve siparişleri al
      prisma.product.count({ where: { isDeleted: false } }),  
      prisma.order.count(),
      prisma.order.count({
        where: { status: 'PENDING' },
      }),
      prisma.order.findMany({
        select: {
          totalAmount: true,
        },
      }),
    ]);

    const totalRevenue = orders.reduce((sum: number, order: { totalAmount: number }) => sum + order.totalAmount, 0);

    return NextResponse.json({
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Error fetching admin stats' },
      { status: 500 }
    );
  }
} 
