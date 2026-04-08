import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Button, Typography, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import { getBooking, cancelBooking } from '../../api/bookingApi'
import type { Booking, BookingStatus } from '../../types/booking'
import { format } from 'date-fns'

const COLORS = {
  surface: '#0b1326',
  card: '#171f33',
  cardLow: '#131b2e',
  surfaceHigh: '#222a3d',
  surfaceHighest: '#2d3449',
  primary: '#b8c4ff',
  primaryContainer: '#1e40af',
  onSurface: '#dae2fd',
  onSurfaceVariant: '#c4c5d5',
  outlineVariant: '#444653',
  tertiary: '#ffb59a',
}

const STATUS_STYLES: Record<BookingStatus, { bg: string; color: string }> = {
  PENDING:   { bg: '#ffb59a20', color: '#ffb59a' },
  APPROVED:  { bg: '#16a34a20', color: '#4ade80' },
  REJECTED:  { bg: '#ef444420', color: '#f87171' },
  CANCELLED: { bg: '#6b728020', color: '#9ca3af' },
}

function StatusPill({ status }: { status: BookingStatus }) {
  const s = STATUS_STYLES[status] ?? { bg: '#6b728020', color: '#9ca3af' }
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 2,
        py: 0.5,
        borderRadius: '9999px',
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        bgcolor: s.bg,
        color: s.color,
        border: `1px solid ${s.color}30`,
      }}
    >
      {status}
    </Box>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        py: 2,
        borderBottom: `1px solid ${COLORS.outlineVariant}30`,
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box sx={{ color: COLORS.primary, mt: 0.25, flexShrink: 0 }}>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: COLORS.onSurfaceVariant, mb: 0.5 }}>
          {label}
        </Typography>
        <Box sx={{ fontSize: 14, color: COLORS.onSurface, fontWeight: 500, lineHeight: 1.5 }}>
          {value}
        </Box>
      </Box>
    </Box>
  )
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelDialog, setCancelDialog] = useState(false)
  const [cancelNote, setCancelNote] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getBooking(id!)
        setBooking(res.data?.data)
      } catch {
        setError('Failed to load booking.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await cancelBooking(id!, cancelNote ? { cancellationNote: cancelNote } : undefined)
      setBooking(b => b ? { ...b, status: 'CANCELLED' } : b)
      setCancelDialog(false)
    } catch {
      setError('Failed to cancel booking.')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: COLORS.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: COLORS.primary }} />
      </Box>
    )
  }

  if (error || !booking) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: COLORS.surface, p: 4 }}>
        <Alert severity="error" sx={{ bgcolor: '#ef444420', color: '#f87171', border: '1px solid #ef444430', '& .MuiAlert-icon': { color: '#f87171' } }}>
          {error ?? 'Booking not found.'}
        </Alert>
      </Box>
    )
  }

  const canCancel = booking.status === 'PENDING' || booking.status === 'APPROVED'

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORS.surface, p: { xs: 2, md: 4 } }}>
      {/* Back */}
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

      {/* Hero header */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'flex-start' }, justifyContent: 'space-between', gap: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5, flexWrap: 'wrap' }}>
            <StatusPill status={booking.status} />
          </Box>
          <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, mb: 0.5 }}>
            {booking.title}
          </Typography>
          <Typography sx={{ color: COLORS.onSurfaceVariant, fontSize: 14 }}>
            Booking for {booking.resourceName}
          </Typography>
        </Box>
        {canCancel && (
          <Button
            variant="outlined"
            onClick={() => setCancelDialog(true)}
            sx={{
              color: '#f87171',
              borderColor: '#ef444450',
              fontWeight: 700,
              borderRadius: '8px',
              textTransform: 'none',
              px: 3,
              flexShrink: 0,
              '&:hover': { bgcolor: '#ef444415', borderColor: '#f87171' },
            }}
          >
            Cancel Booking
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, bgcolor: '#ef444420', color: '#f87171', border: '1px solid #ef444430', borderRadius: '8px', '& .MuiAlert-icon': { color: '#f87171' } }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Main details card */}
        <Box
          sx={{
            bgcolor: COLORS.card,
            borderRadius: '12px',
            p: 3,
            flex: 1,
            minWidth: 300,
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
          }}
        >
          <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: COLORS.outlineVariant, mb: 2 }}>
            Booking Details
          </Typography>

          <InfoRow
            icon={<ApartmentOutlinedIcon sx={{ fontSize: 20 }} />}
            label="Resource"
            value={booking.resourceName}
          />
          <InfoRow
            icon={<ScheduleOutlinedIcon sx={{ fontSize: 20 }} />}
            label="Start"
            value={format(new Date(booking.startDatetime), 'dd MMM yyyy, HH:mm')}
          />
          <InfoRow
            icon={<ScheduleOutlinedIcon sx={{ fontSize: 20 }} />}
            label="End"
            value={format(new Date(booking.endDatetime), 'dd MMM yyyy, HH:mm')}
          />
          <InfoRow
            icon={<AssignmentOutlinedIcon sx={{ fontSize: 20 }} />}
            label="Purpose"
            value={booking.purpose}
          />
          <InfoRow
            icon={<PeopleOutlinedIcon sx={{ fontSize: 20 }} />}
            label="Expected Attendees"
            value={booking.expectedAttendees ?? '—'}
          />
          <InfoRow
            icon={<PersonOutlinedIcon sx={{ fontSize: 20 }} />}
            label="Requested By"
            value={booking.requestedByName}
          />
          <InfoRow
            icon={<EventOutlinedIcon sx={{ fontSize: 20 }} />}
            label="Requested On"
            value={format(new Date(booking.createdAt), 'dd MMM yyyy')}
          />
        </Box>

        {/* Review / rejection info card */}
        {(booking.rejectionReason || booking.cancellationNote || booking.reviewedByName) && (
          <Box
            sx={{
              flex: 1,
              minWidth: 280,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {/* Rejection card */}
            {booking.rejectionReason && (
              <Box
                sx={{
                  bgcolor: '#ef444412',
                  border: '1px solid #ef444430',
                  borderRadius: '12px',
                  p: 3,
                }}
              >
                <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#f87171', mb: 1.5 }}>
                  Rejection Reason
                </Typography>
                <Typography sx={{ color: '#fca5a5', fontSize: 14, lineHeight: 1.6 }}>
                  {booking.rejectionReason}
                </Typography>
              </Box>
            )}

            {/* Cancellation note card */}
            {booking.cancellationNote && (
              <Box
                sx={{
                  bgcolor: '#6b728012',
                  border: `1px solid ${COLORS.outlineVariant}40`,
                  borderRadius: '12px',
                  p: 3,
                }}
              >
                <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: COLORS.onSurfaceVariant, mb: 1.5 }}>
                  Cancellation Note
                </Typography>
                <Typography sx={{ color: COLORS.onSurfaceVariant, fontSize: 14, lineHeight: 1.6 }}>
                  {booking.cancellationNote}
                </Typography>
              </Box>
            )}

            {/* Reviewed by */}
            {booking.reviewedByName && (
              <Box sx={{ bgcolor: COLORS.card, borderRadius: '12px', p: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: COLORS.outlineVariant, mb: 2 }}>
                  Review Info
                </Typography>
                <InfoRow
                  icon={<AdminPanelSettingsOutlinedIcon sx={{ fontSize: 20 }} />}
                  label="Reviewed By"
                  value={booking.reviewedByName}
                />
                {booking.reviewedAt && (
                  <InfoRow
                    icon={<EventOutlinedIcon sx={{ fontSize: 20 }} />}
                    label="Reviewed At"
                    value={format(new Date(booking.reviewedAt), 'dd MMM yyyy, HH:mm')}
                  />
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Cancel Dialog */}
      <Dialog
        open={cancelDialog}
        onClose={() => setCancelDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: COLORS.card,
            border: `1px solid ${COLORS.outlineVariant}50`,
            borderRadius: '16px',
            color: COLORS.onSurface,
          },
        }}
      >
        <DialogTitle sx={{ color: '#fff', fontWeight: 800, fontSize: 18, borderBottom: `1px solid ${COLORS.outlineVariant}40`, pb: 2 }}>
          Cancel Booking
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ color: COLORS.onSurfaceVariant, mb: 2.5, fontSize: 14 }}>
            This will cancel your booking for{' '}
            <Box component="span" sx={{ color: '#fff', fontWeight: 700 }}>{booking.resourceName}</Box>.
            This action cannot be undone.
          </Typography>
          <TextField
            label="Cancellation note (optional)"
            multiline
            rows={3}
            fullWidth
            value={cancelNote}
            onChange={e => setCancelNote(e.target.value)}
            InputLabelProps={{ style: { color: COLORS.onSurfaceVariant } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: COLORS.cardLow,
                color: COLORS.onSurface,
                borderRadius: '8px',
                '& fieldset': { borderColor: `${COLORS.outlineVariant}80` },
                '&:hover fieldset': { borderColor: COLORS.outlineVariant },
                '&.Mui-focused fieldset': { borderColor: COLORS.primary },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5, borderTop: `1px solid ${COLORS.outlineVariant}40`, gap: 1 }}>
          <Button
            onClick={() => setCancelDialog(false)}
            sx={{ color: COLORS.onSurfaceVariant, fontWeight: 600, textTransform: 'none', borderRadius: '8px', '&:hover': { bgcolor: `rgba(255,255,255,0.06)` } }}
          >
            Keep Booking
          </Button>
          <Button
            onClick={handleCancel}
            disabled={cancelling}
            sx={{
              bgcolor: '#ef4444',
              color: '#fff',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '8px',
              px: 3,
              '&:hover': { bgcolor: '#dc2626' },
              '&:disabled': { bgcolor: '#ef444450', color: '#fff8' },
            }}
          >
            {cancelling ? 'Cancelling…' : 'Confirm Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
