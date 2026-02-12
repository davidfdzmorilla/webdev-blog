'use server';

import { db } from '@/lib/db';
import { posts, users, categories, postCategories } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

export interface PublicPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: Date;
  readingTime: number;
  author: {
    id: string;
    name: string;
    bio: string | null;
    avatarUrl: string | null;
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export async function getRecentPosts(limit: number = 6): Promise<PublicPost[]> {
  const publishedPosts = await db
    .select({
      post: posts,
      author: users,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);

  const postsWithCategories = await Promise.all(
    publishedPosts.map(async ({ post, author }) => {
      const postCats = await db
        .select({ category: categories })
        .from(postCategories)
        .innerJoin(categories, eq(postCategories.categoryId, categories.id))
        .where(eq(postCategories.postId, post.id));

      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        featuredImage: post.featuredImage,
        publishedAt: post.publishedAt!,
        readingTime: calculateReadingTime(post.content),
        author: {
          id: author.id,
          name: author.name,
          bio: author.bio,
          avatarUrl: author.avatarUrl,
        },
        categories: postCats.map(({ category }) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
        })),
      };
    })
  );

  return postsWithCategories;
}

export async function getPostBySlug(slug: string): Promise<PublicPost | null> {
  const result = await db
    .select({
      post: posts,
      author: users,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(and(eq(posts.slug, slug), eq(posts.status, 'published')))
    .limit(1);

  if (result.length === 0) return null;

  const { post, author } = result[0];

  const postCats = await db
    .select({ category: categories })
    .from(postCategories)
    .innerJoin(categories, eq(postCategories.categoryId, categories.id))
    .where(eq(postCategories.postId, post.id));

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    featuredImage: post.featuredImage,
    publishedAt: post.publishedAt!,
    readingTime: calculateReadingTime(post.content),
    author: {
      id: author.id,
      name: author.name,
      bio: author.bio,
      avatarUrl: author.avatarUrl,
    },
    categories: postCats.map(({ category }) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    })),
  };
}

export async function getPostsByCategory(
  categorySlug: string,
  page: number = 1,
  limit: number = 10
): Promise<{ posts: PublicPost[]; total: number }> {
  const offset = (page - 1) * limit;

  const category = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, categorySlug))
    .limit(1);

  if (category.length === 0) {
    return { posts: [], total: 0 };
  }

  const postIds = await db
    .select({ postId: postCategories.postId })
    .from(postCategories)
    .where(eq(postCategories.categoryId, category[0].id));

  const postIdList = postIds.map((p) => p.postId);

  if (postIdList.length === 0) {
    return { posts: [], total: 0 };
  }

  const publishedPosts = await db
    .select({
      post: posts,
      author: users,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(and(eq(posts.status, 'published'), sql`${posts.id} = ANY(${postIdList})`))
    .orderBy(desc(posts.publishedAt))
    .limit(limit)
    .offset(offset);

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(and(eq(posts.status, 'published'), sql`${posts.id} = ANY(${postIdList})`));

  const postsWithCategories = await Promise.all(
    publishedPosts.map(async ({ post, author }) => {
      const postCats = await db
        .select({ category: categories })
        .from(postCategories)
        .innerJoin(categories, eq(postCategories.categoryId, categories.id))
        .where(eq(postCategories.postId, post.id));

      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        featuredImage: post.featuredImage,
        publishedAt: post.publishedAt!,
        readingTime: calculateReadingTime(post.content),
        author: {
          id: author.id,
          name: author.name,
          bio: author.bio,
          avatarUrl: author.avatarUrl,
        },
        categories: postCats.map(({ category }) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
        })),
      };
    })
  );

  return { posts: postsWithCategories, total: total[0].count };
}

export async function getAllPosts(
  page: number = 1,
  limit: number = 10
): Promise<{ posts: PublicPost[]; total: number }> {
  const offset = (page - 1) * limit;

  const publishedPosts = await db
    .select({
      post: posts,
      author: users,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.publishedAt))
    .limit(limit)
    .offset(offset);

  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(eq(posts.status, 'published'));

  const postsWithCategories = await Promise.all(
    publishedPosts.map(async ({ post, author }) => {
      const postCats = await db
        .select({ category: categories })
        .from(postCategories)
        .innerJoin(categories, eq(postCategories.categoryId, categories.id))
        .where(eq(postCategories.postId, post.id));

      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        featuredImage: post.featuredImage,
        publishedAt: post.publishedAt!,
        readingTime: calculateReadingTime(post.content),
        author: {
          id: author.id,
          name: author.name,
          bio: author.bio,
          avatarUrl: author.avatarUrl,
        },
        categories: postCats.map(({ category }) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
        })),
      };
    })
  );

  return { posts: postsWithCategories, total: totalResult[0].count };
}

export async function getPostsByAuthor(
  authorId: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  posts: PublicPost[];
  total: number;
  author: { id: string; name: string; bio: string | null; avatarUrl: string | null } | null;
}> {
  const offset = (page - 1) * limit;

  const author = await db.select().from(users).where(eq(users.id, authorId)).limit(1);

  if (author.length === 0) {
    return { posts: [], total: 0, author: null };
  }

  const publishedPosts = await db
    .select({
      post: posts,
      author: users,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(and(eq(posts.status, 'published'), eq(posts.authorId, authorId)))
    .orderBy(desc(posts.publishedAt))
    .limit(limit)
    .offset(offset);

  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(and(eq(posts.status, 'published'), eq(posts.authorId, authorId)));

  const postsWithCategories = await Promise.all(
    publishedPosts.map(async ({ post, author }) => {
      const postCats = await db
        .select({ category: categories })
        .from(postCategories)
        .innerJoin(categories, eq(postCategories.categoryId, categories.id))
        .where(eq(postCategories.postId, post.id));

      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        featuredImage: post.featuredImage,
        publishedAt: post.publishedAt!,
        readingTime: calculateReadingTime(post.content),
        author: {
          id: author.id,
          name: author.name,
          bio: author.bio,
          avatarUrl: author.avatarUrl,
        },
        categories: postCats.map(({ category }) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
        })),
      };
    })
  );

  return {
    posts: postsWithCategories,
    total: totalResult[0].count,
    author: {
      id: author[0].id,
      name: author[0].name,
      bio: author[0].bio,
      avatarUrl: author[0].avatarUrl,
    },
  };
}
