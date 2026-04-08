import { STATUS_BADGE, RESOURCE_TYPE_BADGE, ROLE_BADGE } from '../../theme/tokens'

type Variant = 'status' | 'resource-type' | 'role'

interface Props {
  label: string
  variant?: Variant
}

const FALLBACK = { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' }

export default function StatusBadge({ label, variant = 'status' }: Props) {
  if (!label) return null

  const map =
    variant === 'resource-type' ? RESOURCE_TYPE_BADGE
    : variant === 'role' ? ROLE_BADGE
    : STATUS_BADGE
  const token = map[label] ?? FALLBACK

  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 9999,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: token.color,
      background: token.bg,
      whiteSpace: 'nowrap',
    }}>
      {label.replace(/_/g, '\u00A0')}
    </span>
  )
}
