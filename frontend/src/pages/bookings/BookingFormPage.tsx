import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Box, Button, TextField, Grid, CircularProgress, Alert, Typography, Autocomplete, Chip,
} from '@mui/material'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import { createBooking } from '../../api/bookingApi'
import { getResources } from '../../api/resourceApi'
import type { Resource, ResourceType } from '../../types/resource'

const COLORS = {
  surface: '#0b1326',
  card: '#171f33',
  cardLow: '#131b2e',
  surfaceHigh: '#222a3d',
  primary: '#b8c4ff',
  primaryContainer: '#1e40af',
  onSurface: '#dae2fd',
  onSurfaceVariant: '#c4c5d5',
  outlineVariant: '#444653',
  tertiary: '#ffb59a',
}

const RESOURCE_TYPE_COLORS: Record<ResourceType, { bg: string; color: string }> = {
  LECTURE_HALL: { bg: '#1e40af30', color: '#93c5fd' },
  LAB:          { bg: '#15803d30', color: '#86efac' },
  MEETING_ROOM: { bg: '#7c3aed30', color: '#c4b5fd' },
  EQUIPMENT:    { bg: '#b4530a30', color: '#fdba74' },
}

const inputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: COLORS.cardLow,
    color: COLORS.onSurface,
    borderRadius: '8px',
    '& fieldset': { borderColor: `${COLORS.outlineVariant}80` },
    '&:hover fieldset': { borderColor: COLORS.outlineVariant },
    '&.Mui-focused fieldset': { borderColor: COLORS.primary },
  },
  '& .MuiInputLabel-root': { color: COLORS.onSurfaceVariant },
  '& .MuiInputLabel-root.Mui-focused': { color: COLORS.primary },
  '& .MuiInputBase-input': { color: COLORS.onSurface },
  '& .MuiFormHelperText-root': { color: '#f87171' },
}

interface FormData {
  title: string
  purpose: string
  expectedAttendees: number | null
  startDatetime: string
  endDatetime: string
}

