'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface ProfileFormProps {
  user: User;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords if trying to change password
    if (newPassword) {
      if (!currentPassword) {
        setError('Mevcut şifrenizi girmelisiniz');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Yeni şifreler eşleşmiyor');
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Profil güncellenirken bir hata oluştu');
      }

      setSuccess('Profil başarıyla güncellendi');

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Refresh the page to get updated user data
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      // Redirect to home page
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* User Profile Summary Card */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
            {(user.name || user.email).charAt(0).toUpperCase()}
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold text-gray-900">{user.name || 'İsimsiz Kullanıcı'}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
              }`}>
                {user.role === 'ADMIN' ? 'Yönetici' : 'Kullanıcı'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Ad Soyad
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email adresi
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900">Şifre Değiştir</h3>
          <p className="mt-1 text-sm text-gray-500">
            Şifrenizi değiştirmek istemiyorsanız bu alanları boş bırakın.
          </p>
        </div>

        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
            Mevcut Şifre
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
            Yeni Şifre
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Yeni Şifre Tekrar
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-between">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
          >
            {loading ? 'Güncelleniyor...' : 'Profili Güncelle'}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Çıkış Yap
          </button>
        </div>
      </form>

      <div className="mt-8 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900">Hesap Bilgileri</h3>
        <dl className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          <div>
            <dt className="text-sm font-medium text-gray-500">Hesap Oluşturma Tarihi</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(user.createdAt).toLocaleDateString('tr-TR')}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Son Güncelleme</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(user.updatedAt).toLocaleDateString('tr-TR')}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Kullanıcı ID</dt>
            <dd className="mt-1 text-sm text-gray-900 truncate">
              {user.id}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Hesap Türü</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {user.role === 'ADMIN' ? 'Yönetici' : 'Standart Kullanıcı'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Quick Links Section */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900">Hızlı Bağlantılar</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/messages" 
            className="text-center block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="block text-2xl mb-2">💬</span>
            <span className="font-medium">Mesajlarım</span>
          </Link>

          <Link 
            href="/" 
            className="text-center block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="block text-2xl mb-2">📊</span>
            <span className="font-medium">Döviz Kurları</span>
          </Link>

          {user.role === 'ADMIN' && (
            <Link 
              href="/admin" 
              className="text-center block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="block text-2xl mb-2">⚙️</span>
              <span className="font-medium">Admin Paneli</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
