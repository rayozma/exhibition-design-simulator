import { Box3, Vector3 } from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { supabase, SUPABASE_KEY, SUPABASE_URL } from './supabase'

export const MAX_MODEL_MB = 25
const MAX_BYTES = MAX_MODEL_MB * 1024 * 1024
const BUCKET = 'models'
/** Same decoder location drei's useGLTF uses, so the browser caches it once. */
const DRACO_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/'

export type ModelSize = { w: number; d: number; h: number }

/** Quick checks before reading the file: extension, size, and the "glTF" magic bytes. */
export async function checkGlbFile(file: File): Promise<string | null> {
  if (!file.name.toLowerCase().endsWith('.glb')) return 'Only .glb files are supported (not .gltf, .fbx, .obj …).'
  if (file.size > MAX_BYTES) return `File is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is ${MAX_MODEL_MB} MB.`
  if (file.size < 20) return 'File is empty or truncated.'
  const magic = new Uint8Array(await file.slice(0, 4).arrayBuffer())
  if (String.fromCharCode(...magic) !== 'glTF') return 'This is not a valid GLB file (wrong file header).'
  return null
}

/** Parse the GLB locally (validates it) and return its bounding-box size in meters. */
export async function measureGlb(file: File): Promise<ModelSize> {
  const loader = new GLTFLoader()
  const draco = new DRACOLoader().setDecoderPath(DRACO_PATH)
  loader.setDRACOLoader(draco)
  loader.setMeshoptDecoder(MeshoptDecoder)
  try {
    const gltf = await loader.parseAsync(await file.arrayBuffer(), '')
    const size = new Box3().setFromObject(gltf.scene).getSize(new Vector3())
    if (!Number.isFinite(size.x) || size.x + size.y + size.z === 0) throw new Error('the model has no visible geometry')
    return { w: size.x, d: size.z, h: size.y }
  } catch (e) {
    throw new Error(`Could not read the model: ${(e as Error).message}`)
  } finally {
    draco.dispose()
  }
}

const slug = (name: string) =>
  name
    .replace(/\.glb$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'model'

/**
 * Upload to models/<room>/<timestamp>-<name>.glb and return its public URL.
 * Uses XHR (not supabase-js) because only XHR reports upload progress.
 */
export function uploadGlb(room: string, file: File, onProgress: (fraction: number) => void): Promise<string> {
  if (!supabase) return Promise.reject(new Error('Supabase is not configured'))
  const client = supabase
  const path = `${room}/${Date.now()}-${slug(file.name)}.glb`

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`)
    xhr.setRequestHeader('apikey', SUPABASE_KEY)
    // Same rule as supabase-js: new-style keys go only in "apikey"; legacy anon JWT keys also as Bearer.
    if (!/^sb_(publishable|secret)_/.test(SUPABASE_KEY)) xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_KEY}`)
    xhr.setRequestHeader('Content-Type', 'model/gltf-binary')
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.setRequestHeader('cache-control', 'max-age=31536000')

    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total)
    xhr.onerror = () => reject(new Error('Network error during upload. Check your connection and try again.'))
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(1)
        resolve(client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl)
        return
      }
      reject(new Error(uploadErrorText(xhr.status, xhr.responseText)))
    }
    xhr.send(file)
  })
}

function uploadErrorText(status: number, body: string): string {
  let msg = ''
  try {
    const j = JSON.parse(body)
    msg = j.message || j.error || ''
  } catch {
    msg = body.slice(0, 200)
  }
  if (status === 413 || /exceeded the maximum/i.test(msg)) return `Upload rejected: file is larger than ${MAX_MODEL_MB} MB.`
  if (/bucket not found/i.test(msg)) return 'Upload failed: the "models" bucket does not exist. Run supabase/storage.sql in Supabase.'
  if (status === 403 || /row-level security|unauthorized/i.test(msg))
    return 'Upload not allowed by Storage policies. Run supabase/storage.sql in Supabase.'
  if (/mime/i.test(msg)) return 'Upload rejected: only GLB files (model/gltf-binary) are allowed.'
  return `Upload failed (${status}): ${msg || 'unknown error'}`
}
