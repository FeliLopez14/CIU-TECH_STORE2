import { createContext } from 'react'
import type { User } from '../types/social'

export interface AuthContextValue {
  currentUser: User | null
  fullUser: User | null
  isAuthenticated: boolean
  login: (nickname: string, password: string) => Promise<void>
  register: (nickname: string) => Promise<void>
  logout: () => void
  refreshFullUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)