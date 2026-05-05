import { useEffect } from 'react'
import { useWorkspaceStore } from '../../store/workspaceStore'

function getPreferredIsDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export function ThemeSync() {
  const theme = useWorkspaceStore((s) => s.settings.theme)

  useEffect(() => {
    const root = document.documentElement
    const apply = () => {
      const isDark = theme === 'dark' || (theme === 'system' && getPreferredIsDark())
      root.classList.toggle('dark', isDark)
    }
    apply()
    if (theme !== 'system') return
    const mql = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mql) return
    const onChange = () => apply()
    mql.addEventListener?.('change', onChange)
    return () => mql.removeEventListener?.('change', onChange)
  }, [theme])

  return null
}