export default function BookingFormPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedResourceId = searchParams.get('resourceId')

  const [resources, setResources] = useState<Resource[]>([])
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [resourcesLoading, setResourcesLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ mode: 'onBlur' })

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getResources({ status: 'ACTIVE' })
        const raw = res.data?.data?.content ?? res.data?.data
        const list = Array.isArray(raw) ? raw : []
        setResources(list)
        if (preselectedResourceId) {
          const found = list.find((r: Resource) => r.id === preselectedResourceId) ?? null
          setSelectedResource(found)
        }
      } catch {
        setError('Failed to load resources.')
      } finally {
        setResourcesLoading(false)
      }
    }
    load()
  }, [])

  const onSubmit = handleSubmit(async (data) => {
    if (!selectedResource) { setError('Please select a resource.'); return }
    setSaving(true)
    setError(null)
    try {
      const res = await createBooking({
        ...data,
        resourceId: selectedResource.id,
        expectedAttendees: data.expectedAttendees || null,
      })
      navigate(`/bookings/${res.data?.data?.id}`)
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to create booking.')
    } finally {
      setSaving(false)
    }
  })

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORS.surface, p: { xs: 2, md: 4 } }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackOutlinedIcon />}
        onClick={() => navigate('/bookings')}
        sx={{
          color: COLORS.onSurfaceVariant,
          textTransform: 'none',
          fontWeight: 600,
          mb: 3,
          borderRadius: '8px',
          '&:hover': { bgcolor: `rgba(255,255,255,0.06)`, color: COLORS.onSurface },
        }}
      >
        Back to Bookings
      </Button>

      {/* Page heading */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          New Booking
        </Typography>
        <Typography sx={{ color: COLORS.onSurfaceVariant, mt: 0.75, fontSize: 14 }}>
          Request a campus resource for your event or session.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, bgcolor: '#ef444420', color: '#f87171', border: '1px solid #ef444430', borderRadius: '8px', '& .MuiAlert-icon': { color: '#f87171' } }}>
          {error}
        </Alert>
      )}

      {/* Form card */}
      <Box
        sx={{
          bgcolor: COLORS.card,
          borderRadius: '12px',
          p: { xs: 3, md: 4 },
          maxWidth: 720,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* Resource selector */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: COLORS.onSurfaceVariant, mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Resource *
            </Typography>
            {resourcesLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                <CircularProgress size={18} sx={{ color: COLORS.primary }} />
                <Typography sx={{ fontSize: 13, color: COLORS.onSurfaceVariant }}>Loading resources…</Typography>
              </Box>
            ) : (
              <Autocomplete
                options={resources}
                getOptionLabel={r => `${r.name} — ${r.location}`}
                value={selectedResource}
                onChange={(_, v) => setSelectedResource(v)}
                renderOption={(props, r) => {
                  const typeStyle = RESOURCE_TYPE_COLORS[r.type] ?? { bg: '#44465320', color: COLORS.onSurfaceVariant }
                  return (
                    <Box
                      component="li"
                      {...props}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                        px: 2,
                        py: 1.5,
                        '&:hover': { bgcolor: COLORS.surfaceHigh },
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 14, color: COLORS.onSurface }}>{r.name}</Typography>
                        <Typography sx={{ fontSize: 12, color: COLORS.onSurfaceVariant }}>{r.location}</Typography>
                      </Box>
                      <Chip
                        label={r.type.replace(/_/g, ' ')}
                        size="small"
                        sx={{
                          bgcolor: typeStyle.bg,
                          color: typeStyle.color,
                          fontSize: 10,
                          fontWeight: 700,
                          height: 22,
                          border: 'none',
                        }}
                      />
                    </Box>
                  )
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select a resource…"
                    error={!selectedResource && saving}
                    helperText={!selectedResource && saving ? 'Please select a resource' : undefined}
                    sx={{
                      ...inputSx,
                      '& .MuiAutocomplete-clearIndicator': { color: COLORS.onSurfaceVariant },
                      '& .MuiAutocomplete-popupIndicator': { color: COLORS.onSurfaceVariant },
                    }}
                  />
                )}
                PaperComponent={({ children, ...rest }) => (
                  <Box
                    {...rest}
                    sx={{
                      bgcolor: COLORS.card,
                      border: `1px solid ${COLORS.outlineVariant}60`,
                      borderRadius: '8px',
                      mt: 0.5,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                      overflow: 'hidden',
                    }}
                  >
                    {children}
                  </Box>
                )}
              />
            )}
          </Box>

          {/* Title */}
          <TextField
            label="Booking title"
            fullWidth
            {...register('title', { required: 'Required' })}
            error={!!errors.title}
            helperText={errors.title?.message}
            sx={inputSx}
          />

          {/* Purpose */}
          <TextField
            label="Purpose"
            multiline
            rows={3}
            fullWidth
            {...register('purpose', { required: 'Required' })}
            error={!!errors.purpose}
            helperText={errors.purpose?.message}
            sx={inputSx}
          />

          {/* Expected attendees */}
          <TextField
            label="Expected attendees"
            type="number"
            fullWidth
            {...register('expectedAttendees', { valueAsNumber: true })}
            sx={inputSx}
          />

          {/* Date/time row */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Start date & time"
                type="datetime-local"
                fullWidth
                InputLabelProps={{ shrink: true }}
                {...register('startDatetime', { required: 'Required' })}
                error={!!errors.startDatetime}
                helperText={errors.startDatetime?.message}
                sx={{
                  ...inputSx,
                  '& input[type="datetime-local"]::-webkit-calendar-picker-indicator': { filter: 'invert(0.7)' },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="End date & time"
                type="datetime-local"
                fullWidth
                InputLabelProps={{ shrink: true }}
                {...register('endDatetime', { required: 'Required' })}
                error={!!errors.endDatetime}
                helperText={errors.endDatetime?.message}
                sx={{
                  ...inputSx,
                  '& input[type="datetime-local"]::-webkit-calendar-picker-indicator': { filter: 'invert(0.7)' },
                }}
              />
            </Grid>
          </Grid>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              type="submit"
              disabled={saving}
              sx={{
                px: 4,
                py: 1.25,
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryContainer})`,
                color: '#001453',
                fontWeight: 700,
                fontSize: 14,
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: `0 4px 16px ${COLORS.primaryContainer}33`,
                '&:hover': { background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryContainer})`, transform: 'scale(1.01)' },
                '&:disabled': { background: `${COLORS.primaryContainer}50`, color: '#001453aa' },
              }}
            >
              {saving ? 'Submitting…' : 'Submit Booking'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/bookings')}
              sx={{
                px: 3,
                py: 1.25,
                color: COLORS.onSurfaceVariant,
                borderColor: `${COLORS.outlineVariant}80`,
                fontWeight: 600,
                fontSize: 14,
                borderRadius: '8px',
                textTransform: 'none',
                '&:hover': { borderColor: COLORS.outlineVariant, bgcolor: `rgba(255,255,255,0.04)` },
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
