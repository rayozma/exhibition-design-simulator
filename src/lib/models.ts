import { Box3, Vector3 } from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { slugName, uploadToBucket, UploadError } from './upload'

export const MAX_MODEL_MB = 25
const MAX_BYTES = MAX_MODEL_MB * 1024 * 1024
const BUCKET = 'models'
/** Same decoder location drei's useGLTF uses, so the browser caches it once. */
const DRACO_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/'

export type ModelSize = { w: number; d: number; h: number }

/** OBJ sources are converted in the browser; cap their total size so the tab doesn't freeze. */
export const MAX_OBJ_INPUT_MB = 100

const isGlb = (f: File) => /\.glb$/i.test(f.name)
const isObj = (f: File) => /\.obj$/i.test(f.name)

/** Validate what was picked: one .glb, or one .obj with optional .mtl and texture files. */
export async function checkSelection(files: File[]): Promise<string | null> {
  const glbs = files.filter(isGlb)
  const objs = files.filter(isObj)
  if (glbs.length + objs.length !== 1)
    return 'Pick one .glb file, or one .obj file together with its .mtl and texture files.'
  if (glbs.length) {
    if (files.length > 1) return 'A .glb file is self-contained — pick only that one file.'
    return checkGlbFile(glbs[0])
  }
  const total = files.reduce((s, f) => s + f.size, 0)
  if (total > MAX_OBJ_INPUT_MB * 1024 * 1024)
    return `The OBJ files add up to ${(total / 1024 / 1024).toFixed(0)} MB — the limit for conversion is ${MAX_OBJ_INPUT_MB} MB.`
  return null
}

/**
 * Turn the picked files into one checked .glb: a .glb is used as is, an .obj (+ .mtl + textures)
 * is converted in the browser. Returns a warning when textures referenced by the .mtl were not picked.
 */
export async function prepareModel(files: File[]): Promise<{ glb: File; warning: string | null }> {
  const problem = await checkSelection(files)
  if (problem) throw new Error(problem)
  const glb = files.find(isGlb)
  if (glb) return { glb, warning: null }

  const { objToGlb } = await import('./objToGlb') // loaded only when an OBJ is used
  const { glb: converted, missing } = await objToGlb(files)
  const tooBig = await checkGlbFile(converted)
  if (tooBig) throw new Error(`After conversion: ${tooBig}`)
  const hasMtl = files.some((f) => /\.mtl$/i.test(f.name))
  const warning = missing.length
    ? `Textures not found: ${missing.join(', ')}. Pick them together with the .obj to include them.`
    : hasMtl
      ? null
      : 'No .mtl file picked — the model will be plain gray.'
  return { glb: converted, warning }
}

/** Quick checks before reading the file: extension, size, and the "glTF" magic bytes. */
export async function checkGlbFile(file: File): Promise<string | null> {
  if (!file.name.toLowerCase().endsWith('.glb')) return 'Only .glb or .obj files are supported (not .gltf, .fbx …).'
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

/** Upload to models/<room>/<timestamp>-<name>.glb and return its public URL. */
export async function uploadGlb(room: string, file: File, onProgress: (fraction: number) => void): Promise<string> {
  const path = `${room}/${Date.now()}-${slugName(file.name, 'model')}.glb`
  try {
    return await uploadToBucket(BUCKET, path, file, 'model/gltf-binary', onProgress)
  } catch (e) {
    throw e instanceof UploadError ? new Error(uploadErrorText(e.status, e.message)) : e
  }
}

function uploadErrorText(status: number, msg: string): string {
  if (status === 413 || /exceeded the maximum/i.test(msg)) return `Upload rejected: file is larger than ${MAX_MODEL_MB} MB.`
  if (/bucket not found/i.test(msg)) return 'Upload failed: the "models" bucket does not exist. Run supabase/storage.sql in Supabase.'
  if (status === 403 || /row-level security|unauthorized/i.test(msg))
    return 'Upload not allowed by Storage policies. Run supabase/storage.sql in Supabase.'
  if (/mime/i.test(msg)) return 'Upload rejected: only GLB files (model/gltf-binary) are allowed.'
  return `Upload failed (${status}): ${msg || 'unknown error'}`
}
