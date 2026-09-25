import { useState } from 'react'
import { DialogHost } from './components/DialogHost'
import { Landing } from './components/Landing'
import { UserDialog } from './components/UserDialog'
import { Editor } from './Editor'
import { supabase } from './lib/supabase'
import { loadUser, roomFromUrl, saveUser, type User } from './lib/user'

const room = roomFromUrl()

/**
 * Without Supabase config: local-only editor.
 * With it: landing page (no ?room=), then name/color prompt on first visit, then the shared editor.
 */
export function App() {
  const [user, setUser] = useState<User | null>(loadUser)
  const [editingUser, setEditingUser] = useState(false)

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
