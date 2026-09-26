import { APP_TITLE } from '../lib/design'

const home = () => location.pathname

/** Short user guide for the team, at ?guide. */
export function GuidePage() {
  return (
    <div className="guide">
      <header>
        <a href={home()}>← Back to designs</a>
        <h1>{APP_TITLE} — quick guide</h1>
        <p className="muted">Plan an exhibition booth in 3D, together, in the browser. No account needed.</p>
      </header>

      <nav className="guide-toc">
        <a href="#start">Start</a>
        <a href="#view">Look around</a>
        <a href="#objects">Objects</a>
        <a href="#add">Add things</a>
        <a href="#info">Info cards</a>
        <a href="#layout">Layout</a>
        <a href="#measure">Measure</a>
        <a href="#crowd">Crowd</a>
        <a href="#together">Together</a>
        <a href="#keys">Shortcuts</a>
      </nav>

      <section id="start">
        <h2>1. Start</h2>
        <ol>
          <li>
            Open a design from the list on the home page, or create one under <b>New design</b>: type a name, pick a
            template (<b>Blank hall</b>, or the <b>ADIPEC 2026 – NDTCCS booth</b>) and click <b>Create design</b>.
          </li>
          <li>The first time, enter your name, a color and your avatar. Others see these.</li>
          <li>
            Everything saves automatically. Everyone who opens the same design edits it together, live. Share it with{' '}
            <b>Copy link</b> in the top bar.
          </li>
        </ol>
      </section>

      <section id="view">
        <h2>2. Look around</h2>
        <ul>
          <li>
            <b>3D</b>: drag to orbit, right-drag to pan, scroll to zoom. <b>2D plan</b>: the view from above.
          </li>
          <li>
            <b>Walk</b>: click <i>Click to start walking</i>, then look with the mouse, move with <kbd>W</kbd> <kbd>A</kbd>{' '}
            <kbd>S</kbd> <kbd>D</kbd>, run with <kbd>Shift</kbd>. <kbd>Esc</kbd> frees the mouse. Others see you as your avatar.
          </li>
          <li>
            <b>Pavilion</b> (ADIPEC design) shows the surrounding Al Masaood structure; <b>Zone volumes</b> shows other
            booths as blocks; <b>Walls</b> hides your booth walls.
          </li>
        </ul>
      </section>

      <section id="objects">
        <h2>3. Work with objects</h2>
        <ul>
          <li>
            <b>Click</b> to select, <b>drag</b> to move. <kbd>Ctrl</kbd>/<kbd>Shift</kbd>+click selects several; they move
            and rotate together.
          </li>
          <li>
            <kbd>R</kbd> / <kbd>Shift</kbd>+<kbd>R</kbd> rotates by 15°. <b>Snap</b> (top bar) moves in 25 cm steps.
          </li>
          <li>
            The <b>Selected</b> tab on the right: number, name, exact size and position, <b>Lift</b> (height above the
            floor, to stack things), info card, color, lock, duplicate, delete.
          </li>
          <li>
            Colors warn you: <span className="tag red">red</span> = overlaps another object or a wall,{' '}
            <span className="tag yellow">yellow</span> = partly outside your booth.
          </li>
          <li>
            <kbd>Ctrl</kbd>+<kbd>Z</kbd> undoes your own last change. <b>Reset to design</b> puts every object back to
            the design&apos;s starting layout (can be undone too).
          </li>
          <li>
            The <b>Objects</b> tab lists everything with sizes and status.
          </li>
        </ul>
      </section>

      <section id="add">
        <h2>4. Add things</h2>
        <ul>
          <li>
            <b>+ Add</b> tab: <b>basic shapes</b> (box, cylinder, sphere, cone, ramp, panel, sign) and{' '}
            <b>ready-made items</b> (plinths, desks, counter, TV, LED wall, chairs, tables, banner, plant…). Click one: it
            appears in a free spot in your booth, ready to drag.
          </li>
          <li>
            <b>Build your own</b>: add a few shapes, arrange them (use <b>Lift</b> to put a screen on a counter), select them
            all and click <b>Combine into one object</b>. <b>Break apart</b> undoes it.
          </li>
          <li>
            <b>Save to library…</b> on any object makes it available in <b>every design</b>, under{' '}
            <i>+ Add → Your library</i>.
          </li>
          <li>
            Real 3D files: <b>Upload .glb / .obj</b> (max 25 MB). For .obj, select the .obj, .mtl and texture images
            together.
          </li>
        </ul>
      </section>

      <section id="info">
        <h2>5. Info cards (ⓘ)</h2>
        <ul>
          <li>
            Objects with an info card show a blue <b>ⓘ</b> above them. Click it (2D or 3D) to open the window: pictures,
            what it is, <i>why it&apos;s useful for you</i>, and a <i>Learn more</i> link.
          </li>
          <li>
            In <b>Walk</b> view, look at the object (the dot in the middle turns blue) and press <kbd>E</kbd> or click.
          </li>
          <li>
            To write one: select the object, <b>Selected</b> tab → <b>Add info card…</b>. Fill in the title, description and
            why it&apos;s useful, add a link, and <b>Upload images</b> (big photos are shrunk automatically) or{' '}
            <b>Add image link</b>. <b>Preview ⓘ</b> shows what visitors see.
          </li>
        </ul>
      </section>

      <section id="layout">
        <h2>6. Change the layout</h2>
        <ul>
          <li>
            Click <b>Edit layout</b>. Pick a tool and <b>drag on the plan</b> to draw: <b>Zone</b> (another exhibitor),{' '}
            <b>Walkway</b>, <b>Booth area</b> (your platform), <b>Wall</b>, <b>Entrance</b>.
          </li>
          <li>
            With <b>Select</b>: drag an element to move it, drag the yellow handles to resize. Exact values, hall size and
            wall height are in the panel. <kbd>Delete</kbd> removes, <kbd>Ctrl</kbd>+<kbd>Z</kbd> undoes.
          </li>
          <li>
            Click <b>Done editing layout</b> to go back to objects.
          </li>
        </ul>
      </section>

      <section id="measure">
        <h2>7. Check sizes and space</h2>
        <ul>
          <li>
            <b>Dimensions</b>: rulers along the hall. Select an object to see its size and the free space to the nearest
            wall or object (yellow).
          </li>
          <li>
            <b>📏 Measure</b>: click two points. It snaps to corners, so edge-to-edge is easy. <kbd>Esc</kbd> stops;
            measurements stay until you clear them.
          </li>
        </ul>
      </section>

      <section id="crowd">
        <h2>8. Simulate visitors</h2>
        <ul>
          <li>
            <b>Crowd</b> panel (bottom left): <b>Low</b> / <b>High</b> or the density slider, and how many people stop at
            the booth. You see how many are in your booth now and at most.
          </li>
          <li>
            Visitors stop at objects marked <b>Visitors stop here</b>. <b>Density heatmap</b> shows busy spots;{' '}
            <b>Clearance &lt; 1.2 m</b> shows passages that are too narrow.
          </li>
          <li>The crowd is only on your screen; others don&apos;t see it.</li>
        </ul>
      </section>

      <section id="together">
        <h2>9. Work together and keep versions</h2>
        <ul>
          <li>
            Top right: who is online. A colored ring shows what someone has selected; &quot;moving: name&quot; means they
            are dragging it (you can&apos;t grab it meanwhile).
          </li>
          <li>
            <b>Snapshots &amp; export</b>: save a named version and restore it later, download the layout as JSON, or a
            PNG picture of the current view.
          </li>
          <li>
            Designs are visible to everyone who has the site link. Don&apos;t put confidential information in them.
          </li>
        </ul>
      </section>

      <section id="keys">
        <h2>Shortcuts</h2>
        <table>
          <tbody>
            {[
              ['Click / drag', 'Select / move'],
              ['Ctrl or Shift + click', 'Select several'],
              ['Ctrl + A', 'Select all'],
              ['R / Shift + R', 'Rotate ±15°'],
              ['Delete', 'Delete selected'],
              ['Ctrl + Z', 'Undo your last change'],
              ['Esc', 'Deselect, stop measuring, cancel a layout tool'],
              ['W A S D, Shift', 'Walk, run (Walk view)'],
              ['E', 'Open the info of the object you look at (Walk view)'],
            ].map(([k, v]) => (
              <tr key={k}>
                <td>
                  <kbd>{k}</kbd>
                </td>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="muted small">
        Something not working? A red bar at the top explains most problems; if it says the server can&apos;t be reached,
        check your connection or ad blocker. Reload the page with <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> after
        updates.
      </footer>
    </div>
  )
}
