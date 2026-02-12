import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPostsByAuthor } from '@/app/actions/public';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { author } = await getPostsByAuthor(id, 1, 1);

  if (!author) {
    return {
      title: 'Author Not Found',
    };
  }

  return {
    title: `${author.name} - Author`,
    description: author.bio || `Posts by ${author.name}`,
  };
}

export default async function AuthorPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const queryParams = await searchParams;
  const currentPage = Number(queryParams.page) || 1;
  const { posts, total, author } = await getPostsByAuthor(id, currentPage, 10);

  if (!author) {
    notFound();
  }

  const totalPages = Math.ceil(total / 10);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link
          href="/blog"
          className="text-blue-600 hover:text-blue-700 font-medium mb-8 inline-block"
        >
          ← Back to Blog
        </Link>

        {/* Author Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <div className="flex items-center space-x-6">
            {author.avatarUrl ? (
              <div className="relative h-24 w-24 rounded-full overflow-hidden flex-shrink-0">
                <Image src={author.avatarUrl} alt={author.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                {author.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{author.name}</h1>
              {author.bio && <p className="text-gray-600 mb-2">{author.bio}</p>}
              <p className="text-sm text-gray-500">
                {total} {total === 1 ? 'post' : 'posts'} published
              </p>
            </div>
          </div>
        </div>

        {/* Posts List */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No posts published yet.</p>
          </div>
        ) : (
          <>
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

                      <div className="text-sm text-gray-500">
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        {' · '}
                        {post.readingTime} min read
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
                    href={`/author/${id}?page=${currentPage - 1}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Previous
                  </Link>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Link
                    key={page}
                    href={`/author/${id}?page=${page}`}
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
                    href={`/author/${id}?page=${currentPage + 1}`}
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
