import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { TopBar } from './components/TopBar'
import { Scene, type ViewMode } from './scene/Scene'
import type { LayoutId } from './lib/layout'

export function App() {
  const [layoutId, setLayoutId] = useState<LayoutId>('B')
  const [view, setView] = useState<ViewMode>('perspective')
  const [showVolumes, setShowVolumes] = useState(false)
  const [showWalls, setShowWalls] = useState(true)

  return (
    <div className="app">
      <TopBar
        layoutId={layoutId}
        onLayout={setLayoutId}
        view={view}
        onView={setView}
        showVolumes={showVolumes}
        onVolumes={setShowVolumes}
        showWalls={showWalls}
        onWalls={setShowWalls}
      />
      <main className="viewport">
        <Canvas dpr={[1, 2]}>
          <Scene layoutId={layoutId} view={view} showVolumes={showVolumes} showWalls={showWalls} />
        </Canvas>
      </main>
    </div>
  )
}
