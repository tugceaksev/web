'use client';

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function OrderSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    toast.success('Siparişiniz başarıyla oluşturuldu!');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h1 className="text-2xl font-bold mb-3">Siparişiniz Başarıyla Oluşturuldu!</h1>
        <p className="text-gray-600 mb-6">
          Siparişiniz en kısa sürede hazırlanıp size ulaştırılacaktır.
        </p>
        <button
          onClick={() => router.push('/')}
          className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    </div>
  );
}
