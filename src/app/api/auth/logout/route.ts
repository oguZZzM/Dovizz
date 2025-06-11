import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Clear the auth cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0, // Expire immediately
    });

    return NextResponse.json({ message: 'Çıkış başarılı' });
  } catch (error) {
    console.error('Çıkış hatası:', error);
    return NextResponse.json(
      { error: 'Çıkış sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
