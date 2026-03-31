import { Chip } from '@mui/material'
import type { BookingStatus } from '../../../types/booking'

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: 'warning' | 'success' | 'error' | 'default' }> = {
  PENDING:   { label: 'Pending',   color: 'warning' },
  APPROVED:  { label: 'Approved',  color: 'success' },
  REJECTED:  { label: 'Rejected',  color: 'error'   },
  CANCELLED: { label: 'Cancelled', color: 'default' },
}

interface Props {
  status: BookingStatus
  size?: 'small' | 'medium'
}

export default function BookingStatusChip({ status, size = 'small' }: Props) {
  const { label, color } = STATUS_CONFIG[status]
  return <Chip label={label} color={color} size={size} />
}
