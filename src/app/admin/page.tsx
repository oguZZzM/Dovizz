import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminPage() {
  const user = await getCurrentUser();
  
  // If not authenticated or not an admin, redirect to unauthorized
  if (!user || user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Admin Paneli</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* User Management Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Kullanıcı Yönetimi</h3>
            <p className="mt-1 text-sm text-gray-500">
              Kullanıcıları görüntüleyin, düzenleyin veya silin.
            </p>
            <div className="mt-4">
              <Link
                href="/admin/users"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Kullanıcıları Yönet
              </Link>
            </div>
          </div>
        </div>
        
        {/* Currency Management Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Döviz Yönetimi</h3>
            <p className="mt-1 text-sm text-gray-500">
              Para birimlerini ekleyin, düzenleyin veya kaldırın.
            </p>
            <div className="mt-4">
              <Link
                href="/admin/currencies"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Para Birimlerini Yönet
              </Link>
            </div>
          </div>
        </div>
        
        {/* Conversion History Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Dönüşüm Geçmişi</h3>
            <p className="mt-1 text-sm text-gray-500">
              Tüm kullanıcıların dönüşüm geçmişini görüntüleyin.
            </p>
            <div className="mt-4">
              <Link
                href="/admin/conversions"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Dönüşüm Geçmişini Görüntüle
              </Link>
            </div>
          </div>
        </div>
        
        {/* System Stats Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Sistem İstatistikleri</h3>
            <p className="mt-1 text-sm text-gray-500">
              Kullanıcı sayısı, dönüşüm sayısı gibi istatistikleri görüntüleyin.
            </p>
            <div className="mt-4">
              <Link
                href="/admin/stats"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                İstatistikleri Görüntüle
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}