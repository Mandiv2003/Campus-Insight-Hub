import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Box, Typography, TextField, Button, Alert,
  InputAdornment, IconButton,
} from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import EventSeatOutlinedIcon from '@mui/icons-material/EventSeatOutlined'
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined'
import { loginLocal, registerLocal } from '../../api/authApi'
import { useAuth } from '../../context/AuthContext'
import { IMG } from '../../assets/images'

interface LoginForm { identifier: string; password: string }
interface RegisterForm { fullName: string; email: string; username?: string; password: string; confirmPassword: string }

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080'

// ── Shared input style ───────────────────────────────────────────────────────
const inputSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#171f33',
    borderRadius: '8px',
    color: '#dae2fd',
    '& fieldset': { borderColor: 'rgba(68,70,83,0.4)' },
    '&:hover fieldset': { borderColor: 'rgba(184,196,255,0.4)' },
    '&.Mui-focused fieldset': { borderColor: '#b8c4ff', borderWidth: 2 },
    '& input': { color: '#dae2fd' },
    '& input::placeholder': { color: '#8e909f', opacity: 1 },
  },
  '& .MuiInputLabel-root': { color: '#8e909f', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#b8c4ff' },
  '& .MuiFormHelperText-root': { color: '#ffb4ab' },
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [tab, setTab] = useState(0)
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const loginForm = useForm<LoginForm>({ mode: 'onBlur' })
  const registerForm = useForm<RegisterForm>({ mode: 'onBlur' })

  const handleLogin = loginForm.handleSubmit(async (data) => {
    setError(null)
    setLoading(true)
    try {
      const res = await loginLocal(data)
      login(res.data.data.token)
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  })

  const handleRegister = registerForm.handleSubmit(async (data) => {
    setError(null)
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const { confirmPassword: _, ...payload } = data
      const res = await registerLocal(payload)
      login(res.data.data.token)
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  })

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#0b1326',
      fontFamily: '"Plus Jakarta Sans", sans-serif',
    }}>
      {/* ── Left panel: branding ──────────────────────────────── */}
      <Box sx={{
        display: { xs: 'none', lg: 'flex' },
        width: '50%',
        flexShrink: 0,
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: '48px',
        backgroundColor: '#060e20',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Campus background image */}
        <Box component="img" src={IMG.bgCampusDusk} alt="" sx={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', opacity: 0.35, mixBlendMode: 'luminosity',
        }} />
        {/* Gradient overlay */}
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #060e20 0%, rgba(6,14,32,0.7) 50%, transparent 100%)',
        }} />
        {/* Decorative blobs */}
        <Box sx={{
          position: 'absolute',
          top: -96,
          right: -96,
          width: 384,
          height: 384,
          borderRadius: '50%',
          background: '#1e40af',
          filter: 'blur(120px)',
          opacity: 0.15,
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: 160,
          left: -80,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: '#872d00',
          filter: 'blur(100px)',
          opacity: 0.12,
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #b8c4ff 0%, #1e40af 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(30,64,175,0.25)',
            flexShrink: 0,
          }}>
            <Typography sx={{ color: '#001453', fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>
              SC
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ color: '#ffffff', fontSize: 20, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
              Campus Hub
            </Typography>
            <Typography sx={{ color: '#b8c4ff', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Your campus, connected.
            </Typography>
          </Box>
        </Box>

        {/* Hero content */}
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 420 }}>
          <Typography sx={{
            color: '#ffffff',
            fontSize: 44,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            mb: 4,
          }}>
            Elevate Your{' '}
            <Box component="br" />
            <Box component="span" sx={{
              background: 'linear-gradient(90deg, #b8c4ff 0%, #dde1ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Academic Journey
            </Box>
          </Typography>

          {/* Feature items */}
          {[
            { icon: <EventSeatOutlinedIcon sx={{ fontSize: 20, color: '#b8c4ff' }} />, label: 'Resource Booking' },
            { icon: <ReportProblemOutlinedIcon sx={{ fontSize: 20, color: '#b8c4ff' }} />, label: 'Incident Reporting' },
            { icon: <NotificationsActiveOutlinedIcon sx={{ fontSize: 20, color: '#b8c4ff' }} />, label: 'Real-time Notifications' },
          ].map(({ icon, label }) => (
            <Box key={label} sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 2.5,
            }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                backgroundColor: '#171f33',
                border: '1px solid rgba(68,70,83,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {icon}
              </Box>
              <Typography sx={{ color: '#dae2fd', fontWeight: 500, fontSize: 14 }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Footer */}
        <Typography sx={{ position: 'relative', zIndex: 1, color: '#c4c5d5', fontSize: 13 }}>
          © 2024 Smart Campus Hub. Standardized Institutional Excellence.
        </Typography>
      </Box>

      {/* ── Right panel: form ─────────────────────────────────── */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 3, sm: 6 },
        backgroundColor: '#0b1326',
      }}>
        <Box sx={{ width: '100%', maxWidth: 440 }}>
          {/* Card */}
          <Box sx={{
            backgroundColor: '#131b2e',
            borderRadius: '12px',
            boxShadow: '0 24px 48px rgba(6,14,32,0.6)',
            border: '1px solid rgba(68,70,83,0.08)',
            overflow: 'hidden',
          }}>
            {/* Tabs */}
            <Box sx={{
              display: 'flex',
              gap: 4,
              px: 4,
              pt: 3,
              borderBottom: '1px solid rgba(68,70,83,0.15)',
            }}>
              {['Sign In', 'Register'].map((label, idx) => (
                <Box
                  key={label}
                  component="button"
                  onClick={() => { setTab(idx); setError(null) }}
                  sx={{
                    pb: 2,
                    background: 'none',
                    border: 'none',
                    borderBottom: tab === idx ? '2px solid #b8c4ff' : '2px solid transparent',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: tab === idx ? 700 : 600,
                    color: tab === idx ? '#b8c4ff' : '#c4c5d5',
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    transition: 'color 0.15s',
                    mb: '-1px',
                    '&:hover': { color: tab === idx ? '#b8c4ff' : '#dae2fd' },
                  }}
                >
                  {label}
                </Box>
              ))}
            </Box>

            <Box sx={{ p: { xs: 3, sm: 4 } }}>
              {/* Header */}
              <Box sx={{ mb: 3.5 }}>
                <Typography sx={{
                  color: '#dae2fd',
                  fontSize: 26,
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                  mb: 0.75,
                }}>
                  {tab === 0 ? 'Welcome back' : 'Create your account'}
                </Typography>
                <Typography sx={{ color: '#c4c5d5', fontSize: 13 }}>
                  {tab === 0 ? 'Sign in to your campus account' : 'Complete the form below to join the Campus Hub.'}
                </Typography>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2.5,
                    backgroundColor: 'rgba(147,0,10,0.2)',
                    color: '#ffdad6',
                    border: '1px solid rgba(147,0,10,0.4)',
                    borderRadius: '8px',
                    '& .MuiAlert-icon': { color: '#ffb4ab' },
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* ── Sign In form ── */}
              {tab === 0 && (
                <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    label="Email or Username"
                    placeholder="Enter your university email"
                    fullWidth
                    size="small"
                    {...loginForm.register('identifier', { required: 'Required' })}
                    error={!!loginForm.formState.errors.identifier}
                    helperText={loginForm.formState.errors.identifier?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon sx={{ fontSize: 18, color: '#8e909f' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                  <TextField
                    label="Password"
                    placeholder="••••••••"
                    type={showPw ? 'text' : 'password'}
                    fullWidth
                    size="small"
                    {...loginForm.register('password', { required: 'Required' })}
                    error={!!loginForm.formState.errors.password}
                    helperText={loginForm.formState.errors.password?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon sx={{ fontSize: 18, color: '#8e909f' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPw(v => !v)}
                            sx={{ color: '#8e909f', '&:hover': { color: '#dae2fd' } }}
                          >
                            {showPw
                              ? <VisibilityOffOutlinedIcon fontSize="small" />
                              : <VisibilityOutlinedIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    size="large"
                    disabled={loading}
                    sx={{
                      height: 44,
                      background: 'linear-gradient(90deg, #b8c4ff 0%, #1e40af 100%)',
                      color: '#001453',
                      fontWeight: 700,
                      fontSize: 14,
                      borderRadius: '8px',
                      boxShadow: '0 4px 16px rgba(30,64,175,0.25)',
                      mt: 0.5,
                      '&:hover': { opacity: 0.9, background: 'linear-gradient(90deg, #b8c4ff 0%, #1e40af 100%)' },
                      '&:disabled': { opacity: 0.6, color: '#001453' },
                    }}
                  >
                    {loading ? 'Signing in…' : 'Sign In'}
                  </Button>
                </Box>
              )}

              {/* ── Register form ── */}
              {tab === 1 && (
                <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Full Name"
                    placeholder="John Doe"
                    fullWidth
                    size="small"
                    {...registerForm.register('fullName', { required: 'Required' })}
                    error={!!registerForm.formState.errors.fullName}
                    helperText={registerForm.formState.errors.fullName?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlinedIcon sx={{ fontSize: 18, color: '#8e909f' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                  <TextField
                    label="Email Address"
                    placeholder="j.doe@university.edu"
                    type="email"
                    fullWidth
                    size="small"
                    {...registerForm.register('email', { required: 'Required' })}
                    error={!!registerForm.formState.errors.email}
                    helperText={registerForm.formState.errors.email?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon sx={{ fontSize: 18, color: '#8e909f' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                  <TextField
                    label="Username (Optional)"
                    placeholder="johndoe_24"
                    fullWidth
                    size="small"
                    {...registerForm.register('username')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography sx={{ color: '#8e909f', fontSize: 14, fontWeight: 500, lineHeight: 1 }}>@</Typography>
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <TextField
                      label="Password"
                      placeholder="••••••••"
                      type={showPw ? 'text' : 'password'}
                      fullWidth
                      size="small"
                      {...registerForm.register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })}
                      error={!!registerForm.formState.errors.password}
                      helperText={registerForm.formState.errors.password?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon sx={{ fontSize: 18, color: '#8e909f' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowPw(v => !v)} sx={{ color: '#8e909f' }}>
                              {showPw ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={inputSx}
                    />
                    <TextField
                      label="Confirm"
                      placeholder="••••••••"
                      type={showConfirmPw ? 'text' : 'password'}
                      fullWidth
                      size="small"
                      {...registerForm.register('confirmPassword', { required: 'Required' })}
                      error={!!registerForm.formState.errors.confirmPassword}
                      helperText={registerForm.formState.errors.confirmPassword?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon sx={{ fontSize: 18, color: '#8e909f' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowConfirmPw(v => !v)} sx={{ color: '#8e909f' }}>
                              {showConfirmPw ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={inputSx}
                    />
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    size="large"
                    disabled={loading}
                    sx={{
                      height: 44,
                      background: 'linear-gradient(90deg, #b8c4ff 0%, #1e40af 100%)',
                      color: '#001453',
                      fontWeight: 700,
                      fontSize: 14,
                      borderRadius: '8px',
                      boxShadow: '0 4px 16px rgba(30,64,175,0.25)',
                      mt: 0.5,
                      '&:hover': { opacity: 0.9, background: 'linear-gradient(90deg, #b8c4ff 0%, #1e40af 100%)' },
                      '&:disabled': { opacity: 0.6, color: '#001453' },
                    }}
                  >
                    {loading ? 'Creating account…' : 'Create Account'}
                  </Button>
                </Box>
              )}

              {/* Divider */}
              <Box sx={{ position: 'relative', my: 3.5, display: 'flex', alignItems: 'center' }}>
                <Box sx={{ flex: 1, height: 1, backgroundColor: 'rgba(68,70,83,0.15)' }} />
                <Typography sx={{
                  mx: 2,
                  color: '#c4c5d5',
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  whiteSpace: 'nowrap',
                }}>
                  or continue with
                </Typography>
                <Box sx={{ flex: 1, height: 1, backgroundColor: 'rgba(68,70,83,0.15)' }} />
              </Box>

              {/* Google OAuth button */}
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={() => { window.location.href = `${BACKEND_URL}/oauth2/authorization/google` }}
                startIcon={
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                }
                sx={{
                  height: 44,
                  borderColor: 'rgba(68,70,83,0.25)',
                  backgroundColor: '#31394d',
                  color: '#dae2fd',
                  fontWeight: 600,
                  fontSize: 13,
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: '#2d3449',
                    borderColor: 'rgba(68,70,83,0.4)',
                  },
                }}
              >
                Continue with Google
              </Button>
            </Box>
          </Box>

          {/* Footer links */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 3 }}>
            {['Privacy Policy', 'Terms of Service', 'Help Center'].map(link => (
              <Typography
                key={link}
                component="a"
                href="#"
                sx={{
                  color: '#8e909f',
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  textDecoration: 'none',
                  '&:hover': { color: '#dae2fd' },
                  transition: 'color 0.15s',
                }}
              >
                {link}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
