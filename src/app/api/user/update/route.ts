import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    // Get the current user from the session
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const { name, email, currentPassword, newPassword } = await request.json();

    // Check if email is already taken by another user
    if (email !== currentUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Bu email adresi zaten kullanılıyor' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
    };

    // If changing password, verify current password and hash new password
    if (newPassword) {
      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: { password: true },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Kullanıcı bulunamadı' },
          { status: 404 }
        );
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Mevcut şifre yanlış' },
          { status: 400 }
        );
      }

      // Hash new password
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: 'Profil başarıyla güncellendi',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Profil güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
