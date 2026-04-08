import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Button, CircularProgress, Alert, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  IconButton, Tooltip,
} from '@mui/material'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined'
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined'
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined'
import { getMyBookings, cancelBooking } from '../../api/bookingApi'
import type { Booking, BookingStatus } from '../../types/booking'
import type { ResourceType } from '../../types/resource'
import { format } from 'date-fns'

const STATUSES: BookingStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

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

function getResourceIcon(type?: string) {
  const iconSx = { fontSize: 22, color: COLORS.primary }
  switch (type) {
    case 'LECTURE_HALL': return <ApartmentOutlinedIcon sx={iconSx} />
    case 'LAB':          return <ScienceOutlinedIcon sx={iconSx} />
    case 'MEETING_ROOM': return <MeetingRoomOutlinedIcon sx={iconSx} />
    case 'EQUIPMENT':    return <ConstructionOutlinedIcon sx={iconSx} />
    default:             return <ComputerOutlinedIcon sx={iconSx} />
  }
}

function StatusPill({ status }: { status: BookingStatus }) {
  const s = STATUS_STYLES[status] ?? { bg: '#6b728020', color: '#9ca3af' }
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.5,
        py: 0.25,
        borderRadius: '9999px',
        fontSize: 10,
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

export default function BookingListPage() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [cancelDialog, setCancelDialog] = useState<Booking | null>(null)
  const [cancelNote, setCancelNote] = useState('')
  const [cancelling, setCancelling] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = {}
      if (statusFilter) params.status = statusFilter
      const res = await getMyBookings(params)
      const raw = res.data?.data?.content ?? res.data?.data
      setBookings(Array.isArray(raw) ? raw : [])
    } catch {
      setError('Failed to load bookings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter])

  const handleCancel = async () => {
    if (!cancelDialog) return
    setCancelling(true)
    try {
      await cancelBooking(cancelDialog.id, cancelNote ? { cancellationNote: cancelNote } : undefined)
      setCancelDialog(null)
      setCancelNote('')
      load()
    } catch {
      setError('Failed to cancel booking.')
    } finally {
      setCancelling(false)
    }
  }

  const canCancel = (b: Booking) => b.status === 'PENDING' || b.status === 'APPROVED'

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORS.surface, p: { xs: 2, md: 4 } }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'flex-end' }, justifyContent: 'space-between', gap: 3, mb: 5 }}>
        <Box>
          <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            My Bookings
          </Typography>
          <Typography sx={{ color: COLORS.onSurfaceVariant, mt: 0.5, fontSize: 14 }}>
            Track and manage your room and resource reservations across the Smart Campus.
          </Typography>
        </Box>
        <Button
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => navigate('/bookings/new')}
          sx={{
            px: 3,
            py: 1.5,
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryContainer})`,
            color: '#001453',
            fontWeight: 700,
            fontSize: 14,
            borderRadius: '8px',
            textTransform: 'none',
            whiteSpace: 'nowrap',
            boxShadow: `0 4px 16px ${COLORS.primaryContainer}33`,
            '&:hover': { transform: 'scale(1.02)', background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryContainer})` },
            '&:active': { transform: 'scale(0.97)' },
          }}
        >
          New Booking
        </Button>
      </Box>

      {/* Filter Row */}
      <Box
        sx={{
          bgcolor: COLORS.cardLow,
          borderRadius: '12px',
          p: 2.5,
          mb: 3,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          displayEmpty
          size="small"
          sx={{
            bgcolor: COLORS.card,
            color: COLORS.onSurfaceVariant,
            borderRadius: '8px',
            minWidth: 160,
            fontSize: 14,
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '& .MuiSvgIcon-root': { color: COLORS.onSurfaceVariant },
          }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          {STATUSES.map(s => <MenuItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</MenuItem>)}
        </Select>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, bgcolor: '#ef444420', color: '#f87171', border: '1px solid #ef444430', '& .MuiAlert-icon': { color: '#f87171' } }}>
          {error}
        </Alert>
      )}

      {/* Table Card */}
      <Box sx={{ bgcolor: COLORS.card, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: COLORS.primary }} />
          </Box>
        ) : bookings.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12, gap: 2 }}>
            <InboxOutlinedIcon sx={{ fontSize: 52, color: COLORS.outlineVariant }} />
            <Typography sx={{ color: COLORS.onSurfaceVariant, fontWeight: 600, fontSize: 16 }}>No bookings yet</Typography>
            <Typography sx={{ color: COLORS.outlineVariant, fontSize: 13 }}>Book a resource to get started.</Typography>
            <Button
              onClick={() => navigate('/bookings/new')}
              sx={{
                mt: 1, px: 3, py: 1,
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryContainer})`,
                color: '#001453', fontWeight: 700, borderRadius: '8px', textTransform: 'none',
                '&:hover': { background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryContainer})` },
              }}
            >
              New Booking
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: `${COLORS.surfaceHigh}80` }}>
                  {['Resource', 'Title', 'Date & Time', 'Status', 'Attendees', 'Actions'].map((h, i) => (
                    <TableCell
                      key={h}
                      align={i === 5 ? 'right' : 'left'}
                      sx={{
                        color: '#64748b',
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        border: 'none',
                        py: 2,
                        px: 3,
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map(b => (
                  <TableRow
                    key={b.id}
                    sx={{
                      borderTop: `1px solid rgba(255,255,255,0.05)`,
                      '&:hover': { bgcolor: `${COLORS.primary}08` },
                      transition: 'background 0.15s',
                      cursor: 'default',
                    }}
                  >
                    {/* Resource */}
                    <TableCell sx={{ border: 'none', py: 2.5, px: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '8px',
                            bgcolor: COLORS.surfaceHigh,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {getResourceIcon(undefined)}
                        </Box>
                        <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{b.resourceName}</Typography>
                      </Box>
                    </TableCell>

                    {/* Title */}
                    <TableCell sx={{ border: 'none', py: 2.5, px: 3, color: COLORS.onSurfaceVariant, fontWeight: 500, fontSize: 14 }}>
                      {b.title}
                    </TableCell>

                    {/* Date & Time */}
                    <TableCell sx={{ border: 'none', py: 2.5, px: 3 }}>
                      <Box>
                        <Typography sx={{ color: COLORS.onSurface, fontWeight: 600, fontSize: 14 }}>
                          {format(new Date(b.startDatetime), 'MMM dd, yyyy')}
                        </Typography>
                        <Typography sx={{ color: '#64748b', fontSize: 12, mt: 0.25 }}>
                          {format(new Date(b.startDatetime), 'HH:mm')} – {format(new Date(b.endDatetime), 'HH:mm')}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Status */}
                    <TableCell sx={{ border: 'none', py: 2.5, px: 3 }}>
                      <StatusPill status={b.status} />
                    </TableCell>

                    {/* Attendees */}
                    <TableCell sx={{ border: 'none', py: 2.5, px: 3, color: COLORS.onSurfaceVariant, fontSize: 14 }}>
                      {b.expectedAttendees ?? '—'}
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right" sx={{ border: 'none', py: 2.5, px: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Tooltip title="View details">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/bookings/${b.id}`)}
                            sx={{
                              color: COLORS.primary,
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                            }}
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {canCancel(b) && (
                          <Tooltip title="Cancel booking">
                            <IconButton
                              size="small"
                              onClick={() => setCancelDialog(b)}
                              sx={{
                                color: '#f87171',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                              }}
                            >
                              <CancelOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Footer count */}
        {!loading && bookings.length > 0 && (
          <Box
            sx={{
              px: 3,
              py: 2,
              bgcolor: `${COLORS.surfaceHigh}50`,
              borderTop: `1px solid rgba(255,255,255,0.05)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography sx={{ fontSize: 12, color: '#64748b' }}>
              {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Processing info box */}
      <Box
        sx={{
          mt: 4,
          p: 2.5,
          bgcolor: `${COLORS.primaryContainer}15`,
          border: `1px solid ${COLORS.primary}18`,
          borderRadius: '12px',
          display: 'flex',
          gap: 2,
          alignItems: 'flex-start',
        }}
      >
        <Typography sx={{ color: COLORS.primary, fontSize: 18, mt: 0.25 }}>ℹ</Typography>
        <Box>
          <Typography sx={{ color: COLORS.primary, fontWeight: 600, fontSize: 13, mb: 0.5 }}>Processing Timeline</Typography>
          <Typography sx={{ color: COLORS.onSurfaceVariant, fontSize: 13, lineHeight: 1.6 }}>
            Pending bookings are reviewed within 24 hours. You'll receive a notification once approved or rejected.
          </Typography>
        </Box>
      </Box>

      {/* Cancel Dialog */}
      <Dialog
        open={!!cancelDialog}
        onClose={() => { setCancelDialog(null); setCancelNote('') }}
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
        <DialogTitle
          sx={{
            color: '#fff',
            fontWeight: 800,
            fontSize: 18,
            borderBottom: `1px solid ${COLORS.outlineVariant}40`,
            pb: 2,
          }}
        >
          Cancel Booking
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ color: COLORS.onSurfaceVariant, mb: 2.5, fontSize: 14 }}>
            Are you sure you want to cancel <Box component="span" sx={{ color: '#fff', fontWeight: 700 }}>{cancelDialog?.title}</Box>? This action cannot be undone.
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
        <DialogActions
          sx={{
            px: 3,
            py: 2.5,
            borderTop: `1px solid ${COLORS.outlineVariant}40`,
            gap: 1,
          }}
        >
          <Button
            onClick={() => { setCancelDialog(null); setCancelNote('') }}
            sx={{ color: COLORS.onSurfaceVariant, fontWeight: 600, textTransform: 'none', borderRadius: '8px', '&:hover': { bgcolor: `rgba(255,255,255,0.06)` } }}
          >
            Keep Booking
          </Button>
          <Button
            variant="contained"
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
            {cancelling ? 'Cancelling…' : 'Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
