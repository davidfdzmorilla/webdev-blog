'use client';

import { signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
    >
      Logout
    </button>
  );
}
