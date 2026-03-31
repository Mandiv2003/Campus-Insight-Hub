import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import {
  Box, Typography, TextField, Button, MenuItem, Select,
  FormControl, InputLabel, FormHelperText, CircularProgress,
  Alert, Paper, IconButton,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { createTicket } from '../../api/incidentApi'

const CATEGORIES = [
  'ELECTRICAL', 'PLUMBING', 'IT_EQUIPMENT', 'FURNITURE', 'HVAC', 'SAFETY', 'OTHER',
]
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

interface FormValues {
  title: string
  description: string
  category: string
  priority: string
  locationDetail: string
  contactPhone: string
  contactEmail: string
}

export default function IncidentFormPage() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: '', description: '', category: '', priority: 'MEDIUM',
      locationDetail: '', contactPhone: '', contactEmail: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    setSaving(true)
    setError(null)
    try {
      const res = await createTicket(values)
      navigate(`/tickets/${res.data.data.id}`)
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to submit ticket')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box p={3} maxWidth={700} mx="auto">
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
        <Typography variant="h5" fontWeight={700}>Report an Incident</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} display="flex" flexDirection="column" gap={2.5}>
          <TextField
            label="Title" fullWidth required
            {...register('title', { required: 'Title is required' })}
            error={!!errors.title} helperText={errors.title?.message}
          />

          <TextField
            label="Description" fullWidth required multiline minRows={4}
            {...register('description', { required: 'Description is required' })}
            error={!!errors.description} helperText={errors.description?.message}
          />

          <Box display="flex" gap={2}>
            <Controller
              name="category" control={control}
              rules={{ required: 'Category is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.category} required>
                  <InputLabel>Category</InputLabel>
                  <Select {...field} label="Category">
                    {CATEGORIES.map((c) => (
                      <MenuItem key={c} value={c}>{c.replace('_', ' ')}</MenuItem>
                    ))}
                  </Select>
                  {errors.category && <FormHelperText>{errors.category.message}</FormHelperText>}
                </FormControl>
              )}
            />
            <Controller
              name="priority" control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select {...field} label="Priority">
                    {PRIORITIES.map((p) => (
                      <MenuItem key={p} value={p}>{p}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Box>

          <TextField
            label="Location Detail" fullWidth
            placeholder="e.g. Block B, Room 203"
            {...register('locationDetail')}
          />

          <Box display="flex" gap={2}>
            <TextField label="Contact Phone" fullWidth {...register('contactPhone')} />
            <TextField label="Contact Email" fullWidth {...register('contactEmail')} />
          </Box>

          <Button
            type="submit" variant="contained" size="large"
            disabled={saving}
            endIcon={saving ? <CircularProgress size={16} /> : null}
          >
            {saving ? 'Submitting...' : 'Submit Ticket'}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}
