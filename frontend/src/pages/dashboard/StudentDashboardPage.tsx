import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, CircularProgress } from '@mui/material'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import NotificationsIcon from '@mui/icons-material/Notifications'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import ComputerIcon from '@mui/icons-material/Computer'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
import AddTaskIcon from '@mui/icons-material/AddTask'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
import SearchIcon from '@mui/icons-material/Search'
import RouterIcon from '@mui/icons-material/Router'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useAuth } from '../../context/AuthContext'
import { IMG } from '../../assets/images'
import { getMyBookings } from '../../api/bookingApi'
import { getMyTickets } from '../../api/incidentApi'
import type { Booking } from '../../types/booking'
import type { Ticket } from '../../types/incident'
import { format } from 'date-fns'

// ─── Dark theme tokens ────────────────────────────────────────────────────────
const D = {
  surface: '#0b1326',
  surfaceContainer: '#171f33',
  surfaceContainerLow: '#131b2e',
  surfaceContainerHigh: '#222a3d',
  surfaceContainerHighest: '#2d3449',
  onSurface: '#dae2fd',
  onSurfaceVariant: '#c4c5d5',
  outlineVariant: '#444653',
  primary: '#b8c4ff',
  primaryContainer: '#1e40af',
  error: '#ffb4ab',
  errorContainer: '#93000a',
  tertiary: '#ffb59a',
  secondary: '#bbc4f6',
  secondaryContainer: '#3b446e',
}

function getBookingStatusStyle(status: string): { bgcolor: string; color: string } {
  if (status === 'APPROVED') return { bgcolor: 'rgba(184,196,255,0.1)', color: D.primary }
  if (status === 'PENDING') return { bgcolor: 'rgba(255,181,154,0.1)', color: D.tertiary }
  if (status === 'REJECTED') return { bgcolor: 'rgba(255,180,171,0.1)', color: D.error }
  return { bgcolor: 'rgba(68,70,83,0.3)', color: D.onSurfaceVariant }
}

function getPriorityStyle(priority: string): { bgcolor: string; color: string } {
  if (priority === 'HIGH' || priority === 'CRITICAL')
    return { bgcolor: D.errorContainer, color: D.error }
  if (priority === 'MEDIUM')
    return { bgcolor: D.secondaryContainer, color: D.secondary }
  return { bgcolor: 'rgba(68,70,83,0.3)', color: D.onSurfaceVariant }
}

function getTicketStatusStyle(status: string): { color: string; bgcolor: string } {
  if (status === 'IN_PROGRESS') return { color: D.tertiary, bgcolor: 'rgba(255,181,154,0.07)' }
  if (status === 'OPEN') return { color: '#34d399', bgcolor: 'rgba(52,211,153,0.07)' }
  if (status === 'RESOLVED' || status === 'CLOSED') return { color: D.primary, bgcolor: 'rgba(184,196,255,0.07)' }
  return { color: D.onSurfaceVariant, bgcolor: 'rgba(68,70,83,0.2)' }
}

