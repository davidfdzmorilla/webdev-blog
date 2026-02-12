'use server';

import { db } from '@/lib/db';
import { categories, postCategories } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, desc } from 'drizzle-orm';
import { generateSlug } from '@/lib/utils/slug';
import { revalidatePath } from 'next/cache';

export async function createCategory(formData: { name: string; description?: string }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Must be admin');
  }

  const slug = generateSlug(formData.name);

  const [category] = await db
    .insert(categories)
    .values({
      name: formData.name,
      slug,
      description: formData.description,
    })
    .returning();

  revalidatePath('/dashboard/categories');
  revalidatePath('/blog');

  return { success: true, category };
}

export async function updateCategory(
  categoryId: string,
  formData: { name?: string; description?: string }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Must be admin');
  }

  const updateData: Record<string, unknown> = {};

  if (formData.name) {
    updateData.name = formData.name;
    updateData.slug = generateSlug(formData.name);
  }

  if (formData.description !== undefined) {
    updateData.description = formData.description;
  }

  const [updatedCategory] = await db
    .update(categories)
    .set(updateData)
    .where(eq(categories.id, categoryId))
    .returning();

  revalidatePath('/dashboard/categories');
  revalidatePath('/blog');

  return { success: true, category: updatedCategory };
}

export async function deleteCategory(categoryId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Must be admin');
  }

  await db.delete(categories).where(eq(categories.id, categoryId));

  revalidatePath('/dashboard/categories');
  revalidatePath('/blog');

  return { success: true };
}

export async function getAllCategories() {
  const allCategories = await db.select().from(categories).orderBy(desc(categories.createdAt));
  return allCategories;
}

export async function addPostCategory(postId: string, categoryId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user.role !== 'author' && session.user.role !== 'admin')) {
    throw new Error('Unauthorized');
  }

  await db.insert(postCategories).values({
    postId,
    categoryId,
  });

  revalidatePath('/dashboard/posts');
  revalidatePath(`/blog/${postId}`);

  return { success: true };
}

export async function removePostCategory(postId: string, categoryId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user.role !== 'author' && session.user.role !== 'admin')) {
    throw new Error('Unauthorized');
  }

  await db
    .delete(postCategories)
    .where(eq(postCategories.postId, postId) && eq(postCategories.categoryId, categoryId));

  revalidatePath('/dashboard/posts');
  revalidatePath(`/blog/${postId}`);

  return { success: true };
}
