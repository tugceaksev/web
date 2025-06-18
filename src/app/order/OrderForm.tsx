'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Product } from '@/types';

const orderSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  surname: z.string().min(2, 'Soyisim en az 2 karakter olmalı'),
  phone: z.string().min(10, 'Telefon numarası geçersiz'),
  address: z.string().min(5, 'Adres en az 5 karakter olmalı')
});

type FormData = z.infer<typeof orderSchema>;

interface CartItem extends Product {
  quantity: number;
}

export default function OrderForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(orderSchema)
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { cartItems, clearCart } = useCart();
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    try {
      if (cartItems.length === 0) {
        throw new Error('Sepetiniz boş. Lütfen ürün ekleyin.');
      }

      // Sepet veri yapısını düzeltiyoruz
      const cartItemsWithQuantity = cartItems.map((item: Product) => ({
        ...item,
        quantity: 1 // Her ürün için varsayılan olarak 1 adet
      }));

      const totalAmount = cartItemsWithQuantity.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Prisma schema'ya uygun veri yapısı
      const orderData = {
        customerName: `${data.name} ${data.surname}`,
        phone: data.phone,
        address: data.address,
        totalAmount,
        items: {
          create: cartItemsWithQuantity.map((item: CartItem) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      };

      // Veri doğrulama
      if (!orderData.customerName || !orderData.phone || !orderData.address || !orderData.totalAmount || !orderData.items) {
        throw new Error('Geçersiz sipariş verisi');
      }

      console.log('Gönderilen Veri:', orderData); // Debug için

      try {
        setLoading(true);
        setError('');
        
        const response = await axios.post('/api/orders', orderData);
        console.log('API Response:', response.data);
        
        if (!response.data.success) {
          throw new Error(response.data.error || 'Sipariş oluşturulurken bir hata oluştu');
        }

        toast.success('Siparişiniz başarıyla oluşturuldu!');
        clearCart();
        router.push('/order-success');
      } catch (error: unknown) {
        console.error('API Hatası:', error);
        if (error instanceof Error) {
          console.error('API Yanıt:', error.message);
          setError(error.message);
          toast.error('Sipariş oluşturulurken bir hata oluştu');
        } else {
          setError('API ile bağlantı kurulamadı');
          toast.error('API ile bağlantı kurulamadı');
        }
        setLoading(false);
        throw new Error('Sipariş oluşturulurken bir hata oluştu');
      }
    } catch (error: unknown) {
      console.error('Sipariş oluşturma hatası:', error);
      setError(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          İsim
        </label>
        <input
          type="text"
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="surname" className="block text-sm font-medium text-gray-700">
          Soyisim
        </label>
        <input
          type="text"
          {...register('surname')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.surname && (
          <p className="mt-1 text-sm text-red-600">{errors.surname.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Telefon
        </label>
        <input
          type="tel"
          {...register('phone')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Adres
        </label>
        <textarea
          {...register('address')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
      >
        {loading ? 'Sipariş oluşturuluyor...' : 'Siparişi Tamamla'}
      </button>
    </form>
  );
} 