export default function StudentDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  const firstName = user?.fullName?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there'

  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, tRes] = await Promise.allSettled([
          getMyBookings({ size: 5 }),
          getMyTickets({ size: 2 }),
        ])
        if (bRes.status === 'fulfilled') {
          setBookings(bRes.value.data?.data?.content ?? bRes.value.data?.data ?? [])
        }
        if (tRes.status === 'fulfilled') {
          setTickets(tRes.value.data?.data?.content ?? tRes.value.data?.data ?? [])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const activeBookings = bookings.filter(b => b.status === 'APPROVED' || b.status === 'PENDING').length
  const openTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length

  const statCards = [
    {
      icon: <EventAvailableIcon sx={{ color: D.primary, fontSize: 22 }} />,
      iconBg: 'rgba(184,196,255,0.1)',
      border: D.primary,
      badge: 'Live',
      badgeColor: D.primary,
      value: activeBookings,
      label: 'Active Bookings',
      pulse: false,
    },
    {
      icon: <ConfirmationNumberIcon sx={{ color: D.tertiary, fontSize: 22 }} />,
      iconBg: 'rgba(255,181,154,0.1)',
      border: D.tertiary,
      badge: null,
      pulse: true,
      value: openTickets,
      label: 'Open Tickets',
    },
    {
      icon: <NotificationsIcon sx={{ color: D.secondary, fontSize: 22 }} />,
      iconBg: 'rgba(187,196,246,0.1)',
      border: D.secondary,
      badge: null,
      pulse: false,
      value: 3,
      label: 'Unread Alerts',
    },
    {
      icon: <LibraryBooksIcon sx={{ color: '#34d399', fontSize: 22 }} />,
      iconBg: 'rgba(52,211,153,0.1)',
      border: '#34d399',
      badge: null,
      pulse: false,
      value: 24,
      label: 'Library Resources',
    },
  ]

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, bgcolor: D.surface }}>
        <CircularProgress sx={{ color: D.primary }} />
      </Box>
    )
  }

  return (
    <Box sx={{ bgcolor: D.surface, minHeight: '100vh', p: 0 }}>

      {/* Welcome Banner */}
      <Box sx={{
        background: `linear-gradient(135deg, ${D.primaryContainer} 0%, ${D.surfaceContainerHighest} 100%)`,
        borderRadius: 3,
        p: { xs: 4, md: 5 },
        mb: 4,
        minHeight: 180,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box
          component="img"
          src={IMG.bgNetworkPattern}
          alt=""
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.12,
            mixBlendMode: 'luminosity',
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 800, letterSpacing: '-0.5px', color: '#fff', mb: 1 }}>
            Good morning, {firstName}! 👋
          </Typography>
          <Typography sx={{ color: `${D.primary}cc`, fontSize: 16, maxWidth: 480, lineHeight: 1.6 }}>
            Your academic day is looking productive. You have {activeBookings} booking{activeBookings !== 1 ? 's' : ''} and {openTickets} open ticket{openTickets !== 1 ? 's' : ''}.
          </Typography>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 4,
      }}>
        {statCards.map(card => (
          <Box key={card.label} sx={{
            bgcolor: D.surfaceContainerLow,
            borderLeft: `4px solid ${card.border}`,
            p: 3,
            borderRadius: 2.5,
            transition: 'transform 0.3s',
            '&:hover': { transform: 'scale(1.02)' },
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ p: 1, bgcolor: card.iconBg, borderRadius: 1.5 }}>
                {card.icon}
              </Box>
              {card.pulse ? (
                <Box sx={{ position: 'relative', width: 12, height: 12, mt: 0.5 }}>
                  <Box sx={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    bgcolor: D.tertiary, opacity: 0.75,
                    animation: 'ping 1.2s cubic-bezier(0,0,0.2,1) infinite',
                    '@keyframes ping': {
                      '0%': { transform: 'scale(1)', opacity: 0.75 },
                      '75%, 100%': { transform: 'scale(2)', opacity: 0 },
                    },
                  }} />
                  <Box sx={{ position: 'relative', width: 12, height: 12, borderRadius: '50%', bgcolor: D.tertiary }} />
                </Box>
              ) : card.badge ? (
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: card.badgeColor, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {card.badge}
                </Typography>
              ) : null}
            </Box>
            <Typography sx={{ fontSize: 32, fontWeight: 800, color: '#fff', mb: 0.5, lineHeight: 1 }}>
              {card.value}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>
              {card.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Bento Layout */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
        gap: 4,
      }}>

        {/* Left Column — Upcoming Bookings + Quick Actions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* Upcoming Bookings */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
                Upcoming Bookings
              </Typography>
              <Box
                component="button"
                onClick={() => navigate('/bookings')}
                sx={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, color: D.primary,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                View All
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {bookings.length === 0 ? (
                <Box sx={{
                  bgcolor: D.surfaceContainer, borderRadius: 2.5, p: 4,
                  textAlign: 'center',
                }}>
                  <Typography sx={{ color: D.onSurfaceVariant, fontSize: 14 }}>
                    No upcoming bookings. Book a resource to get started!
                  </Typography>
                </Box>
              ) : (
                bookings.slice(0, 4).map(b => (
                  <Box key={b.id} sx={{
                    bgcolor: D.surfaceContainer, borderRadius: 2.5, p: 2.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    '&:hover': { bgcolor: D.surfaceContainerHigh },
                    transition: 'background 0.15s', cursor: 'pointer',
                  }}
                    onClick={() => navigate(`/bookings/${b.id}`)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        width: 48, height: 48, bgcolor: D.surfaceContainerHighest,
                        borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {b.resourceName?.toLowerCase().includes('lab') || b.resourceName?.toLowerCase().includes('computer')
                          ? <ComputerIcon sx={{ color: D.primary }} />
                          : <MeetingRoomIcon sx={{ color: D.secondary }} />
                        }
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>
                          {b.resourceName}
                        </Typography>
                        <Typography sx={{ color: '#475569', fontSize: 13 }}>
                          {format(new Date(b.startDatetime), 'EEE, MMM d · HH:mm')} – {format(new Date(b.endDatetime), 'HH:mm')}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box component="span" sx={{
                        px: 2, py: 0.5, borderRadius: 9999,
                        fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                        ...getBookingStatusStyle(b.status),
                      }}>
                        {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                      </Box>
                      <MoreVertIcon sx={{ color: '#475569', fontSize: 18, cursor: 'pointer' }} />
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Box>

          {/* Quick Actions */}
          <Box sx={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2,
          }}>
            {[
              {
                icon: <AddTaskIcon sx={{ fontSize: 28, color: D.primary }} />,
                label: 'Book Resource',
                hoverBg: 'rgba(184,196,255,0.05)',
                onClick: () => navigate('/bookings/new'),
              },
              {
                icon: <ReportProblemIcon sx={{ fontSize: 28, color: D.tertiary }} />,
                label: 'Report Incident',
                hoverBg: 'rgba(255,181,154,0.05)',
                onClick: () => navigate('/tickets/new'),
              },
              {
                icon: <SearchIcon sx={{ fontSize: 28, color: D.secondary }} />,
                label: 'Browse All',
                hoverBg: 'rgba(187,196,246,0.05)',
                onClick: () => navigate('/resources'),
              },
            ].map(action => (
              <Box
                key={action.label}
                component="button"
                onClick={action.onClick}
                sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  p: 3, bgcolor: D.surfaceContainerLow, borderRadius: 2.5, cursor: 'pointer',
                  border: `1px solid rgba(68,70,83,0.12)`,
                  '&:hover': { bgcolor: action.hoverBg, '& .action-icon': { transform: 'scale(1.12)' } },
                  transition: 'background 0.15s',
                }}
              >
                <Box className="action-icon" sx={{ mb: 1.5, transition: 'transform 0.2s' }}>
                  {action.icon}
                </Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                  {action.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right Column — Recent Tickets + Resource Meter */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* Recent Tickets */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
                Recent Tickets
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {tickets.length === 0 ? (
                <Box sx={{ bgcolor: D.surfaceContainerLow, borderRadius: 2.5, p: 4, textAlign: 'center' }}>
                  <Typography sx={{ color: D.onSurfaceVariant, fontSize: 14 }}>No tickets yet.</Typography>
                </Box>
              ) : (
                tickets.slice(0, 2).map(t => (
                  <Box key={t.id} sx={{
                    bgcolor: D.surfaceContainerLow, borderRadius: 2.5, p: 3,
                    border: '1px solid rgba(68,70,83,0.08)',
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'rgba(184,196,255,0.15)' },
                  }}
                    onClick={() => navigate(`/tickets/${t.id}`)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box component="span" sx={{
                        px: 1, py: 0.25, borderRadius: 0.5,
                        fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                        ...getPriorityStyle(t.priority),
                      }}>
                        {t.priority.charAt(0) + t.priority.slice(1).toLowerCase()} Priority
                      </Box>
                      <Typography sx={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>
                        #{t.id.slice(-6).toUpperCase()}
                      </Typography>
                    </Box>

                    <Typography sx={{ fontWeight: 700, color: '#fff', mb: 0.5, fontSize: 14 }}>
                      {t.title}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: '#475569', mb: 2 }}>
                      {t.locationDetail ?? t.resourceName ?? 'No location'}
                    </Typography>

                    <Box sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      pt: 2, borderTop: '1px solid rgba(68,70,83,0.15)',
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {t.category === 'IT_EQUIPMENT' ? (
                          <RouterIcon sx={{ fontSize: 16, color: D.primary }} />
                        ) : (
                          <LightbulbIcon sx={{ fontSize: 16, color: '#facc15' }} />
                        )}
                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          {t.category}
                        </Typography>
                      </Box>
                      <Box component="span" sx={{
                        fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                        px: 1, py: 0.5, borderRadius: 0.5,
                        ...getTicketStatusStyle(t.status),
                      }}>
                        {t.status.replace('_', ' ')}
                      </Box>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Box>

          {/* Resource Availability Meter */}
          <Box sx={{
            background: `linear-gradient(135deg, rgba(59,68,110,0.4) 0%, ${D.surfaceContainerHighest} 100%)`,
            borderRadius: 2.5, p: 3,
            border: '1px solid rgba(68,70,83,0.12)',
            position: 'relative', overflow: 'hidden',
          }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography sx={{ fontWeight: 700, color: '#fff', mb: 2, fontSize: 15 }}>
                Academic Resources
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 1 }}>
                <Typography sx={{ fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                  88%
                </Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: D.secondary, mb: 0.5 }}>
                  Available
                </Typography>
              </Box>
              {/* Progress bar */}
              <Box sx={{
                width: '100%', bgcolor: '#060e20', height: 8, borderRadius: 9999,
                mb: 2, overflow: 'hidden',
              }}>
                <Box sx={{
                  width: '88%', bgcolor: D.secondary, height: '100%', borderRadius: 9999,
                }} />
              </Box>
              <Typography sx={{ fontSize: 11, color: '#475569', lineHeight: 1.6 }}>
                Most campus facilities are currently under peak operational efficiency. Book now to secure your spot.
              </Typography>
            </Box>
            {/* Decorative */}
            <Box sx={{
              position: 'absolute', bottom: -16, right: -16, fontSize: 96,
              color: 'rgba(255,255,255,0.04)', userSelect: 'none', fontFamily: 'serif',
              transform: 'rotate(12deg)',
            }}>
              🎓
            </Box>
          </Box>

        </Box>
      </Box>
    </Box>
  )
}
