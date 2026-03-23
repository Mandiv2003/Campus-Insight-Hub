import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
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
  login: (token: string) => void
  logout: () => void
  isAdmin: () => boolean
  isTechnician: () => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt'))
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token)
        if (decoded.exp * 1000 < Date.now()) {
          logout()
        } else {
          setUser({ id: decoded.sub, email: decoded.email, role: decoded.role })
        }
      } catch {
        logout()
      }
    }
  }, [token])

  const login = (newToken: string) => {
    localStorage.setItem('jwt', newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem('jwt')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user, token, login, logout,
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
