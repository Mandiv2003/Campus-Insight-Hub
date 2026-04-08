import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconButton, Badge, Tooltip } from '@mui/material'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import { getUnreadCount } from '../../api/notificationApi'

export default function NotificationBell() {
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await getUnreadCount()
        const d = res.data?.data
        if (!cancelled) setUnread(typeof d === 'number' ? d : (d?.count ?? 0))
      } catch {
        // Silently fail — bell just shows no badge
      }
    }
    load()
    const interval = setInterval(load, 30_000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  return (
    <Tooltip title="Notifications">
      <IconButton onClick={() => navigate('/notifications')} size="small" sx={{ color: '#374151' }}>
        <Badge badgeContent={unread} color="error" max={99}>
          <NotificationsOutlinedIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  )
}
