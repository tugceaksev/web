'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Stats = {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Yönetim Paneli</h1>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Toplam Ürün</h3>
          <p className="text-3xl font-bold text-primary">{stats.totalProducts}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Toplam Sipariş</h3>
          <p className="text-3xl font-bold text-primary">{stats.totalOrders}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Bekleyen Sipariş</h3>
          <p className="text-3xl font-bold text-primary">{stats.pendingOrders}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Toplam Gelir</h3>
          <p className="text-3xl font-bold text-primary">
            {stats.totalRevenue.toLocaleString('tr-TR', {
              style: 'currency',
              currency: 'TRY',
            })}
          </p>
        </div>
      </div>

      {/* Hızlı Erişim */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/products"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">Ürün Yönetimi</h3>
          <p className="text-gray-600">
            Ürünleri ekle, düzenle ve yönet
          </p>
        </Link>

        <Link
          href="/admin/orders"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">Sipariş Yönetimi</h3>
          <p className="text-gray-600">
            Siparişleri görüntüle ve durumlarını güncelle
          </p>
        </Link>

        <Link
          href="/admin/contact"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">İletişim Bilgileri</h3>
          <p className="text-gray-600">
            İletişim bilgilerini ve çalışma saatlerini düzenle
          </p>
        </Link>
      </div>
    </div>
  );
} 