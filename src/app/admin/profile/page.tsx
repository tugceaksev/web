"use client";

import { useEffect, useState, useRef } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";

interface UserProfile {
  name: string;
  surname: string;
  phone: string;
  address: string;
}

export default function AdminProfilePage() {
  // const { data: session, status } = useSession();
  // const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({ name: "", surname: "", phone: "", address: "" });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  useEffect(() => {
    // ...
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Güncelleme başarısız");
      setSuccess("Bilgiler başarıyla güncellendi.");
    } catch (error: unknown) {
      if (error instanceof Error) setError(error.message);
      else setError("Bilinmeyen bir hata oluştu.");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    const password = passwordRef.current?.value || "";
    const newPassword = newPasswordRef.current?.value || "";
    if (!password || !newPassword) {
      setPwError("Lütfen tüm alanları doldurun.");
      return;
    }
    try {
      const res = await fetch("/api/users/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Şifre değiştirilemedi");
      setPwSuccess("Şifre başarıyla değiştirildi.");
      if (passwordRef.current) passwordRef.current.value = "";
      if (newPasswordRef.current) newPasswordRef.current.value = "";
    } catch (error: unknown) {
      if (error instanceof Error) setPwError(error.message);
      else setPwError("Bilinmeyen bir hata oluştu.");
    }
  };

  if (error) {
    return <div className="text-center text-red-600 py-12">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Admin Profil Bilgilerim</h1>
      {success && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mb-4">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Ad</label>
          <input type="text" name="name" id="name" value={profile.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
        </div>
        <div>
          <label htmlFor="surname" className="block text-sm font-medium text-gray-700">Soyad</label>
          <input type="text" name="surname" id="surname" value={profile.surname} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefon</label>
          <input type="tel" name="phone" id="phone" value={profile.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adres</label>
          <input type="text" name="address" id="address" value={profile.address} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
        </div>
        <button type="submit" className="w-full bg-primary text-white py-2 rounded-md font-medium">Güncelle</button>
      </form>
      <h2 className="text-xl font-bold mt-10 mb-4">Şifre Değiştir</h2>
      {pwSuccess && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mb-4">{pwSuccess}</div>}
      {pwError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">{pwError}</div>}
      <form onSubmit={handlePasswordChange} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mevcut Şifre</label>
          <input type="password" id="password" ref={passwordRef} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
        </div>
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Yeni Şifre</label>
          <input type="password" id="newPassword" ref={newPasswordRef} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
        </div>
        <button type="submit" className="w-full bg-primary text-white py-2 rounded-md font-medium">Şifreyi Değiştir</button>
      </form>
    </div>
  );
} 
