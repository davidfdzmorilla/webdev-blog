import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPostBySlug } from '@/app/actions/public';
import { getCommentsByPost } from '@/app/actions/comments';
import CommentSection from '@/components/CommentSection';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt || post.content.slice(0, 160),
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.slice(0, 160),
      type: 'article',
      publishedTime: post.publishedAt.toISOString(),
      authors: [post.author.name],
      images: post.featuredImage
        ? [
            {
              url: post.featuredImage,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.content.slice(0, 160),
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const comments = await getCommentsByPost(post.id);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.featuredImage || undefined,
    datePublished: post.publishedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'WebDev Blog',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-gray-50">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            {' / '}
            <Link href="/blog" className="hover:text-blue-600">
              Blog
            </Link>
            {' / '}
            <span className="text-gray-900">{post.title}</span>
          </nav>

          {/* Categories */}
          {post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/blog/category/${category.slug}`}
                  className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 transition"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{post.title}</h1>

          {/* Excerpt */}
          {post.excerpt && <p className="text-xl text-gray-600 mb-8">{post.excerpt}</p>}

          {/* Author & Meta */}
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
            <Link
              href={`/author/${post.author.id}`}
              className="flex items-center space-x-3 hover:opacity-80 transition"
            >
              {post.author.avatarUrl ? (
                <div className="relative h-12 w-12 rounded-full overflow-hidden">
                  <Image
                    src={post.author.avatarUrl}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
                  {post.author.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-semibold text-gray-900">{post.author.name}</div>
                <div className="text-sm text-gray-500">
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </Link>
            <div className="text-sm text-gray-500">{post.readingTime} min read</div>
          </div>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
              <Image src={post.featuredImage} alt={post.title} fill className="object-cover" />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg prose-blue max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Author Bio */}
          {post.author.bio && (
            <div className="bg-gray-100 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About {post.author.name}</h3>
              <p className="text-gray-600 mb-4">{post.author.bio}</p>
              <Link
                href={`/author/${post.author.id}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View all posts by {post.author.name} →
              </Link>
            </div>
          )}

          {/* Comments */}
          <CommentSection postId={post.id} initialComments={comments} />

          {/* Back to Blog */}
          <div className="text-center mt-12">
            <Link
              href="/blog"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              ← Back to All Posts
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
