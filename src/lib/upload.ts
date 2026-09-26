import { supabase, SUPABASE_KEY, SUPABASE_URL } from './supabase'

/** An upload the server refused: HTTP status and its message. */
export class UploadError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

/**
 * Upload a file to a public Storage bucket and return its public URL.
 * Uses XHR (not supabase-js) because only XHR reports upload progress.
 */
export function uploadToBucket(
  bucket: string,
  path: string,
  body: Blob,
  contentType: string,
  onProgress: (fraction: number) => void,
): Promise<string> {
  if (!supabase) return Promise.reject(new Error('Supabase is not configured'))
  const client = supabase
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`)
    xhr.setRequestHeader('apikey', SUPABASE_KEY)
    // Same rule as supabase-js: new-style keys go only in "apikey"; legacy anon JWT keys also as Bearer.
    if (!/^sb_(publishable|secret)_/.test(SUPABASE_KEY)) xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_KEY}`)
    xhr.setRequestHeader('Content-Type', contentType)
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.setRequestHeader('cache-control', 'max-age=31536000')

    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total)
    xhr.onerror = () => reject(new Error('Network error during upload. Check your connection and try again.'))
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(1)
        resolve(client.storage.from(bucket).getPublicUrl(path).data.publicUrl)
        return
      }
      let msg = ''
      try {
        const j = JSON.parse(xhr.responseText)
        msg = j.message || j.error || ''
      } catch {
        msg = xhr.responseText.slice(0, 200)
      }
      reject(new UploadError(xhr.status, msg || 'unknown error'))
    }
    xhr.send(body)
  })
}

/** "My Photo (1).JPG" -> "my-photo-1" */
export const slugName = (name: string, fallback: string) =>
  name
    .replace(/\.[a-z0-9]+$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || fallback
