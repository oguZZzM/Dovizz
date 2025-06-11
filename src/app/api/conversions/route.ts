import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST endpoint to record a new conversion
export async function POST(request: Request) {
  try {
    // Get the current user from the session
    const currentUser = await getCurrentUser();

    // Check if user is authenticated
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Parse request body
    const { fromCurrency, toCurrency, amount, convertedAmount, rate } = await request.json();

    // Validate input
    if (!fromCurrency || !toCurrency || !amount || !convertedAmount) {
      return NextResponse.json(
        { error: 'Eksik bilgi' },
        { status: 400 }
      );
    }

    // Create conversion history record
    const conversion = await prisma.conversionHistory.create({
      data: {
        userId: currentUser.id,
        fromCurrency,
        toCurrency,
        amount,
        convertedAmount,
        rate: rate || 0,
      },
    });

    return NextResponse.json({
      message: 'Dönüşüm kaydedildi',
      conversion,
    }, { status: 201 });
  } catch (error) {
    console.error('Dönüşüm kaydetme hatası:', error);
    return NextResponse.json(
      { error: 'Dönüşüm kaydedilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve conversion history for the current user
export async function GET() {
  try {
    // Get the current user from the session
    const currentUser = await getCurrentUser();

    // Check if user is authenticated
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Get conversion history for the current user
    const conversions = await prisma.conversionHistory.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ conversions });
  } catch (error) {
    console.error('Dönüşüm geçmişi getirme hatası:', error);
    return NextResponse.json(
      { error: 'Dönüşüm geçmişi getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
