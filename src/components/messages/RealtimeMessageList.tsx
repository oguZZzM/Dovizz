'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface Message {
  id: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender: User;
  receiver: User;
}

interface RealtimeMessageListProps {
  initialMessages: Message[];
  currentUserId: string;
}

export default function RealtimeMessageList({ initialMessages, currentUserId }: RealtimeMessageListProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  
  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  // Function to get user display name
  const getUserDisplayName = (user: User) => {
    return user.name || user.email.split('@')[0];
  };
  
  // Fetch messages periodically
  useEffect(() => {
    // Function to fetch messages
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/messages');
        
        if (!response.ok) {
          throw new Error('Mesajlar alınırken bir hata oluştu');
        }
        
        const data = await response.json();
        setMessages(data.messages);
        setError('');
      } catch (err: any) {
        console.error('Mesaj getirme hatası:', err);
        setError('Mesajlar alınırken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch messages immediately
    fetchMessages();
    
    // Set up interval to fetch messages every 5 seconds
    const intervalId = setInterval(fetchMessages, 5000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }
  
  if (messages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Henüz mesajınız bulunmamaktadır.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 relative">
      {loading && (
        <div className="absolute top-0 right-0">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Yenileniyor...
          </span>
        </div>
      )}
      
      {messages.map((message) => {
        const isSender = message.sender.id === currentUserId;
        
        return (
          <div
            key={message.id}
            className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-[80%] ${
                isSender
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-sm">
                  {isSender ? 'Siz' : getUserDisplayName(message.sender)}
                </span>
                <span className={`text-xs ml-2 ${isSender ? 'text-blue-200' : 'text-gray-500'}`}>
                  {formatDate(message.createdAt)}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}