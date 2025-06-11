import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json(
      { error: 'Kullanıcı bilgileri alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}