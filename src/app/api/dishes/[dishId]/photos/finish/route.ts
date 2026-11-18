import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getEditableDish, requestIsSameOrigin } from '@/lib/image-authorization';
import { getImageStorage, storageIsConfigured } from '@/lib/image-storage';
import {
  imageFinishSchema, PHOTO_CONTENT_TYPE, isValidWebpMetadata, MAX_IMAGE_BYTES, MAX_INPUT_PIXELS, isTrustedImageKey,
} from '@/lib/image-policy';

export const runtime = 'nodejs';
type Context = { params: Promise<{ dishId: string }> };

export async function POST(request: Request, context: Context) {
  if (!requestIsSameOrigin(request)) return NextResponse.json({ error: 'FORBIDDEN_ORIGIN' }, { status: 403 });
  const { dishId } = await context.params;
  const editable = await getEditableDish(dishId);
  if (!editable) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  if (!storageIsConfigured()) return NextResponse.json({ error: 'STORAGE_NOT_CONFIGURED' }, { status: 503 });

  const data = imageFinishSchema.safeParse(await request.json().catch(() => null));
  if (!data.success) return NextResponse.json({ error: 'INVALID_UPLOAD' }, { status: 400 });
  const upload = await prisma.dishImageUpload.findFirst({
    where: {
      id: data.data.uploadId, dishId, restaurantId: editable.restaurantId,
      usedAt: null, expiresAt: { gt: new Date() },
    },
  });
  if (!upload) return NextResponse.json({ error: 'INVALID_OR_EXPIRED_UPLOAD' }, { status: 409 });

  const { client, bucket } = getImageStorage();
  try {
    const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: upload.objectKey }));
    if (!head.ContentLength || head.ContentLength > MAX_IMAGE_BYTES || head.ContentType !== PHOTO_CONTENT_TYPE) {
      return NextResponse.json({ error: 'INVALID_UPLOADED_OBJECT' }, { status: 422 });
    }

    const object = await client.send(new GetObjectCommand({ Bucket: bucket, Key: upload.objectKey }));
    if (!object.Body) return NextResponse.json({ error: 'MISSING_IMAGE' }, { status: 422 });
    const original = await object.Body.transformToByteArray();
    if (original.length > MAX_IMAGE_BYTES) return NextResponse.json({ error: 'TOO_LARGE' }, { status: 422 });
    const metadata = await sharp(original, { limitInputPixels: MAX_INPUT_PIXELS }).metadata();
    if (!isValidWebpMetadata(metadata)) return NextResponse.json({ error: 'INVALID_IMAGE' }, { status: 422 });

    // Re-encoding strips metadata (including EXIF) and never trusts the uploaded bytes for serving.
    const sanitized = await sharp(original, { limitInputPixels: MAX_INPUT_PIXELS })
      .rotate().resize({ width: 960, height: 960, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 76 }).toBuffer();
    if (sanitized.length > MAX_IMAGE_BYTES) return NextResponse.json({ error: 'IMAGE_NOT_COMPRESSIBLE' }, { status: 422 });

    const readyKey = 'ready/' + editable.restaurantId + '/' + dishId + '/' + randomUUID() + '.webp';
    await client.send(new PutObjectCommand({
      Bucket: bucket, Key: readyKey, ContentType: PHOTO_CONTENT_TYPE,
      CacheControl: 'public, max-age=300', Body: sanitized,
    }));

    let previous: string | null;
    try {
      previous = await prisma.$transaction(async tx => {
        const claimed = await tx.dishImageUpload.updateMany({
          where: { id: upload.id, usedAt: null, expiresAt: { gt: new Date() } },
          data: { usedAt: new Date() },
        });
        if (claimed.count !== 1) throw new Error('UPLOAD_ALREADY_USED');
        const dish = await tx.dish.findFirst({
          where: {
            id: dishId,
            category: { menu: { restaurant: { members: {
              some: { userId: editable.userId, role: { in: ['OWNER', 'EDITOR'] } },
            } } } },
          },
          select: { imageKey: true },
        });
        if (!dish) throw new Error('NOT_AUTHORIZED');
        await tx.dish.update({ where: { id: dishId }, data: { imageKey: readyKey } });
        return dish.imageKey;
      });
    } catch {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: readyKey })).catch(() => {});
      return NextResponse.json({ error: 'UPLOAD_CONFLICT' }, { status: 409 });
    }

    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: upload.objectKey })).catch(() => {});
    if (isTrustedImageKey(previous)) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: previous })).catch(() => {});
    }
    revalidatePath('/r/' + editable.slug);
    revalidatePath('/panel/restaurantes/' + editable.restaurantId);
    return NextResponse.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    // Never expose bucket names, S3 credentials, internal URLs or stack traces.
    return NextResponse.json({ error: 'IMAGE_STORAGE_FAILED' }, { status: 503 });
  }
}
