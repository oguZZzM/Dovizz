import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt, refreshTokenIfNeeded } from '@/lib/jwt';

// Korumalı rotaları ve gereken rolleri tanımla
const protectedRoutes = [
  {
    path: '/admin',
    roles: ['ADMIN'],
  },
  {
    path: '/profile',
    roles: ['USER', 'ADMIN'],
  },
  {
    path: '/messages',
    roles: ['USER', 'ADMIN'],
  },
];

// Çözülmüş JWT token için arayüz
interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

export async function middleware(request: NextRequest) {
  // İsteğin yolunu al
  const path = request.nextUrl.pathname;

  // Yola uyan korumalı rota yapılandırmasını bul
  const routeConfig = protectedRoutes.find(route => 
    path === route.path || path.startsWith(`${route.path}/`)
  );

  // Eğer yol korumalı bir rotaysa
  if (routeConfig) {
    // Çerezlerden token'ı al
    const token = request.cookies.get('auth_token')?.value;

    // Eğer token yoksa, giriş sayfasına yönlendir
    if (!token) {
      const url = new URL(`/login?callbackUrl=${path}`, request.url);
      return NextResponse.redirect(url);
    }

    try {
      // Token'ı doğrula ve gerekirse yenile
      const refreshedToken = await refreshTokenIfNeeded(token);

      // Use the refreshed token if available
      const tokenToVerify = refreshedToken || token;

      // Token'ı doğrula
      const payload = await verifyJwt(tokenToVerify);
      if (!payload) {
        const url = new URL(`/login?callbackUrl=${path}`, request.url);
        return NextResponse.redirect(url);
      }
      const decoded = payload as unknown as DecodedToken;

      // Kullanıcının gerekli role sahip olup olmadığını kontrol et
      if (!routeConfig.roles.includes(decoded.role)) {
        // Eğer değilse, yetkisiz sayfasına yönlendir
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch (error) {
      console.error('Token doğrulama hatası:', error);
      // Token doğrulama başarısız olursa, giriş sayfasına yönlendir
      const url = new URL(`/login?callbackUrl=${path}`, request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Middleware'i belirli yollarda çalıştırmak için yapılandır
export const config = {
  matcher: [
    '/admin', 
    '/admin/:path*', 
    '/profile', 
    '/profile/:path*', 
    '/messages', 
    '/messages/:path*'
  ],
};
