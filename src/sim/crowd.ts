import { inRects, layouts } from '../lib/layout'
import { cellOf, cellX, cellZ, type FlowField, type NavGrid } from './navGrid'

export const MAX_AGENTS = 400

export type CrowdSettings = {
  /** People per m² of walkable area. */
  density: number
  /** Share of new arrivals (0–1) who visit booth attractions; the rest walk past on the walkway. */
  visitorShare: number
  playing: boolean
  showHeat: boolean
  showClearance: boolean
  /** Bump to restart the simulation. */
  restartToken: number
}

export type CrowdStats = { inside: number; peak: number; total: number; area: number; narrowArea: number }

const MAX_VISITS = 3
const DWELL_MIN = 5
const DWELL_MAX = 30
const STUCK_AFTER = 6 // s without getting closer to the goal -> pick another goal
const SEPARATION = 0.55 // m, agents push apart inside this distance
const HEAT_EVERY = 0.5 // s
const HEAT_KEEP = 0.92 // exponential moving average: ~6 s memory
const SHIRTS = [0xe11d48, 0x2563eb, 0x16a34a, 0xf59e0b, 0x7c3aed, 0x0891b2, 0xf97316, 0x64748b, 0xf8fafc, 0x111827]

type Agent = {
  x: number
  z: number
  vx: number
  vz: number
  speed: number
  role: 'visitor' | 'passer'
  /** Attraction index (goal) or entrance index (leaving). */
  goal: { kind: 'attraction' | 'exit'; idx: number } | null
  dwell: number
  /** Closest distance to the goal so far, and time since it last improved. */
  bestDist: number
  stuckT: number
  visitsLeft: number
  lastAttraction: number
  spawnEntrance: number
  color: number
  dead: boolean
}

const rand = (a: number, b: number) => a + Math.random() * (b - a)
const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

/** Local crowd simulation on a NavGrid: flow-field walking + simple separation steering. */
export class CrowdSim {
  agents: Agent[] = []
  nav: NavGrid | null = null
  density = 0
  visitorShare = 0.3
  peak = 0
  inside = 0
  readonly heatCols = layouts.hall.w
  readonly heatRows = layouts.hall.d
  /** Average people per m² in 1 m cells. */
  heat = new Float32Array(layouts.hall.w * layouts.hall.d)
  heatVersion = 0
  private heatTimer = 0
  private warm = true // next top-up places agents anywhere (instead of at entrances)
  private bucketHead = new Int32Array(layouts.hall.w * layouts.hall.d)
  private bucketNext = new Int32Array(MAX_AGENTS)

  get targetCount() {
    return this.nav ? Math.min(MAX_AGENTS, Math.round(this.density * this.nav.walkableArea)) : 0
  }

  setNav(nav: NavGrid | null) {
    this.nav = nav
    // Routes changed: re-plan everyone (dwellers keep dwelling).
    for (const a of this.agents) if (a.dwell <= 0) this.plan(a)
  }

  setDensity(d: number) {
    if (d > this.density) this.warm = true
    this.density = d
  }

  restart() {
    this.agents = []
    this.peak = 0
    this.inside = 0
    this.heat.fill(0)
    this.heatVersion++
    this.warm = true
  }

  resetPeak() {
    this.peak = this.inside
  }

  private field(a: Agent): FlowField | null {
    const nav = this.nav
    if (!nav || !a.goal) return null
    return a.goal.kind === 'attraction' ? nav.attractions[a.goal.idx]?.field ?? null : nav.entrances[a.goal.idx]?.field ?? null
  }

