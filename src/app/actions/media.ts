'use server';
import type { ExtendedSession } from '@/lib/auth-types';

import { db } from '@/lib/db';
import { media } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { uploadToS3, deleteFromS3 } from '@/lib/s3';

export async function uploadImage(formData: FormData) {
  const session = (await auth.api.getSession({
    headers: await headers(),
  })) as ExtendedSession | null;

  if (!session) {
    throw new Error('Unauthorized');
  }

  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 5MB.');
  }

  try {
    // Upload to MinIO/S3
    const url = await uploadToS3(file, session.user.id);

    // Save metadata to database
    const [mediaRecord] = await db
      .insert(media)
      .values({
        userId: session.user.id,
        filename: `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        originalFilename: file.name,
        url,
        size: file.size.toString(),
        mimeType: file.type,
      })
      .returning();

    return { success: true, media: mediaRecord };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to upload image', {
      cause: error,
    });
  }
}

export async function deleteImage(mediaId: string) {
  const session = (await auth.api.getSession({
    headers: await headers(),
  })) as ExtendedSession | null;

  if (!session) {
    throw new Error('Unauthorized');
  }

  const [mediaRecord] = await db.select().from(media).where(eq(media.id, mediaId));

  if (!mediaRecord) {
    throw new Error('Media not found');
  }

  // Only owner or admin can delete
  if (mediaRecord.userId !== session.user.id && session.user.role !== 'admin') {
    throw new Error('Unauthorized: Not your media');
  }

  try {
    // Delete from S3
    await deleteFromS3(mediaRecord.url);

    // Delete from database
    await db.delete(media).where(eq(media.id, mediaId));

    return { success: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete image', {
      cause: error,
    });
  }
}

export async function getMyMedia() {
  const session = (await auth.api.getSession({
    headers: await headers(),
  })) as ExtendedSession | null;

  if (!session) {
    throw new Error('Unauthorized');
  }

  const myMedia = await db.select().from(media).where(eq(media.userId, session.user.id));

  return myMedia;
}
