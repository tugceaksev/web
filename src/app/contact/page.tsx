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

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // TODO: Fetch contact info from API
    fetch('/api/contact')
      .then((res) => res.json())
      .then(setContactInfo)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !contactInfo) {
    return <div className="flex items-center justify-center min-h-screen">Yükleniyor...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">İletişim</h1>
      <button
        className="mb-6 px-6 py-2 bg-primary text-white rounded-md shadow hover:bg-primary/90 transition"
        onClick={() => {
          // Mesajlar sayfasına yönlendir, admin ID'si orada otomatik bulunacak
          router.push('/messages');
        }}
      >
        ar-el Catering ile İletişime Geç
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* İletişim Bilgileri */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">İletişim Bilgileri</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700">Adres</h3>
              <p className="text-gray-600">{contactInfo.address}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700">Telefon</h3>
              <p className="text-gray-600">
                <a href={`tel:${contactInfo.phone}`} className="hover:text-primary">
                  {contactInfo.phone}
                </a>
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700">E-posta</h3>
              <p className="text-gray-600">
                <a href={`mailto:${contactInfo.email}`} className="hover:text-primary">
                  {contactInfo.email}
                </a>
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700">Çalışma Saatleri</h3>
              <p className="text-gray-600">{contactInfo.workingHours}</p>
            </div>
          </div>
        </div>

        {/* Harita */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Konum</h2>
          <div className="aspect-video">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.1258638001914!2d36.29304477609234!3d41.32787637130757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4088790075622393%3A0xf07766f456b07f83!2sAR-EL%20Catering!5e0!3m2!1str!2str!4v1748857658736!5m2!1str!2str"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
} 