  /** Choose the agent's next goal from where it stands. */
  private plan(a: Agent) {
    const nav = this.nav
    if (!nav) return
    a.bestDist = Infinity
    a.stuckT = 0
    const c = cellOf(nav, a.x, a.z)
    const reachable = (f: FlowField) => c >= 0 && f.dist[c] < Infinity
    if (a.role === 'visitor' && a.visitsLeft > 0) {
      const options = nav.attractions.map((_, i) => i).filter((i) => i !== a.lastAttraction && reachable(nav.attractions[i].field))
      if (options.length) {
        a.goal = { kind: 'attraction', idx: pick(options) }
        return
      }
    }
    // Leave: passers walk to the other end of the aisle they came in on, visitors to the nearest exit.
    const exits = nav.entrances.map((_, i) => i).filter((i) => reachable(nav.entrances[i].field))
    const aisle = nav.entrances[a.spawnEntrance]?.aisle
    const sameAisle = exits.filter((i) => i !== a.spawnEntrance && aisle && nav.entrances[i].aisle === aisle)
    let idx = -1
    if (a.role === 'passer' && sameAisle.length) idx = pick(sameAisle)
    else if (exits.length) idx = exits.reduce((b, i) => (nav.entrances[i].field.dist[c] < nav.entrances[b].field.dist[c] ? i : b))
    a.goal = idx >= 0 ? { kind: 'exit', idx } : null
    if (idx < 0) a.dead = true // nowhere to go
  }

  private spawn(anywhere: boolean) {
    const nav = this.nav
    if (!nav || !nav.freeCells.length) return
    const role = Math.random() < this.visitorShare ? 'visitor' : 'passer'
    let cell: number
    let spawnEntrance = -1
    // Entrances that have another end on the same aisle (passers-by walk from one end to the other).
    const through = nav.entrances
      .map((_, i) => i)
      .filter((i) => nav.entrances.some((o, j) => j !== i && o.aisle && o.aisle === nav.entrances[i].aisle))
    if (anywhere || !nav.entrances.length) {
      cell = pick(nav.freeCells)
      // Warm start: treat the nearest through-entrance as where this person came in.
      if (role === 'passer' && through.length)
        spawnEntrance = through.reduce((b, i) =>
          nav.entrances[i].field.dist[cell] < nav.entrances[b].field.dist[cell] ? i : b,
        )
    } else {
      spawnEntrance = role === 'passer' && through.length ? pick(through) : Math.floor(Math.random() * nav.entrances.length)
      cell = pick(nav.entrances[spawnEntrance].field.sources)
    }
    const a: Agent = {
      x: cellX(nav, cell) + rand(-0.1, 0.1),
      z: cellZ(nav, cell) + rand(-0.1, 0.1),
      vx: 0,
      vz: 0,
      speed: rand(1.0, 1.4),
      role,
      goal: null,
      dwell: anywhere && role === 'visitor' && Math.random() < 0.3 ? rand(0, DWELL_MAX) : 0,
      bestDist: Infinity,
      stuckT: 0,
      visitsLeft: role === 'visitor' ? 1 + Math.floor(Math.random() * MAX_VISITS) : 0,
      lastAttraction: -1,
      spawnEntrance,
      color: pick(SHIRTS),
      dead: false,
    }
    this.plan(a)
    if (!a.dead) this.agents.push(a)
  }

