import { Box, Typography, Button } from '@mui/material'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'

interface Props {
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  icon?: React.ReactNode
}

export default function EmptyState({ title, description, action, icon }: Props) {
  return (
    <Box sx={{ textAlign: 'center', py: 10, px: 4 }}>
      <Box sx={{ color: '#d1d5db', mb: 2, '& svg': { fontSize: 56 } }}>
        {icon ?? <InboxOutlinedIcon />}
      </Box>
      <Typography variant="h6" fontWeight={600} sx={{ color: '#374151', mb: 1 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
          {description}
        </Typography>
      )}
      {action && (
        <Button variant="contained" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Box>
  )
}
