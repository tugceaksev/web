'use client';
import { useEffect } from 'react';
import OrderPageClient from './OrderPageClient';

export default function OrderPage() {
  useEffect(() => {
    // Client-side only code
  }, []);

  return <OrderPageClient />;
} 