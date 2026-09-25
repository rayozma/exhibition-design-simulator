import { useState } from 'react'
import { walkableArea } from '../lib/design'
import { useDesign } from '../lib/DesignContext'
import type { CrowdSettings, CrowdStats } from '../sim/crowd'
import { MIN_CLEARANCE } from '../sim/navGrid'

type Props = {
  settings: CrowdSettings
  onChange: (patch: Partial<CrowdSettings>) => void
  stats: CrowdStats
}

/** Floating panel over the 3D view: crowd mode, density, play/pause, stats and overlays. */
export function CrowdPanel({ settings, onChange, stats }: Props) {
  const [open, setOpen] = useState(true)
  const design = useDesign()
  const area = walkableArea(design)
  const p = design.crowdPresets
  const MODES = [
    ['Empty', p.empty],
    ['Low', p.low],
    ['High', p.high],
  ] as const
  const s = settings

  return (
    <div className="crowd-panel">
      <div className="crowd-row">
        <button className="link" onClick={() => setOpen(!open)} title={open ? 'Collapse' : 'Expand'}>
          <strong>Crowd</strong> {open ? '▾' : '▸'}
        </button>
        <div className="group">
          {MODES.map(([label, d]) => (
            <button key={label} className={s.density === d ? 'active' : ''} onClick={() => onChange({ density: d })}>
              {label}
            </button>
          ))}
        </div>
        {s.density > 0 && (
          <>
            <button onClick={() => onChange({ playing: !s.playing })}>{s.playing ? 'Pause' : 'Play'}</button>
            <button onClick={() => onChange({ restartToken: s.restartToken + 1 })} title="Start over and reset the peak">
              Restart
            </button>
          </>
        )}
      </div>

      {open && (
        <>
          <label className="slider">
            <span>Density</span>
            <input
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={s.density}
              onChange={(e) => onChange({ density: Number(e.target.value) })}
            />
            <span>
              {s.density.toFixed(2)} p/m² · ~{Math.round(s.density * area)} people
            </span>
          </label>
          <label className="slider" title="Share of arriving people who visit booth displays; the rest walk past">
            <span>Stop at booth</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={s.visitorShare}
              onChange={(e) => onChange({ visitorShare: Number(e.target.value) })}
            />
            <span>{Math.round(s.visitorShare * 100)}%</span>
          </label>

          {s.density > 0 && (
            <p className="crowd-stats">
              In NDT booth: <b>{stats.inside}</b> · Peak: <b>{stats.peak}</b> · Total: {stats.total}
              <span className="muted"> ({area} m² walkable)</span>
            </p>
          )}

          <div className="crowd-row">
            <label className="toggle">
              <input type="checkbox" checked={s.showHeat} onChange={(e) => onChange({ showHeat: e.target.checked })} />
              Density heatmap
            </label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={s.showClearance}
                onChange={(e) => onChange({ showClearance: e.target.checked })}
              />
              Clearance &lt; {MIN_CLEARANCE} m
            </label>
          </div>
          {s.showClearance && (
            <p className="muted small">
              Red: {stats.narrowArea.toFixed(1)} m² of walkable floor in passages narrower than {MIN_CLEARANCE} m.
            </p>
          )}
        </>
      )}
    </div>
  )
}
