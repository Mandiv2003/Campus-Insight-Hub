import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Grid, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import { getResource, updateResourceStatus } from '../../api/resourceApi'
import type { Resource, ResourceStatus, ResourceType } from '../../types/resource'
import { useAuth } from '../../context/AuthContext'

const C = {
  bg: '#0b1326',
  card: '#171f33',
  containerLow: '#131b2e',
  containerHighest: '#2d3449',
  primary: '#b8c4ff',
  primaryContainer: '#1e40af',
  onSurface: '#dae2fd',
  onSurfaceVariant: '#c4c5d5',
  outline: '#8e909f',
  outlineVariant: '#444653',
  tertiary: '#ffb59a',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate700: '#334155',
  white: '#ffffff',
}

const TYPE_GRADIENTS: Record<ResourceType, { from: string; to: string }> = {
  LECTURE_HALL: { from: '#1e40af', to: '#002584' },
  LAB:          { from: '#004d40', to: '#00bfa5' },
  MEETING_ROOM: { from: '#4a148c', to: '#7c4dff' },
  EQUIPMENT:    { from: '#e65100', to: '#ff9800' },
}

const TYPE_BADGE: Record<ResourceType, { bg: string; color: string; label: string }> = {
  LECTURE_HALL: { bg: 'rgba(184,196,255,0.12)', color: '#b8c4ff', label: 'Lecture Hall' },
  LAB:          { bg: 'rgba(45,212,191,0.12)',  color: '#2dd4bf', label: 'Lab' },
  MEETING_ROOM: { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa', label: 'Meeting Room' },
  EQUIPMENT:    { bg: 'rgba(251,146,60,0.12)',  color: '#fb923c', label: 'Equipment' },
}

const STATUS_BADGE: Record<ResourceStatus, { bg: string; color: string; label: string }> = {
  ACTIVE:         { bg: C.primary,    color: '#002584', label: 'Active' },
  MAINTENANCE:    { bg: C.tertiary,   color: '#5a1b00', label: 'Maintenance' },
  OUT_OF_SERVICE: { bg: '#ef4444',    color: '#ffffff', label: 'Out of Service' },
  ARCHIVED:       { bg: C.slate700,   color: C.slate400, label: 'Archived' },
}

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']
const STATUSES: ResourceStatus[] = ['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE', 'ARCHIVED']

const DAY_SHORT: Record<string, string> = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed',
  THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun',
}

