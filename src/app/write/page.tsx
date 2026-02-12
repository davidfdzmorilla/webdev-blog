'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import type { ExtendedSession } from '@/lib/auth-types';
import TipTapEditor from '@/components/TipTapEditor';
import { createPost } from '@/app/actions/posts';
import { uploadImage } from '@/app/actions/media';

export default function WritePage() {
  const router = useRouter();
  const { data: sessionData, isPending } = useSession();
  const session = sessionData as ExtendedSession | null;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (
      !isPending &&
      (!session || (session.user.role !== 'author' && session.user.role !== 'admin'))
    ) {
      router.push('/dashboard');
    }
  }, [session, isPending, router]);

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadImage(formData);
      setFeaturedImage(result.media.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await createPost({
        title,
        content,
        excerpt: excerpt || undefined,
        featuredImage: featuredImage || undefined,
        status: 'draft',
      });
      router.push('/dashboard/posts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await createPost({
        title,
        content,
        excerpt: excerpt || undefined,
        featuredImage: featuredImage || undefined,
        status: 'published',
      });
      router.push('/blog');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish');
    } finally {
      setLoading(false);
    }
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

  if (!session || (session.user.role !== 'author' && session.user.role !== 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Write a Post</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                onClick={handlePublish}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <input
              type="text"
              placeholder="Post Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-bold border-0 focus:outline-none focus:ring-0 placeholder-gray-300"
            />
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
              Excerpt (optional)
            </label>
            <textarea
              id="excerpt"
              placeholder="Brief summary of your post (auto-generated if left blank)"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="featured-image"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Featured Image (optional)
            </label>
            <div className="flex items-center space-x-4">
              <input
                id="featured-image"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFeaturedImageUpload}
                disabled={uploadingImage}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploadingImage && <span className="text-sm text-gray-500">Uploading...</span>}
            </div>
            {featuredImage && (
              <div className="mt-2">
                <img src={featuredImage} alt="Featured" className="max-w-xs rounded border" />
                <button
                  type="button"
                  onClick={() => setFeaturedImage('')}
                  className="mt-1 text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <TipTapEditor
              content={content}
              onChange={setContent}
              placeholder="Write your amazing post here..."
            />
          </div>

          <div className="text-sm text-gray-500">
            {
              content
                .replace(/<[^>]*>/g, '')
                .trim()
                .split(/\s+/).length
            }{' '}
            words
          </div>
        </div>
      </main>
    </div>
  );
}
