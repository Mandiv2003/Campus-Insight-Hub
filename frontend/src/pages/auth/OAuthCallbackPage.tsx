import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useAuth } from '../../context/AuthContext'

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, user } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      login(token)
      // login() sets user synchronously in the same render batch.
      // We navigate after a microtask delay to guarantee React has
      // committed the updated auth state before ProtectedRoute evaluates.
      Promise.resolve().then(() => navigate('/', { replace: true }))
    } else {
      navigate('/login', { replace: true })
    }
  }, [])

  // If login() already ran (e.g. HMR re-mount) and user is set, redirect now
  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user])

  return (
    <Box display="flex" flexDirection="column" alignItems="center"
         justifyContent="center" minHeight="100vh" gap={2}>
      <CircularProgress />
      <Typography>Signing you in…</Typography>
    </Box>
  )
}
