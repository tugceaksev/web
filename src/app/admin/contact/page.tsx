'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type ContactInfo = {
  address: string;
  phone: string;
  email: string;
  mapUrl: string;
  workingHours: string;
};

export default function AdminContactPage() {
  const router = useRouter();
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    address: '',
    phone: '',
    email: '',
    mapUrl: '',
    workingHours: '',
  });

  useEffect(() => {
    fetch('/api/contact')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setContactInfo(data);
        }
      })
      .catch(console.error);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: formData.get('address'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        mapUrl: formData.get('mapUrl'),
        workingHours: formData.get('workingHours'),
      }),
    });

    if (response.ok) {
      alert('İletişim bilgileri güncellendi!');
      router.refresh();
    } else {
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">İletişim Bilgilerini Düzenle</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Adres
          </label>
          <textarea
            name="address"
            id="address"
            rows={3}
            required
            defaultValue={contactInfo.address}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Telefon
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            required
            defaultValue={contactInfo.phone}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            E-posta
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            defaultValue={contactInfo.email}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="mapUrl" className="block text-sm font-medium text-gray-700">
            Google Maps URL
          </label>
          <input
            type="url"
            name="mapUrl"
            id="mapUrl"
            required
            defaultValue={contactInfo.mapUrl}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="workingHours" className="block text-sm font-medium text-gray-700">
            Çalışma Saatleri
          </label>
          <input
            type="text"
            name="workingHours"
            id="workingHours"
            required
            defaultValue={contactInfo.workingHours}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            İptal
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Kaydet
          </button>
        </div>
      </form>
    </div>
  );
} 
//Admin, iletişim bilgilerini bu sayfadan görebilir ve güncelleyebilir.
//Bilgiler API’dan çekilir ve güncellenir, form ile kolayca düzenlenir.