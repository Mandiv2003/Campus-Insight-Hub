import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  requireAdmin?: boolean
  requireAdminOrTechnician?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false, requireAdminOrTechnician = false }: Props) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (requireAdmin && user.role !== 'ADMIN') return <Navigate to="/" replace />
  if (requireAdminOrTechnician && user.role !== 'ADMIN' && user.role !== 'TECHNICIAN') return <Navigate to="/" replace />

  return <>{children}</>
}
