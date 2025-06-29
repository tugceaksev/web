'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Task, TaskStatus } from '@prisma/client';

interface TaskWithUser extends Task {
  user: {
    name: string | null;
    email: string | null;
  };
}

// Görev durumunu Türkçeye çeviren yardımcı fonksiyon
function getTaskStatusText(status: TaskStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Beklemede';
    case 'IN_PROGRESS':
      return 'Devam Ediyor';
    case 'COMPLETED':
      return 'Tamamlandı';
    case 'CANCELLED':
      return 'İptal Edildi';
    default:
      return status;
  }
}

interface Props {
  task: TaskWithUser;
}

export default function TaskDetailView({ task }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Bu görevi silmek istediğinizden emin misiniz?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Görev silinemedi');
      router.push('/tasks');
      router.refresh();
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Görev silinirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, status }),
      });

      if (!response.ok) throw new Error('Güncelleme başarısız');

      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Görev güncellenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl rounded-lg bg-card p-6 shadow-lg">
        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-card-foreground">
                Başlık
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-card-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-card-foreground">
                Açıklama
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-card-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-card-foreground">
                Durum
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-card-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="PENDING">Beklemede</option>
                <option value="IN_PROGRESS">Devam Ediyor</option>
                <option value="COMPLETED">Tamamlandı</option>
                <option value="CANCELLED">İptal Edildi</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-md border border-input px-4 py-2 text-sm font-medium text-card-foreground hover:bg-background/80"
                disabled={isLoading}
              >
                İptal
              </button>
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                disabled={isLoading}
              >
                {isLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-card-foreground">{task.title}</h1>
              <div className="space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                  disabled={isLoading}
                >
                  Düzenle
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-md bg-danger px-4 py-2 text-sm font-medium text-white hover:bg-danger/80"
                  disabled={isLoading}
                >
                  Sil
                </button>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-card-foreground">Durum</p>
              <p className="mt-1 text-card-foreground">
                {getTaskStatusText(status)}
              </p>
            </div>

            {task.description && (
              <div className="mt-4">
                <p className="text-sm font-medium text-card-foreground">Açıklama</p>
                <p className="mt-1 whitespace-pre-wrap text-card-foreground">{task.description}</p>
              </div>
            )}

            <div className="mt-4">
              <p className="text-sm font-medium text-card-foreground">Oluşturan</p>
              <p className="mt-1 text-card-foreground">{task.user.name || task.user.email}</p>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-card-foreground">Oluşturulma Tarihi</p>
              <p className="mt-1 text-card-foreground">
                {new Date(task.createdAt).toLocaleString('tr-TR')}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