export default function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusDialog, setStatusDialog] = useState(false)
  const [newStatus, setNewStatus] = useState<ResourceStatus>('ACTIVE')
  const [statusLoading, setStatusLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getResource(id!)
        const r: Resource = res.data?.data
        setResource(r)
        setNewStatus(r?.status)
      } catch {
        setError('Failed to load resource.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleStatusUpdate = async () => {
    if (!resource) return
    setStatusLoading(true)
    try {
      await updateResourceStatus(resource.id, newStatus)
      setResource(r => r ? { ...r, status: newStatus } : r)
      setStatusDialog(false)
    } catch {
      setError('Failed to update status.')
    } finally {
      setStatusLoading(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: C.primary }} />
      </Box>
    )
  }

  if (error || !resource) {
    return (
      <Box sx={{ minHeight: '100vh', background: C.bg, p: 4 }}>
        <Alert severity="error" sx={{ background: '#2d1b1b', color: '#fca5a5' }}>
          {error ?? 'Resource not found.'}
        </Alert>
      </Box>
    )
  }

  const grad = TYPE_GRADIENTS[resource.type] ?? TYPE_GRADIENTS.LECTURE_HALL
  const typeBadge = TYPE_BADGE[resource.type] ?? TYPE_BADGE.LECTURE_HALL
  const statusBadge = STATUS_BADGE[resource.status] ?? STATUS_BADGE.ACTIVE
  const isActive = resource.status === 'ACTIVE'

  const sortedWindows = [...resource.availabilityWindows].sort(
    (a, b) => DAYS.indexOf(a.dayOfWeek) - DAYS.indexOf(b.dayOfWeek)
  )

  return (
    <Box sx={{ minHeight: '100vh', background: C.bg, px: { xs: 3, md: 5 }, py: 4 }}>
      {/* Back Button */}
      <Box
        component="button"
        onClick={() => navigate('/resources')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: C.slate400,
          fontWeight: 600,
          fontSize: 14,
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          mb: 4,
          px: 0,
          '&:hover': { color: C.white },
          transition: 'color 0.2s',
        }}
      >
        <ArrowBackOutlinedIcon sx={{ fontSize: 18 }} />
        Back to Resources
      </Box>

      <Grid container spacing={4}>
        {/* LEFT COLUMN */}
        <Grid size={{ xs: 12, lg: 7 }}>
          {/* Hero Banner */}
          <Box
            sx={{
              height: 300,
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${grad.from} 0%, ${grad.to} 100%)`,
              position: 'relative',
              mb: 4,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'flex-end',
            }}
          >
            {/* Status pill */}
            <Box
              sx={{
                position: 'absolute',
                top: 20,
                right: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                background: 'rgba(11,19,38,0.7)',
                backdropFilter: 'blur(8px)',
                px: 2,
                py: 0.75,
                borderRadius: '9999px',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: statusBadge.bg,
                  boxShadow: `0 0 8px ${statusBadge.bg}`,
                  animation: isActive ? 'none' : 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.4 },
                  },
                }}
              />
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.onSurface, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {statusBadge.label}
              </Typography>
            </Box>

            {/* Resource name overlay */}
            <Box sx={{ p: 4, background: 'linear-gradient(to top, rgba(11,19,38,0.85) 0%, transparent 100%)', width: '100%' }}>
              <Typography sx={{ fontSize: 32, fontWeight: 800, color: C.white, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {resource.name}
              </Typography>
            </Box>
          </Box>

          {/* Details Card */}
          <Box sx={{ background: C.card, borderRadius: '12px', p: 4, mb: 3 }}>
            {/* Name + type */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
              <Box>
                <Typography sx={{ fontSize: 26, fontWeight: 800, color: C.white, letterSpacing: '-0.02em', mb: 1 }}>
                  {resource.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      background: typeBadge.bg,
                      color: typeBadge.color,
                      fontSize: 10,
                      fontWeight: 700,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {typeBadge.label}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: C.slate400 }}>
                    <LocationOnOutlinedIcon sx={{ fontSize: 16 }} />
                    <Typography sx={{ fontSize: 13 }}>{resource.location}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Stat pills */}
            <Box sx={{ display: 'flex', gap: 3, pb: 3, borderBottom: `1px solid rgba(68,70,83,0.3)`, mb: 3 }}>
              {resource.capacity != null && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '8px', background: C.containerLow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GroupOutlinedIcon sx={{ fontSize: 20, color: C.primary }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 10, color: C.slate500, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Capacity</Typography>
                    <Typography sx={{ fontSize: 14, color: C.white, fontWeight: 700 }}>{resource.capacity} seats</Typography>
                  </Box>
                </Box>
              )}
              {sortedWindows.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '8px', background: C.containerLow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 18, color: C.primary }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 10, color: C.slate500, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Availability</Typography>
                    <Typography sx={{ fontSize: 14, color: C.white, fontWeight: 700 }}>{sortedWindows.length} window{sortedWindows.length !== 1 ? 's' : ''}</Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Description */}
            {resource.description && (
              <Box>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: C.white, mb: 1.5 }}>About this Space</Typography>
                <Typography sx={{ fontSize: 14, color: C.onSurfaceVariant, lineHeight: 1.75 }}>
                  {resource.description}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Availability Schedule */}
          {sortedWindows.length > 0 && (
            <Box sx={{ background: C.card, borderRadius: '12px', p: 4 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: C.white, mb: 3 }}>
                Availability Schedule
              </Typography>
              <Box sx={{ background: C.containerLow, borderRadius: '10px', p: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {sortedWindows.map(w => (
                    <Box
                      key={w.id}
                      sx={{
                        textAlign: 'center',
                        flex: '1 1 80px',
                      }}
                    >
                      <Typography sx={{ fontSize: 10, fontWeight: 700, color: C.slate500, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1 }}>
                        {DAY_SHORT[w.dayOfWeek] ?? w.dayOfWeek}
                      </Typography>
                      <Box
                        sx={{
                          background: 'rgba(16,185,129,0.1)',
                          border: '1px solid rgba(16,185,129,0.2)',
                          borderRadius: '8px',
                          py: 0.75,
                          px: 1,
                        }}
                      >
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#34d399' }}>
                          {w.startTime} – {w.endTime}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </Grid>

        {/* RIGHT COLUMN */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ position: { lg: 'sticky' }, top: { lg: 24 } }}>
            {/* Book / Admin Actions Card */}
            <Box
              sx={{
                background: C.card,
                borderRadius: '12px',
                p: 4,
                border: `1px solid rgba(68,70,83,0.1)`,
                boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
                mb: 3,
              }}
            >
              {isAdmin() ? (
                <>
                  {/* Admin Actions */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryContainer} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <EditOutlinedIcon sx={{ fontSize: 18, color: '#001453' }} />
                    </Box>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: C.white }}>Admin Actions</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box
                      component="button"
                      onClick={() => navigate(`/admin/resources/${resource.id}/edit`)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        width: '100%',
                        py: 1.75,
                        background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryContainer} 100%)`,
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        color: '#001453',
                        fontWeight: 700,
                        fontSize: 14,
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        boxShadow: `0 4px 16px rgba(30,64,175,0.3)`,
                        '&:hover': { opacity: 0.9 },
                        transition: 'opacity 0.2s',
                      }}
                    >
                      <EditOutlinedIcon sx={{ fontSize: 16 }} />
                      Edit Resource
                    </Box>

                    <Box
                      component="button"
                      onClick={() => setStatusDialog(true)}
                      sx={{
                        width: '100%',
                        py: 1.75,
                        background: 'none',
                        border: `1px solid rgba(68,70,83,0.4)`,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        color: C.onSurfaceVariant,
                        fontWeight: 600,
                        fontSize: 14,
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        '&:hover': { background: 'rgba(68,70,83,0.15)', color: C.white },
                        transition: 'all 0.2s',
                      }}
                    >
                      Change Status
                    </Box>
                  </Box>

                  <Box sx={{ mt: 3, p: 2, background: C.containerLow, borderRadius: '8px' }}>
                    <Typography sx={{ fontSize: 11, color: C.slate500 }}>
                      Current status: <span style={{ color: statusBadge.bg, fontWeight: 700 }}>{statusBadge.label}</span>
                    </Typography>
                  </Box>
                </>
              ) : (
                <>
                  {/* Book This Resource */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryContainer} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CalendarTodayOutlinedIcon sx={{ fontSize: 17, color: '#001453' }} />
                    </Box>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: C.white }}>Make a Reservation</Typography>
                  </Box>

                  <Box
                    component="button"
                    onClick={() => isActive && navigate(`/bookings/new?resourceId=${resource.id}`)}
                    disabled={!isActive}
                    sx={{
                      width: '100%',
                      py: 2,
                      background: isActive
                        ? `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryContainer} 100%)`
                        : C.slate700,
                      border: 'none',
                      borderRadius: '10px',
                      cursor: isActive ? 'pointer' : 'not-allowed',
                      color: isActive ? '#001453' : C.slate400,
                      fontWeight: 700,
                      fontSize: 15,
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      boxShadow: isActive ? `0 4px 20px rgba(30,64,175,0.35)` : 'none',
                      '&:hover': { opacity: isActive ? 0.9 : 1 },
                      transition: 'opacity 0.2s, transform 0.15s',
                      '&:active': { transform: isActive ? 'scale(0.98)' : 'none' },
                    }}
                  >
                    {isActive ? 'Book This Resource' : 'Currently Unavailable'}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mt: 3, p: 2, background: C.containerLow, borderRadius: '8px' }}>
                    <Typography sx={{ fontSize: 12, color: C.slate400, lineHeight: 1.6 }}>
                      Bookings require admin approval. You'll be notified within 24 hours of submission.
                    </Typography>
                  </Box>
                </>
              )}
            </Box>

            {/* Quick Info Card */}
            <Box sx={{ background: C.card, borderRadius: '12px', p: 3, border: `1px solid rgba(68,70,83,0.1)` }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.slate500, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 }}>
                Resource Info
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { label: 'Type', value: typeBadge.label },
                  { label: 'Location', value: resource.location },
                  ...(resource.capacity != null ? [{ label: 'Capacity', value: `${resource.capacity} seats` }] : []),
                  { label: 'Status', value: statusBadge.label },
                ].map(row => (
                  <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: 13, color: C.slate500 }}>{row.label}</Typography>
                    <Typography sx={{ fontSize: 13, color: C.onSurface, fontWeight: 600 }}>{row.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Status Change Dialog */}
      <Dialog
        open={statusDialog}
        onClose={() => setStatusDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            background: C.card,
            border: `1px solid rgba(68,70,83,0.3)`,
            borderRadius: '12px',
          },
        }}
      >
        <DialogTitle sx={{ color: C.white, fontWeight: 700 }}>Change Resource Status</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box
            component="select"
            value={newStatus}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewStatus(e.target.value as ResourceStatus)}
            sx={{
              width: '100%',
              background: C.containerLow,
              border: 'none',
              borderRadius: '8px',
              p: 1.5,
              fontSize: 14,
              color: C.onSurface,
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {STATUSES.map(s => (
              <option key={s} value={s} style={{ background: C.card }}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setStatusDialog(false)}
            sx={{ color: C.slate400, fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStatusUpdate}
            disabled={statusLoading}
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryContainer} 100%)`,
              color: '#001453',
              fontWeight: 700,
              '&:hover': { opacity: 0.9 },
            }}
          >
            {statusLoading ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
