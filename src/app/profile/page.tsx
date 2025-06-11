import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProfileForm from '@/components/ProfileForm';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  // If not authenticated, redirect to login
  if (!user) {
    redirect('/login?callbackUrl=/profile');
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Profil Sayfası</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <ProfileForm user={user} />
        </div>
      </div>
    </div>
  );
}
