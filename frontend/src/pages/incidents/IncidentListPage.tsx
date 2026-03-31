import { useState, useEffect } from 'react'
import {
  Box, Typography, Grid, Tab, Tabs, CircularProgress, Pagination, Button,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useNavigate } from 'react-router-dom'
import { getMyTickets } from '../../api/incidentApi'
import TicketCard from './components/TicketCard'
import type { Ticket, TicketStatus } from '../../types/incident'

const STATUS_TABS: Array<{ label: string; value: TicketStatus | '' }> = [
  { label: 'All',         value: '' },
  { label: 'Open',        value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved',    value: 'RESOLVED' },
  { label: 'Closed',      value: 'CLOSED' },
  { label: 'Rejected',    value: 'REJECTED' },
]

export default function IncidentListPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(0)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const navigate = useNavigate()

  useEffect(() => { load() }, [tab, page])

  const load = async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page, size: 10 }
      const statusValue = STATUS_TABS[tab].value
      if (statusValue) params.status = statusValue
      const res = await getMyTickets(params)
      setTickets(res.data.data.content)
      setTotalPages(res.data.data.totalPages)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (_: React.SyntheticEvent, newTab: number) => {
    setTab(newTab)
    setPage(0)
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>My Tickets</Typography>
        <Button variant="contained" startIcon={<AddIcon />}
                onClick={() => navigate('/tickets/new')}>
          Report Issue
        </Button>
      </Box>

      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }} variant="scrollable" scrollButtons="auto">
        {STATUS_TABS.map((t) => (
          <Tab key={t.value} label={t.label} />
        ))}
      </Tabs>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      ) : tickets.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={8}>
          No tickets found.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {tickets.map((t) => (
            <Grid item xs={12} sm={6} md={4} key={t.id}>
              <TicketCard ticket={t} />
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
    </Box>
  )
}
