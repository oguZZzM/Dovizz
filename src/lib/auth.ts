import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { verifyJwt, refreshTokenIfNeeded } from './jwt';

export interface UserSession {
  id: string;
  email: string;
  role: string;
}

// Oturumdan mevcut kullanıcıyı al
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return null;
    }

    // Token'ı doğrula ve gerekirse yenile
    const refreshedToken = await refreshTokenIfNeeded(token);

    // Use the refreshed token if available and update the cookie
    if (refreshedToken && refreshedToken !== token) {
      token = refreshedToken;

      // Update the cookie with the new token
      // This is safe because getCurrentUser is called from a Route Handler
      try {
        cookieStore.set({
          name: 'auth_token',
          value: refreshedToken,
          httpOnly: true,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24, // 1 day
          sameSite: 'lax',
        });
      } catch (cookieError) {
        console.error('Error setting cookie in getCurrentUser:', cookieError);
        // Continue with the refreshed token even if setting the cookie fails
      }
    }

    // Token'ı doğrula
    const payload = await verifyJwt(token);
    if (!payload) return null;

    const decoded = payload as unknown as UserSession;

    // Veritabanından kullanıcıyı al
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Oturum doğrulama hatası:', error);
    return null;
  }
}

// Mevcut kullanıcının kimlik doğrulamasının yapılıp yapılmadığını kontrol et
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
