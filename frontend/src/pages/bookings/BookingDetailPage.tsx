import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Paper, Button, CircularProgress, Divider,
  IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CancelIcon from '@mui/icons-material/Cancel'
import { getBooking, cancelBooking } from '../../api/bookingApi'
import BookingStatusChip from './components/BookingStatusChip'
import BookingStatusStepper from './components/BookingStatusStepper'
import { useAuth } from '../../context/AuthContext'
import { format } from 'date-fns'
import type { Booking } from '../../types/booking'

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelNote, setCancelNote] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (id) {
      getBooking(id)
        .then((res) => setBooking(res.data.data))
        .catch(() => navigate('/bookings', { replace: true }))
        .finally(() => setLoading(false))
    }
  }, [id])

  const handleCancel = async () => {
    if (!id) return
    setCancelling(true)
    try {
      const res = await cancelBooking(id, { cancellationNote: cancelNote || null })
      setBooking(res.data.data)
      setCancelOpen(false)
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
  if (!booking) return null

  const canCancel = (booking.status === 'PENDING' || booking.status === 'APPROVED') &&
                    booking.requestedById === user?.id

  const fmt = (dt: string) => format(new Date(dt), 'dd MMM yyyy, HH:mm')

  return (
    <Box p={3} maxWidth={700} mx="auto">
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <IconButton onClick={() => navigate('/bookings')} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700} sx={{ flexGrow: 1 }}>
          {booking.title}
        </Typography>
        <BookingStatusChip status={booking.status} size="medium" />
      </Box>

      <BookingStatusStepper status={booking.status} />

      <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          <div>
            <Typography variant="caption" color="text.secondary">Resource</Typography>
            <Typography fontWeight={500}>{booking.resourceName}</Typography>
          </div>
          <div>
            <Typography variant="caption" color="text.secondary">Requested by</Typography>
            <Typography fontWeight={500}>{booking.requestedByName}</Typography>
          </div>
          <div>
            <Typography variant="caption" color="text.secondary">Start</Typography>
            <Typography fontWeight={500}>{fmt(booking.startDatetime)}</Typography>
          </div>
          <div>
            <Typography variant="caption" color="text.secondary">End</Typography>
            <Typography fontWeight={500}>{fmt(booking.endDatetime)}</Typography>
          </div>
          {booking.expectedAttendees != null && (
            <div>
              <Typography variant="caption" color="text.secondary">Attendees</Typography>
              <Typography fontWeight={500}>{booking.expectedAttendees}</Typography>
            </div>
          )}
          {booking.reviewedByName && (
            <div>
              <Typography variant="caption" color="text.secondary">Reviewed by</Typography>
              <Typography fontWeight={500}>{booking.reviewedByName}</Typography>
            </div>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="caption" color="text.secondary">Purpose</Typography>
        <Typography>{booking.purpose}</Typography>

        {booking.rejectionReason && (
          <Box mt={2}>
            <Typography variant="caption" color="error.main">Rejection Reason</Typography>
            <Typography color="error.main">{booking.rejectionReason}</Typography>
          </Box>
        )}

        {booking.cancellationNote && (
          <Box mt={2}>
            <Typography variant="caption" color="text.secondary">Cancellation Note</Typography>
            <Typography>{booking.cancellationNote}</Typography>
          </Box>
        )}
      </Paper>

      {canCancel && (
        <Box mt={3}>
          <Button variant="outlined" color="error" startIcon={<CancelIcon />}
                  onClick={() => setCancelOpen(true)}>
            Cancel Booking
          </Button>
        </Box>
      )}

      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <TextField
            label="Reason (optional)" fullWidth multiline rows={3}
            value={cancelNote} onChange={(e) => setCancelNote(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)}>Keep Booking</Button>
          <Button onClick={handleCancel} color="error" disabled={cancelling}>
            {cancelling ? <CircularProgress size={20} /> : 'Confirm Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
