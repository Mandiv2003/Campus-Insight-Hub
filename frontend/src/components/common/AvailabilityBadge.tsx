import { Chip } from '@mui/material'
import type { ResourceStatus } from '../../types/resource'

interface Props {
  status: ResourceStatus
  size?: 'small' | 'medium'
}

const STATUS_CONFIG: Record<ResourceStatus, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
  ACTIVE:         { label: 'Active',         color: 'success' },
  OUT_OF_SERVICE: { label: 'Out of Service', color: 'error'   },
  MAINTENANCE:    { label: 'Maintenance',    color: 'warning' },
  ARCHIVED:       { label: 'Archived',       color: 'default' },
}

export default function AvailabilityBadge({ status, size = 'small' }: Props) {
  const { label, color } = STATUS_CONFIG[status]
  return <Chip label={label} color={color} size={size} />
}
