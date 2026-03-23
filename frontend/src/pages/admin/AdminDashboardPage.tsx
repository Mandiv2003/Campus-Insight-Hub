import { useState, useEffect } from 'react'
import { Box, Typography, Grid, Card, CardContent } from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
import EventNoteIcon from '@mui/icons-material/EventNote'
import BugReportIcon from '@mui/icons-material/BugReport'
import api from '../../api/axiosInstance'

interface Stats {
  totalUsers?: number
  totalResources?: number
  pendingBookings?: number
  openTickets?: number
}

const StatCard = ({ label, value, icon }: { label: string; value?: number; icon: React.ReactNode }) => (
  <Card elevation={2}>
    <CardContent>
      <Box display="flex" alignItems="center" gap={2}>
        <Box color="primary.main">{icon}</Box>
        <Box>
          <Typography variant="h4" fontWeight={700}>{value ?? '—'}</Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
)

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({})

  useEffect(() => {
    api.get('/admin/stats').then((res) => setStats(res.data.data)).catch(() => {})
  }, [])

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={3}>Admin Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total Users"     value={stats.totalUsers}     icon={<PeopleIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total Resources" value={stats.totalResources} icon={<MeetingRoomIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Pending Bookings" value={stats.pendingBookings} icon={<EventNoteIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Open Tickets"    value={stats.openTickets}    icon={<BugReportIcon />} />
        </Grid>
      </Grid>
    </Box>
  )
}
