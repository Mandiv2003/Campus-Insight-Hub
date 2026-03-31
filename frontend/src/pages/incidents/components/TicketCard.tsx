import { Card, CardActionArea, CardContent, Typography, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import TicketStatusChip from './TicketStatusChip'
import PriorityChip from './PriorityChip'
import type { Ticket } from '../../../types/incident'

interface Props {
  ticket: Ticket
}

export default function TicketCard({ ticket }: Props) {
  const navigate = useNavigate()

  return (
    <Card elevation={2}>
      <CardActionArea onClick={() => navigate(`/tickets/${ticket.id}`)}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography variant="h6" fontWeight={700} noWrap sx={{ maxWidth: '60%' }}>
              {ticket.title}
            </Typography>
            <Box display="flex" gap={0.5}>
              <PriorityChip priority={ticket.priority} />
              <TicketStatusChip status={ticket.status} />
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" noWrap mb={1}>
            {ticket.category.replace('_', ' ')} — {ticket.locationDetail ?? 'No location'}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Reported {format(new Date(ticket.createdAt), 'dd MMM yyyy')}
            {ticket.assignedToName ? ` · Assigned to ${ticket.assignedToName}` : ''}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
