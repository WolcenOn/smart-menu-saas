import { describe, it, expect } from 'vitest';
import { MAX_IMAGE_BYTES, imageStartSchema, imageFinishSchema, isValidWebpMetadata, isTrustedImageKey } from './image-policy';

describe('safe image upload policy', () => {
  it('rejects oversized or unexpected upload data', () => {
    expect(imageStartSchema.safeParse({ bytes: MAX_IMAGE_BYTES }).success).toBe(true);
    expect(imageStartSchema.safeParse({ bytes: MAX_IMAGE_BYTES + 1 }).success).toBe(false);
    expect(imageStartSchema.safeParse({ bytes: 0 }).success).toBe(false);
    expect(imageStartSchema.safeParse({ bytes: 1, role: 'OWNER' }).success).toBe(false);
    expect(imageFinishSchema.safeParse({ uploadId: '../attack' }).success).toBe(false);
  });
  it('rejects fake image formats and decompression bombs', () => {
    expect(isValidWebpMetadata({format:'webp',width:960,height:600,pages:1})).toBe(true);
    expect(isValidWebpMetadata({format:'svg',width:960,height:600})).toBe(false);
    expect(isValidWebpMetadata({format:'webp',width:5000,height:5000})).toBe(false);
    expect(isValidWebpMetadata({format:'webp',width:500,height:500,pages:6})).toBe(false);
  });
  it('only permits generated ready keys', () => {
    expect(isTrustedImageKey('ready/cjld2cjxh0000qzrmn831i7rn/cjld2cjxh0000qzrmn831i7ro/123e4567-e89b-12d3-a456-426614174000.webp')).toBe(true);
    expect(isTrustedImageKey('../../secrets')).toBe(false);
  });
});
