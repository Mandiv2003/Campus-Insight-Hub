import { Chip } from '@mui/material'
import type { TicketPriority } from '../../../types/incident'

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: 'default' | 'info' | 'warning' | 'error' }> = {
  LOW:      { label: 'Low',      color: 'default'  },
  MEDIUM:   { label: 'Medium',   color: 'info'     },
  HIGH:     { label: 'High',     color: 'warning'  },
  CRITICAL: { label: 'Critical', color: 'error'    },
}

interface Props {
  priority: TicketPriority
  size?: 'small' | 'medium'
}

export default function PriorityChip({ priority, size = 'small' }: Props) {
  const { label, color } = PRIORITY_CONFIG[priority]
  return <Chip label={label} color={color} size={size} variant="outlined" />
}
