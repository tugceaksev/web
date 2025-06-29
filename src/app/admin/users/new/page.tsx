"use client";

import { useState } from "react";

export default function NewAdminUserPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/users/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Kullanıcı eklenemedi");
      setSuccess("Yeni admin başarıyla eklendi.");
      setForm({ name: "", email: "", password: "" });
    } catch (error) {
      if (error instanceof Error) setError(error.message);
      else setError("Bilinmeyen bir hata oluştu.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Yeni Admin Ekle</h1>
      {success && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mb-4">{success}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Ad Soyad</label>
          <input type="text" name="name" id="name" value={form.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-posta</label>
          <input type="email" name="email" id="email" value={form.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Şifre</label>
          <input type="password" name="password" id="password" value={form.password} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
        </div>
        <button type="submit" className="w-full bg-primary text-white py-2 rounded-md font-medium">Admin Ekle</button>
      </form>
    </div>
  );
} 
