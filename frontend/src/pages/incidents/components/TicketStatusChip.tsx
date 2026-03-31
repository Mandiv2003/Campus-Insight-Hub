import { Chip } from '@mui/material'
import type { TicketStatus } from '../../../types/incident'

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: 'default' | 'info' | 'success' | 'secondary' | 'error' }> = {
  OPEN:        { label: 'Open',        color: 'info'      },
  IN_PROGRESS: { label: 'In Progress', color: 'secondary' },
  RESOLVED:    { label: 'Resolved',    color: 'success'   },
  CLOSED:      { label: 'Closed',      color: 'default'   },
  REJECTED:    { label: 'Rejected',    color: 'error'     },
}

interface Props {
  status: TicketStatus
  size?: 'small' | 'medium'
}

export default function TicketStatusChip({ status, size = 'small' }: Props) {
  const { label, color } = STATUS_CONFIG[status]
  return <Chip label={label} color={color} size={size} />
}
