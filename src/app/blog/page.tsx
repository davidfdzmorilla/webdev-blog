import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts } from '../actions/public';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogIndex({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const { posts, total } = await getAllPosts(currentPage, 10);
  const totalPages = Math.ceil(total / 10);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">All Posts</h1>
          <p className="text-gray-600">
            {total} {total === 1 ? 'post' : 'posts'} published
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No posts published yet.</p>
          </div>
        ) : (
          <>
            {/* Posts List */}
            <div className="space-y-8 mb-12">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
                >
                  <div className="md:flex">
                    {post.featuredImage && (
                      <Link href={`/blog/${post.slug}`} className="md:w-1/3">
                        <div className="relative h-64 md:h-full w-full">
                          <Image
                            src={post.featuredImage}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </Link>
                    )}

                    <div className={`p-6 ${post.featuredImage ? 'md:w-2/3' : 'w-full'}`}>
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition">
                          {post.title}
                        </h2>
                      </Link>

                      {post.excerpt && <p className="text-gray-600 mb-4">{post.excerpt}</p>}

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <Link
                          href={`/author/${post.author.id}`}
                          className="flex items-center space-x-2 hover:text-blue-600 transition"
                        >
                          {post.author.avatarUrl ? (
                            <div className="relative h-8 w-8 rounded-full overflow-hidden">
                              <Image
                                src={post.author.avatarUrl}
                                alt={post.author.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                              {post.author.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{post.author.name}</div>
                            <div className="text-xs">
                              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                              {' · '}
                              {post.readingTime} min read
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                {currentPage > 1 && (
                  <Link
                    href={`/blog?page=${currentPage - 1}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Previous
                  </Link>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Link
                    key={page}
                    href={`/blog?page=${page}`}
                    className={`px-4 py-2 rounded-lg transition ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </Link>
                ))}

                {currentPage < totalPages && (
                  <Link
                    href={`/blog?page=${currentPage + 1}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
