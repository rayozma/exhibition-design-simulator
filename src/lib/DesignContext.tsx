import { createContext, useContext } from 'react'
import type { Design } from './design'

/** The design that is open in the editor (hall, zones, booth, entrances, …). */
export const DesignContext = createContext<Design | null>(null)

export function useDesign(): Design {
  const d = useContext(DesignContext)
  if (!d) throw new Error('useDesign() used outside a DesignContext provider')
  return d
}
