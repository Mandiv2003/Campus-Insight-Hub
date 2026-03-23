import { Card, CardContent, CardActionArea, Typography, Box } from '@mui/material'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
import ScienceIcon from '@mui/icons-material/Science'
import SchoolIcon from '@mui/icons-material/School'
import BuildIcon from '@mui/icons-material/Build'
import PeopleIcon from '@mui/icons-material/People'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import { useNavigate } from 'react-router-dom'
import AvailabilityBadge from '../../../components/common/AvailabilityBadge'
import type { Resource, ResourceType } from '../../../types/resource'

const TYPE_ICONS: Record<ResourceType, React.ReactNode> = {
  LECTURE_HALL: <SchoolIcon />,
  LAB:          <ScienceIcon />,
  MEETING_ROOM: <MeetingRoomIcon />,
  EQUIPMENT:    <BuildIcon />,
}

interface Props {
  resource: Resource
}

export default function ResourceCard({ resource }: Props) {
  const navigate = useNavigate()

  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardActionArea
        onClick={() => navigate(`/resources/${resource.id}`)}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        {resource.imageUrl && (
          <Box
            component="img"
            src={resource.imageUrl}
            alt={resource.name}
            sx={{ width: '100%', height: 160, objectFit: 'cover' }}
          />
        )}
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography variant="h6" fontWeight={700} noWrap sx={{ maxWidth: '70%' }}>
              {resource.name}
            </Typography>
            <AvailabilityBadge status={resource.status} />
          </Box>

          <Box display="flex" alignItems="center" gap={0.5} mb={1} color="text.secondary">
            {TYPE_ICONS[resource.type]}
            <Typography variant="body2">
              {resource.type.replace('_', ' ')}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={0.5} mb={1} color="text.secondary">
            <LocationOnIcon fontSize="small" />
            <Typography variant="body2" noWrap>{resource.location}</Typography>
          </Box>

          {resource.capacity != null && (
            <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
              <PeopleIcon fontSize="small" />
              <Typography variant="body2">Capacity: {resource.capacity}</Typography>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