  step(dt: number) {
    const nav = this.nav
    if (!nav) {
      this.agents = []
      return
    }

    // Keep the population at the target density.
    const target = this.targetCount
    if (this.agents.length > target) this.agents.length = target
    for (let k = 0; this.agents.length < target && k < (this.warm ? MAX_AGENTS : 4); k++) this.spawn(this.warm)
    this.warm = false

    const agents = this.agents
    const hc = this.heatCols
    const hr = this.heatRows

    // Spatial hash in 1 m buckets for separation.
    this.bucketHead.fill(-1)
    agents.forEach((a, i) => {
      const b = Math.min(hr - 1, Math.max(0, Math.floor(a.z))) * hc + Math.min(hc - 1, Math.max(0, Math.floor(a.x)))
      this.bucketNext[i] = this.bucketHead[b]
      this.bucketHead[b] = i
    })

    let inside = 0
    for (let i = 0; i < agents.length; i++) {
      const a = agents[i]
      let c = cellOf(nav, a.x, a.z)
      if (c < 0 || !nav.free[c]) {
        // Inside an obstacle (e.g. an object was moved onto it): step out to the nearest free cell.
        const f = c >= 0 ? nav.nearestFree[c] : -1
        if (f < 0) {
          a.dead = true
          continue
        }
        a.x = cellX(nav, f)
        a.z = cellZ(nav, f)
        c = f
      }

      // Desired velocity from the flow field.
      let dx = 0
      let dz = 0
      if (a.dwell > 0) {
        a.dwell -= dt
        if (a.dwell <= 0) this.plan(a)
      } else {
        const field = this.field(a)
        if (!field || field.dist[c] === Infinity) {
          this.plan(a)
        } else if (field.dist[c] === 0) {
          // Arrived.
          if (a.goal?.kind === 'exit') {
            a.dead = true
            continue
          }
          a.lastAttraction = a.goal?.idx ?? -1
          a.visitsLeft--
          a.dwell = rand(DWELL_MIN, DWELL_MAX)
        } else {
          // Blocked for a while (e.g. a crowd around the display)? Try another goal.
          if (field.dist[c] < a.bestDist - 0.1) {
            a.bestDist = field.dist[c]
            a.stuckT = 0
          } else if ((a.stuckT += dt) > STUCK_AFTER) {
            if (a.goal?.kind === 'attraction') a.lastAttraction = a.goal.idx
            this.plan(a)
          }
          // Aim two cells ahead for smoother paths.
          let t = field.next[c]
          const t2 = t >= 0 ? field.next[t] : -1
          if (t2 >= 0) t = t2
          if (t >= 0) {
            const ex = cellX(nav, t) - a.x
            const ez = cellZ(nav, t) - a.z
            const len = Math.hypot(ex, ez) || 1
            dx = (ex / len) * a.speed
            dz = (ez / len) * a.speed
          }
        }
      }

      // Separation from nearby agents.
      let sx = 0
      let sz = 0
      const bi = Math.floor(a.x)
      const bj = Math.floor(a.z)
      for (let j = bj - 1; j <= bj + 1; j++) {
        if (j < 0 || j >= hr) continue
        for (let ii = bi - 1; ii <= bi + 1; ii++) {
          if (ii < 0 || ii >= hc) continue
          for (let k = this.bucketHead[j * hc + ii]; k >= 0; k = this.bucketNext[k]) {
            if (k === i) continue
            const ox = a.x - agents[k].x
            const oz = a.z - agents[k].z
            const d = Math.hypot(ox, oz)
            if (d > 0 && d < SEPARATION) {
              const push = ((SEPARATION - d) / SEPARATION) * 1.5
              sx += (ox / d) * push
              sz += (oz / d) * push
            }
          }
        }
      }
      if (a.dwell > 0) {
        sx *= 0.5 // people standing at a display shuffle less
        sz *= 0.5
      }

      const k = Math.min(1, dt * 6)
      a.vx += (dx + sx - a.vx) * k
      a.vz += (dz + sz - a.vz) * k
      const sp = Math.hypot(a.vx, a.vz)
      const max = a.speed * 1.2
      if (sp > max) {
        a.vx *= max / sp
        a.vz *= max / sp
      }

      // Move, sliding along blocked cells.
      const nx = a.x + a.vx * dt
      const nz = a.z + a.vz * dt
      const ok = (x: number, z: number) => {
        const cc = cellOf(nav, x, z)
        return cc >= 0 && nav.free[cc] === 1
      }
      if (ok(nx, nz)) {
        a.x = nx
        a.z = nz
      } else if (ok(nx, a.z)) {
        a.x = nx
        a.vz = 0
      } else if (ok(a.x, nz)) {
        a.z = nz
        a.vx = 0
      } else {
        a.vx = 0
        a.vz = 0
      }

      if (inRects(nav.footprint, a.x, a.z)) inside++
    }

    if (agents.some((a) => a.dead)) this.agents = agents.filter((a) => !a.dead)
    this.inside = inside
    this.peak = Math.max(this.peak, inside)

    // Density heatmap: moving average of people per 1 m cell.
    this.heatTimer += dt
    if (this.heatTimer >= HEAT_EVERY) {
      this.heatTimer = 0
      const counts = new Float32Array(this.heat.length)
      for (const a of this.agents) {
        const b = Math.floor(a.z) * hc + Math.floor(a.x)
        if (b >= 0 && b < counts.length) counts[b]++
      }
      for (let b = 0; b < counts.length; b++) this.heat[b] = this.heat[b] * HEAT_KEEP + counts[b] * (1 - HEAT_KEEP)
      this.heatVersion++
    }
  }
}
