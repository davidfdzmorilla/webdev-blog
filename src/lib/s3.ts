import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

const s3Client = new S3Client({
  endpoint: `http://${process.env.MINIO_ENDPOINT}`,
  region: 'us-east-1', // MinIO doesn't use regions, but SDK requires it
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || '',
    secretAccessKey: process.env.MINIO_SECRET_KEY || '',
  },
  forcePathStyle: true, // Required for MinIO
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'blog-images';

export async function uploadToS3(file: File, userId: string): Promise<string> {
  const timestamp = Date.now();
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${userId}/${timestamp}-${sanitizedFilename}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    },
  });

  await upload.done();

  // Return the URL (accessible via MinIO endpoint)
  return `http://${process.env.MINIO_ENDPOINT}/${BUCKET_NAME}/${key}`;
}

export async function deleteFromS3(url: string): Promise<void> {
  // Extract key from URL
  const urlParts = url.split(`/${BUCKET_NAME}/`);
  if (urlParts.length !== 2) {
    throw new Error('Invalid S3 URL');
  }

  const key = urlParts[1];

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}
