'use client'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'

export type User = {
  sub: string
  name: string
  given_name?: string
  family_name?: string
  email?: string
  picture?: string
}

type AuthContextShape = {
  user: User | null
  isLoading: boolean
  setUser: (u: User | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextShape>({
  user: null,
  isLoading: true,
  setUser: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('socialUser')
    if (saved) setUser(JSON.parse(saved))
    setLoading(false)
  }, [])

  useEffect(() => {
    if (user) localStorage.setItem('socialUser', JSON.stringify(user))
    else localStorage.removeItem('socialUser')
  }, [user])

  const logout = () => {
    setUser(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
