import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RealtimeMessageList from '@/components/messages/RealtimeMessageList';
import RealtimeMessageForm from '@/components/messages/RealtimeMessageForm';
import { prisma } from '@/lib/prisma';

export default async function MessagesPage() {
  const user = await getCurrentUser();

  // If not authenticated, redirect to login
  if (!user) {
    redirect('/login?callbackUrl=/messages');
  }

  let users = [];
  let messages = [];

  try {
    // Fetch all users for the recipient dropdown
    users = await prisma.user.findMany({
      where: {
        id: {
          not: user.id, // Exclude current user
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Fetch messages for the current user
    messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id },
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

    // Mark received messages as read
    await prisma.message.updateMany({
      where: {
        receiverId: user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });
  } catch (error) {
    console.error('Error fetching messages data:', error);
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Mesajlar</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Mesaj Geçmişi</h2>
              <p className="text-sm text-gray-500 mb-4">
                Mesajlar otomatik olarak her 5 saniyede bir güncellenir. Sayfayı yenilemenize gerek yoktur.
              </p>
              <RealtimeMessageList initialMessages={messages} currentUserId={user.id} />
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg sticky top-8">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Yeni Mesaj</h2>
              <RealtimeMessageForm users={users} currentUserId={user.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
