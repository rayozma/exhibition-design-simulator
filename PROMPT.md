# Project: NDT ADIPEC 2026 Design

Web app for collaboratively arranging the NDTCCS booth at ADIPEC 2026 (2–5 Nov 2026, Abu Dhabi, Al Masaood Energy pavilion) in 3D. Public GitHub repo, deployed to GitHub Pages. I'm a beginner: give exact setup steps for every external service and every command I need to run.

## Input
Seed data is `layouts.json` in the repo root (move it to `src/data/layouts.json` during setup). Do not re-derive dimensions.
- Units meters/degrees. Origin = hall NW corner, x east, z south, y up. Object x/z = footprint center; rotY rotates the w/d footprint.
- Pavilion zones = `zones` minus the selected option's `removeZones`.
- Use `theme`, `entrances`, `crowdPresets` from the file.
- Objects render as boxes (or cylinders if `shape: "cylinder"`) from w/d/h, with a name label, until a GLB is attached.

## Stack (keep it minimal)
- Vite + React + TypeScript
- three.js via @react-three/fiber and @react-three/drei (OrbitControls, TransformControls, useGLTF, InstancedMesh)
- Supabase: Postgres + Realtime (postgres_changes + presence) + Storage
- Deploy: GitHub Actions → GitHub Pages (Vite `base` = repo name)
- Config via `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), injected as GitHub Actions secrets. `.env` must be in `.gitignore`.

## Features
**Scene**
- Hall floor 33 × 15 m with 0.5 m grid. Pavilion zones as flat colored rects with labels, plus an optional semi-transparent volume of height `h` (toggle). Zones are not selectable.
- NDT booth: `platformH` platform on its footprint, walls from `walls` (`wallH`, `wallT`; toggle visibility), footprint outline.
- Top-down (2D plan) and perspective views, toggle button.

**Layout options**
- Layout switcher in the top bar: A (09 Sep – NDT 29 m²) and B (23 Sep – NDT 39 m²).
- Each room stores object positions per layout (`layout_id` column), so edits in A don't affect B.
- "Reset to design" restores the seed positions for the current layout.

**Editing**
- Click to select; drag on the floor plane to move; rotate in 15° steps (R key / buttons).
- Snap to grid (toggleable). Keep objects inside the hall bounds; warn (yellow) when an object leaves the NDT footprint.
- Highlight red when an object overlaps another object or a wall (AABB check is fine).
- Side panel: name, dimensions, position, rotation, editable numerically.
- Lock/unlock, duplicate, delete (with confirm). Undo last own action.

**Multi-user (no sign-in)**
- Rooms via URL param `?room=<id>`; landing page creates a random unguessable room id.
- On first visit ask for a display name + color, stored in localStorage.
- Presence: show online users and which object each has selected.
- Realtime sync of transforms; while dragging, broadcast at ~10 Hz and mark the object "being moved by X" so others can't grab it; persist to DB on drop. Last write wins otherwise.

**Upload 3D objects**
- `.glb` only, max 25 MB, to Supabase Storage bucket `models/<room>/`.
- Add as a new object or attach to an existing one; option to auto-scale the model to the object's w/d/h.
- Upload progress and clear errors.

**Crowd simulation**
- Modes Empty / Low / High from `crowdPresets`, plus a density slider (people per m² of walkable area).
- Agents: low-poly instanced figures ~1.7 m tall, 1.0–1.4 m/s, spawn at `entrances`, wander between objects with `attraction: true`, dwell 5–30 s. Walkable = walkway, `walkable` zones, and the NDT footprint; everything else, walls and objects are obstacles. Simple steering, no navmesh library unless needed.
- Local only (not synced); pause/play.
- Stats: people currently inside the NDT booth and peak count. Optional density heatmap and warnings where clearance < 1.2 m.

**Layouts**
- Save named snapshots per layout option; restore any snapshot.
- Export layout JSON and PNG screenshot.

## Supabase
Provide SQL for tables `objects` (room, layout_id, object fields, x, z, rot_y, model_url, locked, updated_by, updated_at) and `snapshots`. Enable Realtime on `objects`. RLS policies allowing anon read/insert/update/delete scoped by room; Storage policies restricting uploads to `.glb` and 25 MB. Briefly explain the no-auth security tradeoff.

## Phases — stop after each one so I can test
1. Project setup + static scene from `layouts.json` with layout switcher (local only, no Supabase).
2. Editing tools (local state).
3. Supabase sync + presence + rooms (walk me through creating the Supabase project).
4. GLB upload.
5. Crowd simulation.
6. Snapshots/export + GitHub Pages deploy workflow + README.

## Constraints
- Only touch files relevant to the current phase; no project-wide scans or rewrites.
- Small components; no extra UI libraries (plain CSS).
- Smooth with ~50 objects and ~300 agents on a normal laptop.
- For each phase give only the commands to run and a short manual test checklist; no test suites.
- At the end of each phase, commit with a clear message.
