import { useState, useEffect } from 'react'
import {
  Box, Typography, Grid, Tab, Tabs, CircularProgress, Pagination, Button,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useNavigate } from 'react-router-dom'
import { getMyBookings } from '../../api/bookingApi'
import BookingCard from './components/BookingCard'
import type { Booking, BookingStatus } from '../../types/booking'

const STATUS_TABS: Array<{ label: string; value: BookingStatus | '' }> = [
  { label: 'All',       value: '' },
  { label: 'Pending',   value: 'PENDING' },
  { label: 'Approved',  value: 'APPROVED' },
  { label: 'Rejected',  value: 'REJECTED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

export default function BookingListPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
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

      const res = await getMyBookings(params)
      setBookings(res.data.data.content)
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
        <Typography variant="h5" fontWeight={700}>My Bookings</Typography>
        <Button variant="contained" startIcon={<AddIcon />}
                onClick={() => navigate('/bookings/new')}>
          New Booking
        </Button>
      </Box>

      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
        {STATUS_TABS.map((t) => (
          <Tab key={t.value} label={t.label} />
        ))}
      </Tabs>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      ) : bookings.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={8}>
          No bookings found.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {bookings.map((b) => (
            <Grid item xs={12} sm={6} md={4} key={b.id}>
              <BookingCard booking={b} />
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
