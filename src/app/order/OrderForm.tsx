'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const orderSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  surname: z.string().min(2, 'Soyisim en az 2 karakter olmalı'),
  phone: z.string().min(10, 'Telefon numarası geçersiz'),
  address: z.string().min(5, 'Adres en az 5 karakter olmalı')
});

type FormData = z.infer<typeof orderSchema>;

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function OrderForm() {
  const { status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: '',
    surname: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/users/profile')
        .then(res => res.json())
        .then(data => {
          if (data) setProfile(data);
        });
    }
  }, [status]);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: profile
  });

  useEffect(() => {
    Object.entries(profile).forEach(([key, value]) => {
      // @ts-expect-error: dynamic key
      setValue(key, value);
    });
  }, [profile, setValue]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { cartItems, clearCart } = useCart();

  const onSubmit = async (data: FormData) => {
    try {
      if (cartItems.length === 0) {
        throw new Error('Sepetiniz boş. Lütfen ürün ekleyin.');
      }

      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const orderData = {
        customerName: `${data.name} ${data.surname}`,
        phone: data.phone,
        address: data.address,
        totalAmount,
        items: {
          create: cartItems.map((item: CartItem) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      };

      setLoading(true);
      setError('');

      const response = await axios.post('/api/orders', orderData, {
        withCredentials: true
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Sipariş oluşturulurken bir hata oluştu');
      }

      clearCart();
      router.push('/order/success'); // ✅ Tek yönlendirme

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Sipariş oluşturma hatası:', message);
      setError(`Sipariş oluşturulurken bir hata oluştu: ${message}`);
      toast.error(message);
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
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">İsim</label>
        <input
          type="text"
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          disabled
        />
      </div>

      <div>
        <label htmlFor="surname" className="block text-sm font-medium text-gray-700">Soyisim</label>
        <input
          type="text"
          {...register('surname')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          disabled
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefon</label>
        <input
          type="tel"
          {...register('phone')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          disabled
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adres</label>
        <input
          type="text"
          {...register('address')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
