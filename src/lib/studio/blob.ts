import { put } from '@vercel/blob';

const EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

/** Upload an image to the public Blob store and return its public URL. */
export async function putImage(body: ArrayBuffer | Buffer | Blob | File, contentType: string): Promise<string> {
  const ext = EXT[contentType] ?? 'png';
  const { url } = await put(`studio/images/${crypto.randomUUID()}.${ext}`, body, {
    access: 'public',
    contentType,
    addRandomSuffix: false,
    cacheControlMaxAge: 31536000,
  });
  return url;
}
