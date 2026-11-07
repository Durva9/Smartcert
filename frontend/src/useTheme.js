import { useEffect, useState } from 'react'

export function useTheme() {
  const [isDark, setIsDark] = useState(true) // default to dark mode

  useEffect(() => {
    const stored = localStorage.getItem('smartcert-theme')
    if (stored) setIsDark(stored === 'dark')
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('smartcert-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return [isDark, setIsDark]
}