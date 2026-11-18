import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getImageStorage, storageIsConfigured } from '@/lib/image-storage';
import { isTrustedImageKey, MAX_IMAGE_BYTES } from '@/lib/image-policy';

export const runtime = 'nodejs';
type Context = { params: Promise<{ dishId: string }> };

export async function GET(_request: Request, context: Context) {
  const { dishId } = await context.params;
  const dish = await prisma.dish.findFirst({
    where: {
      id: dishId, status: 'PUBLISHED', allergensReviewedAt: { not: null },
      category: { menu: { published: true } },
      imageKey: { not: null },
    },
    select: { imageKey: true },
  });
  if (!dish || !isTrustedImageKey(dish.imageKey) || !storageIsConfigured()) {
    return new Response(null, { status: 404 });
  }

  const { client, bucket } = getImageStorage();
  try {
    const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: dish.imageKey }));
    if (!head.ContentLength || head.ContentLength > MAX_IMAGE_BYTES || head.ContentType !== 'image/webp') {
      return new Response(null, { status: 404 });
    }
    const file = await client.send(new GetObjectCommand({ Bucket: bucket, Key: dish.imageKey }));
    if (!file.Body) return new Response(null, { status: 404 });
    const data = await file.Body.transformToByteArray();
    if (data.length > MAX_IMAGE_BYTES) return new Response(null, { status: 404 });
    const body = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=300',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
