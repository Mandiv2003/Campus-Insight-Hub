import { Alert, Box, Typography } from '@mui/material'
import type { TimeSlot } from '../../../types/booking'
import { format } from 'date-fns'

interface Props {
  conflicts: TimeSlot[]
}

export default function ConflictWarning({ conflicts }: Props) {
  if (conflicts.length === 0) return null

  return (
    <Alert severity="error" sx={{ mt: 2 }}>
      <Typography fontWeight={700} mb={1}>
        This time overlaps with {conflicts.length} approved booking{conflicts.length > 1 ? 's' : ''}:
      </Typography>
      {conflicts.map((slot, i) => (
        <Box key={i} fontSize={13}>
          {format(new Date(slot.startDatetime), 'HH:mm')} –{' '}
          {format(new Date(slot.endDatetime), 'HH:mm')}
        </Box>
      ))}
      <Typography fontSize={12} mt={1} color="text.secondary">
        Your request will be saved as PENDING and an admin can approve it later.
      </Typography>
    </Alert>
  )
}
