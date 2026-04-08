import type { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, Divider, Tooltip, InputBase,
} from '@mui/material'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import SearchIcon from '@mui/icons-material/Search'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../notifications/NotificationBell'
import StatusBadge from '../common/StatusBadge'

const SIDEBAR_W = 240
const HEADER_H  = 80

const PATH_LABELS: Record<string, string> = {
  '/resources':       'Resources',
  '/bookings':        'My Bookings',
  '/bookings/new':    'New Booking',
  '/tickets':         'Incident Tickets',
  '/tickets/new':     'Report Incident',
  '/notifications':   'Notifications',
  '/admin':           'Dashboard',
  '/admin/users':     'User Management',
  '/admin/bookings':  'Bookings',
  '/admin/tickets':   'Incident Queue',
  '/dashboard':       'Dashboard',
}

function getPageLabel(pathname: string): string {
  if (PATH_LABELS[pathname]) return PATH_LABELS[pathname]
  // Handle dynamic segments like /bookings/:id, /tickets/:id, /resources/:id
  if (pathname.startsWith('/admin/resources')) return 'Resources'
  if (pathname.startsWith('/bookings/')) return 'Booking Detail'
  if (pathname.startsWith('/tickets/')) return 'Ticket Detail'
  if (pathname.startsWith('/resources/')) return 'Resource Detail'
  return 'Campus Hub'
}

interface NavItem {
  label: string
  path: string
  icon: ReactNode
  exact?: boolean
  roles?: ('USER' | 'ADMIN' | 'TECHNICIAN')[]
}

const ALL_NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardOutlinedIcon fontSize="small" />,
    exact: true,
    roles: ['USER'],
  },
  {
    label: 'Dashboard',
    path: '/admin',
    icon: <DashboardOutlinedIcon fontSize="small" />,
    exact: true,
    roles: ['ADMIN'],
  },
  {
    label: 'User Management',
    path: '/admin/users',
    icon: <PeopleOutlinedIcon fontSize="small" />,
    roles: ['ADMIN'],
  },
  {
    label: 'Resources',
    path: '/resources',
    icon: <BusinessOutlinedIcon fontSize="small" />,
  },
  {
    label: 'My Bookings',
    path: '/bookings',
    icon: <CalendarTodayOutlinedIcon fontSize="small" />,
    roles: ['USER'],
  },
  {
    label: 'Bookings',
    path: '/admin/bookings',
    icon: <CalendarTodayOutlinedIcon fontSize="small" />,
    roles: ['ADMIN'],
  },
  {
    label: 'Incident Tickets',
    path: '/tickets',
    icon: <ConfirmationNumberOutlinedIcon fontSize="small" />,
    roles: ['USER'],
  },
  {
    label: 'Incident Queue',
    path: '/admin/tickets',
    icon: <ConfirmationNumberOutlinedIcon fontSize="small" />,
    roles: ['ADMIN', 'TECHNICIAN'],
  },
  {
    label: 'My Tickets',
    path: '/tickets',
    icon: <ConfirmationNumberOutlinedIcon fontSize="small" />,
    roles: ['TECHNICIAN'],
  },
  {
    label: 'Notifications',
    path: '/notifications',
    icon: <NotificationsOutlinedIcon fontSize="small" />,
  },
]

function initials(name?: string) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function displayName(user: { email: string; fullName?: string } | null) {
  if (!user) return 'User'
  if ((user as any).fullName) return (user as any).fullName
  return user.email.split('@')[0]
}

interface Props {
  children: ReactNode
}

