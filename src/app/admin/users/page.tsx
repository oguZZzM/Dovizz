import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function AdminUsersPage() {
  const user = await getCurrentUser();

  // If not authenticated or not an admin, redirect to unauthorized
  if (!user || user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }

  // Fetch all users
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          sentMessages: true,
          receivedMessages: true,
          conversionHistories: true,
        },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
        <Link
          href="/admin"
          className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
        >
          Admin Paneline Dön
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Tüm Kullanıcılar</h2>
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            Toplam: {users.length} kullanıcı
          </span>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kayıt Tarihi
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İstatistikler
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || 'İsimsiz Kullanıcı'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-4">
                        <div>
                          <span className="font-medium">{user._count.sentMessages + user._count.receivedMessages}</span> mesaj
                        </div>
                        <div>
                          <span className="font-medium">{user._count.conversionHistories}</span> dönüşüm
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          className={`text-blue-600 hover:text-blue-900 ${user.role === 'ADMIN' ? 'hidden' : ''}`}
                          onClick={async () => {
                            // This would be handled by a client component in a real implementation
                            alert('Bu işlev istemci bileşeni gerektirir');
                          }}
                        >
                          Yönetici Yap
                        </button>
                        <button
                          className={`text-green-600 hover:text-green-900 ${user.role === 'USER' ? 'hidden' : ''}`}
                          onClick={async () => {
                            // This would be handled by a client component in a real implementation
                            alert('Bu işlev istemci bileşeni gerektirir');
                          }}
                        >
                          Kullanıcı Yap
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
