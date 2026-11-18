'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { MAX_IMAGE_BYTES } from '@/lib/image-policy';

async function toOptimizedWebp(file: File): Promise<Blob> {
  if (file.size > 12_000_000) throw new Error('Selecciona una imagen inferior a 12 MB.');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Utiliza una imagen JPG, PNG o WebP.');
  }

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 960 / bitmap.width, 960 / bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Tu navegador no admite optimización de imágenes.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.78, 0.66, 0.5]) {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', quality));
      if (blob?.type === 'image/webp' && blob.size <= MAX_IMAGE_BYTES) return blob;
    }
    throw new Error('Esta fotografía es demasiado grande incluso después de optimizarla.');
  } finally {
    bitmap.close();
  }
}

export function DishPhotoUploader({ dishId }: { dishId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');

  async function onUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const input = event.currentTarget.elements.namedItem('photo') as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;
    setBusy(true);
    setFeedback('Optimizando imagen…');
    try {
      const optimized = await toOptimizedWebp(file);
      const start = await fetch('/api/dishes/' + encodeURIComponent(dishId) + '/photos/start', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bytes: optimized.size }),
      });
      if (!start.ok) {
        if (start.status === 503) throw new Error('El almacenamiento de fotos aún no está configurado.');
        throw new Error('No se ha podido iniciar la subida.');
      }
      const result = await start.json() as { uploadId: string; url: string; contentType: string };
      setFeedback('Subiendo imagen…');
      const put = await fetch(result.url, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/webp' },
        body: optimized,
      });
      if (!put.ok) throw new Error('El almacenamiento ha rechazado la subida. Revisa la configuración CORS del bucket.');
      setFeedback('Validando imagen…');
      const finish = await fetch('/api/dishes/' + encodeURIComponent(dishId) + '/photos/finish', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId: result.uploadId }),
      });
      if (!finish.ok) throw new Error('No se ha podido validar y publicar la imagen.');
      setFeedback('Fotografía guardada.');
      if (input) input.value = '';
      router.refresh();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'No se ha podido subir la fotografía.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="dish-photo-upload" onSubmit={onUpload}>
      <label>Fotografía del plato
        <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} />
      </label>
      <button className="editor-primary" type="submit" disabled={busy}>
        {busy ? 'Procesando…' : 'Guardar fotografía'}
      </button>
      <span aria-live="polite" className="dish-photo-feedback">{feedback}</span>
    </form>
  );
}
