import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const [totalProducts, totalOrders, pendingOrders, orders] = await Promise.all([
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
