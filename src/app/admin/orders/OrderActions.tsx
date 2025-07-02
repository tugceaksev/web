'use client';

import { useState } from 'react';
import { updateOrderStatus, deleteOrder } from './actions';

interface OrderActionsProps {
  orderId: string;
  currentStatus: string;
}

export default function OrderActions({ orderId, currentStatus }: OrderActionsProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsLoading(true);
      await updateOrderStatus(orderId, newStatus);
      setStatus(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Durum güncellenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bu siparişi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setIsLoading(true);
      await deleteOrder(orderId);
      // Sayfayı yenile
      window.location.reload();
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Sipariş silinirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={isLoading}
        className="text-sm border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
      >
        <option value="PENDING">Beklemede</option>
        <option value="PREPARING">Hazırlanıyor</option>
        <option value="READY">Hazır</option>
        <option value="DELIVERED">Teslim Edildi</option>
        <option value="CANCELLED">İptal Edildi</option>
      </select>

      <button
        onClick={handleDelete}
        disabled={isLoading}
        className="text-red-600 hover:text-red-800 disabled:opacity-50"
      >
        Sil
      </button>
    </div>
  );
} 
