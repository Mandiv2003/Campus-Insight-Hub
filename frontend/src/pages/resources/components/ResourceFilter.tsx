import { Box, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material'
import type { ResourceStatus, ResourceType } from '../../../types/resource'

interface Filters {
  type: ResourceType | ''
  location: string
  minCapacity: string
  status: ResourceStatus | ''
}

interface Props {
  filters: Filters
  onChange: (filters: Filters) => void
  onClear: () => void
}

export default function ResourceFilter({ filters, onChange, onClear }: Props) {
  const set = (key: keyof Filters, value: string) =>
    onChange({ ...filters, [key]: value })

  return (
    <Box display="flex" gap={2} flexWrap="wrap" alignItems="center" mb={3}>
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Type</InputLabel>
        <Select value={filters.type} label="Type"
                onChange={(e) => set('type', e.target.value)}>
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="LECTURE_HALL">Lecture Hall</MenuItem>
          <MenuItem value="LAB">Lab</MenuItem>
          <MenuItem value="MEETING_ROOM">Meeting Room</MenuItem>
          <MenuItem value="EQUIPMENT">Equipment</MenuItem>
        </Select>
      </FormControl>

      <TextField
        size="small" label="Location" value={filters.location}
        onChange={(e) => set('location', e.target.value)}
        sx={{ width: 160 }}
      />

      <TextField
        size="small" label="Min Capacity" type="number"
        value={filters.minCapacity}
        onChange={(e) => set('minCapacity', e.target.value)}
        sx={{ width: 130 }}
      />

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Status</InputLabel>
        <Select value={filters.status} label="Status"
                onChange={(e) => set('status', e.target.value)}>
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="ACTIVE">Active</MenuItem>
          <MenuItem value="OUT_OF_SERVICE">Out of Service</MenuItem>
          <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
        </Select>
      </FormControl>

      <Button variant="outlined" size="small" onClick={onClear}>Clear</Button>
    </Box>
  )
}
