import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Button, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Paper, CircularProgress, Alert, Select, MenuItem,
  FormControl, InputLabel, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Typography, Autocomplete,
} from '@mui/material'
import { getAdminTickets, updateTicketStatus, assignTechnician } from '../../api/incidentApi'
import { getTechnicians } from '../../api/userApi'
import type { Ticket, TicketStatus } from '../../types/incident'
import { format } from 'date-fns'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import EmptyState from '../../components/common/EmptyState'

const STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']

interface TechUser { id: string; fullName: string; email: string }
interface StatusDialogState { ticket: Ticket; newStatus: TicketStatus; extra: string }

export default function AdminIncidentQueuePage() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('OPEN')
  const [technicians, setTechnicians] = useState<TechUser[]>([])
  const [statusDialog, setStatusDialog] = useState<StatusDialogState | null>(null)
  const [assignDialog, setAssignDialog] = useState<Ticket | null>(null)
  const [selectedTech, setSelectedTech] = useState<TechUser | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = {}
      if (statusFilter) params.status = statusFilter
      const [ticketRes, techRes] = await Promise.all([
        getAdminTickets(params),
        getTechnicians(),
      ])
      setTickets(ticketRes.data?.data?.content ?? ticketRes.data?.data ?? [])
      setTechnicians(techRes.data?.data ?? [])
    } catch {
      setError('Failed to load tickets.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter])

  const handleStatusUpdate = async () => {
    if (!statusDialog) return
    const { ticket, newStatus, extra } = statusDialog
    setActionLoading(true)
    try {
      const payload: Record<string, string> = { status: newStatus }
      if (newStatus === 'RESOLVED') payload.resolutionNotes = extra
      if (newStatus === 'REJECTED') payload.rejectionReason = extra
      await updateTicketStatus(ticket.id, payload)
      setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: newStatus } : t))
      setStatusDialog(null)
    } catch {
      setError('Failed to update status.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!assignDialog || !selectedTech) return
    setActionLoading(true)
    try {
      await assignTechnician(assignDialog.id, selectedTech.id)
      setTickets(prev => prev.map(t => t.id === assignDialog.id
        ? { ...t, assignedToId: selectedTech.id, assignedToName: selectedTech.fullName }
        : t))
      setAssignDialog(null)
      setSelectedTech(null)
    } catch {
      setError('Failed to assign technician.')
    } finally {
      setActionLoading(false)
    }
  }

  const needsExtra = (s: TicketStatus) => s === 'RESOLVED' || s === 'REJECTED'

  return (
    <Box>
      <PageHeader title="Incident Queue" subtitle="Manage and resolve campus incident tickets" />

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
            <MenuItem value="">All statuses</MenuItem>
            {STATUSES.map(s => <MenuItem key={s} value={s}>{s.replace(/_/g, ' ')}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : tickets.length === 0 ? (
        <EmptyState title="No tickets" description="No tickets match the selected filter." />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Reporter</TableCell>
                <TableCell>Assigned</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map(t => (
                <TableRow key={t.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{t.title}</TableCell>
                  <TableCell sx={{ color: '#6b7280' }}>{t.category.replace(/_/g, ' ')}</TableCell>
                  <TableCell><StatusBadge label={t.priority} /></TableCell>
                  <TableCell sx={{ color: '#6b7280' }}>{t.reportedByName}</TableCell>
                  <TableCell sx={{ color: t.assignedToName ? '#374151' : '#9ca3af', fontStyle: t.assignedToName ? 'normal' : 'italic' }}>
                    {t.assignedToName ?? 'Unassigned'}
                  </TableCell>
                  <TableCell><StatusBadge label={t.status} /></TableCell>
                  <TableCell sx={{ color: '#6b7280' }}>{format(new Date(t.createdAt), 'dd MMM')}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => navigate(`/tickets/${t.id}`)}>View</Button>
                    <Button size="small" sx={{ ml: 1 }} onClick={() => setAssignDialog(t)}>Assign</Button>
                    <Button
                      size="small" sx={{ ml: 1 }}
                      onClick={() => setStatusDialog({ ticket: t, newStatus: 'IN_PROGRESS', extra: '' })}
                    >
                      Status
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Status change dialog */}
      <Dialog open={!!statusDialog} onClose={() => setStatusDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Ticket Status</DialogTitle>
        <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={statusDialog?.newStatus ?? 'OPEN'}
              label="New Status"
              onChange={e => setStatusDialog(d => d ? { ...d, newStatus: e.target.value as TicketStatus, extra: '' } : null)}
            >
              {STATUSES.map(s => <MenuItem key={s} value={s}>{s.replace(/_/g, ' ')}</MenuItem>)}
            </Select>
          </FormControl>
          {statusDialog && needsExtra(statusDialog.newStatus) && (
            <TextField
              label={statusDialog.newStatus === 'RESOLVED' ? 'Resolution notes *' : 'Rejection reason *'}
              multiline rows={3} fullWidth
              value={statusDialog.extra}
              onChange={e => setStatusDialog(d => d ? { ...d, extra: e.target.value } : null)}
              required
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setStatusDialog(null)}>Cancel</Button>
          <Button
            variant="contained" onClick={handleStatusUpdate}
            disabled={actionLoading || (!!statusDialog && needsExtra(statusDialog.newStatus) && !statusDialog.extra.trim())}
          >
            {actionLoading ? 'Saving…' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign dialog */}
      <Dialog open={!!assignDialog} onClose={() => setAssignDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Technician</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Assign a technician to <strong>{assignDialog?.title}</strong>
          </Typography>
          <Autocomplete
            options={technicians}
            getOptionLabel={t => `${t.fullName} (${t.email})`}
            value={selectedTech}
            onChange={(_, v) => setSelectedTech(v)}
            renderInput={params => <TextField {...params} label="Select technician" />}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAssignDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssign} disabled={!selectedTech || actionLoading}>
            {actionLoading ? 'Assigning…' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
