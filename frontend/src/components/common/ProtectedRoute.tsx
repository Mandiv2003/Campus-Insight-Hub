import { Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from '../../context/AuthContext'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  requireAdmin?: boolean
  requireAdminOrTechnician?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false, requireAdminOrTechnician = false }: Props) {
  const { user, isHydrated } = useAuth()

  // Auth state is still being read from localStorage / set after OAuth callback —
  // show a blank spinner instead of immediately bouncing to /login.
  if (!isHydrated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (requireAdmin && user.role !== 'ADMIN') return <Navigate to="/" replace />
  if (requireAdminOrTechnician && user.role !== 'ADMIN' && user.role !== 'TECHNICIAN') return <Navigate to="/" replace />

  return <>{children}</>
}
