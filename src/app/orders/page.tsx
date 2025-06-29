'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Beklemede';
    case 'PREPARING':
      return 'Hazırlanıyor';
    case 'READY':
      return 'Hazır';
    case 'DELIVERED':
      return 'Teslim Edildi';
    case 'CANCELLED':
      return 'İptal Edildi';
    default:
      return status;
  }
};

interface OrderItem {
  id: string;
  product: {
    name: string;
    image?: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Siparişler yüklenemedi');
      setOrders(data);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Yükleniyor...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Siparişlerim</h1>

      {orders.length === 0 ? (
        <div className="text-center text-gray-500 flex flex-col items-center gap-4">
          <span>Henüz sipariş oluşturmadınız.</span>
          <Link
            href="/menu"
            className="inline-block bg-orange-600 text-white px-4 py-2 rounded-md font-medium hover:bg-orange-700"
          >
            Menüye Git
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow p-6 border border-gray-100"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-700">
                <div>
                  <span className="font-semibold">Sipariş No:</span> {order.id}
                </div>
                <div>
                  <span className="font-semibold">Durum:</span> {getStatusText(order.status)}
                </div>
                <div>
                  <span className="font-semibold">Tutar:</span>{' '}
                  {order.totalAmount.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  })}
                </div>
                <div>
                  <span className="font-semibold">Tarih:</span>{' '}
                  {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="font-semibold mb-2">Ürünler:</div>
                <ul className="space-y-2">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 text-sm"
                    >
                      {item.product.image && (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-cover rounded border"
                        />
                      )}
                      <div className="flex-1">{item.product.name}</div>
                      <div className="text-gray-500">x{item.quantity}</div>
                      <div>
                        {item.price.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: 'TRY',
                        })}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
