import { NextResponse } from 'next/server';
import { invalidateToken } from '@/lib/jwt';

export async function POST() {
  try {
    // Invalidate the JWT token
    const success = invalidateToken();

    if (success) {
      return NextResponse.json({ message: 'Çıkış başarılı' });
    } else {
      return NextResponse.json(
        { error: 'Çıkış sırasında bir hata oluştu' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Çıkış hatası:', error);
    return NextResponse.json(
      { error: 'Çıkış sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Also support GET requests for simple logout links
export async function GET() {
  return await POST();
}
