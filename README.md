# NDT ADIPEC 2026 Design

A web app for arranging the **NDTCCS booth at ADIPEC 2026** (2–5 Nov 2026, Abu Dhabi, Al Masaood Energy pavilion) together, in 3D, in the browser.

- Hall, pavilion zones, booth platform and walls built from [`src/data/layouts.json`](src/data/layouts.json)
- Two layout options: **A** (09 Sep, NDT 29 m²) and **B** (23 Sep, NDT 39 m²), each with its own object positions
- Move, rotate, lock, duplicate and delete objects. Warnings for overlaps (red) and objects outside the booth (yellow)
- Real-time collaboration in shared rooms, no sign-in. You can see who is online and what they are moving
- Upload `.glb` or `.obj` 3D models for objects
- Crowd simulation with booth occupancy, density heatmap and narrow-passage warnings
- Named snapshots, JSON export and PNG screenshots

Live site: `https://rayozma.github.io/ndt-adipec-2026-design/` (after deployment, see below).

---

## Using the app

1. Open the site and click **Create a new room**. Enter a display name and pick a color.
2. Share the room link (**Copy link** in the top bar) with your team. Everyone with the link can view and edit.
3. Pick layout **A** or **B** in the top bar. Each layout keeps its own positions.

| Action | How |
|---|---|
| Select | Click an object (click empty floor or press Esc to deselect) |
| Move | Drag it on the floor. **Snap** (top bar) moves in 0.25 m steps |
| Rotate | R / Shift+R, or the ⟲ ⟳ buttons (15° steps) |
| Exact values | Type name, size, position or rotation in the right panel, then press Enter |
| Lock / duplicate / delete | Buttons in the right panel (Delete key also works) |
| Undo your last action | Ctrl+Z or **Undo** |
| Back to the original design | **Reset to design** (for everyone in the room, can be undone) |
| 2D plan / 3D view | Button in the top bar |
| 3D model | Right panel → **Attach .glb model…** (or with nothing selected: **Upload .glb as new object…**). For OBJ, select the `.obj` together with its `.mtl` and texture files |
| Crowd | Panel at the bottom-left: Empty / Low / High, density, "stop at booth" share, heatmap, clearance |
| Snapshots / export | **Snapshots & export** in the top bar |

**Colors:** red means the object overlaps another object or a wall. Yellow means part of it is outside the NDT booth footprint. A colored ring means another person has the object selected. "moving: Name" means someone is dragging it, and it can't be grabbed until they let go.

The crowd simulation runs only in your own browser and isn't shared.

---

## Setup (for developers)

Requirements: [Node.js](https://nodejs.org) 22 or newer (24 recommended) and git.

```powershell
git clone https://github.com/rayozma/ndt-adipec-2026-design.git
cd ndt-adipec-2026-design
npm install
npm run dev
```

Open http://127.0.0.1:5173/ndt-adipec-2026-design/.

Without Supabase settings the app runs in **local-only mode**: editing works, but there are no rooms, sync, uploads or snapshots.

### Supabase (database, live sync, file storage)

1. Create a free project at https://supabase.com (**New project**, pick the region closest to your team).
2. **SQL Editor → New query**: paste all of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
3. **SQL Editor → New query**: paste all of [`supabase/storage.sql`](supabase/storage.sql) and click **Run**.
4. Copy the settings file and fill it in:
   ```powershell
   Copy-Item .env.example .env
   ```
   - `VITE_SUPABASE_URL` is the Project URL, for example `https://abcdefgh.supabase.co` (from **Project Settings → Data API** or the **Connect** button), with nothing after `.co`.
   - `VITE_SUPABASE_ANON_KEY` is the **Publishable** key (`sb_publishable_…`) or the legacy **anon** key (from **Project Settings → API Keys**). Never use the secret / service_role key.
5. Restart `npm run dev`.

`.env` is listed in `.gitignore` and must never be committed.

### Deploy to GitHub Pages

The workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and publishes the site on every push to `main`.

One-time setup on GitHub:
1. **Settings → Secrets and variables → Actions → New repository secret**. Add two secrets with the same names and values as in `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main` (or open **Actions → Deploy to GitHub Pages → Run workflow**).

After 1–2 minutes the site is live at `https://rayozma.github.io/ndt-adipec-2026-design/`.

If you rename the repository, also change `base` in [`vite.config.ts`](vite.config.ts) to the new name.

---

## Security (no sign-in)

- The Supabase key in the app is public by design: anyone who opens the site can see it in the browser.
- Without sign-in, the database rules can't tell users apart. They only require a well-formed room id, and the app only reads its own room.
- **The room link works like a shared password.** Its 22 random characters can't be guessed, so people without the link won't find a room.
- Someone technical who takes the public key from the site **could still read or change data in any room**.
- Uploaded model files are publicly downloadable by URL. The app can't overwrite or delete them.

This is acceptable for booth layout drafts. **Don't put confidential information here.** To restrict access properly, add Supabase Auth (for example anonymous sign-ins) plus a room-members table, and tighten the policies in `supabase/schema.sql`.

---

## Project structure

```
src/
  data/layouts.json      seed design: hall, zones, layout options, objects, crowd presets
  App.tsx                landing page / name prompt / editor
  Editor.tsx             editing screen: state, panels, dialogs
  components/            top bar, side panel, dialogs, crowd panel (plain CSS in styles.css)
  scene/                 three.js scene (@react-three/fiber): floor, zones, booth, objects, models, crowd
  lib/
    layout.ts            types + helpers for layouts.json
    geometry.ts          snapping, hall bounds, overlap and footprint checks
    editor.ts            local state per layout option + undo
    useObjectOps.ts      edit operations (move, rotate, lock, duplicate, delete, undo, reset, restore)
    useRoomSync.ts       Supabase Realtime: row changes, drag broadcast, presence
    db.ts                database reads/writes (objects, snapshots)
    models.ts, objToGlb.ts  model checks, OBJ → GLB conversion, upload with progress
    exportLayout.ts      JSON export
  sim/
    navGrid.ts           walkable grid, routes (flow fields), clearance check
    crowd.ts             crowd simulation
supabase/
  schema.sql             tables, row-level security, realtime
  storage.sql            model bucket, upload policy, model_fit column
```

**Coordinates:** meters and degrees. The origin is the hall's north-west corner, x points east (0–33), z points south (0–15), y up. Object `x`/`z` is the center of its footprint, and `rotY` rotates the `w` × `d` footprint.

**Commands:** `npm run dev` (development server), `npm run build` (type-check + production build into `dist/`), `npm run preview` (serve the build locally).
