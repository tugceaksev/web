//Bu dosya, iletişim bilgilerini alır ve günceller.
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET /api/contact
export async function GET() { //İletişim bilgilerini al
  try {
    const contact = await prisma.contactInfo.findFirst();
    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error fetching contact info:', error);
    return NextResponse.json(
      { error: 'Error fetching contact info' },
      { status: 500 }
    );
  }
}

// POST /api/contact
export async function POST(request: Request) { //İletişim bilgilerini güncelle
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') { //Admin yetkisi kontrolü
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json(); //İletişim bilgilerini al
    const { address, phone, email, mapUrl, workingHours } = body;

    const contact = await prisma.contactInfo.upsert({ //İletişim bilgilerini güncelle
      where: { id: 1 }, //Varsayılan olarak sadece bir iletişim bilgisi kaydı varsayılıyor.
      update: {
        address,
        phone,
        email,
        mapUrl,
        workingHours,
      },
      create: {
        id: 1,
        address,
        phone,
        email,
        mapUrl,
        workingHours,
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error updating contact info:', error);
    return NextResponse.json(
      { error: 'Error updating contact info' },
      { status: 500 }
    );
  }
} 