export default function Navbar({ children }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const role = user?.role ?? 'USER'
  const navItems = ALL_NAV_ITEMS.filter(item =>
    !item.roles || item.roles.includes(role)
  )

  const isActive = (item: NavItem) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0b1326' }}>
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <Box sx={{
        width: SIDEBAR_W,
        flexShrink: 0,
        backgroundColor: '#0b1326',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 1200,
        overflowY: 'auto',
        borderRight: '1px solid rgba(68,70,83,0.15)',
        py: 2,
        px: 1,
      }}>
        {/* Logo area */}
        <Box sx={{ px: 2, py: 1.5, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #b8c4ff 0%, #1e40af 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(30,64,175,0.3)',
          }}>
            <Typography sx={{ color: '#001453', fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em' }}>
              SC
            </Typography>
          </Box>
          <Box>
            <Typography sx={{
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.2,
              background: 'linear-gradient(135deg, #b8c4ff 0%, #1e40af 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Smart Campus Hub
            </Typography>
            <Typography sx={{ color: '#c4c5d5', fontSize: 10, fontWeight: 500, letterSpacing: '0.05em' }}>
              University Portal
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(68,70,83,0.2)', mx: 1, mb: 1 }} />

        {/* Nav items */}
        <List sx={{ flex: 1, px: 0.5, py: 1 }} disablePadding>
          {navItems.map(item => {
            const active = isActive(item)
            return (
              <ListItemButton
                key={item.path + item.label}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: '8px',
                  mb: 0.5,
                  py: 1,
                  px: 1.5,
                  background: active ? 'rgba(30,64,175,0.2)' : 'transparent',
                  '&:hover': {
                    background: active ? 'rgba(30,64,175,0.25)' : 'rgba(184,196,255,0.06)',
                  },
                  transition: 'background 0.15s',
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 32,
                  color: active ? '#b8c4ff' : '#94a3b8',
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    color: active ? '#b8c4ff' : '#94a3b8',
                    letterSpacing: '0.01em',
                  }}
                />
              </ListItemButton>
            )
          })}
        </List>

        <Divider sx={{ borderColor: 'rgba(68,70,83,0.2)', mx: 1, mb: 1 }} />

        {/* User info + logout */}
        <Box sx={{ px: 1, py: 1 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 1,
            px: 1.5,
            py: 1.5,
            borderRadius: '10px',
            backgroundColor: '#131b2e',
          }}>
            <Avatar sx={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #b8c4ff 0%, #1e40af 100%)',
              fontSize: 13,
              fontWeight: 700,
              color: '#001453',
              flexShrink: 0,
            }}>
              {initials(displayName(user))}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{
                color: '#dae2fd',
                fontSize: 12,
                fontWeight: 700,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.3,
              }}>
                {displayName(user)}
              </Typography>
              <Box sx={{ mt: 0.25 }}>
                <StatusBadge label={role} variant="role" />
              </Box>
            </Box>
          </Box>

          <Tooltip title="Sign out">
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: '8px',
                py: 0.75,
                px: 1.5,
                '&:hover': { background: 'rgba(255,180,171,0.1)' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 28, color: '#ffb4ab' }}>
                <LogoutOutlinedIcon sx={{ fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText
                primary="Sign out"
                primaryTypographyProps={{ fontSize: 12, fontWeight: 500, color: '#ffb4ab' }}
              />
            </ListItemButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ── Right panel ─────────────────────────────────────── */}
      <Box sx={{ flex: 1, ml: `${SIDEBAR_W}px`, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top header */}
        <Box sx={{
          height: HEADER_H,
          background: 'rgba(11,19,38,0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(68,70,83,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 4,
          position: 'sticky',
          top: 0,
          zIndex: 1100,
        }}>
          {/* Left — breadcrumb */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>
              Pages
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#334155' }}>/</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {getPageLabel(location.pathname)}
            </Typography>
          </Box>

          {/* Right — search + bell + profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* Global search */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: '#131b2e',
              borderRadius: '8px',
              px: 1.5,
              py: 0.75,
              width: 220,
            }}>
              <SearchIcon sx={{ fontSize: 16, color: '#64748b', flexShrink: 0 }} />
              <InputBase
                placeholder="Global search..."
                inputProps={{ 'aria-label': 'search' }}
                sx={{
                  fontSize: 13,
                  color: '#c4c5d5',
                  flex: 1,
                  '& input::placeholder': { color: '#475569', opacity: 1 },
                  '& input': { padding: 0 },
                }}
              />
            </Box>

            <NotificationBell />

            {/* Profile */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              pl: 2,
              borderLeft: '1px solid rgba(68,70,83,0.3)',
            }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#ffffff', lineHeight: 1, mb: 0.25 }}>
                  {displayName(user)}
                </Typography>
                <Typography sx={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </Typography>
              </Box>
              <Avatar sx={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #b8c4ff 0%, #1e40af 100%)',
                fontSize: 13,
                fontWeight: 700,
                color: '#001453',
                flexShrink: 0,
                boxShadow: '0 0 0 2px rgba(184,196,255,0.2)',
              }}>
                {initials(displayName(user))}
              </Avatar>
            </Box>
          </Box>
        </Box>

        {/* Page content */}
        <Box component="main" sx={{ flex: 1, p: 3, maxWidth: 1200, width: '100%' }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
