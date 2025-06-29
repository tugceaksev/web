import { notFound } from 'next/navigation';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
  };
}

interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/orders/${orderId}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function OrderDetailPage({ params }: { params: { orderId: string } }) {
  const order = await getOrder(params.orderId);
  if (!order) return notFound();

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Sipariş Detayı</h1>
      <div className="mb-2">Sipariş No: <span className="font-mono">{order.id}</span></div>
      <div className="mb-2">Müşteri: {order.customerName}</div>
      <div className="mb-2">Telefon: {order.phone}</div>
      <div className="mb-2">Adres: {order.address}</div>
      <div className="mb-2">Durum: {order.status}</div>
      <div className="mb-2">Tutar: ₺{order.totalAmount.toFixed(2)}</div>
      <div className="mb-2">Tarih: {new Date(order.createdAt).toLocaleDateString()}</div>
      <hr className="my-4" />
      <div>
        <b>Ürünler:</b>
        <ul className="mt-2 space-y-2">
          {order.items.map(item => (
            <li key={item.id} className="flex justify-between items-center">
              <span>{item.product.name}</span>
              <span className="text-sm text-gray-500">x{item.quantity}</span>
              <span>₺{item.price.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 