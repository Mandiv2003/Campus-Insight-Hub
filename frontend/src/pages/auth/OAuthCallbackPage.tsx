import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useAuth } from '../../context/AuthContext'

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      login(token)
      navigate('/', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [])

  return (
    <Box display="flex" flexDirection="column" alignItems="center"
         justifyContent="center" minHeight="100vh" gap={2}>
      <CircularProgress />
      <Typography>Signing you in…</Typography>
    </Box>
  )
}
