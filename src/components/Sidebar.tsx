import { useState, type ReactNode } from 'react'

type Tab = 'add' | 'selected' | 'objects'

/** Right-hand panel with three tabs: add things, the selection's properties, and the list of all objects. */
export function Sidebar({
  selectedCount,
  objectCount,
  add,
  selected,
  list,
}: {
  selectedCount: number
  objectCount: number
  add: ReactNode
  selected: ReactNode
  list: ReactNode
}) {
  const [tab, setTab] = useState<Tab>('selected')

  const tabButton = (t: Tab, label: string) => (
    <button role="tab" aria-selected={tab === t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
      {label}
    </button>
  )
  return (
    <aside className="panel">
      <div className="tabs" role="tablist">
        {tabButton('add', '+ Add')}
        {tabButton('selected', `Selected${selectedCount ? ` (${selectedCount})` : ''}`)}
        {tabButton('objects', `Objects (${objectCount})`)}
      </div>
      {tab === 'add' ? add : tab === 'selected' ? selected : list}
    </aside>
  )
}
