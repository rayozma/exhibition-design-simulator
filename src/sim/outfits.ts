/**
 * Visual variety for crowd figures, reflecting an ADIPEC (Abu Dhabi) audience:
 * a majority in Gulf dress (kandura with ghutra + agal, abaya with shayla), the rest in
 * business suits or smart casual. Colors are hex numbers for InstancedMesh.setColorAt.
 */

export type Look = 'kandura' | 'abaya' | 'suit' | 'casual'

export type Outfit = {
  look: Look
  /** Lower body: robe hem or trousers. */
  lower: number
  /** Upper body: robe, jacket or shirt. */
  upper: number
  skin: number
  /** Headwear (ghutra / shayla) or hair color. */
  head: number
}

/** Share of each look among new arrivals (sums to 1). */
const LOOKS: [Look, number][] = [
  ['kandura', 0.4],
  ['abaya', 0.2],
  ['suit', 0.25],
  ['casual', 0.15],
]

// Light olive to deep brown, weighted toward mid tones by repetition.
const SKIN = [0xe0b394, 0xd8a47f, 0xc68c63, 0xc68c63, 0xb77b52, 0xb77b52, 0xa86a45, 0x8d5a3b]
const KANDURA = [0xf4f4f2, 0xf4f4f2, 0xf4f4f2, 0xebe4d3, 0xd9d9d6]
const GHUTRA = [0xf7f7f7, 0xf7f7f7, 0xc94c4c] // white, or red-checked shemagh
const ABAYA = [0x141418, 0x141418, 0x141418, 0x1f2433, 0x2b2233]
const JACKET = [0x1f2937, 0x111827, 0x374151, 0x3b3b4f, 0x2d2a26]
const SHIRT = [0xf8fafc, 0x93c5fd, 0x2563eb, 0x16a34a, 0xe11d48, 0xf59e0b, 0x7c3aed, 0x0891b2]
const TROUSERS = [0x2f3b52, 0x1f2937, 0x8b7d6b, 0x4b5563]
const HAIR = [0x1a1410, 0x2b1d14, 0x3b2a1e, 0x6b6b6b]

const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

function randomLook(): Look {
  let r = Math.random()
  for (const [look, share] of LOOKS) {
    if ((r -= share) < 0) return look
  }
  return 'casual'
}

export function randomOutfit(): Outfit {
  const look = randomLook()
  const skin = pick(SKIN)
  switch (look) {
    case 'kandura': {
      const robe = pick(KANDURA)
      return { look, lower: robe, upper: robe, skin, head: pick(GHUTRA) }
    }
    case 'abaya': {
      const robe = pick(ABAYA)
      return { look, lower: robe, upper: robe, skin, head: robe }
    }
    case 'suit': {
      const suit = pick(JACKET)
      return { look, lower: suit, upper: suit, skin, head: pick(HAIR) }
    }
    case 'casual':
      return { look, lower: pick(TROUSERS), upper: pick(SHIRT), skin, head: pick(HAIR) }
  }
}

/** Long robes flare to the ankle; trousers are slimmer. */
export const isRobe = (look: Look) => look === 'kandura' || look === 'abaya'
/** Ghutra and shayla cover the head and hang behind; others show hair. */
export const hasHeadCloth = (look: Look) => look === 'kandura' || look === 'abaya'
