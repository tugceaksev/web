//Bu dosya, ürünleri alır ve oluşturur.
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() { //Ürünleri al
  try {
    const products = await prisma.product.findMany({ //Ürünleri al
      where: { isDeleted: false },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error fetching products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) { //Ürün oluştur
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in product creation:', session);

    if (!session?.user || session.user.role !== 'ADMIN') { //Admin yetkisi kontrolü
      console.log('Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli. Sadece admin kullanıcılar ürün ekleyebilir.' },
        { status: 401 }
      );
    }

    const body = await request.json(); //Ürün verilerini al
    console.log('Received product data:', body); //Ürün verilerini logla
    
    const { name, description, price, category, image } = body;

    // Veri doğrulama
    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { error: 'Ürün adı, açıklama, fiyat ve kategori alanları zorunludur.' },
        { status: 400 }
      );
    }

    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { error: 'Geçerli bir fiyat giriniz.' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({ //Ürün oluştur
      data: {
        name: name.trim(),
        description: description.trim(),
        price,
        category: category.trim(),
        image: image?.trim() || null
      }
    });

    console.log('Product created successfully:', product); //Ürün oluşturulduğunda hata mesajı döndür
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Prisma hatalarını yakala
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) { //Eğer ürün adı zaten kullanılıyorsa hata mesajı döndür
        return NextResponse.json(
          { error: 'Bu ürün adı zaten kullanılıyor.' },
          { status: 400 }
        );
      }
    }
    
    //Hata durumunda hata mesajı döndür
    return NextResponse.json(
      { error: 'Ürün oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}
