'use client';

import { useSession, signOut } from '@/lib/auth-client';
import type { ExtendedSession } from '@/lib/auth-types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: sessionData, isPending } = useSession();
  const session = sessionData as ExtendedSession | null;
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/auth/login');
    }
  }, [session, isPending, router]);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">WebDev Blog</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {session.user.name} ({session.user.role || 'reader'})
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Dashboard</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Profile</h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{session.user.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{session.user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {session.user.role || 'reader'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">User ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">{session.user.id}</dd>
                </div>
              </dl>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {(session.user.role === 'author' || session.user.role === 'admin') && (
                  <>
                    <button
                      onClick={() => router.push('/write')}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Write New Post
                    </button>
                    <button
                      onClick={() => router.push('/dashboard/posts')}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      My Posts
                    </button>
                  </>
                )}
                {session.user.role === 'admin' && (
                  <button
                    onClick={() => router.push('/dashboard/categories')}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Manage Categories
                  </button>
                )}
                <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
