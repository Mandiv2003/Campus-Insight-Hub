import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  sub: string
  email: string
  role: 'USER' | 'ADMIN' | 'TECHNICIAN'
  exp: number
}

interface AuthUser {
  id: string
  email: string
  role: 'USER' | 'ADMIN' | 'TECHNICIAN'
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isHydrated: boolean
  login: (token: string) => void
  logout: () => void
  isAdmin: () => boolean
  isTechnician: () => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

function decodeUser(token: string): AuthUser | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    if (decoded.exp * 1000 < Date.now()) return null
    return { id: decoded.sub, email: decoded.email, role: decoded.role }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialise synchronously from localStorage so there is no null flash on refresh
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jwt'))
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('jwt')
    return stored ? decodeUser(stored) : null
  })
  // true once the initial localStorage check is done — ProtectedRoute waits for this
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Re-validate the stored token on mount (handles expiry on page load)
    const stored = localStorage.getItem('jwt')
    if (stored) {
      const decoded = decodeUser(stored)
      if (!decoded) {
        // Token expired — clear it
        localStorage.removeItem('jwt')
        setToken(null)
        setUser(null)
      } else {
        setUser(decoded)
        setToken(stored)
      }
    }
    setIsHydrated(true)
  }, [])

  const login = (newToken: string) => {
    localStorage.setItem('jwt', newToken)
    const decoded = decodeUser(newToken)
    // Set both together in the same render batch so ProtectedRoute
    // never sees user=null after a successful login
    setUser(decoded)
    setToken(newToken)
    setIsHydrated(true)
  }

  const logout = () => {
    localStorage.removeItem('jwt')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user, token, isHydrated, login, logout,
      isAdmin: () => user?.role === 'ADMIN',
      isTechnician: () => user?.role === 'TECHNICIAN',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
