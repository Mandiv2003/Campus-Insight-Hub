import { useState, useEffect } from 'react'
import { IconButton, Badge, Menu, MenuItem, Typography, Box, Divider } from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { getUnreadCount, getNotifications, markRead } from '../../api/notificationApi'
import { useNavigate } from 'react-router-dom'

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export default function NotificationBell() {
  const [count, setCount] = useState(0)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 30_000)
    return () => clearInterval(interval)
  }, [])

  const fetchCount = async () => {
    try {
      const res = await getUnreadCount()
      setCount(res.data.data.count)
    } catch {
      // silently ignore polling errors
    }
  }

  const handleOpen = async (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget)
    const res = await getNotifications({ isRead: false, size: 5 })
    setNotifications(res.data.data.content)
  }

  const handleClose = () => setAnchorEl(null)

  const handleClick = async (n: Notification) => {
    if (!n.read) await markRead(n.id)
    handleClose()
    navigate('/notifications')
  }

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={count} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}
            PaperProps={{ sx: { width: 360, maxHeight: 400 } }}>
        <Box px={2} py={1}>
          <Typography variant="subtitle2" fontWeight={700}>Notifications</Typography>
        </Box>
        <Divider />
        {notifications.length === 0 && (
          <MenuItem disabled><Typography variant="body2">No unread notifications</Typography></MenuItem>
        )}
        {notifications.map((n) => (
          <MenuItem key={n.id} onClick={() => handleClick(n)}
                    sx={{ whiteSpace: 'normal', bgcolor: n.read ? 'transparent' : 'action.hover' }}>
            <Box>
              <Typography variant="body2" fontWeight={600}>{n.title}</Typography>
              <Typography variant="caption" color="text.secondary">{n.message}</Typography>
            </Box>
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={() => { navigate('/notifications'); handleClose() }}>
          <Typography variant="body2" color="primary">View all</Typography>
        </MenuItem>
      </Menu>
    </>
  )
}
