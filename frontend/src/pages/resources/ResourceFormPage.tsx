import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Box, Typography, Grid, CircularProgress, Alert, IconButton } from '@mui/material'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import {
  createResource, updateResource, getResource,
  addAvailabilityWindow, deleteAvailabilityWindow,
} from '../../api/resourceApi'
import type { Resource, ResourceType, AvailabilityWindow } from '../../types/resource'

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
  slate600: '#475569',
  slate700: '#334155',
  white: '#ffffff',
  error: '#f87171',
}

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']
const TYPES: ResourceType[] = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT']

const TYPE_LABELS: Record<ResourceType, string> = {
  LECTURE_HALL: 'Lecture Hall',
  LAB: 'Lab',
  MEETING_ROOM: 'Meeting Room',
  EQUIPMENT: 'Equipment',
}

interface FormData {
  name: string
  type: ResourceType
  location: string
  capacity: number | null
  description: string
  imageUrl: string
}

interface WindowForm { dayOfWeek: string; startTime: string; endTime: string }

const fieldSx = {
  width: '100%',
  background: C.containerLow,
  border: `1px solid transparent`,
  borderRadius: '8px',
  padding: '12px 14px',
  fontSize: '14px',
  color: C.onSurface,
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box' as const,
  '&:focus': {
    borderColor: C.primary,
  },
  '&::placeholder': {
    color: C.slate600,
  },
}

const selectSx = {
  ...fieldSx,
  cursor: 'pointer',
  appearance: 'none' as const,
  WebkitAppearance: 'none' as const,
}

const labelSx = {
  fontSize: 11,
  fontWeight: 700,
  color: C.slate500,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  mb: 1,
  display: 'block',
}

