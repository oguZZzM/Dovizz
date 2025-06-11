import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Döviz Kurları',
  description: 'Detaylı grafikler ve geçmiş verilerle canlı döviz kurları',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="bg-gray-100 border-t">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-600">
                &copy; {new Date().getFullYear()} Döviz Kurları. Tüm hakları saklıdır.
              </p>
              <p className="text-gray-500 text-sm mt-2 md:mt-0">
                Exchange Rate API tarafından desteklenmektedir
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
