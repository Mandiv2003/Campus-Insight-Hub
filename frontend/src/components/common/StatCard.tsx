import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { STAT_BORDER } from '../../theme/tokens'

type ColorKey = 'info' | 'success' | 'warning' | 'danger' | 'accent'

interface Props {
  label: string
  value: string | number
  trend?: string
  icon?: ReactNode
  color?: ColorKey
}

export default function StatCard({ label, value, trend, icon, color = 'info' }: Props) {
  const borderColor = STAT_BORDER[color]
  return (
    <Box sx={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderLeft: `4px solid ${borderColor}`,
      borderRadius: '0 8px 8px 0',
      p: '20px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography sx={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
            textTransform: 'uppercase', color: '#6b7280', mb: 1,
          }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: 32, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>
            {value}
          </Typography>
          {trend && (
            <Typography variant="caption" sx={{ color: '#6b7280', mt: 0.5, display: 'block' }}>
              {trend}
            </Typography>
          )}
        </Box>
        {icon && (
          <Box sx={{ color: borderColor, opacity: 0.65, '& svg': { fontSize: 28 } }}>
            {icon}
          </Box>
        )}
      </Box>
    </Box>
  )
}
