import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Get the current user from the session
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const { receiverId, content } = await request.json();

    // Validate input
    if (!receiverId) {
      return NextResponse.json(
        { error: 'Alıcı ID gereklidir' },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Mesaj içeriği gereklidir' },
        { status: 400 }
      );
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return NextResponse.json(
        { error: 'Alıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Prevent sending message to self
    if (receiverId === currentUser.id) {
      return NextResponse.json(
        { error: 'Kendinize mesaj gönderemezsiniz' },
        { status: 400 }
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: currentUser.id,
        receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Mesaj başarıyla gönderildi',
      data: message,
    }, { status: 201 });
  } catch (error) {
    console.error('Mesaj gönderme hatası:', error);
    return NextResponse.json(
      { error: 'Mesaj gönderilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get the current user from the session
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Fetch messages for the current user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUser.id },
          { receiverId: currentUser.id },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Mesaj getirme hatası:', error);
    return NextResponse.json(
      { error: 'Mesajlar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