export default function ResourceFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id
  const [resource, setResource] = useState<Resource | null>(null)
  const [pageLoading, setPageLoading] = useState(isEdit)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [windows, setWindows] = useState<AvailabilityWindow[]>([])
  const [newWindow, setNewWindow] = useState<WindowForm>({ dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '17:00' })
  const [addingWindow, setAddingWindow] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ mode: 'onBlur' })

  useEffect(() => {
    if (!isEdit) return
    const load = async () => {
      try {
        const res = await getResource(id!)
        const r: Resource = res.data?.data
        setResource(r)
        setWindows(r.availabilityWindows ?? [])
        reset({
          name: r.name,
          type: r.type,
          location: r.location,
          capacity: r.capacity,
          description: r.description ?? '',
          imageUrl: r.imageUrl ?? '',
        })
      } catch {
        setError('Failed to load resource.')
      } finally {
        setPageLoading(false)
      }
    }
    load()
  }, [id])

  const onSubmit = handleSubmit(async (data) => {
    setSaving(true)
    setError(null)
    try {
      if (isEdit) {
        await updateResource(id!, data)
        navigate(`/resources/${id}`)
      } else {
        const res = await createResource(data)
        const newId = res.data?.data?.id
        navigate(`/resources/${newId}`)
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to save resource.')
    } finally {
      setSaving(false)
    }
  })

  const handleAddWindow = async () => {
    if (!resource) return
    setAddingWindow(true)
    try {
      const res = await addAvailabilityWindow(resource.id, newWindow)
      setWindows(prev => [...prev, res.data?.data])
    } catch {
      setError('Failed to add availability window.')
    } finally {
      setAddingWindow(false)
    }
  }

  const handleDeleteWindow = async (windowId: string) => {
    if (!resource) return
    try {
      await deleteAvailabilityWindow(resource.id, windowId)
      setWindows(prev => prev.filter(w => w.id !== windowId))
    } catch {
      setError('Failed to remove window.')
    }
  }

  if (pageLoading) {
    return (
      <Box sx={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: C.primary }} />
      </Box>
    )
  }

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

      {/* Page Heading */}
      <Box sx={{ mb: 5 }}>
        <Typography
          sx={{
            fontSize: { xs: 26, md: 32 },
            fontWeight: 800,
            color: C.white,
            letterSpacing: '-0.02em',
            mb: 0.5,
          }}
        >
          {isEdit ? 'Edit Resource' : 'Create New Resource'}
        </Typography>
        <Typography sx={{ color: C.slate400, fontSize: 15 }}>
          {isEdit ? 'Update the details for this campus resource.' : 'Add a new facility or equipment to the campus catalogue.'}
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, background: '#2d1b1b', color: '#fca5a5', '& .MuiAlert-icon': { color: '#f87171' } }}
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* FORM CARD */}
        <Grid size={{ xs: 12, md: isEdit ? 7 : 12 }}>
          <Box sx={{ background: C.card, borderRadius: '12px', p: 4, border: `1px solid rgba(68,70,83,0.1)` }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: C.white, mb: 4 }}>
              Resource Details
            </Typography>

            <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Name */}
              <Box>
                <Typography component="label" sx={labelSx}>Resource Name</Typography>
                <Box
                  component="input"
                  type="text"
                  placeholder="e.g. Main Auditorium"
                  {...register('name', { required: 'Name is required' })}
                  sx={{
                    ...fieldSx,
                    borderColor: errors.name ? C.error : 'transparent',
                  }}
                />
                {errors.name && (
                  <Typography sx={{ fontSize: 12, color: C.error, mt: 0.5 }}>{errors.name.message}</Typography>
                )}
              </Box>

              {/* Type */}
              <Box>
                <Typography component="label" sx={labelSx}>Resource Type</Typography>
                <Box
                  component="select"
                  {...register('type', { required: 'Type is required' })}
                  sx={{
                    ...selectSx,
                    borderColor: errors.type ? C.error : 'transparent',
                  }}
                >
                  <option value="" style={{ background: C.card }}>Select type…</option>
                  {TYPES.map(t => (
                    <option key={t} value={t} style={{ background: C.card }}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </Box>
                {errors.type && (
                  <Typography sx={{ fontSize: 12, color: C.error, mt: 0.5 }}>{errors.type.message}</Typography>
                )}
              </Box>

              {/* Capacity + Location row */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography component="label" sx={labelSx}>Capacity (seats)</Typography>
                  <Box
                    component="input"
                    type="number"
                    placeholder="e.g. 300"
                    {...register('capacity', { valueAsNumber: true })}
                    sx={fieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography component="label" sx={labelSx}>Location</Typography>
                  <Box
                    component="input"
                    type="text"
                    placeholder="e.g. Block A, Floor 1"
                    {...register('location', { required: 'Location is required' })}
                    sx={{
                      ...fieldSx,
                      borderColor: errors.location ? C.error : 'transparent',
                    }}
                  />
                  {errors.location && (
                    <Typography sx={{ fontSize: 12, color: C.error, mt: 0.5 }}>{errors.location.message}</Typography>
                  )}
                </Grid>
              </Grid>

              {/* Description */}
              <Box>
                <Typography component="label" sx={labelSx}>Description</Typography>
                <Box
                  component="textarea"
                  rows={4}
                  placeholder="Briefly describe this resource, its features and ideal use cases..."
                  {...register('description')}
                  sx={{
                    ...fieldSx,
                    resize: 'vertical',
                    lineHeight: 1.6,
                  }}
                />
              </Box>

              {/* Image URL */}
              <Box>
                <Typography component="label" sx={labelSx}>Image URL (optional)</Typography>
                <Box
                  component="input"
                  type="url"
                  placeholder="https://..."
                  {...register('imageUrl')}
                  sx={fieldSx}
                />
              </Box>

              {/* Submit / Cancel */}
              <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
                <Box
                  component="button"
                  type="submit"
                  disabled={saving}
                  sx={{
                    flex: 1,
                    py: 1.75,
                    background: saving
                      ? C.slate700
                      : `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryContainer} 100%)`,
                    border: 'none',
                    borderRadius: '10px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    color: saving ? C.slate400 : '#001453',
                    fontWeight: 700,
                    fontSize: 15,
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    boxShadow: saving ? 'none' : `0 4px 16px rgba(30,64,175,0.3)`,
                    transition: 'opacity 0.2s',
                    '&:hover': { opacity: saving ? 1 : 0.9 },
                  }}
                >
                  {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Resource'}
                </Box>
                <Box
                  component="button"
                  type="button"
                  onClick={() => navigate('/resources')}
                  sx={{
                    flex: 1,
                    py: 1.75,
                    background: 'none',
                    border: `1px solid rgba(68,70,83,0.4)`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    color: C.onSurfaceVariant,
                    fontWeight: 600,
                    fontSize: 15,
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    '&:hover': { background: 'rgba(68,70,83,0.12)', color: C.white },
                    transition: 'all 0.2s',
                  }}
                >
                  Cancel
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* AVAILABILITY WINDOWS — edit mode only */}
        {isEdit && (
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ background: C.card, borderRadius: '12px', p: 4, border: `1px solid rgba(68,70,83,0.1)` }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: C.white, mb: 3 }}>
                Availability Windows
              </Typography>

              {/* Existing windows */}
              {windows.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                  {[...windows]
                    .sort((a, b) => DAYS.indexOf(a.dayOfWeek) - DAYS.indexOf(b.dayOfWeek))
                    .map(w => (
                      <Box
                        key={w.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          py: 1.25,
                          px: 2,
                          background: C.containerLow,
                          borderRadius: '8px',
                          border: `1px solid rgba(68,70,83,0.15)`,
                        }}
                      >
                        <Typography sx={{ flex: 1, fontSize: 13, fontWeight: 700, color: C.onSurface }}>
                          {w.dayOfWeek}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: C.onSurfaceVariant }}>
                          {w.startTime} – {w.endTime}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteWindow(w.id)}
                          sx={{
                            color: C.error,
                            '&:hover': { background: 'rgba(239,68,68,0.1)' },
                            ml: 0.5,
                          }}
                        >
                          <DeleteOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                </Box>
              ) : (
                <Box sx={{ mb: 3, p: 2, background: C.containerLow, borderRadius: '8px' }}>
                  <Typography sx={{ fontSize: 13, color: C.slate500, textAlign: 'center' }}>
                    No availability windows configured yet.
                  </Typography>
                </Box>
              )}

              {/* Divider */}
              <Box sx={{ height: 1, background: `rgba(68,70,83,0.3)`, mb: 3 }} />

              {/* Add new window */}
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.slate500, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 }}>
                Add Window
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography component="label" sx={labelSx}>Day of Week</Typography>
                  <Box
                    component="select"
                    value={newWindow.dayOfWeek}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setNewWindow(w => ({ ...w, dayOfWeek: e.target.value }))
                    }
                    sx={selectSx}
                  >
                    {DAYS.map(d => (
                      <option key={d} value={d} style={{ background: C.card }}>{d}</option>
                    ))}
                  </Box>
                </Box>

                <Grid container spacing={1.5}>
                  <Grid size={6}>
                    <Typography component="label" sx={labelSx}>Start Time</Typography>
                    <Box
                      component="input"
                      type="time"
                      value={newWindow.startTime}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewWindow(w => ({ ...w, startTime: e.target.value }))
                      }
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid size={6}>
                    <Typography component="label" sx={labelSx}>End Time</Typography>
                    <Box
                      component="input"
                      type="time"
                      value={newWindow.endTime}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewWindow(w => ({ ...w, endTime: e.target.value }))
                      }
                      sx={fieldSx}
                    />
                  </Grid>
                </Grid>

                <Box
                  component="button"
                  type="button"
                  onClick={handleAddWindow}
                  disabled={addingWindow}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    width: '100%',
                    py: 1.5,
                    background: 'none',
                    border: `1px solid rgba(184,196,255,0.3)`,
                    borderRadius: '8px',
                    cursor: addingWindow ? 'not-allowed' : 'pointer',
                    color: C.primary,
                    fontWeight: 600,
                    fontSize: 13,
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    '&:hover': { background: 'rgba(184,196,255,0.08)' },
                    transition: 'background 0.2s',
                    opacity: addingWindow ? 0.6 : 1,
                  }}
                >
                  <AddOutlinedIcon sx={{ fontSize: 16 }} />
                  {addingWindow ? 'Adding…' : 'Add Window'}
                </Box>
              </Box>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
