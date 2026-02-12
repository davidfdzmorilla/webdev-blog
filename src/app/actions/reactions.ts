'use server';

import { db } from '@/lib/db';
import { reactions } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { ExtendedSession } from '@/lib/auth-types';

export type ReactionType = 'like' | 'heart' | 'fire' | 'clap';

export interface ReactionCounts {
  like: number;
  heart: number;
  fire: number;
  clap: number;
  total: number;
  userReaction: ReactionType | null;
}

export async function toggleReaction(postId: string, reactionType: ReactionType) {
  const session = (await auth.api.getSession({
    headers: await headers(),
  })) as ExtendedSession | null;

  if (!session) {
    throw new Error('Unauthorized: Must be logged in to react');
  }

  // Check if user already reacted to this post with this type
  const existing = await db
    .select()
    .from(reactions)
    .where(
      and(
        eq(reactions.postId, postId),
        eq(reactions.userId, session.user.id),
        eq(reactions.type, reactionType)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Remove the reaction (toggle off)
    await db.delete(reactions).where(eq(reactions.id, existing[0].id));

    revalidatePath('/blog/[slug]', 'page');
    revalidatePath('/blog', 'page');
    revalidatePath('/', 'page');

    return { success: true, action: 'removed', reaction: null };
  }

  // Check if user has a different reaction type on this post
  const otherReaction = await db
    .select()
    .from(reactions)
    .where(and(eq(reactions.postId, postId), eq(reactions.userId, session.user.id)))
    .limit(1);

  if (otherReaction.length > 0) {
    // Update to the new reaction type
    await db
      .update(reactions)
      .set({ type: reactionType })
      .where(eq(reactions.id, otherReaction[0].id));
  } else {
    // Add new reaction
    await db.insert(reactions).values({
      postId,
      userId: session.user.id,
      type: reactionType,
    });
  }

  revalidatePath('/blog/[slug]', 'page');
  revalidatePath('/blog', 'page');
  revalidatePath('/', 'page');

  return { success: true, action: 'added', reaction: reactionType };
}

export async function getReactionCounts(postId: string, userId?: string): Promise<ReactionCounts> {
  // Get all reaction counts for the post
  const allReactions = await db.select().from(reactions).where(eq(reactions.postId, postId));

  const counts: ReactionCounts = {
    like: 0,
    heart: 0,
    fire: 0,
    clap: 0,
    total: allReactions.length,
    userReaction: null,
  };

  for (const reaction of allReactions) {
    counts[reaction.type as ReactionType]++;

    if (userId && reaction.userId === userId) {
      counts.userReaction = reaction.type as ReactionType;
    }
  }

  return counts;
}

export async function getPostReactions(
  postIds: string[],
  userId?: string
): Promise<Map<string, ReactionCounts>> {
  if (postIds.length === 0) {
    return new Map();
  }

  const allReactions = await db
    .select()
    .from(reactions)
    .where(sql`${reactions.postId} = ANY(${postIds})`);

  const reactionMap = new Map<string, ReactionCounts>();

  // Initialize counts for all posts
  for (const postId of postIds) {
    reactionMap.set(postId, {
      like: 0,
      heart: 0,
      fire: 0,
      clap: 0,
      total: 0,
      userReaction: null,
    });
  }

  // Count reactions
  for (const reaction of allReactions) {
    const counts = reactionMap.get(reaction.postId);
    if (counts) {
      counts[reaction.type as ReactionType]++;
      counts.total++;

      if (userId && reaction.userId === userId) {
        counts.userReaction = reaction.type as ReactionType;
      }
    }
  }

  return reactionMap;
}
