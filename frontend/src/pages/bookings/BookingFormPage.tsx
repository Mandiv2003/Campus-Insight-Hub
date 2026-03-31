import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Box, Typography, TextField, Button, CircularProgress, Alert,
  Paper, IconButton,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { createBooking, getResourceAvailability } from '../../api/bookingApi'
import { getResource } from '../../api/resourceApi'
import ConflictWarning from './components/ConflictWarning'
import type { TimeSlot } from '../../types/booking'

interface FormValues {
  title: string
  purpose: string
  expectedAttendees: string
  startDatetime: string
  endDatetime: string
}

export default function BookingFormPage() {
  const [searchParams] = useSearchParams()
  const resourceId = searchParams.get('resourceId') ?? ''
  const [resourceName, setResourceName] = useState<string>('')
  const [conflicts, setConflicts] = useState<TimeSlot[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: '', purpose: '', expectedAttendees: '',
      startDatetime: '', endDatetime: '',
    },
  })

  const watchStart = watch('startDatetime')
  const watchEnd   = watch('endDatetime')

  // Load resource name
  useEffect(() => {
    if (resourceId) {
      getResource(resourceId)
        .then((res) => setResourceName(res.data.data.name))
        .catch(() => navigate('/resources', { replace: true }))
    }
  }, [resourceId])

  // Pre-check for conflicts whenever start/end change
  useEffect(() => {
    if (resourceId && watchStart && watchEnd && watchStart < watchEnd) {
      const date = watchStart.split('T')[0]
      getResourceAvailability(resourceId, date)
        .then((res) => {
          const slots: TimeSlot[] = res.data.data
          const proposed = { start: new Date(watchStart), end: new Date(watchEnd) }
          const overlapping = slots.filter(
            (s) => new Date(s.startDatetime) < proposed.end && new Date(s.endDatetime) > proposed.start
          )
          setConflicts(overlapping)
        })
        .catch(() => setConflicts([]))
    } else {
      setConflicts([])
    }
  }, [resourceId, watchStart, watchEnd])

  const onSubmit = async (values: FormValues) => {
    setSaving(true)
    setError(null)
    try {
      await createBooking({
        resourceId,
        title: values.title,
        purpose: values.purpose,
        expectedAttendees: values.expectedAttendees ? parseInt(values.expectedAttendees) : null,
        startDatetime: values.startDatetime,
        endDatetime: values.endDatetime,
      })
      navigate('/bookings')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Failed to create booking. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box p={3} maxWidth={600} mx="auto">
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <IconButton onClick={() => navigate(-1)} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>New Booking</Typography>
      </Box>

      {resourceName && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'action.hover' }}>
          <Typography variant="body2" color="text.secondary">Booking for</Typography>
          <Typography fontWeight={700}>{resourceName}</Typography>
        </Paper>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            {...register('title', { required: 'Title is required' })}
            label="Booking Title" fullWidth
            error={!!errors.title} helperText={errors.title?.message}
          />

          <TextField
            {...register('purpose', { required: 'Purpose is required' })}
            label="Purpose" fullWidth multiline rows={3}
            error={!!errors.purpose} helperText={errors.purpose?.message}
          />

          <TextField
            {...register('expectedAttendees', { min: { value: 1, message: 'Must be at least 1' } })}
            label="Expected Attendees" type="number" fullWidth
            placeholder="Optional"
            error={!!errors.expectedAttendees} helperText={errors.expectedAttendees?.message}
          />

          <TextField
            {...register('startDatetime', { required: 'Start time is required' })}
            label="Start" type="datetime-local" fullWidth
            InputLabelProps={{ shrink: true }}
            error={!!errors.startDatetime} helperText={errors.startDatetime?.message}
          />

          <TextField
            {...register('endDatetime', {
              required: 'End time is required',
              validate: (v) => !watchStart || v > watchStart || 'End must be after start',
            })}
            label="End" type="datetime-local" fullWidth
            InputLabelProps={{ shrink: true }}
            error={!!errors.endDatetime} helperText={errors.endDatetime?.message}
          />

          <ConflictWarning conflicts={conflicts} />

          <Box display="flex" gap={2} justifyContent="flex-end" mt={1}>
            <Button variant="outlined" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? <CircularProgress size={20} /> : 'Submit Booking'}
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  )
}
