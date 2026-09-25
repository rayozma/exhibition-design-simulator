# Exhibition Design & Simulator

A web app for designing exhibition booths together, in 3D, in the browser — like a simple Canva for booth layouts, with a walk-through and a crowd simulation.

- Designs listed on the home page. Start from a blank hall or a template 
- Each design has its own hall, surrounding zones (other booths, walkways), your booth (outline, platform, walls) and entrances
- Move, rotate, lock, duplicate and delete objects. Warnings for overlaps (red) and objects outside the booth (yellow)
- Everyone who opens a design edits it live, no sign-in. You can see who is online, what they are moving, and their avatars in walk mode
- Per-object colors, editable in the side panel
- Upload `.glb` or `.obj` 3D models for objects
- Crowd simulation with booth occupancy, density heatmap and narrow-passage warnings
- Named snapshots, JSON export and PNG screenshots

Live site: `https://rayozma.github.io/exhibition-design-simulator/` (after deployment, see below).

---

## Using the app

1. Open the site. Pick a design from the list, or under **New design** type a name, choose a template and click **Create design**. On first visit, enter a display name, a color and your walk-mode avatar.
2. Everyone who opens the site can see and join every design. **Copy link** in the top bar gives a direct link to the design you're in; **✎** renames it.

| Action | How |
|---|---|
| Select | Click an object (click empty floor or press Esc to deselect). **Ctrl/Shift+click** adds or removes objects, **Ctrl+A** selects all |
| Move | Drag it on the floor; with several selected, they move together. **Snap** (top bar) moves in 0.25 m steps |
| Rotate | R / Shift+R, or the ⟲ ⟳ buttons (15° steps). Several objects turn around their common center |
| Exact values | Type number, name, size, position or rotation in the right panel (**Selected** tab), then press Enter |
| Object list and remarks | **Objects** tab in the right panel: every object with number, name, size and status, and a remarks box (saved for everyone) |
| Edit the layout | **Edit layout** in the top bar: draw zones, walkways, booth areas, walls and entrances on the plan; drag to move, drag the yellow handles to resize; hall size and booth settings in the panel |
| Add things | **+ Add** tab: basic shapes (box, cylinder, sphere, cone, ramp, panel, sign), ready-made items, your library, or upload a .glb / .obj |
| Stack things | **Lift** (next to X / Z): height above the floor, e.g. a screen on a counter |
| Combine | Select several objects, **Combine into one object**; **Break apart** undoes it. **Save to library…** makes any object reusable in all designs |
| Crowd attraction | **Visitors stop here** on any object |
| Dimensions | **Dimensions** in the top bar: rulers along the hall, size of the selected object and its clearances to walls / objects / booth edge |
| Measure | **📏 Measure**: click two points (snaps to corners); Esc to stop, measurements stay until cleared |
| Walk through the booth | **Walk** in the top bar, then **Click to start walking**. Mouse to look, W A S D or arrows to walk, Shift to run, Esc to release the mouse |
| Delete a design | **Delete** next to the design on the home page, then enter the delete password |
| Color | Color picker in the right panel (placeholder boxes only; uploaded models keep their own materials) |
| Lock / duplicate / delete | Buttons in the right panel (Delete key also works) |
| Undo your last action | Ctrl+Z or **Undo** |
| Back to the starting objects | **Reset to design** (for everyone in the design, can be undone) |
| 2D plan / 3D view | Button in the top bar |
| 3D model | Right panel → **Attach .glb model…** (or with nothing selected: **Upload .glb as new object…**). For OBJ, select the `.obj` together with its `.mtl` and texture files |
| Crowd | Panel at the bottom-left: Empty / Low / High, density, "stop at booth" share, heatmap, clearance |
| Snapshots / export | **Snapshots & export** in the top bar |

**Colors:** red means the object overlaps another object or a wall. Yellow means part of it is outside the booth footprint. A colored ring means another person has the object selected. "moving: Name" means someone is dragging it, and it can't be grabbed until they let go.

The crowd simulation runs only in your own browser and isn't shared.

---

## Setup (for developers)

