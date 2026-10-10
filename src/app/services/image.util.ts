/**
 * Loads an image file, scales it down so the longer edge is at most `maxSize`
 * and re-encodes it as JPEG. Phone photos are often 5+ MB; this keeps each one
 * around 100-250 KB, which is plenty for a flashcard.
 */
export function fileToResizedDataUrl(
  file: File,
  maxSize = 1280,
  quality = 0.82,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(
        1,
        maxSize / Math.max(img.naturalWidth, img.naturalHeight),
      );
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas
        .getContext('2d')!
        .drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(file.name));
    };
    img.src = url;
  });
}

export async function filesToDataUrls(
  files: FileList | null,
): Promise<string[]> {
  if (!files) return [];
  const images = Array.from(files).filter((f) => f.type.startsWith('image/'));
  return Promise.all(images.map((f) => fileToResizedDataUrl(f)));
}
