import { slugName, uploadToBucket, UploadError } from './upload'

const BUCKET = 'images'
export const MAX_IMAGE_MB = 10
const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }
/** Photos bigger than this (px, longest side) or this file size are shrunk before uploading. */
const MAX_SIDE = 1920
const SHRINK_ABOVE_BYTES = 1.5 * 1024 * 1024

export function checkImage(file: File): string | null {
  if (!TYPES[file.type]) return 'Use a JPG, PNG, WebP or GIF image.'
  if (file.size > 40 * 1024 * 1024) return 'This image is over 40 MB. Please use a smaller one.'
  return null
}

/**
 * Shrink big photos to web size (max 1920 px, JPEG 85 %) so they load fast for everyone.
 * Small images, PNG graphics with transparency and GIFs are kept as they are.
 */
async function shrink(file: File): Promise<{ blob: Blob; type: string }> {
  if (file.type === 'image/gif') return { blob: file, type: file.type }
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height))
  if (scale === 1 && file.size <= SHRINK_ABOVE_BYTES) {
    bmp.close()
    return { blob: file, type: file.type }
  }
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  const ctx = canvas.getContext('2d')!
  const keepPng = file.type === 'image/png' && file.size <= SHRINK_ABOVE_BYTES // likely a logo / graphic
  if (!keepPng) {
    ctx.fillStyle = '#ffffff' // JPEG has no transparency
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  bmp.close()
  const type = keepPng ? 'image/png' : 'image/jpeg'
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.85))
  if (!blob) throw new Error('Could not read this image.')
  return { blob, type }
}

/** Upload an image for an info card to images/<room>/… and return its public URL. */
export async function uploadImage(room: string, file: File, onProgress: (fraction: number) => void): Promise<string> {
  const problem = checkImage(file)
  if (problem) throw new Error(problem)
  const { blob, type } = await shrink(file)
  if (blob.size > MAX_IMAGE_MB * 1024 * 1024) throw new Error(`Even after shrinking the image is over ${MAX_IMAGE_MB} MB.`)
  const path = `${room}/${Date.now()}-${slugName(file.name, 'image')}.${TYPES[type]}`
  try {
    return await uploadToBucket(BUCKET, path, blob, type, onProgress)
  } catch (e) {
    if (!(e instanceof UploadError)) throw e
    if (/bucket not found/i.test(e.message) || e.status === 403 || /row-level security/i.test(e.message))
      throw new Error('Image uploads are not set up. Run supabase/info.sql in the Supabase SQL Editor.')
    throw new Error(`Upload failed (${e.status}): ${e.message}`)
  }
}

/** A pasted image link must be a web address. */
export const isImageLink = (url: string) => /^https?:\/\/\S+$/i.test(url.trim())