Requirements: [Node.js](https://nodejs.org) 22 or newer (24 recommended) and git.

```powershell
git clone https://github.com/rayozma/exhibition-design-simulator.git
cd exhibition-design-simulator
npm install
npm run dev
```

Open http://127.0.0.1:5173/exhibition-design-simulator/.

Without Supabase settings the app runs in **local-only mode**: editing works, but there are no rooms, sync, uploads or snapshots.

### Supabase (database, live sync, file storage)

1. Create a free project at https://supabase.com (**New project**, pick the region closest to your team).
2. **SQL Editor → New query**: paste all of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
3. **SQL Editor → New query**: paste all of [`supabase/storage.sql`](supabase/storage.sql) and click **Run**.
4. **SQL Editor → New query**: paste all of [`supabase/rooms-and-colors.sql`](supabase/rooms-and-colors.sql) and click **Run**.
5. **SQL Editor → New query**: paste all of [`supabase/delete-room.sql`](supabase/delete-room.sql) and click **Run**. Then set the delete password with the one-line `insert into public.app_secrets …` shown at the top of that file (replace `YOUR-PASSWORD`). The password is never stored in this repository.
6. **SQL Editor → New query**: run [`supabase/designs.sql`](supabase/designs.sql), then [`supabase/shapes.sql`](supabase/shapes.sql), then [`supabase/library.sql`](supabase/library.sql), each the same way.
7. Copy the settings file and fill it in:
   ```powershell
   Copy-Item .env.example .env
   ```
   - `VITE_SUPABASE_URL` is the Project URL, for example `https://abcdefgh.supabase.co` (from **Project Settings → Data API** or the **Connect** button), with nothing after `.co`.
   - `VITE_SUPABASE_ANON_KEY` is the **Publishable** key (`sb_publishable_…`) or the legacy **anon** key (from **Project Settings → API Keys**). Never use the secret / service_role key.
8. Restart `npm run dev`.

`.env` is listed in `.gitignore` and must never be committed.

### Deploy to GitHub Pages

The workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and publishes the site on every push to `main`.

One-time setup on GitHub:
1. **Settings → Secrets and variables → Actions → New repository secret**. Add two secrets with the same names and values as in `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main` (or open **Actions → Deploy to GitHub Pages → Run workflow**).

After 1–2 minutes the site is live at `https://rayozma.github.io/exhibition-design-simulator/`.

If you rename the repository, also change `base` in [`vite.config.ts`](vite.config.ts) to the new name.

---

## Security (no sign-in)

- The Supabase key in the app is public by design: anyone who opens the site can see it in the browser.
- Without sign-in, the database rules can't tell users apart. They only require a well-formed room id.
- **Designs are public.** The home page lists every design, so anyone who can open the site can open, edit, rename or reset any design. There is no "private design".
- Deleting a whole design needs the delete password, which is checked inside the database. That protects against accidental deletion from the app; it doesn't stop someone technical from clearing a design's objects through the public API.
- Uploaded model files are publicly downloadable by URL. The app can't overwrite or delete them.

This is acceptable for booth layout drafts. **Don't put confidential information here.** To restrict access properly, add Supabase Auth (for example anonymous sign-ins) plus a room-members table, and tighten the policies in `supabase/schema.sql`.

---

## Project structure

```
src/
  data/layouts.json      data behind the template
  App.tsx                landing page / name prompt / editor
  Editor.tsx             editing screen: state, panels, dialogs
  components/            top bar, side panel, dialogs, crowd panel (plain CSS in styles.css)
  scene/                 three.js scene (@react-three/fiber): floor, zones, booth, objects, models, crowd
  lib/
    design.ts            the Design type (hall, zones, booth, entrances, …) and templates
    layout.ts            shared geometry types and helpers
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
  rooms-and-colors.sql   rooms table (home page list), per-object color column
  delete-room.sql        password-protected deletion (password set separately, not in the repo)
  designs.sql            design document per room, flexible layout ids, realtime on rooms
  shapes.sql             more shapes, sign text, built-in model kind
  library.sql            lift, combined-object parts, shared item library
```

**Coordinates:** meters and degrees. The origin is the hall's north-west corner, x points east, z points south, y up. Object `x`/`z` is the center of its footprint, and `rotY` rotates the `w` × `d` footprint.

**Data:** a design is stored as JSON on its room row (`rooms.design`); its objects are rows in `objects` with `layout_id = design.layoutId`. Rooms created before designs existed were ADIPEC rooms: on first open they get the ADIPEC design (layout B, where their objects already are). Their old layout-A rows are kept untouched in the table.

**Commands:** `npm run dev` (development server), `npm run build` (type-check + production build into `dist/`), `npm run preview` (serve the build locally).
