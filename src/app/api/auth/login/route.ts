import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { signJwt } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Girişi doğrula
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    // Şifreyi doğrula
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    // JWT token oluştur
    const token = await signJwt({ 
      id: user.id, 
      email: user.email,
      role: user.role
    }, '1d');

    // Çerez ayarla
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 gün
      sameSite: 'lax',
    });

    // Yanıttan şifreyi kaldır
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'Giriş başarılı',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    return NextResponse.json(
      { error: 'Giriş sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
