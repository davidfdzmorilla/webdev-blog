import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';

async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('__Secure-better-auth.session_token')?.value;
  
  console.log('All cookies:', cookieStore.getAll().map(c => c.name));
  console.log('Session token:', sessionToken);
  
  if (!sessionToken) {
    console.log('No session token found');
    return null;
  }

  try {
    const response = await fetch('http://localhost:3000/api/auth/get-session', {
      headers: {
        'Cookie': `__Secure-better-auth.session_token=${sessionToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Session fetch error:', error);
    return null;
  }
}

export default async function DashboardPage() {
  const sessionData = await getSession();

  if (!sessionData || !sessionData.user) {
    redirect('/auth/login');
  }

  const { user, session } = sessionData;

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
                {user.name} ({user.role || 'reader'})
              </span>
              <form action="/api/auth/sign-out" method="POST">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-2 text-gray-600">Welcome back, {user.name}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/blog"
            className="p-6 bg-white rounded-lg shadow hover:shadow-xl transition"
          >
            <h3 className="text-xl font-semibold mb-2">View Blog</h3>
            <p className="text-gray-600">Browse all published posts</p>
          </Link>

          {(user.role === 'admin' || user.role === 'author') && (
            <>
              <Link
                href="/dashboard/posts/new"
                className="p-6 bg-white rounded-lg shadow hover:shadow-xl transition"
              >
                <h3 className="text-xl font-semibold mb-2">New Post</h3>
                <p className="text-gray-600">Create a new blog post</p>
              </Link>

              <Link
                href="/dashboard/posts"
                className="p-6 bg-white rounded-lg shadow hover:shadow-xl transition"
              >
                <h3 className="text-xl font-semibold mb-2">My Posts</h3>
                <p className="text-gray-600">Manage your posts</p>
              </Link>
            </>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Your Profile</h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="text-sm text-gray-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="text-sm text-gray-900">{user.role || 'reader'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Member since</dt>
              <dd className="text-sm text-gray-900">
                {new Date(user.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </main>
    </div>
  );
}
