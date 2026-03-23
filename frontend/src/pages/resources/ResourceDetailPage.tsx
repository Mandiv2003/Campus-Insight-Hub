import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Chip, Button, CircularProgress,
  Table, TableHead, TableBody, TableRow, TableCell,
  Paper, Divider, IconButton,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd'
import { getResource } from '../../api/resourceApi'
import AvailabilityBadge from '../../components/common/AvailabilityBadge'
import { useAuth } from '../../context/AuthContext'
import type { Resource } from '../../types/resource'

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

export default function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  useEffect(() => {
    if (id) {
      getResource(id)
        .then((res) => setResource(res.data.data))
        .catch(() => navigate('/resources', { replace: true }))
        .finally(() => setLoading(false))
    }
  }, [id])

  if (loading) {
    return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
  }
  if (!resource) return null

  const sortedWindows = [...resource.availabilityWindows].sort(
    (a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek)
  )

  return (
    <Box p={3} maxWidth={800} mx="auto">
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <IconButton onClick={() => navigate('/resources')} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700} sx={{ flexGrow: 1 }}>
          {resource.name}
        </Typography>
        {isAdmin() && (
          <Button variant="outlined" startIcon={<EditIcon />}
                  onClick={() => navigate(`/admin/resources/${id}/edit`)}>
            Edit
          </Button>
        )}
      </Box>

      {resource.imageUrl && (
        <Box component="img" src={resource.imageUrl} alt={resource.name}
             sx={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 2, mb: 3 }} />
      )}

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
          <Chip label={resource.type.replace(/_/g, ' ')} variant="outlined" />
          <AvailabilityBadge status={resource.status} size="medium" />
          {resource.capacity != null && (
            <Chip label={`Capacity: ${resource.capacity}`} variant="outlined" />
          )}
        </Box>

        <Typography variant="body1" color="text.secondary" mb={1}>
          <strong>Location:</strong> {resource.location}
        </Typography>

        {resource.description && (
          <Typography variant="body1">{resource.description}</Typography>
        )}
      </Paper>

      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <EventAvailableIcon color="action" />
        <Typography variant="h6" fontWeight={700}>Availability Schedule</Typography>
      </Box>

      {sortedWindows.length === 0 ? (
        <Typography color="text.secondary">No availability windows defined.</Typography>
      ) : (
        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Day</strong></TableCell>
                <TableCell><strong>From</strong></TableCell>
                <TableCell><strong>To</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedWindows.map((w) => (
                <TableRow key={w.id}>
                  <TableCell sx={{ textTransform: 'capitalize' }}>
                    {w.dayOfWeek.charAt(0) + w.dayOfWeek.slice(1).toLowerCase()}
                  </TableCell>
                  <TableCell>{w.startTime}</TableCell>
                  <TableCell>{w.endTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {resource.status === 'ACTIVE' && (
        <Box mt={3}>
          <Divider sx={{ mb: 3 }} />
          <Button
            variant="contained"
            size="large"
            startIcon={<BookmarkAddIcon />}
            onClick={() => navigate(`/bookings/new?resourceId=${resource.id}`)}
          >
            Book This Resource
          </Button>
        </Box>
      )}
    </Box>
  )
}
