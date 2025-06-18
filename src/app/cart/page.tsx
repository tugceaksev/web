'use client';

import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';

export default function CartPage() {
  const { cartItems, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Sepetiniz Boş</h2>
        <p className="text-gray-600 mb-4">
          Ürün eklemek için menü sayfasına gidin.
        </p>
        <Link
          href="/menu"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
        >
          Menüye Git
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Sepetim</h2>
      
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-gray-600">{item.price} TL</p>
              </div>
              <button
                onClick={() => clearCart()}
                className="text-red-600 hover:text-red-800"
              >
                Sepeti Temizle
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex justify-between font-bold mb-4">
          <span>Toplam:</span>
          <span>{cartItems.reduce((sum, item) => sum + item.price, 0)} TL</span>
        </div>
        <Link
          href="/order"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Siparişi Tamamla
        </Link>
      </div>
    </div>
  );
}
