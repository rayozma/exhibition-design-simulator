import { useState } from 'react'
import { BriefingPage } from './components/BriefingPage'
import { DialogHost } from './components/DialogHost'
import { GuidePage } from './components/GuidePage'
import { Landing } from './components/Landing'
import { PinGate } from './components/PinGate'
import { UserDialog } from './components/UserDialog'
import { Editor } from './Editor'
import { isUnlocked, rememberUnlock } from './lib/access'
import { supabase } from './lib/supabase'
import { loadUser, roomFromUrl, saveUser, type User } from './lib/user'

const room = roomFromUrl()
const params = new URLSearchParams(location.search)
const guide = params.has('guide')
const briefing = params.has('briefing')

/**
 * Everything is behind the team PIN (remembered per device).
 * Without Supabase config: local-only editor.
 * With it: landing page (no ?room=), then name/color prompt on first visit, then the shared editor.
 */
export function App() {
  const [unlocked, setUnlocked] = useState(isUnlocked)
  const [user, setUser] = useState<User | null>(loadUser)
  const [editingUser, setEditingUser] = useState(false)

  if (!unlocked)
    return (
      <PinGate
        onUnlock={() => {
          rememberUnlock()
          setUnlocked(true)
        }}
      />
    )
  if (guide) return <GuidePage />
  if (briefing)
    return (
      <>
        <BriefingPage />
        <DialogHost />
      </>
    )
  if (supabase && !room)
    return (
      <>
        <Landing />
        <DialogHost />
      </>
    )

  const askUser = !!supabase && (!user || editingUser)
  return (
    <>
      <Editor room={supabase ? room : null} me={user} onEditUser={() => setEditingUser(true)} />
      {askUser && (
        <UserDialog
          initial={user}
          onSave={(u) => {
            saveUser(u)
            setUser(u)
            setEditingUser(false)
          }}
          onCancel={user ? () => setEditingUser(false) : undefined}
        />
      )}
      <DialogHost />
    </>
  )
}
