import Link from 'next/link';
import Image from 'next/image';
import { getRecentPosts } from './actions/public';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const posts = await getRecentPosts(6);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">WebDev Blog</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Thoughts, tutorials, and insights on modern web development. Built with Next.js,
              TypeScript, and PostgreSQL.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/blog"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Browse All Posts
              </Link>
              <Link
                href="/auth/signup"
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400 transition"
              >
                Join the Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Posts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Recent Posts</h2>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No posts published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
              >
                {post.featuredImage && (
                  <Link href={`/blog/${post.slug}`}>
                    <div className="relative h-48 w-full">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Link>
                )}

                <div className="p-6">
                  {post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/blog/category/${category.slug}`}
                          className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition">
                      {post.title}
                    </h3>
                  </Link>

                  {post.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <Link
                      href={`/author/${post.author.id}`}
                      className="flex items-center space-x-2 hover:text-blue-600 transition"
                    >
                      {post.author.avatarUrl ? (
                        <div className="relative h-6 w-6 rounded-full overflow-hidden">
                          <Image
                            src={post.author.avatarUrl}
                            alt={post.author.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {post.author.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium">{post.author.name}</span>
                    </Link>

                    <span>{post.readingTime} min read</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {posts.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="/blog"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              View All Posts →
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">WebDev Blog</h3>
              <p className="text-sm">
                A production-ready full-stack blogging platform built with modern web technologies.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/blog" className="hover:text-white transition">
                    All Posts
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="hover:text-white transition">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-white transition">
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Technologies</h4>
              <p className="text-sm">
                Next.js 15, PostgreSQL, Drizzle ORM, Better-Auth, MinIO, Docker
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; 2026 WebDev Blog. Built by davidfdzmorilla.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
