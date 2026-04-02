import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../notifications/NotificationBell'

export default function Navbar() {
  const { user, logout, isAdmin, isTechnician } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
          Smart Campus Hub
        </Typography>
        {user && (
          <Box display="flex" alignItems="center" gap={1}>
            <Button color="inherit" component={Link} to="/resources">Resources</Button>
            <Button color="inherit" component={Link} to="/bookings">Bookings</Button>
            <Button color="inherit" component={Link} to="/tickets">Tickets</Button>
            {isAdmin() && (
              <Button color="inherit" component={Link} to="/admin">Admin</Button>
            )}
            {isTechnician() && (
              <Button color="inherit" component={Link} to="/admin/tickets">Ticket Queue</Button>
            )}
            <NotificationBell />
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  )
}
