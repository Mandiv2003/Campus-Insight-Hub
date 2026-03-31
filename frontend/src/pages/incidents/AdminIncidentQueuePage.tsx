import { useState, useEffect } from 'react'
import {
  Box, Typography, Grid, Tab, Tabs, CircularProgress, Pagination,
  MenuItem, Select, FormControl, InputLabel, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { getAdminTickets, updateTicketStatus } from '../../api/incidentApi'
import TicketCard from './components/TicketCard'
import type { Ticket, TicketStatus, TicketPriority, TicketCategory } from '../../types/incident'

const STATUS_TABS: Array<{ label: string; value: TicketStatus | '' }> = [
  { label: 'All',         value: '' },
  { label: 'Open',        value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved',    value: 'RESOLVED' },
  { label: 'Closed',      value: 'CLOSED' },
  { label: 'Rejected',    value: 'REJECTED' },
]

export default function AdminIncidentQueuePage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(0)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [priority, setPriority] = useState<TicketPriority | ''>('')
  const [category, setCategory] = useState<TicketCategory | ''>('')

  // Status-change dialog state
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean; ticketId: string; newStatus: TicketStatus
  } | null>(null)
  const [dialogNote, setDialogNote] = useState('')

  const navigate = useNavigate()

  useEffect(() => { load() }, [tab, page, priority, category])

  const load = async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page, size: 20 }
      const statusValue = STATUS_TABS[tab].value
      if (statusValue) params.status = statusValue
      if (priority)   params.priority = priority
      if (category)   params.category = category
      const res = await getAdminTickets(params)
      setTickets(res.data.data.content)
      setTotalPages(res.data.data.totalPages)
    } finally {
      setLoading(false)
    }
  }

  const openStatusDialog = (ticketId: string, newStatus: TicketStatus) => {
    setDialogNote('')
    setStatusDialog({ open: true, ticketId, newStatus })
  }

  const handleStatusChange = async () => {
    if (!statusDialog) return
    const { ticketId, newStatus } = statusDialog
    const body: Record<string, string> = { status: newStatus }
    if (newStatus === 'RESOLVED')  body.resolutionNotes = dialogNote
    if (newStatus === 'REJECTED')  body.rejectionReason = dialogNote
    await updateTicketStatus(ticketId, body)
    setStatusDialog(null)
    load()
  }

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={2}>Incident Queue</Typography>

      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Priority</InputLabel>
          <Select value={priority} label="Priority"
                  onChange={(e) => { setPriority(e.target.value as TicketPriority | ''); setPage(0) }}>
            <MenuItem value="">All</MenuItem>
            {['LOW','MEDIUM','HIGH','CRITICAL'].map((p) => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Category</InputLabel>
          <Select value={category} label="Category"
                  onChange={(e) => { setCategory(e.target.value as TicketCategory | ''); setPage(0) }}>
            <MenuItem value="">All</MenuItem>
            {['ELECTRICAL','PLUMBING','IT_EQUIPMENT','FURNITURE','HVAC','SAFETY','OTHER'].map((c) => (
              <MenuItem key={c} value={c}>{c.replace('_', ' ')}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Tabs value={tab}
            onChange={(_, v) => { setTab(v); setPage(0) }}
            sx={{ mb: 3 }} variant="scrollable" scrollButtons="auto">
        {STATUS_TABS.map((t) => <Tab key={t.value} label={t.label} />)}
      </Tabs>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      ) : tickets.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={8}>No tickets found.</Typography>
      ) : (
        <Grid container spacing={2}>
          {tickets.map((t) => (
            <Grid item xs={12} sm={6} md={4} key={t.id}>
              <Box>
                <TicketCard ticket={t} />
                <Box display="flex" gap={0.5} mt={0.5} flexWrap="wrap">
                  {t.status === 'OPEN' && (
                    <Button size="small" variant="outlined"
                            onClick={() => openStatusDialog(t.id, 'IN_PROGRESS')}>
                      Start
                    </Button>
                  )}
                  {(t.status === 'OPEN' || t.status === 'IN_PROGRESS') && (
                    <>
                      <Button size="small" variant="contained" color="success"
                              onClick={() => openStatusDialog(t.id, 'RESOLVED')}>
                        Resolve
                      </Button>
                      <Button size="small" variant="outlined" color="error"
                              onClick={() => openStatusDialog(t.id, 'REJECTED')}>
                        Reject
                      </Button>
                    </>
                  )}
                  {t.status === 'RESOLVED' && (
                    <Button size="small" variant="outlined"
                            onClick={() => openStatusDialog(t.id, 'CLOSED')}>
                      Close
                    </Button>
                  )}
                  <Button size="small" onClick={() => navigate(`/tickets/${t.id}`)}>
                    View
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination count={totalPages} page={page + 1}
                      onChange={(_, p) => setPage(p - 1)} />
        </Box>
      )}

      {/* Status-change dialog */}
      <Dialog open={!!statusDialog?.open} onClose={() => setStatusDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {statusDialog?.newStatus === 'RESOLVED' && 'Resolve Ticket'}
          {statusDialog?.newStatus === 'REJECTED' && 'Reject Ticket'}
          {statusDialog?.newStatus === 'IN_PROGRESS' && 'Mark In Progress'}
          {statusDialog?.newStatus === 'CLOSED' && 'Close Ticket'}
        </DialogTitle>
        <DialogContent>
          {(statusDialog?.newStatus === 'RESOLVED' || statusDialog?.newStatus === 'REJECTED') && (
            <TextField
              autoFocus fullWidth multiline minRows={3}
              label={statusDialog.newStatus === 'RESOLVED' ? 'Resolution Notes *' : 'Rejection Reason *'}
              value={dialogNote}
              onChange={(e) => setDialogNote(e.target.value)}
              sx={{ mt: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleStatusChange}
            disabled={
              (statusDialog?.newStatus === 'RESOLVED' || statusDialog?.newStatus === 'REJECTED')
              && !dialogNote.trim()
            }
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
