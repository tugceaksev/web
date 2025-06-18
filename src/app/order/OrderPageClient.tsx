'use client';

import { useCart } from '@/contexts/CartContext';
import OrderForm from './OrderForm';

export default function OrderPageClient() {
  const { cartItems } = useCart();

  if (cartItems.length === 0 || !cartItems[0]) {
    window.location.href = '/menu';
    return null;
  }


  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-8">Sipariş Formu</h1>
          <OrderForm />
        </div>
      </div>
    </div>
  );
}
