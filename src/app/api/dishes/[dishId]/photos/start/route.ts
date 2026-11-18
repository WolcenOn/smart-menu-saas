import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { prisma } from '@/lib/db';
import { getEditableDish, requestIsSameOrigin } from '@/lib/image-authorization';
import { getImageStorage, storageIsConfigured } from '@/lib/image-storage';
import { imageStartSchema, PHOTO_CONTENT_TYPE, MAX_IMAGE_BYTES } from '@/lib/image-policy';

export const runtime = 'nodejs';
type Context = { params: Promise<{ dishId: string }> };

export async function POST(request: Request, context: Context) {
  if (!requestIsSameOrigin(request)) return NextResponse.json({ error: 'FORBIDDEN_ORIGIN' }, { status: 403 });
  const { dishId } = await context.params;
  const editable = await getEditableDish(dishId);
  if (!editable) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  if (!storageIsConfigured()) return NextResponse.json({ error: 'STORAGE_NOT_CONFIGURED' }, { status: 503 });
  const payload = imageStartSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ error: 'INVALID_IMAGE_SIZE' }, { status: 400 });

  // Prevent repeated abandoned uploads in the pilot; final stored image capped per dish.
  const pending = await prisma.dishImageUpload.count({
    where: { dishId, usedAt: null, expiresAt: { gt: new Date() } },
  });
  if (pending >= 3) return NextResponse.json({ error: 'TOO_MANY_PENDING_UPLOADS' }, { status: 429 });

  const { bucket, client } = getImageStorage();
  const key = 'pending/' + editable.restaurantId + '/' + dishId + '/' + randomUUID() + '.webp';
  const url = await getSignedUrl(client, new PutObjectCommand({
    Bucket: bucket, Key: key, ContentType: PHOTO_CONTENT_TYPE,
  }), { expiresIn: 90 });

  const upload = await prisma.dishImageUpload.create({
    data: {
      dishId, restaurantId: editable.restaurantId, objectKey: key,
      maxBytes: MAX_IMAGE_BYTES, expiresAt: new Date(Date.now() + 5 * 60_000),
    },
    select: { id: true },
  });
  return NextResponse.json({ uploadId: upload.id, url, contentType: PHOTO_CONTENT_TYPE }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
