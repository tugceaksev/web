import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Belirli bir ürünü getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
  });
  if (!product) {
    return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
  }
  return NextResponse.json(product);
}

// PUT: Belirli bir ürünü güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const updated = await prisma.product.update({
    where: { id },
    data: body,
  });
  return NextResponse.json(updated);
}

// DELETE: Belirli bir ürünü sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.product.update({
    where: { id },
    data: { isDeleted: true },
  });
  return NextResponse.json({ message: `Ürün ${id} silindi (soft delete).` });
}