'use client';
import { useEffect, useState } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export default function AdminUsers() {
  const [adminList, setAdminList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setAdminList(data.filter((u: User) => u.role === 'ADMIN'));
      })
      .finally(() => setLoading(false));
  }, []);

  function openModal(id: string) {
    setToDelete(id);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setToDelete(null);
  }

  async function handleDelete() {
    if (!toDelete) return;
    const res = await fetch(`/api/users/admin?id=${toDelete}`, { method: 'DELETE' });
    if (res.ok) {
      setAdminList(adminList.filter((u) => u.id !== toDelete));
      closeModal();
    } else {
      alert('Silme işlemi başarısız!');
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Admin Yönetimi</h2>
      <div className="mb-6">
        <a href="/admin/users/new" className="inline-block bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-dark">Yeni Admin Ekle</a>
      </div>
      <div className="bg-card rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-muted">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-6">Yükleniyor...</td></tr>
            ) : adminList.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                  <span className="px-2 py-1 rounded-full text-xs bg-primary/20 text-primary">ADMIN</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button onClick={() => openModal(user.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs">Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Onay Modalı */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Admin Sil</h3>
            <p className="mb-6">Bu admini silmek istediğinize emin misiniz?</p>
            <div className="flex justify-end gap-4">
              <button onClick={closeModal} className="px-4 py-2 rounded bg-gray-200 text-gray-700">İptal</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600">Evet, Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
