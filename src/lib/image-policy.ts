import { z } from 'zod';

export const MAX_IMAGE_BYTES = 600_000;
export const MAX_INPUT_PIXELS = 2_000_000;
export const MAX_IMAGE_DIMENSION = 1600;
export const PHOTO_CONTENT_TYPE = 'image/webp';

export const imageStartSchema = z.object({
  bytes: z.number().int().min(1).max(MAX_IMAGE_BYTES),
}).strict();

export const imageFinishSchema = z.object({
  uploadId: z.string().cuid(),
}).strict();

export function isValidWebpMetadata(metadata: { format?: string; width?: number; height?: number; pages?: number }): boolean {
  if (metadata.format !== 'webp') return false;
  if (!metadata.width || !metadata.height || !Number.isInteger(metadata.width) || !Number.isInteger(metadata.height)) return false;
  if (metadata.width > MAX_IMAGE_DIMENSION || metadata.height > MAX_IMAGE_DIMENSION) return false;
  if (metadata.width * metadata.height > MAX_INPUT_PIXELS) return false;
  if (metadata.pages && metadata.pages !== 1) return false;
  return true;
}

export function isTrustedImageKey(key: string | null | undefined): key is string {
  return !!key && /^ready\/[a-z0-9]+\/[a-z0-9]+\/[0-9a-f-]{36}\.webp$/.test(key);
}
