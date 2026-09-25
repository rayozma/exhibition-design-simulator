import { useState, type ReactNode } from 'react'

type Tab = 'selected' | 'objects'

/** Right-hand panel with two tabs: the selection's properties, and the list of all objects. */
export function Sidebar({
  selectedCount,
  objectCount,
  selected,
  list,
}: {
  selectedCount: number
  objectCount: number
  selected: ReactNode
  list: ReactNode
}) {
  const [tab, setTab] = useState<Tab>('selected')
  return (
    <aside className="panel">
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'selected'} className={tab === 'selected' ? 'active' : ''} onClick={() => setTab('selected')}>
          Selected{selectedCount ? ` (${selectedCount})` : ''}
        </button>
        <button role="tab" aria-selected={tab === 'objects'} className={tab === 'objects' ? 'active' : ''} onClick={() => setTab('objects')}>
          Objects ({objectCount})
        </button>
      </div>
      {tab === 'selected' ? selected : list}
    </aside>
  )
}
