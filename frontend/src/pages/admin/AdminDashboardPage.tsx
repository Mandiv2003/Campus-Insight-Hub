import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, CircularProgress, IconButton, Grid,
} from '@mui/material'
import GroupIcon from '@mui/icons-material/Group'
import ScheduleIcon from '@mui/icons-material/Schedule'
import WarningIcon from '@mui/icons-material/Warning'
import BusinessIcon from '@mui/icons-material/Business'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import { getAdminBookings, approveBooking, rejectBooking } from '../../api/bookingApi'
import { getAdminTickets } from '../../api/incidentApi'
import { getResources } from '../../api/resourceApi'
import { getUsers } from '../../api/userApi'
import type { Booking } from '../../types/booking'
import type { Ticket } from '../../types/incident'
import { format } from 'date-fns'
import { IMG } from '../../assets/images'

const D = {
  surface:               '#0b1326',
  surfaceContainer:      '#171f33',
  surfaceContainerLow:   '#131b2e',
  surfaceContainerHigh:  '#222a3d',
  onSurface:             '#dae2fd',
  onSurfaceVariant:      '#c4c5d5',
  outlineVariant:        '#444653',
  primary:               '#b8c4ff',
  primaryContainer:      '#1e40af',
  error:                 '#ffb4ab',
  tertiary:              '#ffb59a',
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ users: 0, resources: 0, pendingBookings: 0, openTickets: 0 })
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([])
  const [openTickets, setOpenTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, resourcesRes, pendingRes, openRes] = await Promise.allSettled([
          getUsers({ size: 1 }),
          getResources({ size: 1 }),
          getAdminBookings({ status: 'PENDING', size: 5 }),
          getAdminTickets({ status: 'OPEN', size: 5 }),
        ])

        const usersTotal = usersRes.status === 'fulfilled'
          ? (usersRes.value.data?.data?.totalElements ?? usersRes.value.data?.data?.length ?? 0) : 0
        const resourcesTotal = resourcesRes.status === 'fulfilled'
          ? (resourcesRes.value.data?.data?.totalElements ?? resourcesRes.value.data?.data?.length ?? 0) : 0

        const pending: Booking[] = pendingRes.status === 'fulfilled'
          ? (pendingRes.value.data?.data?.content ?? pendingRes.value.data?.data ?? []) : []
        const open: Ticket[] = openRes.status === 'fulfilled'
          ? (openRes.value.data?.data?.content ?? openRes.value.data?.data ?? []) : []

        setPendingBookings(pending)
        setOpenTickets(open)
        setStats({
          users: usersTotal,
          resources: resourcesTotal,
          pendingBookings: pending.length,
          openTickets: open.length,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleApprove = async (id: string) => {
    setActionLoading(id)
    try {
      await approveBooking(id)
      setPendingBookings(prev => prev.filter(b => b.id !== id))
      setStats(s => ({ ...s, pendingBookings: s.pendingBookings - 1 }))
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: string) => {
    setActionLoading(id + '_reject')
    try {
      await rejectBooking(id, { rejectionReason: 'Rejected by admin' })
      setPendingBookings(prev => prev.filter(b => b.id !== id))
      setStats(s => ({ ...s, pendingBookings: s.pendingBookings - 1 }))
    } finally {
      setActionLoading(null)
    }
  }

  const handleGenerateReport = () => {
    window.print()
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, bgcolor: D.surface }}>
        <CircularProgress sx={{ color: D.primary }} />
      </Box>
    )
  }

  const kpiCards = [
    {
      label: 'Total Users',
      value: stats.users,
      icon: <GroupIcon sx={{ color: D.primary, fontSize: 22 }} />,
      iconBg: 'rgba(184,196,255,0.1)',
      border: D.primary,
      badge: 'All roles',
      badgeColor: D.primary,
      badgeBg: 'rgba(184,196,255,0.08)',
    },
    {
      label: 'Pending Bookings',
      value: stats.pendingBookings,
      icon: <ScheduleIcon sx={{ color: '#f59e0b', fontSize: 22 }} />,
      iconBg: 'rgba(245,158,11,0.1)',
      border: '#f59e0b',
      badge: 'Needs review',
      badgeColor: '#f59e0b',
      badgeBg: 'rgba(245,158,11,0.08)',
    },
    {
      label: 'Open Incidents',
      value: stats.openTickets,
      icon: <WarningIcon sx={{ color: D.error, fontSize: 22 }} />,
      iconBg: 'rgba(255,180,171,0.1)',
      border: D.error,
      badge: 'Active',
      badgeColor: D.error,
      badgeBg: 'rgba(255,180,171,0.08)',
    },
    {
      label: 'Active Resources',
      value: stats.resources,
      icon: <BusinessIcon sx={{ color: '#34d399', fontSize: 22 }} />,
      iconBg: 'rgba(52,211,153,0.1)',
      border: '#34d399',
      badge: 'Operational',
      badgeColor: '#34d399',
      badgeBg: 'rgba(52,211,153,0.08)',
    },
  ]

  const barData = [
    { label: 'APP', value: 85, color: D.primary },
    { label: 'PEN', value: 40, color: '#f59e0b' },
    { label: 'REJ', value: 15, color: D.error },
    { label: 'CAN', value: 25, color: D.outlineVariant },
  ]

  return (
    <Box sx={{ bgcolor: D.surface, minHeight: '100vh', p: 0 }}>

      {/* Hero Banner */}
      <Box sx={{
        background: `linear-gradient(135deg, ${D.primaryContainer} 0%, ${D.surface} 100%)`,
        borderRadius: 3,
        p: { xs: 4, md: 5 },
        mb: 4,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box
          component="img"
          src={IMG.bgNetworkPattern}
          alt=""
          sx={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: 0.08, mixBlendMode: 'luminosity',
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 560 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', mb: 1 }}>
            Admin Control Center
          </Typography>
          <Typography sx={{ color: `${D.primary}cc`, fontSize: 16, lineHeight: 1.6 }}>
            Manage campus resources, bookings, users, and incident reports from a single intelligent hub.
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Box
              component="button"
              onClick={handleGenerateReport}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 1,
                px: 3, py: 1.25, bgcolor: '#fff', color: D.primaryContainer, fontWeight: 700,
                fontSize: 14, border: 'none', borderRadius: 2, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                '&:hover': { opacity: 0.92 },
              }}
            >
              <DownloadOutlinedIcon sx={{ fontSize: 18 }} />
              Generate Report
            </Box>
          </Box>
        </Box>
      </Box>

      {/* KPI Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiCards.map(card => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Box sx={{
              bgcolor: D.surfaceContainer,
              borderRadius: 3,
              p: 3,
              borderLeft: `4px solid ${card.border}`,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-3px)' },
              border: `1px solid rgba(68,70,83,0.15)`,
              borderLeftWidth: 4,
              borderLeftStyle: 'solid',
              borderLeftColor: card.border,
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ p: 1, bgcolor: card.iconBg, borderRadius: 1.5 }}>
                  {card.icon}
                </Box>
                <Box component="span" sx={{
                  fontSize: 11, fontWeight: 700, px: 1.25, py: 0.5,
                  borderRadius: 9999, color: card.badgeColor, bgcolor: card.badgeBg,
                }}>
                  {card.badge}
                </Box>
              </Box>
              <Typography sx={{ color: D.onSurfaceVariant, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', mb: 0.5 }}>
                {card.label}
              </Typography>
              <Typography sx={{ fontSize: 32, fontWeight: 800, color: D.onSurface, lineHeight: 1 }}>
                {card.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Main Operational Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }} alignItems="flex-start">

        {/* Pending Booking Approvals */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{
            bgcolor: D.surfaceContainer, borderRadius: 3, p: 4,
            border: '1px solid rgba(68,70,83,0.15)',
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: D.onSurface, letterSpacing: '-0.3px' }}>
                Pending Booking Approvals
              </Typography>
              <Box
                component="button"
                onClick={() => navigate('/admin/bookings')}
                sx={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 700, color: D.primary,
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                View all
              </Box>
            </Box>

            {pendingBookings.length === 0 ? (
              <Typography sx={{ color: D.onSurfaceVariant, textAlign: 'center', py: 4, fontSize: 14 }}>
                No pending bookings
              </Typography>
            ) : (
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <Box component="thead">
                  <Box component="tr">
                    {['Resource', 'Title', 'Requested By', 'Date', ''].map(h => (
                      <Box key={h} component="th" sx={{
                        pb: 2, fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.1em', color: D.onSurfaceVariant,
                        textAlign: h === '' ? 'right' : 'left',
                        borderBottom: `1px solid rgba(68,70,83,0.25)`,
                      }}>
                        {h}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {pendingBookings.map(b => (
                    <Box component="tr" key={b.id} sx={{
                      '&:hover td': { bgcolor: D.surfaceContainerHigh },
                      '& td': { transition: 'background 0.15s', borderBottom: `1px solid rgba(68,70,83,0.12)` },
                    }}>
                      <Box component="td" sx={{ py: 2, pr: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{
                            width: 32, height: 32, borderRadius: 1, bgcolor: D.surfaceContainerLow,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <BusinessIcon sx={{ fontSize: 16, color: D.onSurfaceVariant }} />
                          </Box>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: D.onSurface }}>
                            {b.resourceName}
                          </Typography>
                        </Box>
                      </Box>
                      <Box component="td" sx={{ py: 2, pr: 2 }}>
                        <Typography sx={{ fontSize: 13, color: D.onSurfaceVariant }}>{b.title}</Typography>
                      </Box>
                      <Box component="td" sx={{ py: 2, pr: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{
                            width: 24, height: 24, borderRadius: '50%', bgcolor: 'rgba(184,196,255,0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 700, color: D.primary,
                          }}>
                            {b.requestedByName?.charAt(0) ?? '?'}
                          </Box>
                          <Typography sx={{ fontSize: 13, fontWeight: 500, color: D.onSurface }}>
                            {b.requestedByName}
                          </Typography>
                        </Box>
                      </Box>
                      <Box component="td" sx={{ py: 2, pr: 2 }}>
                        <Typography sx={{ fontSize: 13, color: D.onSurface }}>
                          {format(new Date(b.startDatetime), 'MMM d')}
                        </Typography>
                      </Box>
                      <Box component="td" sx={{ py: 2, textAlign: 'right' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <IconButton
                            size="small"
                            disabled={actionLoading === b.id}
                            onClick={() => handleApprove(b.id)}
                            sx={{
                              width: 32, height: 32, bgcolor: 'rgba(52,211,153,0.1)', color: '#34d399',
                              '&:hover': { bgcolor: '#34d399', color: '#fff' },
                            }}
                          >
                            <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            disabled={actionLoading === b.id + '_reject'}
                            onClick={() => handleReject(b.id)}
                            sx={{
                              width: 32, height: 32, bgcolor: 'rgba(255,180,171,0.1)', color: D.error,
                              '&:hover': { bgcolor: D.error, color: '#fff' },
                            }}
                          >
                            <CancelOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            <Box sx={{ mt: 3 }}>
              <Box
                component="button"
                onClick={() => navigate('/admin/bookings')}
                sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.75,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 700, color: D.primary,
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  '&:hover span': { transform: 'translateX(3px)' },
                }}
              >
                View All Bookings
                <Box component="span" sx={{ transition: 'transform 0.2s', display: 'flex' }}>
                  <ArrowForwardIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Critical Incidents */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{
            bgcolor: D.surfaceContainer, borderRadius: 3, p: 4,
            border: '1px solid rgba(68,70,83,0.15)',
          }}>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: D.onSurface, letterSpacing: '-0.3px', mb: 3 }}>
              Critical Incidents
            </Typography>

            {openTickets.length === 0 ? (
              <Typography sx={{ color: D.onSurfaceVariant, textAlign: 'center', py: 4, fontSize: 14 }}>
                No critical incidents
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {openTickets.slice(0, 4).map(t => (
                  <Box key={t.id} sx={{
                    p: 2.5, borderRadius: 2.5, bgcolor: D.surfaceContainerLow,
                    border: '1px solid rgba(68,70,83,0.1)',
                    '&:hover': { borderColor: 'rgba(184,196,255,0.15)' },
                    transition: 'border-color 0.15s',
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#475569', fontFamily: 'monospace' }}>
                        #{t.id.slice(-6).toUpperCase()}
                      </Typography>
                      <Box component="span" sx={{
                        px: 1.25, py: 0.25, borderRadius: 9999, fontSize: 10, fontWeight: 700,
                        textTransform: 'uppercase',
                        bgcolor: t.priority === 'CRITICAL' ? 'rgba(255,180,171,0.12)' : t.priority === 'HIGH' ? 'rgba(249,115,22,0.1)' : 'rgba(234,179,8,0.1)',
                        color: t.priority === 'CRITICAL' ? D.error : t.priority === 'HIGH' ? '#fb923c' : '#fbbf24',
                      }}>
                        {t.priority}
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: D.onSurface, mb: 0.5 }}>
                      {t.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography sx={{ fontSize: 11, color: D.onSurfaceVariant }}>
                        {t.category}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: D.tertiary, fontWeight: 600 }}>
                        {t.status}
                      </Typography>
                    </Box>
                    <Box
                      component="button"
                      onClick={() => navigate('/admin/tickets')}
                      sx={{
                        width: '100%', py: 1, bgcolor: D.primaryContainer, color: '#fff',
                        border: 'none', borderRadius: 1.5, fontSize: 11, fontWeight: 700,
                        cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em',
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        '&:hover': { bgcolor: '#1a36a0' },
                      }}
                    >
                      Assign Technician
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            <Box sx={{ mt: 3 }}>
              <Box
                component="button"
                onClick={() => navigate('/admin/tickets')}
                sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.75,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 700, color: D.primary,
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  '&:hover span': { transform: 'translateX(3px)' },
                }}
              >
                View Incident Queue
                <Box component="span" sx={{ transition: 'transform 0.2s', display: 'flex' }}>
                  <ArrowForwardIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Analytics Overview */}
      <Grid container spacing={3} sx={{ pb: 6 }}>

        {/* User Role Distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{
            bgcolor: D.surfaceContainer, borderRadius: 3, p: 4,
            border: '1px solid rgba(68,70,83,0.15)',
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: D.onSurface, letterSpacing: '-0.3px' }}>
                User Role Distribution
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                {[
                  { label: 'USER', color: D.primary },
                  { label: 'TECH', color: '#60a5fa' },
                  { label: 'ADMIN', color: '#1e3a8a' },
                ].map(item => (
                  <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                    <Typography sx={{ fontSize: 10, fontWeight: 600, color: D.onSurfaceVariant }}>
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
              <Box sx={{
                width: 160, height: 160, borderRadius: '50%',
                border: '20px solid',
                borderTopColor: D.primary,
                borderRightColor: D.primary,
                borderBottomColor: '#1e3a8a',
                borderLeftColor: '#60a5fa',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 28, fontWeight: 800, color: D.onSurface, lineHeight: 1 }}>
                    {stats.users}
                  </Typography>
                  <Typography sx={{ fontSize: 9, color: D.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.1em', mt: 0.5 }}>
                    Total
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ ml: 5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { label: 'Student / Staff', pct: '78%' },
                  { label: 'Technician', pct: '15%' },
                  { label: 'Administrator', pct: '7%' },
                ].map(item => (
                  <Box key={item.label}>
                    <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: D.onSurfaceVariant }}>
                      {item.label}
                    </Typography>
                    <Typography sx={{ fontSize: 20, fontWeight: 800, color: D.onSurface }}>
                      {item.pct}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Weekly Booking Trends */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{
            bgcolor: D.surfaceContainer, borderRadius: 3, p: 4,
            border: '1px solid rgba(68,70,83,0.15)',
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: D.onSurface, letterSpacing: '-0.3px' }}>
                Weekly Booking Trends
              </Typography>
              <Box
                component="select"
                sx={{
                  fontSize: 11, fontWeight: 700, border: '1px solid rgba(68,70,83,0.3)',
                  bgcolor: D.surfaceContainerLow, borderRadius: 1.5, py: 0.5, px: 1.5,
                  color: D.onSurface, cursor: 'pointer', outline: 'none',
                }}
              >
                <option style={{ background: D.surfaceContainerLow }}>This Week</option>
                <option style={{ background: D.surfaceContainerLow }}>Last Week</option>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 160, gap: 2, px: 1, mb: 2 }}>
              {barData.map(bar => (
                <Box key={bar.label} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, height: '100%', justifyContent: 'flex-end' }}>
                  <Box sx={{
                    width: '100%', bgcolor: bar.color, borderRadius: '4px 4px 0 0',
                    height: `${bar.value}%`,
                    position: 'relative',
                    opacity: 0.85,
                    '&:hover': { opacity: 1 },
                    '&:hover .bar-tooltip': { opacity: 1 },
                  }}>
                    <Box className="bar-tooltip" sx={{
                      position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)',
                      bgcolor: D.surfaceContainerHigh, color: D.onSurface, fontSize: 10, px: 1, py: 0.5,
                      borderRadius: 1, opacity: 0, transition: 'opacity 0.2s', whiteSpace: 'nowrap',
                      border: '1px solid rgba(68,70,83,0.3)',
                    }}>
                      {bar.value}
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: D.onSurfaceVariant, letterSpacing: '0.08em' }}>
                    {bar.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 1 }}>
              {[
                { label: 'APPROVED', color: D.primary },
                { label: 'PENDING', color: '#f59e0b' },
                { label: 'REJECTED', color: D.error },
                { label: 'CANCELLED', color: D.outlineVariant },
              ].map(item => (
                <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: item.color }} />
                  <Typography sx={{ fontSize: 9, fontWeight: 700, color: D.onSurfaceVariant, letterSpacing: '0.06em' }}>
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
