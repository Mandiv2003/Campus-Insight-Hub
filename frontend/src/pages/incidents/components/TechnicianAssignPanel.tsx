import { useState, useEffect } from 'react'
import {
  Box, Typography, Autocomplete, TextField, Button, Alert,
} from '@mui/material'
import { assignTechnician } from '../../../api/incidentApi'
import { getTechnicians } from '../../../api/userApi'

interface Technician {
  id: string
  fullName: string
  email: string
}

interface Props {
  ticketId: string
  currentAssigneeId: string | null
  currentAssigneeName: string | null
  onAssigned: (assignedToId: string, assignedToName: string) => void
}

export default function TechnicianAssignPanel({
  ticketId, currentAssigneeId, currentAssigneeName, onAssigned
}: Props) {
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [selected, setSelected] = useState<Technician | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTechnicians()
      .then((res) => setTechnicians(res.data.data))
      .catch(() => setError('Could not load technicians'))
  }, [])

  const handleAssign = async () => {
    if (!selected) return
    setSaving(true)
    setError(null)
    try {
      await assignTechnician(ticketId, selected.id)
      onAssigned(selected.id, selected.fullName)
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Assignment failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} mb={1}>
        Assign Technician
        {currentAssigneeName && (
          <Typography component="span" variant="body2" color="text.secondary" ml={1}>
            (Currently: {currentAssigneeName})
          </Typography>
        )}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

      <Box display="flex" gap={1}>
        <Autocomplete
          options={technicians}
          getOptionLabel={(t) => `${t.fullName} (${t.email})`}
          value={selected}
          onChange={(_, val) => setSelected(val)}
          renderInput={(params) => (
            <TextField {...params} size="small" placeholder="Search technician..." />
          )}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          onClick={handleAssign}
          disabled={!selected || saving}
          size="small"
        >
          Assign
        </Button>
      </Box>
    </Box>
  )
}
