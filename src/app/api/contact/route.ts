import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET /api/contact
export async function GET() {
  try {
    const contact = await prisma.contactInfo.findFirst();
    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error fetching contact info:', error);
    return new NextResponse('Error fetching contact info', { status: 500 });
  }
}

// POST /api/contact
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { address, phone, email, mapUrl, workingHours } = body;

    const contact = await prisma.contactInfo.upsert({
      where: { id: 1 }, // Assuming we only have one contact info record
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
    return new NextResponse('Error updating contact info', { status: 500 });
  }
} 