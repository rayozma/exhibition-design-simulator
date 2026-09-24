import { LoadingManager, MeshStandardMaterial, type Material, type Mesh, type MeshPhongMaterial } from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

const TEXTURE_TIMEOUT_MS = 30_000

/** OBJ/MTL give Phong materials; glTF wants PBR. Keep color, texture and transparency. */
function toStandard(m: Material): Material {
  const p = m as MeshPhongMaterial
  if (!('shininess' in p)) return m
  return new MeshStandardMaterial({
    name: p.name,
    color: p.color,
    map: p.map,
    transparent: p.transparent,
    opacity: p.opacity,
    side: p.side,
    roughness: 0.7,
    metalness: 0,
  })
}

const baseName = (url: string) => decodeURIComponent(url.split(/[\\/]/).pop() ?? '').toLowerCase()

/**
 * Convert an .obj (plus optional .mtl and texture images, picked together) into a single .glb File.
 * Textures are resolved by file name from the picked files. Returns the GLB and any missing texture names.
 */
export async function objToGlb(files: File[]): Promise<{ glb: File; missing: string[] }> {
  const obj = files.find((f) => /\.obj$/i.test(f.name))
  if (!obj) throw new Error('No .obj file selected.')
  const mtl = files.find((f) => /\.mtl$/i.test(f.name))
  const byName = new Map(files.map((f) => [f.name.toLowerCase(), f]))

  // Serve referenced textures from the picked files instead of the network.
  const blobUrls: string[] = []
  const missing: string[] = []
  const manager = new LoadingManager()
  manager.setURLModifier((url) => {
    const f = byName.get(baseName(url))
    if (!f) return url
    const u = URL.createObjectURL(f)
    blobUrls.push(u)
    return u
  })
  let started = false
  const texturesDone = new Promise<void>((resolve) => {
    manager.onStart = () => (started = true)
    manager.onLoad = () => resolve()
    manager.onError = (url) => missing.push(baseName(url) || url)
    setTimeout(resolve, TEXTURE_TIMEOUT_MS)
  })

  try {
    const loader = new OBJLoader(manager)
    if (mtl) {
      const materials = new MTLLoader(manager).parse(await mtl.text(), '')
      materials.preload() // starts texture loads
      loader.setMaterials(materials)
    }
    const group = loader.parse(await obj.text())
    if (!group.children.length) throw new Error('The .obj file contains no geometry.')
    if (started) await texturesDone

    group.traverse((o) => {
      const mesh = o as Mesh
      if (!mesh.isMesh) return
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(toStandard) : toStandard(mesh.material)
    })

    const out = (await new GLTFExporter().parseAsync(group, { binary: true })) as ArrayBuffer
    const name = obj.name.replace(/\.obj$/i, '.glb')
    return { glb: new File([out], name, { type: 'model/gltf-binary' }), missing: [...new Set(missing)] }
  } catch (e) {
    throw new Error(`Could not convert the OBJ: ${(e as Error).message}`)
  } finally {
    blobUrls.forEach((u) => URL.revokeObjectURL(u))
  }
}
