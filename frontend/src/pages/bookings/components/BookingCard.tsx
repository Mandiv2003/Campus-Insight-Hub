import { Card, CardContent, CardActionArea, Typography, Box } from '@mui/material'
import EventIcon from '@mui/icons-material/Event'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import BookingStatusChip from './BookingStatusChip'
import type { Booking } from '../../../types/booking'

interface Props {
  booking: Booking
}

export default function BookingCard({ booking }: Props) {
  const navigate = useNavigate()

  return (
    <Card elevation={2}>
      <CardActionArea onClick={() => navigate(`/bookings/${booking.id}`)}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography variant="h6" fontWeight={700} noWrap sx={{ maxWidth: '75%' }}>
              {booking.title}
            </Typography>
            <BookingStatusChip status={booking.status} />
          </Box>

          <Box display="flex" alignItems="center" gap={0.5} mb={0.5} color="text.secondary">
            <MeetingRoomIcon fontSize="small" />
            <Typography variant="body2" noWrap>{booking.resourceName}</Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
            <EventIcon fontSize="small" />
            <Typography variant="body2">
              {format(new Date(booking.startDatetime), 'dd MMM yyyy, HH:mm')} –{' '}
              {format(new Date(booking.endDatetime), 'HH:mm')}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
