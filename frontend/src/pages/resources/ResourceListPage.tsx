import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, CircularProgress, Alert, Grid } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { getResources } from '../../api/resourceApi'
import type { Resource, ResourceType, ResourceStatus } from '../../types/resource'
import { useAuth } from '../../context/AuthContext'
import { resourceImage } from '../../assets/images'

const C = {
  bg: '#0b1326',
  card: '#171f33',
  cardHover: '#222a3d',
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
  slate600: '#475569',
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

const TYPES: ResourceType[] = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT']
const STATUSES: ResourceStatus[] = ['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE', 'ARCHIVED']

const inputSx = {
  background: C.card,
  border: 'none',
  outline: 'none',
  borderRadius: '8px',
  padding: '10px 14px',
  fontSize: '14px',
  color: C.onSurfaceVariant,
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  appearance: 'none' as const,
  WebkitAppearance: 'none' as const,
}

export default function ResourceListPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = {}
      if (typeFilter)   params.type = typeFilter
      if (statusFilter) params.status = statusFilter
      const res = await getResources(params)
      const raw = res.data?.data?.content ?? res.data?.data
      setResources(Array.isArray(raw) ? raw : [])
    } catch {
      setError('Failed to load resources.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [typeFilter, statusFilter])

  const q = search.trim().toLowerCase()
  const filtered = q
    ? resources.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.location?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.type.toLowerCase().replace(/_/g, ' ').includes(q)
      )
    : resources

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('')
    setStatusFilter('')
  }

  return (
    <Box sx={{ minHeight: '100vh', background: C.bg, px: { xs: 3, md: 5 }, py: 5 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 5 }}>
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 28, md: 36 },
              fontWeight: 800,
              color: C.white,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              mb: 1,
            }}
          >
            Campus Resources
          </Typography>
          <Typography sx={{ color: C.slate400, fontSize: 16, fontWeight: 500, maxWidth: 560 }}>
            Browse and book available facilities and equipment across the university ecosystem.
          </Typography>
        </Box>
        {isAdmin() && (
          <Box
            component="button"
            onClick={() => navigate('/admin/resources/new')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryContainer} 100%)`,
              border: 'none',
              borderRadius: '10px',
              px: 3,
              py: 1.5,
              cursor: 'pointer',
              color: C.white,
              fontWeight: 700,
              fontSize: 14,
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              flexShrink: 0,
              ml: 3,
              '&:hover': { opacity: 0.9 },
            }}
          >
            <AddOutlinedIcon sx={{ fontSize: 18 }} />
            Add Resource
          </Box>
        )}
      </Box>

      {/* Filter Bar */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          mb: 5,
          p: 1.5,
          background: 'rgba(19,27,46,0.5)',
          borderRadius: '12px',
        }}
      >
        {/* Search */}
        <Box sx={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <SearchIcon
            sx={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: C.slate500,
              fontSize: 18,
            }}
          />
          <Box
            component="input"
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            sx={{ ...inputSx, width: '100%', pl: '36px', boxSizing: 'border-box' }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {/* Type Select */}
          <Box
            component="select"
            value={typeFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value)}
            sx={{ ...inputSx, minWidth: 140, cursor: 'pointer' }}
          >
            <option value="">All Types</option>
            {TYPES.map(t => (
              <option key={t} value={t} style={{ background: C.card }}>
                {TYPE_BADGE[t].label}
              </option>
            ))}
          </Box>

          {/* Status Select */}
          <Box
            component="select"
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
            sx={{ ...inputSx, minWidth: 130, cursor: 'pointer' }}
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => (
              <option key={s} value={s} style={{ background: C.card }}>
                {STATUS_BADGE[s].label}
              </option>
            ))}
          </Box>

          {/* Clear Filters */}
          <Box
            component="button"
            onClick={clearFilters}
            sx={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: C.primary,
              fontWeight: 600,
              fontSize: 14,
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              px: 2,
              py: 1,
              borderRadius: '8px',
              '&:hover': { background: 'rgba(184,196,255,0.08)' },
            }}
          >
            Clear Filters
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, background: '#2d1b1b', color: '#fca5a5', '& .MuiAlert-icon': { color: '#f87171' } }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: C.primary }} />
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 12 }}>
          <Typography sx={{ color: C.onSurfaceVariant, fontSize: 18, fontWeight: 600, mb: 1 }}>
            No resources found
          </Typography>
          <Typography sx={{ color: C.slate500, fontSize: 14 }}>
            Try adjusting your filters{isAdmin() ? ', or add a new resource' : ''}.
          </Typography>
          {isAdmin() && (
            <Box
              component="button"
              onClick={() => navigate('/admin/resources/new')}
              sx={{
                mt: 3,
                background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryContainer} 100%)`,
                border: 'none',
                borderRadius: '10px',
                px: 4,
                py: 1.5,
                cursor: 'pointer',
                color: C.white,
                fontWeight: 700,
                fontSize: 14,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              Add Resource
            </Box>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filtered.map(r => {
            const grad = TYPE_GRADIENTS[r.type] ?? TYPE_GRADIENTS.LECTURE_HALL
            const typeBadge = TYPE_BADGE[r.type] ?? TYPE_BADGE.LECTURE_HALL
            const statusBadge = STATUS_BADGE[r.status] ?? STATUS_BADGE.ACTIVE
            const isActive = r.status === 'ACTIVE'

            return (
              <Grid key={r.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Box
                  sx={{
                    background: C.card,
                    border: `1px solid rgba(68,70,83,0.1)`,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    transition: 'box-shadow 0.4s ease, transform 0.2s ease',
                    '&:hover': {
                      boxShadow: `0 24px 48px -12px rgba(30,64,175,0.2)`,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {/* Card Header — Gradient Banner */}
                  <Box
                    sx={{
                      height: 160,
                      background: `linear-gradient(135deg, ${grad.from} 0%, ${grad.to} 100%)`,
                      position: 'relative',
                      flexShrink: 0,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      component="img"
                      src={resourceImage(r.type)}
                      alt=""
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.2,
                        mixBlendMode: 'luminosity',
                      }}
                    />
                    {/* Status Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        background: statusBadge.bg,
                        color: statusBadge.color,
                        fontSize: 10,
                        fontWeight: 700,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '9999px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      {r.status === 'MAINTENANCE' && (
                        <Box
                          component="span"
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: statusBadge.color,
                            display: 'inline-block',
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                              '0%, 100%': { opacity: 1 },
                              '50%': { opacity: 0.4 },
                            },
                          }}
                        />
                      )}
                      {statusBadge.label}
                    </Box>
                  </Box>

                  {/* Card Body */}
                  <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography
                        sx={{
                          fontSize: 17,
                          fontWeight: 700,
                          color: C.white,
                          lineHeight: 1.3,
                          flex: 1,
                          mr: 1,
                          transition: 'color 0.2s',
                        }}
                      >
                        {r.name}
                      </Typography>
                      <Box
                        sx={{
                          background: typeBadge.bg,
                          color: typeBadge.color,
                          fontSize: 10,
                          fontWeight: 700,
                          px: 1.25,
                          py: 0.5,
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          flexShrink: 0,
                        }}
                      >
                        {typeBadge.label}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mb: 3, flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: C.slate400 }}>
                        <LocationOnOutlinedIcon sx={{ fontSize: 16, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 13 }}>{r.location}</Typography>
                      </Box>
                      {r.capacity != null ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: C.slate400 }}>
                          <GroupOutlinedIcon sx={{ fontSize: 16, flexShrink: 0 }} />
                          <Typography sx={{ fontSize: 13 }}>{r.capacity} seats</Typography>
                        </Box>
                      ) : r.description ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: C.slate500 }}>
                          <Typography sx={{ fontSize: 13, fontStyle: 'italic' }}>{r.description.slice(0, 60)}{r.description.length > 60 ? '…' : ''}</Typography>
                        </Box>
                      ) : null}
                    </Box>

                    {/* Card Footer Buttons */}
                    <Box sx={{ display: 'flex', gap: 1.5, mt: 'auto' }}>
                      <Box
                        component="button"
                        onClick={() => navigate(`/resources/${r.id}`)}
                        sx={{
                          flex: 1,
                          py: 1,
                          fontSize: 13,
                          fontWeight: 700,
                          color: C.primary,
                          background: 'none',
                          border: `1px solid rgba(68,70,83,0.3)`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontFamily: 'Plus Jakarta Sans, sans-serif',
                          transition: 'background 0.2s',
                          '&:hover': { background: 'rgba(184,196,255,0.06)' },
                        }}
                      >
                        Details
                      </Box>
                      <Box
                        component="button"
                        onClick={() => isActive && navigate(`/bookings/new?resourceId=${r.id}`)}
                        disabled={!isActive}
                        sx={{
                          flex: 1.5,
                          py: 1,
                          fontSize: 13,
                          fontWeight: 700,
                          color: isActive ? C.white : C.slate400,
                          background: isActive
                            ? `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryContainer} 100%)`
                            : C.slate700,
                          border: 'none',
                          borderRadius: '8px',
                          cursor: isActive ? 'pointer' : 'not-allowed',
                          fontFamily: 'Plus Jakarta Sans, sans-serif',
                          boxShadow: isActive ? `0 4px 16px rgba(30,64,175,0.25)` : 'none',
                          transition: 'opacity 0.2s',
                          '&:hover': { opacity: isActive ? 0.9 : 1 },
                        }}
                      >
                        {isActive ? 'Book Now' : 'Unavailable'}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            )
          })}
        </Grid>
      )}
    </Box>
  )
}
