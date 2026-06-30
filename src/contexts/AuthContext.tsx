import {
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { createUser, fetchUsers } from '../services/api'
import { AuthContext, type AuthContextValue } from './auth-context'

const STORAGE_KEY = 'unahur-anti-social-net:user'
const FIXED_PASSWORD = '123456'

function getStoredUser() {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthContextValue['currentUser']
  } catch {
    return null
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [currentUser, setCurrentUser] = useState<AuthContextValue['currentUser']>(() => getStoredUser())

  useEffect(() => {
    if (!currentUser) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser))
  }, [currentUser])

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      async login(nickname: string, password: string) {
        const trimmedNickname = nickname.trim()

        if (!trimmedNickname) {
          throw new Error('Ingresá tu nickName para continuar.')
        }

        if (password !== FIXED_PASSWORD) {
          throw new Error('La contraseña simulada debe ser 123456.')
        }

        const users = await fetchUsers()
        const matchedUser = users.find(
          (user) => user.nickname.toLowerCase() === trimmedNickname.toLowerCase(),
        )

        if (!matchedUser) {
          throw new Error('No encontramos un usuario con ese nickName.')
        }

        setCurrentUser(matchedUser)
      },
      async register(nickname: string) {
        const trimmedNickname = nickname.trim()

        if (!trimmedNickname) {
          throw new Error('El nickName es obligatorio.')
        }

        const createdUser = await createUser(trimmedNickname)
        const nextUser = {
          id: createdUser.id || trimmedNickname,
          nickname: createdUser.nickname || trimmedNickname,
        }

        setCurrentUser(nextUser)
      },
      logout() {
        setCurrentUser(null)
      },
    }),
    [currentUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// The useAuth function will be moved to a separate file.