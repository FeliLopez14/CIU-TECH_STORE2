import {
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import type { ThemeMode } from '../types/social'
import { ThemeContext, type ThemeContextValue } from './theme-context'

const STORAGE_KEY = 'unahur-anti-social-net:theme'

function getStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'dark' ? 'dark' : 'light'
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme())

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme() {
        setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))
      },
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// The useTheme function will be moved to a separate file.