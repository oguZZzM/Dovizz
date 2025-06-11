import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Yetkisiz Erişim
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Bu sayfaya erişim yetkiniz bulunmamaktadır.
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <p className="text-gray-500">
            Bu sayfayı görüntülemek için gerekli izinlere sahip değilsiniz. Eğer bu bir hata olduğunu düşünüyorsanız, lütfen site yöneticisiyle iletişime geçin.
          </p>
          
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center mt-6">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ana Sayfaya Dön
            </Link>
            
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}