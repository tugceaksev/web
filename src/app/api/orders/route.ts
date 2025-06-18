import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

// TypeScript tip tanımlamaları
interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface OrderBody {
  customerName: string;
  phone: string;
  address: string;
  totalAmount: number;
  items: {
    create: OrderItem[];
  };
}

export async function POST(request: Request) {
  try {
    const body: OrderBody = await request.json();
    console.log('API Request:', body);

    // Body doğrulama
    if (
      !body ||
      typeof body !== 'object' ||
      !body.customerName ||
      !body.phone ||
      !body.address ||
      !body.totalAmount ||
      !body.items?.create?.length
    ) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz istek verisi' },
        { status: 400 }
      );
    }

    // Ürünlerin varlığını kontrol et
    const productIds = body.items.create.map((item) => item.productId);
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (existingProducts.length !== productIds.length) {
      return NextResponse.json(
        { success: false, error: 'Bazı ürünler bulunamadı' },
        { status: 400 }
      );
    }

    // Sipariş oluştur
    const orderData = {
      customerName: body.customerName,
      phone: body.phone,
      address: body.address,
      status: OrderStatus.PENDING,
      totalAmount: body.totalAmount,
      items: {
        create: body.items.create.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    } as const;

    const order = await prisma.order.create({
      data: orderData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log('Sipariş oluşturuldu:', order.id);
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('API Hatası:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Sipariş oluşturulurken bir hata oluştu',
      },
      { status: 500 }
    );
  }
}
