'use server';

import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, desc } from 'drizzle-orm';
import { generateSlug, generateExcerpt } from '@/lib/utils/slug';
import { revalidatePath } from 'next/cache';
import type { ExtendedSession } from '@/lib/auth-types';

export async function createPost(formData: {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status?: 'draft' | 'published';
}) {
  const session = (await auth.api.getSession({
    headers: await headers(),
  })) as ExtendedSession | null;

  if (!session || (session.user.role !== 'author' && session.user.role !== 'admin')) {
    throw new Error('Unauthorized: Must be author or admin');
  }

  const slug = generateSlug(formData.title);
  const excerpt = formData.excerpt || generateExcerpt(formData.content);
  const status = formData.status || 'draft';

  const [post] = await db
    .insert(posts)
    .values({
      authorId: session.user.id,
      title: formData.title,
      slug,
      content: formData.content,
      excerpt,
      featuredImage: formData.featuredImage,
      status,
      publishedAt: status === 'published' ? new Date() : null,
    })
    .returning();

  revalidatePath('/dashboard/posts');
  if (status === 'published') {
    revalidatePath('/blog');
    revalidatePath('/');
  }

  return { success: true, post };
}

export async function updatePost(
  postId: string,
  formData: {
    title?: string;
    content?: string;
    excerpt?: string;
    featuredImage?: string;
  }
) {
  const session = (await auth.api.getSession({
    headers: await headers(),
  })) as ExtendedSession | null;

  if (!session) {
    throw new Error('Unauthorized');
  }

  const [existingPost] = await db.select().from(posts).where(eq(posts.id, postId));

  if (!existingPost) {
    throw new Error('Post not found');
  }

  // Only post author or admin can update
  if (existingPost.authorId !== session.user.id && session.user.role !== 'admin') {
    throw new Error('Unauthorized: Not your post');
  }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (formData.title) {
    updateData.title = formData.title;
    updateData.slug = generateSlug(formData.title);
  }

  if (formData.content) {
    updateData.content = formData.content;
    updateData.excerpt = formData.excerpt || generateExcerpt(formData.content);
  }

  if (formData.featuredImage !== undefined) {
    updateData.featuredImage = formData.featuredImage;
  }

  const [updatedPost] = await db
    .update(posts)
    .set(updateData)
    .where(eq(posts.id, postId))
    .returning();

  revalidatePath('/dashboard/posts');
  revalidatePath(`/blog/${existingPost.slug}`);
  if (existingPost.status === 'published') {
    revalidatePath('/blog');
    revalidatePath('/');
  }

  return { success: true, post: updatedPost };
}

export async function publishPost(postId: string) {
  const session = (await auth.api.getSession({
    headers: await headers(),
  })) as ExtendedSession | null;

  if (!session) {
    throw new Error('Unauthorized');
  }

  const [existingPost] = await db.select().from(posts).where(eq(posts.id, postId));

  if (!existingPost) {
    throw new Error('Post not found');
  }

  if (existingPost.authorId !== session.user.id && session.user.role !== 'admin') {
    throw new Error('Unauthorized: Not your post');
  }

  const [updatedPost] = await db
    .update(posts)
    .set({
      status: 'published',
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId))
    .returning();

  revalidatePath('/dashboard/posts');
  revalidatePath('/blog');
  revalidatePath('/');

  return { success: true, post: updatedPost };
}

export async function unpublishPost(postId: string) {
  const session = (await auth.api.getSession({
    headers: await headers(),
  })) as ExtendedSession | null;

  if (!session) {
    throw new Error('Unauthorized');
  }

  const [existingPost] = await db.select().from(posts).where(eq(posts.id, postId));

  if (!existingPost) {
    throw new Error('Post not found');
  }

  if (existingPost.authorId !== session.user.id && session.user.role !== 'admin') {
    throw new Error('Unauthorized: Not your post');
  }

  const [updatedPost] = await db
    .update(posts)
    .set({
      status: 'draft',
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId))
    .returning();

  revalidatePath('/dashboard/posts');
  revalidatePath('/blog');
  revalidatePath('/');

  return { success: true, post: updatedPost };
}

export async function deletePost(postId: string) {
  const session = (await auth.api.getSession({
    headers: await headers(),
  })) as ExtendedSession | null;

  if (!session) {
    throw new Error('Unauthorized');
  }

  const [existingPost] = await db.select().from(posts).where(eq(posts.id, postId));

  if (!existingPost) {
    throw new Error('Post not found');
  }

  if (existingPost.authorId !== session.user.id && session.user.role !== 'admin') {
    throw new Error('Unauthorized: Not your post');
  }

  await db.delete(posts).where(eq(posts.id, postId));

  revalidatePath('/dashboard/posts');
  if (existingPost.status === 'published') {
    revalidatePath('/blog');
    revalidatePath('/');
  }

  return { success: true };
}

export async function getMyPosts() {
  const session = (await auth.api.getSession({
    headers: await headers(),
  })) as ExtendedSession | null;

  if (!session) {
    throw new Error('Unauthorized');
  }

  const myPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.authorId, session.user.id))
    .orderBy(desc(posts.createdAt));

  return myPosts;
}
