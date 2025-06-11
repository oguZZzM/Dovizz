import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { verifyJwt } from './jwt';

export interface UserSession {
  id: string;
  email: string;
  role: string;
}

// Oturumdan mevcut kullanıcıyı al
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return null;
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
