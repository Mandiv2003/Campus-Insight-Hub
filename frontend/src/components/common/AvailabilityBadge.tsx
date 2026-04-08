import { STATUS_BADGE } from '../../theme/tokens'
import type { ResourceStatus } from '../../types/resource'

interface Props {
  status: ResourceStatus
  size?: 'small' | 'medium'
}

export default function AvailabilityBadge({ status, size = 'medium' }: Props) {
  if (!status) return null
  const token = STATUS_BADGE[status] ?? { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' }
  return (
    <span style={{
      display: 'inline-block',
      padding: size === 'small' ? '1px 8px' : '2px 10px',
      borderRadius: 9999,
      fontSize: size === 'small' ? 10 : 11,
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: token.color,
      background: token.bg,
      whiteSpace: 'nowrap',
    }}>
      {status.replace(/_/g, '\u00A0')}
    </span>
  )
}
