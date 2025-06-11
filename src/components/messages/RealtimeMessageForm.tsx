'use client';

import { useState } from 'react';

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface RealtimeMessageFormProps {
  users: User[];
  currentUserId: string;
  onMessageSent?: () => void;
}

export default function RealtimeMessageForm({ users, currentUserId, onMessageSent }: RealtimeMessageFormProps) {
  const [receiverId, setReceiverId] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get user display name
  const getUserDisplayName = (user: User) => {
    return user.name || user.email.split('@')[0];
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!receiverId) {
      setError('Lütfen bir alıcı seçin');
      return;
    }
    
    if (!content.trim()) {
      setError('Lütfen bir mesaj girin');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId,
          content,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Mesaj gönderilirken bir hata oluştu');
      }
      
      setSuccess('Mesaj başarıyla gönderildi');
      setContent('');
      
      // Call the callback function if provided
      if (onMessageSent) {
        onMessageSent();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <p className="text-green-700">{success}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="receiver" className="block text-sm font-medium text-gray-700">
            Alıcı
          </label>
          <select
            id="receiver"
            name="receiver"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Alıcı seçin</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {getUserDisplayName(user)}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Mesaj
          </label>
          <textarea
            id="content"
            name="content"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Mesajınızı buraya yazın..."
          />
        </div>
        
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm disabled:bg-blue-300"
          >
            {loading ? 'Gönderiliyor...' : 'Mesaj Gönder'}
          </button>
        </div>
      </form>
    </div>
  );
}