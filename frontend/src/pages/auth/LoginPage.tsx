import { Box, Button, Typography, Paper } from '@mui/material'

export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorize/google'
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"
         sx={{ bgcolor: 'grey.100' }}>
      <Paper elevation={3} sx={{ p: 6, textAlign: 'center', maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" fontWeight={700} mb={1}>
          Smart Campus Operations Hub
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={4}>
          Sign in to manage facilities, bookings, and incidents
        </Typography>
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleGoogleLogin}
          sx={{ textTransform: 'none' }}
        >
          Sign in with Google
        </Button>
      </Paper>
    </Box>
  )
}
