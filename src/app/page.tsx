'use client';

import Link from 'next/link';
import { useSession } from '@/lib/auth-client';

export default function Home() {
  const { data: session, isPending } = useSession();

  return (
    <main className="min-h-screen flex flex-col">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">WebDev Blog</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isPending ? (
                <div className="animate-pulse h-4 w-20 bg-gray-200 rounded"></div>
              ) : session ? (
                <>
                  <span className="text-gray-700">{session.user.name}</span>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="px-4 py-2 text-gray-700 hover:text-gray-900">
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center px-4">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            WebDev Blog
          </h1>
          <p className="text-xl text-gray-600 mb-8">A modern blog platform for developers</p>

          <div className="space-x-4">
            <Link
              href="/blog"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Browse Posts
            </Link>
            {!session && !isPending && (
              <Link
                href="/auth/signup"
                className="inline-block px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition"
              >
                Get Started
              </Link>
            )}
          </div>

          <div className="mt-12 text-sm text-gray-500">
            <p>Level 2.2 Project - Blog Platform</p>
            <p className="mt-1">
              Built with Next.js 15, TypeScript, Tailwind CSS 4, PostgreSQL, and Better-Auth
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
