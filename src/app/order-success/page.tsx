'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function OrderSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    toast.success('Siparişiniz başarıyla oluşturuldu!');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-4">Siparişiniz Başarıyla Oluşturuldu!</h1>
          <p className="text-gray-600 mb-8">
            Siparişiniz en kısa sürede hazırlanıp size iletilecektir.
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  );
}
