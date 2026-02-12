'use server';

import { db } from '@/lib/db';
import { comments } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { ExtendedSession } from '@/lib/auth-types';

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  parentId: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  replies?: Comment[];
}

export async function addComment(formData: {
  postId: string;
  content: string;
  parentId?: string | null;
}) {
  const session = (await auth.api.getSession({
    headers: await headers(),
  })) as ExtendedSession | null;

  if (!session) {
    throw new Error('Unauthorized: Must be logged in to comment');
  }

  // Rate limiting check (simple in-memory, should use Redis in production)
  // For now, skip rate limiting implementation

  const [comment] = await db
    .insert(comments)
    .values({
      postId: formData.postId,
      userId: session.user.id,
      content: formData.content.trim(),
      parentId: formData.parentId || null,
    })
    .returning();

  revalidatePath(`/blog/[slug]`, 'page');

  return { success: true, comment };
}

export async function deleteComment(commentId: string) {
  const session = (await auth.api.getSession({
    headers: await headers(),
  })) as ExtendedSession | null;

  if (!session) {
    throw new Error('Unauthorized');
  }

  // Get the comment to check ownership
  const [comment] = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1);

  if (!comment) {
    throw new Error('Comment not found');
  }

  // Only allow deletion by comment author or admin
  if (comment.userId !== session.user.id && session.user.role !== 'admin') {
    throw new Error('Unauthorized: Can only delete your own comments');
  }

  await db.delete(comments).where(eq(comments.id, commentId));

  revalidatePath(`/blog/[slug]`, 'page');

  return { success: true };
}

export async function getCommentsByPost(postId: string): Promise<Comment[]> {
  const { sql } = await import('drizzle-orm');

  // Get comments with user info via SQL query
  const result = (await db.execute(
    sql`SELECT 
      c.id, c.post_id, c.user_id, c.parent_id, c.content, c.created_at, c.updated_at,
      u.name as user_name, u.avatar_url as user_avatar_url
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ${postId}
    ORDER BY c.created_at ASC`
  )) as Array<{
    id: string;
    post_id: string;
    user_id: string;
    parent_id: string | null;
    content: string;
    created_at: Date;
    updated_at: Date;
    user_name: string;
    user_avatar_url: string | null;
  }>;

  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  // First pass: create all comment objects
  for (const row of result) {
    const comment: Comment = {
      id: row.id,
      postId: row.post_id,
      userId: row.user_id,
      parentId: row.parent_id,
      content: row.content,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      user: {
        id: row.user_id,
        name: row.user_name,
        avatarUrl: row.user_avatar_url,
      },
      replies: [],
    };

    commentMap.set(comment.id, comment);

    if (!comment.parentId) {
      rootComments.push(comment);
    }
  }

  // Second pass: build reply hierarchy (1 level deep only)
  for (const comment of commentMap.values()) {
    if (comment.parentId && commentMap.has(comment.parentId)) {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(comment);
      }
    }
  }

  return rootComments;
}

export async function getCommentCount(postId: string): Promise<number> {
  const result = await db
    .select({ count: comments.id })
    .from(comments)
    .where(eq(comments.postId, postId));

  return result.length;
}
