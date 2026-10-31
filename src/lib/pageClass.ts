import { useEffect } from 'react'

/**
 * Marks the page with classes on <html> while a component is shown (e.g. page-briefing), for page-wide
 * styles. Used instead of CSS :has(), which older iPads (Safari before 15.4) don't support.
 */
export function usePageClass(...names: string[]) {
  const key = names.join(' ')
  useEffect(() => {
    const list = key.split(' ')
    document.documentElement.classList.add(...list)
    return () => document.documentElement.classList.remove(...list)
  }, [key])
}
