import { useState, useEffect } from 'react'
import {
  Box, Button, Paper, Typography, CircularProgress, Alert,
  List, ListItem, IconButton, Divider,
} from '@mui/material'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined'
import { getNotifications, markRead, markAllRead, deleteNotification } from '../../api/notificationApi'
import type { Notification } from '../../types/notification'
import { format } from 'date-fns'
import PageHeader from '../../components/common/PageHeader'
import EmptyState from '../../components/common/EmptyState'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string | boolean> = {}
      if (filter === 'unread') params.unread = true
      const res = await getNotifications(params)
      setNotifications(res.data?.data?.content ?? res.data?.data ?? [])
    } catch {
      setError('Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch {
      setError('Failed to mark as read.')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch {
      setError('Failed to mark all as read.')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch {
      setError('Failed to delete notification.')
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Box>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        action={
          unreadCount > 0 ? (
            <Button
              variant="outlined"
              startIcon={<DoneAllOutlinedIcon />}
              onClick={handleMarkAllRead}
            >
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        {(['all', 'unread'] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setFilter(f)}
            sx={{ textTransform: 'capitalize' }}
          >
            {f}
          </Button>
        ))}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : notifications.length === 0 ? (
        <EmptyState
          title={filter === 'unread' ? 'No unread notifications' : 'No notifications'}
          description={filter === 'unread' ? "You're all caught up!" : 'Notifications will appear here.'}
          icon={<NotificationsOutlinedIcon />}
        />
      ) : (
        <Paper>
          <List disablePadding>
            {notifications.map((n, i) => (
              <Box key={n.id}>
                {i > 0 && <Divider />}
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    py: 2, px: 3,
                    background: n.read ? 'transparent' : 'rgba(30,64,175,0.03)',
                    cursor: !n.read ? 'pointer' : 'default',
                    '&:hover': { background: '#f8fafc', '& .notification-title': { color: '#111827' } },
                    transition: 'background 0.15s',
                  }}
                  onClick={() => { if (!n.read) handleMarkRead(n.id) }}
                >
                  <Box sx={{ flex: 1, pr: 5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography
                        variant="body2"
                        fontWeight={n.read ? 400 : 700}
                        className="notification-title"
                        sx={{ color: '#9ca3af', transition: 'color 0.15s' }}
                      >
                        {n.title}
                      </Typography>
                      {!n.read && (
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: '#1e40af', flexShrink: 0 }} />
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.6 }}>
                      {n.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280', mt: 0.5, display: 'block' }}>
                      {format(new Date(n.createdAt), 'dd MMM yyyy, HH:mm')}
                    </Typography>
                  </Box>
                  <Box sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }}>
                    <IconButton
                      size="small"
                      sx={{ color: '#d1d5db', '&:hover': { color: '#ef4444' } }}
                      onClick={e => { e.stopPropagation(); handleDelete(n.id) }}
                    >
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItem>
              </Box>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  )
}
