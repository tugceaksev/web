'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Stats = {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });

  const [messageCount, setMessageCount] = useState<number>(0);
  const [adminCount, setAdminCount] = useState(0);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch('/api/messages')
      .then((res) => res.json())
      .then((data) => setMessageCount(data.length || 0))
      .catch(() => setMessageCount(0));
  }, []);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        const admins = data.filter((u: User) => u.role === 'ADMIN');
        setAdminCount(admins.length);
      });
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

      {/* Kullanıcı Mesajları Genel Bakış */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Kullanıcı Mesajları</h2>
          <Link href="/admin/messages" className="text-primary hover:underline font-medium">Tüm mesajları gör</Link>
        </div>
        <p className="text-gray-600 mb-2">Son mesaj sayısı: <span className="font-bold">{messageCount}</span></p>
        <p className="text-gray-500 text-sm">Detaylı mesaj yönetimi için tüm mesajları gör butonunu kullanabilirsin.</p>
      </div>

      {/* Admin Yönetimi Genel Bakış */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Admin Yönetimi</h2>
          <Link href="/admin/users" className="text-primary hover:underline font-medium">Tüm adminleri gör</Link>
        </div>
        <p className="text-gray-600 mb-2">Toplam admin: <span className="font-bold">{adminCount}</span></p>
        <p className="text-gray-500 text-sm">Yeni admin ekleyebilir veya mevcut adminleri yönetebilirsin.</p>
      </div>
    </div>
  );
} 
