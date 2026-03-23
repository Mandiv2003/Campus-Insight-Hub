import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import {
  Box, Typography, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, Grid, IconButton, Paper, Divider,
  CircularProgress, Alert,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { getResource, createResource, updateResource } from '../../api/resourceApi'

interface WindowField {
  dayOfWeek: string
  startTime: string
  endTime: string
}

interface FormValues {
  name: string
  type: string
  capacity: string
  location: string
  description: string
  imageUrl: string
  availabilityWindows: WindowField[]
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

export default function ResourceFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: '', type: 'LECTURE_HALL', capacity: '',
      location: '', description: '', imageUrl: '',
      availabilityWindows: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'availabilityWindows',
  })

  useEffect(() => {
    if (isEdit && id) {
      getResource(id)
        .then((res) => {
          const r = res.data.data
          reset({
            name: r.name,
            type: r.type,
            capacity: r.capacity?.toString() ?? '',
            location: r.location,
            description: r.description ?? '',
            imageUrl: r.imageUrl ?? '',
            availabilityWindows: r.availabilityWindows.map((w: WindowField) => ({
              dayOfWeek: w.dayOfWeek,
              startTime: w.startTime,
              endTime: w.endTime,
            })),
          })
        })
        .finally(() => setLoading(false))
    }
  }, [id])

  const onSubmit = async (values: FormValues) => {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: values.name,
        type: values.type,
        capacity: values.capacity ? parseInt(values.capacity) : null,
        location: values.location,
        description: values.description || null,
        imageUrl: values.imageUrl || null,
        availabilityWindows: values.availabilityWindows,
      }

      if (isEdit && id) {
        await updateResource(id, payload)
      } else {
        await createResource(payload)
      }
      navigate('/resources')
    } catch {
      setError('Failed to save resource. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
  }

  return (
    <Box p={3} maxWidth={700} mx="auto">
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <IconButton onClick={() => navigate('/resources')} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          {isEdit ? 'Edit Resource' : 'Add New Resource'}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <TextField
              {...register('name', { required: 'Name is required' })}
              label="Resource Name" fullWidth
              error={!!errors.name} helperText={errors.name?.message}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Controller
                name="type" control={control}
                render={({ field }) => (
                  <Select {...field} label="Type">
                    <MenuItem value="LECTURE_HALL">Lecture Hall</MenuItem>
                    <MenuItem value="LAB">Lab</MenuItem>
                    <MenuItem value="MEETING_ROOM">Meeting Room</MenuItem>
                    <MenuItem value="EQUIPMENT">Equipment</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              {...register('location', { required: 'Location is required' })}
              label="Location" fullWidth
              error={!!errors.location} helperText={errors.location?.message}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              {...register('capacity', { min: { value: 1, message: 'Must be at least 1' } })}
              label="Capacity" type="number" fullWidth
              placeholder="Leave blank for equipment"
              error={!!errors.capacity} helperText={errors.capacity?.message}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              {...register('imageUrl')}
              label="Image URL" fullWidth
              placeholder="https://example.com/image.jpg"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              {...register('description')}
              label="Description" fullWidth multiline rows={3}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Availability Windows</Typography>
          <Button size="small" startIcon={<AddIcon />}
                  onClick={() => append({ dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '17:00' })}>
            Add Window
          </Button>
        </Box>

        {fields.map((field, index) => (
          <Paper key={field.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Day</InputLabel>
                  <Controller
                    name={`availabilityWindows.${index}.dayOfWeek`}
                    control={control}
                    render={({ field: f }) => (
                      <Select {...f} label="Day">
                        {DAYS.map((d) => (
                          <MenuItem key={d} value={d}>
                            {d.charAt(0) + d.slice(1).toLowerCase()}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  {...register(`availabilityWindows.${index}.startTime`)}
                  label="Start" type="time" fullWidth size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  {...register(`availabilityWindows.${index}.endTime`)}
                  label="End" type="time" fullWidth size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <IconButton color="error" onClick={() => remove(index)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
        ))}

        <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
          <Button variant="outlined" onClick={() => navigate('/resources')}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} /> : isEdit ? 'Save Changes' : 'Create Resource'}
          </Button>
        </Box>
      </form>
    </Box>
  )
}
