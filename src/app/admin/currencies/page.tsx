import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function AdminCurrenciesPage() {
  const user = await getCurrentUser();

  // If not authenticated or not an admin, redirect to unauthorized
  if (!user || user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }

  // Fetch all currencies with their latest rate
  const currencies = await prisma.currency.findMany({
    orderBy: {
      code: 'asc',
    },
    include: {
      rates: {
        orderBy: {
          timestamp: 'desc',
        },
        take: 1,
      },
      _count: {
        select: {
          rates: true,
        },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Döviz Yönetimi</h1>
        <Link
          href="/admin"
          className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
        >
          Admin Paneline Dön
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Para Birimleri</h2>
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            Toplam: {currencies.length} para birimi
          </span>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kod
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İsim
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Güncel Kur
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Değişim
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kayıt Sayısı
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currencies.map((currency) => {
                  const latestRate = currency.rates[0];
                  return (
                    <tr key={currency.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {currency.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {currency.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {latestRate ? latestRate.value.toFixed(4) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {latestRate ? (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            latestRate.increasing ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {latestRate.increasing ? '+' : '-'}{Math.abs(latestRate.change).toFixed(2)}%
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {currency._count.rates}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/currency/${currency.code}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Görüntüle
                          </Link>
                          <button
                            className="text-yellow-600 hover:text-yellow-900"
                            onClick={async () => {
                              // This would be handled by a client component in a real implementation
                              alert('Bu işlev istemci bileşeni gerektirir');
                            }}
                          >
                            Güncelle
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={async () => {
                              // This would be handled by a client component in a real implementation
                              alert('Bu işlev istemci bileşeni gerektirir');
                            }}
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Yeni Para Birimi Ekle</h2>
          <p className="mt-1 text-sm text-gray-500">
            Sisteme yeni bir para birimi eklemek için aşağıdaki formu doldurun.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Para Birimi Kodu
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="code"
                  id="code"
                  placeholder="USD"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">3 karakterli kod (örn. USD, EUR)</p>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Para Birimi Adı
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="US Dollar"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => {
                // This would be handled by a client component in a real implementation
                alert('Bu işlev istemci bileşeni gerektirir');
              }}
            >
              Para Birimi Ekle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
