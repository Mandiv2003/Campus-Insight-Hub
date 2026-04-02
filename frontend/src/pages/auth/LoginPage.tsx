import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  School,
  CalendarMonth,
  ConfirmationNumber,
  Notifications,
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import { loginLocal, registerLocal } from '../../api/authApi'

// ── types ────────────────────────────────────────────────────────────────────

interface LoginFormData {
  identifier: string
  password: string
}

interface RegisterFormData {
  fullName: string
  email: string
  username: string
  password: string
  confirmPassword: string
}

// ── Google icon SVG ──────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 6.294C4.672 4.169 6.656 3.58 9 3.58z"
      />
    </svg>
  )
}

// ── feature list shown on the hero panel ────────────────────────────────────

const FEATURES = [
  { icon: <School sx={{ fontSize: 20 }} />, text: 'Browse & book campus facilities' },
  { icon: <CalendarMonth sx={{ fontSize: 20 }} />, text: 'Manage room and equipment bookings' },
  { icon: <ConfirmationNumber sx={{ fontSize: 20 }} />, text: 'Report and track incident tickets' },
  { icon: <Notifications sx={{ fontSize: 20 }} />, text: 'Real-time operational notifications' },
]

// ── component ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const { login } = useAuth()

  const [searchParams] = useSearchParams()

  const [tab, setTab] = useState<0 | 1>(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Show error if Google OAuth2 failed and backend redirected back here
  useEffect(() => {
    const oauthError = searchParams.get('oauth_error')
    if (oauthError) {
      setErrorMsg(`Google sign-in failed: ${decodeURIComponent(oauthError)}`)
    }
  }, [])

  // sign-in form
  const {
    register: regLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({ mode: 'onBlur' })

  // sign-up form
  const {
    register: regSignup,
    handleSubmit: handleSignupSubmit,
    watch: watchSignup,
    formState: { errors: signupErrors },
  } = useForm<RegisterFormData>({ mode: 'onBlur' })

  const signupPassword = watchSignup('password')

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google'
  }

  const onLogin = handleLoginSubmit(async (data) => {
    setErrorMsg(null)
    setLoading(true)
    try {
      const res = await loginLocal({ identifier: data.identifier, password: data.password })
      login(res.data.data.token)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Sign in failed. Please check your credentials.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  })

  const onRegister = handleSignupSubmit(async (data) => {
    setErrorMsg(null)
    setLoading(true)
    try {
      const res = await registerLocal({
        fullName: data.fullName,
        email: data.email,
        username: data.username || undefined,
        password: data.password,
      })
      login(res.data.data.token)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please try again.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  })

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'grey.50' }}>

      {/* ── Left hero panel (desktop only) ──────────────────────────────── */}
      {!isMobile && (
        <Box
          sx={{
            flex: 1,
            background: 'linear-gradient(145deg, #1565c0 0%, #0d47a1 40%, #1a237e 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            px: 8,
            py: 6,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* decorative circles */}
          <Box sx={{
            position: 'absolute', top: -80, right: -80,
            width: 320, height: 320, borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.06)',
          }} />
          <Box sx={{
            position: 'absolute', bottom: -120, left: -60,
            width: 400, height: 400, borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.04)',
          }} />

          {/* logo + product name */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 5 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <School sx={{ color: 'white', fontSize: 26 }} />
            </Box>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, letterSpacing: 0.3 }}>
              Campus Hub
            </Typography>
          </Box>

          {/* headline */}
          <Typography variant="h3" sx={{
            color: 'white', fontWeight: 800, lineHeight: 1.2, mb: 2, maxWidth: 420,
          }}>
            Manage your campus,{' '}
            <Box component="span" sx={{ color: '#90caf9' }}>smarter.</Box>
          </Typography>

          <Typography variant="body1" sx={{
            color: 'rgba(255,255,255,0.75)', mb: 5, maxWidth: 380, lineHeight: 1.7,
          }}>
            One platform for facilities, bookings, incident reporting, and real-time
            operational visibility across your institution.
          </Typography>

          {/* feature list */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {FEATURES.map((f) => (
              <Box key={f.text} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: 1.5,
                  bgcolor: 'rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#90caf9', flexShrink: 0,
                }}>
                  {f.icon}
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                  {f.text}
                </Typography>
              </Box>
            ))}
          </Box>

          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', mt: 'auto', pt: 6 }}>
            IT3030 PAF 2026 · SLIIT
          </Typography>
        </Box>
      )}

      {/* ── Right form panel ─────────────────────────────────────────────── */}
      <Box sx={{
        width: { xs: '100%', md: 480 },
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 4 },
        py: 4,
      }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>

          {/* mobile-only header */}
          {isMobile && (
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 56, height: 56, borderRadius: 3, bgcolor: 'primary.main', mb: 2,
              }}>
                <School sx={{ color: 'white', fontSize: 30 }} />
              </Box>
              <Typography variant="h5" fontWeight={800} gutterBottom>
                Smart Campus Hub
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage facilities, bookings &amp; incidents
              </Typography>
            </Box>
          )}

          <Paper elevation={0} sx={{
            p: { xs: 3, sm: 4 },
            border: '1px solid', borderColor: 'divider',
            borderRadius: 3, bgcolor: 'white',
          }}>
            {/* tab selector */}
            <Tabs
              value={tab}
              onChange={(_, v) => { setTab(v); setErrorMsg(null) }}
              variant="fullWidth"
              sx={{
                mb: 3,
                borderBottom: 1, borderColor: 'divider',
                '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '0.95rem' },
              }}
            >
              <Tab label="Sign In" />
              <Tab label="Sign Up" />
            </Tabs>

            {/* server / network error */}
            {errorMsg && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErrorMsg(null)}>
                {errorMsg}
              </Alert>
            )}

            {/* ── Sign In ──────────────────────────────────────────────── */}
            {tab === 0 && (
              <Box component="form" onSubmit={onLogin} noValidate>
                <TextField
                  label="Email or username"
                  fullWidth
                  autoComplete="username"
                  autoFocus
                  margin="normal"
                  inputProps={{ 'aria-label': 'Email or username' }}
                  error={!!loginErrors.identifier}
                  helperText={loginErrors.identifier?.message}
                  {...regLogin('identifier', { required: 'Email or username is required' })}
                />
                <TextField
                  label="Password"
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  margin="normal"
                  inputProps={{ 'aria-label': 'Password' }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((p) => !p)}
                          edge="end"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  error={!!loginErrors.password}
                  helperText={loginErrors.password?.message}
                  {...regLogin('password', { required: 'Password is required' })}
                />

                <Box sx={{ textAlign: 'right', mt: 0.5, mb: 1 }}>
                  <Link
                    component="button"
                    type="button"
                    variant="caption"
                    underline="hover"
                    color="primary"
                    tabIndex={-1}
                    onClick={() => {/* TODO: forgot password */}}
                  >
                    Forgot password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 1, mb: 2, py: 1.4, fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
                >
                  {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
                </Button>

                <Divider sx={{ my: 2 }}>
                  <Typography variant="caption" color="text.secondary">or</Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={handleGoogleLogin}
                  startIcon={<GoogleIcon />}
                  sx={{
                    py: 1.3, fontWeight: 600, textTransform: 'none', borderRadius: 2,
                    borderColor: 'divider', color: 'text.primary',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' },
                  }}
                >
                  Continue with Google
                </Button>

                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
                  Don&apos;t have an account?{' '}
                  <Link
                    component="button"
                    type="button"
                    underline="hover"
                    fontWeight={600}
                    onClick={() => { setTab(1); setErrorMsg(null) }}
                  >
                    Sign up
                  </Link>
                </Typography>
              </Box>
            )}

            {/* ── Sign Up ──────────────────────────────────────────────── */}
            {tab === 1 && (
              <Box component="form" onSubmit={onRegister} noValidate>
                <TextField
                  label="Full name"
                  fullWidth
                  autoComplete="name"
                  autoFocus
                  margin="normal"
                  inputProps={{ 'aria-label': 'Full name' }}
                  error={!!signupErrors.fullName}
                  helperText={signupErrors.fullName?.message}
                  {...regSignup('fullName', {
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  })}
                />
                <TextField
                  label="Email address"
                  fullWidth
                  type="email"
                  autoComplete="email"
                  margin="normal"
                  inputProps={{ 'aria-label': 'Email address' }}
                  error={!!signupErrors.email}
                  helperText={signupErrors.email?.message}
                  {...regSignup('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' },
                  })}
                />
                <TextField
                  label="Username (optional)"
                  fullWidth
                  autoComplete="username"
                  margin="normal"
                  inputProps={{ 'aria-label': 'Username (optional)' }}
                  error={!!signupErrors.username}
                  helperText={signupErrors.username?.message ?? 'You can sign in with this later'}
                  {...regSignup('username', {
                    pattern: {
                      value: /^[a-zA-Z0-9_]{3,30}$/,
                      message: '3–30 chars, letters/numbers/underscores only',
                    },
                  })}
                />
                <TextField
                  label="Password"
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  margin="normal"
                  inputProps={{ 'aria-label': 'Password' }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((p) => !p)}
                          edge="end"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  error={!!signupErrors.password}
                  helperText={signupErrors.password?.message ?? 'At least 8 characters'}
                  {...regSignup('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  })}
                />
                <TextField
                  label="Confirm password"
                  fullWidth
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  margin="normal"
                  inputProps={{ 'aria-label': 'Confirm password' }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword((p) => !p)}
                          edge="end"
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  error={!!signupErrors.confirmPassword}
                  helperText={signupErrors.confirmPassword?.message}
                  {...regSignup('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (v) => v === signupPassword || 'Passwords do not match',
                  })}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 2, mb: 2, py: 1.4, fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
                >
                  {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
                </Button>

                <Divider sx={{ my: 2 }}>
                  <Typography variant="caption" color="text.secondary">or</Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={handleGoogleLogin}
                  startIcon={<GoogleIcon />}
                  sx={{
                    py: 1.3, fontWeight: 600, textTransform: 'none', borderRadius: 2,
                    borderColor: 'divider', color: 'text.primary',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' },
                  }}
                >
                  Continue with Google
                </Button>

                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
                  Already have an account?{' '}
                  <Link
                    component="button"
                    type="button"
                    underline="hover"
                    fontWeight={600}
                    onClick={() => { setTab(0); setErrorMsg(null) }}
                  >
                    Sign in
                  </Link>
                </Typography>
              </Box>
            )}
          </Paper>

          <Typography variant="caption" color="text.disabled" align="center" display="block" sx={{ mt: 3 }}>
            By continuing you agree to the institution&apos;s terms of use.
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
