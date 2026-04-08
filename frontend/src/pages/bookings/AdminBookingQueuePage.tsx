import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Button, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Paper, CircularProgress, Alert, Select, MenuItem,
  FormControl, InputLabel, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Typography,
} from '@mui/material'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import { getAdminBookings, approveBooking, rejectBooking } from '../../api/bookingApi'
import type { Booking, BookingStatus } from '../../types/booking'
import { format } from 'date-fns'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import EmptyState from '../../components/common/EmptyState'

const STATUSES: BookingStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

export default function AdminBookingQueuePage() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [rejectDialog, setRejectDialog] = useState<Booking | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = {}
      if (statusFilter) params.status = statusFilter
      const res = await getAdminBookings(params)
      setBookings(res.data?.data?.content ?? res.data?.data ?? [])
    } catch {
      setError('Failed to load bookings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter])

  const handleApprove = async (b: Booking) => {
    setActionLoading(b.id)
    try {
      await approveBooking(b.id)
      setBookings(prev => prev.map(x => x.id === b.id ? { ...x, status: 'APPROVED' } : x))
    } catch {
      setError('Failed to approve booking.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectDialog || !rejectReason.trim()) return
    setActionLoading(rejectDialog.id)
    try {
      await rejectBooking(rejectDialog.id, { rejectionReason: rejectReason })
      setBookings(prev => prev.map(x => x.id === rejectDialog.id ? { ...x, status: 'REJECTED' } : x))
      setRejectDialog(null)
      setRejectReason('')
    } catch {
      setError('Failed to reject booking.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <Box>
      <PageHeader title="Booking Queue" subtitle="Review and process booking requests" />

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
            <MenuItem value="">All statuses</MenuItem>
            {STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : bookings.length === 0 ? (
        <EmptyState title="No bookings" description="There are no bookings matching the selected filter." />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Resource</TableCell>
                <TableCell>Requested By</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map(b => (
                <TableRow key={b.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{b.title}</TableCell>
                  <TableCell>{b.resourceName}</TableCell>
                  <TableCell sx={{ color: '#6b7280' }}>{b.requestedByName}</TableCell>
                  <TableCell sx={{ color: '#6b7280' }}>{format(new Date(b.startDatetime), 'dd MMM, HH:mm')}</TableCell>
                  <TableCell sx={{ color: '#6b7280' }}>{format(new Date(b.endDatetime), 'HH:mm')}</TableCell>
                  <TableCell><StatusBadge label={b.status} /></TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => navigate(`/bookings/${b.id}`)}>View</Button>
                    {b.status === 'PENDING' && (
                      <>
                        <Button
                          size="small"
                          color="success"
                          startIcon={<CheckOutlinedIcon fontSize="small" />}
                          sx={{ ml: 1 }}
                          onClick={() => handleApprove(b)}
                          disabled={actionLoading === b.id}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<CloseOutlinedIcon fontSize="small" />}
                          sx={{ ml: 1 }}
                          onClick={() => setRejectDialog(b)}
                          disabled={actionLoading === b.id}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!rejectDialog} onClose={() => setRejectDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Booking</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Rejecting <strong>{rejectDialog?.title}</strong> by {rejectDialog?.requestedByName}. Please provide a reason.
          </Typography>
          <TextField
            label="Rejection reason *"
            multiline rows={3} fullWidth
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectDialog(null)}>Cancel</Button>
          <Button
            variant="contained" color="error"
            onClick={handleReject}
            disabled={!rejectReason.trim() || !!actionLoading}
          >
            Reject Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
