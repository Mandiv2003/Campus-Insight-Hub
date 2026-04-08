import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { Box, Typography, Button } from '@mui/material'
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined'

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (error) {
      return (
        <Box sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          p: 4,
          background: '#f8fafc',
        }}>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: 48, color: '#dc2626' }} />
          <Typography variant="h6" fontWeight={700} sx={{ color: '#111827' }}>
            Something went wrong
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', textAlign: 'center', maxWidth: 480 }}>
            {error.message}
          </Typography>
          <Button variant="contained" onClick={() => { this.setState({ error: null }); window.location.href = '/' }}>
            Reload app
          </Button>
        </Box>
      )
    }
    return this.props.children
  }
}
