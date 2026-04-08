export const STATUS_BADGE: Record<string, { color: string; bg: string }> = {
  PENDING:        { color: '#d97706', bg: 'rgba(217,119,6,0.10)' },
  APPROVED:       { color: '#16a34a', bg: 'rgba(22,163,74,0.10)' },
  REJECTED:       { color: '#dc2626', bg: 'rgba(220,38,38,0.10)' },
  CANCELLED:      { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' },
  OPEN:           { color: '#2563eb', bg: 'rgba(37,99,235,0.10)' },
  IN_PROGRESS:    { color: '#0891b2', bg: 'rgba(8,145,178,0.10)' },
  RESOLVED:       { color: '#16a34a', bg: 'rgba(22,163,74,0.10)' },
  CLOSED:         { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' },
  CRITICAL:       { color: '#991b1b', bg: 'rgba(153,27,27,0.10)' },
  HIGH:           { color: '#dc2626', bg: 'rgba(220,38,38,0.10)' },
  MEDIUM:         { color: '#d97706', bg: 'rgba(217,119,6,0.10)' },
  LOW:            { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' },
  ACTIVE:         { color: '#16a34a', bg: 'rgba(22,163,74,0.10)' },
  OUT_OF_SERVICE: { color: '#dc2626', bg: 'rgba(220,38,38,0.10)' },
  MAINTENANCE:    { color: '#d97706', bg: 'rgba(217,119,6,0.10)' },
  ARCHIVED:       { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' },
}

export const RESOURCE_TYPE_BADGE: Record<string, { color: string; bg: string }> = {
  LECTURE_HALL: { color: '#1e40af', bg: 'rgba(30,64,175,0.10)' },
  LAB:          { color: '#0f766e', bg: 'rgba(15,118,110,0.10)' },
  MEETING_ROOM: { color: '#6d28d9', bg: 'rgba(109,40,217,0.10)' },
  EQUIPMENT:    { color: '#c2410c', bg: 'rgba(194,65,12,0.10)' },
}

export const ROLE_BADGE: Record<string, { color: string; bg: string }> = {
  ADMIN:      { color: '#dc2626', bg: 'rgba(220,38,38,0.10)' },
  TECHNICIAN: { color: '#0891b2', bg: 'rgba(8,145,178,0.10)' },
  USER:       { color: '#2563eb', bg: 'rgba(37,99,235,0.10)' },
}

export const STAT_BORDER: Record<string, string> = {
  info:    '#1e40af',
  success: '#16a34a',
  warning: '#d97706',
  danger:  '#dc2626',
  accent:  '#6d28d9',
}
