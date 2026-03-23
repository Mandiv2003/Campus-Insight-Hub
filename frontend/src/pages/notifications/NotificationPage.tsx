import { useState, useEffect } from 'react'
import {
  Box, Typography, List, ListItem, ListItemText,
  IconButton, Button, Chip, Divider,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { getNotifications, markAllRead, deleteNotification, markRead } from '../../api/notificationApi'

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
  entityType?: string
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => { load() }, [])

  const load = async () => {
    const res = await getNotifications({ size: 50 })
    setNotifications(res.data.data.content)
  }

  const handleMarkAll = async () => {
    await markAllRead()
    load()
  }

  const handleDelete = async (id: string) => {
    await deleteNotification(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleMarkRead = async (id: string) => {
    await markRead(id)
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <Box p={3} maxWidth={700} mx="auto">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>Notifications</Typography>
        <Button variant="outlined" size="small" onClick={handleMarkAll}>
          Mark all as read
        </Button>
      </Box>

      {notifications.length === 0 && (
        <Typography color="text.secondary">No notifications yet.</Typography>
      )}

      <List disablePadding>
        {notifications.map((n) => (
          <Box key={n.id}>
            <ListItem
              sx={{ bgcolor: n.read ? 'transparent' : 'action.hover', borderRadius: 1 }}
              secondaryAction={
                <IconButton edge="end" size="small" onClick={() => handleDelete(n.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
              onClick={() => !n.read && handleMarkRead(n.id)}
            >
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body1" fontWeight={n.read ? 400 : 700}>
                      {n.title}
                    </Typography>
                    {!n.read && <Chip label="New" size="small" color="primary" />}
                  </Box>
                }
                secondary={n.message}
              />
            </ListItem>
            <Divider />
          </Box>
        ))}
      </List>
    </Box>
  )
}
