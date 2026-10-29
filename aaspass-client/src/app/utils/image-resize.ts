/** Image types the profile picture upload accepts (must match the backend's allowed types). */
export const PROFILE_PICTURE_ACCEPT = 'image/jpeg,image/png,image/webp';

/** Largest original file the browser will try to process before resizing. */
export const PROFILE_PICTURE_MAX_SOURCE_BYTES = 5 * 1024 * 1024;

/**
 * Center-crops an image to a square and scales it down to at most `size`×`size`, returning a JPEG.
 * Transparent areas are filled white because JPEG has no alpha channel.
 * Keeps uploads around 50–100 KB so pictures can live in the database cheaply.
 */
export async function resizeToSquareJpeg(file: Blob, size = 512, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    const side = Math.min(bitmap.width, bitmap.height);
    if (side <= 0) {
      throw new Error('Image has no pixels.');
    }
    const target = Math.min(size, side);
    const sx = (bitmap.width - side) / 2;
    const sy = (bitmap.height - side) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = target;
    canvas.height = target;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas is not supported.');
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, target, target);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, target, target);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not encode image.')), 'image/jpeg', quality);
    });
  } finally {
    bitmap.close();
  }
}
