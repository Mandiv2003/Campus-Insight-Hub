import { useState, useEffect } from 'react'
import {
  Box, Typography, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Paper, Button, CircularProgress, Pagination,
  FormControl, InputLabel, Select, MenuItem, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import { getAdminBookings, approveBooking, rejectBooking } from '../../api/bookingApi'
import BookingStatusChip from './components/BookingStatusChip'
import { format } from 'date-fns'
import type { Booking, BookingStatus } from '../../types/booking'

export default function AdminBookingQueuePage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<BookingStatus | ''>('PENDING')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => { load() }, [status, page])

  const load = async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page, size: 20 }
      if (status) params.status = status
      const res = await getAdminBookings(params)
      setBookings(res.data.data.content)
      setTotalPages(res.data.data.totalPages)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    setProcessing(true)
    try { await approveBooking(id); load() }
    catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      alert(msg ?? 'Conflict detected — cannot approve')
    } finally { setProcessing(false) }
  }

  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return
    setProcessing(true)
    try {
      await rejectBooking(rejectTarget, { rejectionReason: rejectReason })
      setRejectOpen(false)
      setRejectReason('')
      load()
    } finally { setProcessing(false) }
  }

  const openReject = (id: string) => { setRejectTarget(id); setRejectOpen(true) }

  const fmt = (dt: string) => format(new Date(dt), 'dd MMM, HH:mm')

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={3}>Booking Queue</Typography>

      <Box display="flex" gap={2} mb={3}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={status} label="Status"
                  onChange={(e) => { setStatus(e.target.value as BookingStatus | ''); setPage(0) }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Title</strong></TableCell>
                <TableCell><strong>Resource</strong></TableCell>
                <TableCell><strong>Requested by</strong></TableCell>
                <TableCell><strong>Time</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography noWrap>{b.title}</Typography>
                  </TableCell>
                  <TableCell>{b.resourceName}</TableCell>
                  <TableCell>{b.requestedByName}</TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap>
                      {fmt(b.startDatetime)} – {fmt(b.endDatetime)}
                    </Typography>
                  </TableCell>
                  <TableCell><BookingStatusChip status={b.status} /></TableCell>
                  <TableCell align="right">
                    {b.status === 'PENDING' && (
                      <Box display="flex" gap={1} justifyContent="flex-end">
                        <Button size="small" variant="contained" color="success"
                                startIcon={<CheckCircleIcon />} disabled={processing}
                                onClick={() => handleApprove(b.id)}>
                          Approve
                        </Button>
                        <Button size="small" variant="outlined" color="error"
                                startIcon={<CancelIcon />} disabled={processing}
                                onClick={() => openReject(b.id)}>
                          Reject
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination count={totalPages} page={page + 1} onChange={(_, p) => setPage(p - 1)} />
        </Box>
      )}

      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Reject Booking</DialogTitle>
        <DialogContent>
          <TextField label="Rejection Reason" required fullWidth multiline rows={3}
                     value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                     sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
          <Button onClick={handleReject} color="error"
                  disabled={!rejectReason.trim() || processing}>
            {processing ? <CircularProgress size={20} /> : 'Confirm Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
