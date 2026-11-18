import 'server-only';
import { S3Client } from '@aws-sdk/client-s3';

type StorageConfig = { bucket: string; client: S3Client };
let cached: StorageConfig | undefined;

export function storageIsConfigured(): boolean {
  return Boolean(
    process.env.S3_BUCKET && process.env.S3_REGION &&
    process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
  );
}

export function getImageStorage(): StorageConfig {
  if (cached) return cached;
  if (!storageIsConfigured()) throw new Error('STORAGE_NOT_CONFIGURED');
  const endpoint = process.env.S3_ENDPOINT?.trim();
  if (endpoint && new URL(endpoint).protocol !== 'https:') throw new Error('STORAGE_ENDPOINT_NOT_HTTPS');
  const client = new S3Client({
    region: process.env.S3_REGION!,
    ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });
  cached = { client, bucket: process.env.S3_BUCKET! };
  return cached;
}
