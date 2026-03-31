import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Paper, CircularProgress, Button,
  Divider, IconButton, Alert,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { format } from 'date-fns'
import { getTicket, deleteTicket } from '../../api/incidentApi'
import { useAuth } from '../../context/AuthContext'
import TicketStatusChip from './components/TicketStatusChip'
import PriorityChip from './components/PriorityChip'
import AttachmentUploader from './components/AttachmentUploader'
import CommentThread from './components/CommentThread'
import type { Ticket } from '../../types/incident'

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) return
    getTicket(id)
      .then((res) => setTicket(res.data.data))
      .catch(() => setError('Ticket not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
  if (error || !ticket) return <Box p={3}><Alert severity="error">{error ?? 'Not found'}</Alert></Box>

  const isOwner = user?.id === ticket.reportedById
  const canEdit = isOwner && ticket.status === 'OPEN'
  const canAttach = (isOwner || isAdmin) && ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED'

  const hoursOpen = Math.floor(
    (Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60)
  )

  return (
    <Box p={3} maxWidth={800} mx="auto">
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
        <Typography variant="h5" fontWeight={700} flex={1}>{ticket.title}</Typography>
        {canEdit && (
          <Button variant="outlined" size="small" onClick={() => navigate(`/tickets/${ticket.id}/edit`)}>
            Edit
          </Button>
        )}
        {(isOwner && ticket.status === 'OPEN') || isAdmin ? (
          <Button variant="outlined" color="error" size="small" onClick={async () => {
            await deleteTicket(ticket.id)
            navigate('/tickets')
          }}>
            Delete
          </Button>
        ) : null}
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          <TicketStatusChip status={ticket.status} size="medium" />
          <PriorityChip priority={ticket.priority} size="medium" />
          <Typography variant="caption" color="text.secondary" alignSelf="center">
            Open for {hoursOpen}h
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
          {ticket.description}
        </Typography>

        <Box display="flex" flexWrap="wrap" gap={3} mb={2}>
          <Box>
            <Typography variant="caption" color="text.secondary">Category</Typography>
            <Typography variant="body2">{ticket.category.replace('_', ' ')}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Location</Typography>
            <Typography variant="body2">{ticket.locationDetail ?? '—'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Reported by</Typography>
            <Typography variant="body2">{ticket.reportedByName}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Assigned to</Typography>
            <Typography variant="body2">{ticket.assignedToName ?? 'Unassigned'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Reported</Typography>
            <Typography variant="body2">{format(new Date(ticket.createdAt), 'dd MMM yyyy, HH:mm')}</Typography>
          </Box>
          {ticket.resolvedAt && (
            <Box>
              <Typography variant="caption" color="text.secondary">Resolved</Typography>
              <Typography variant="body2">{format(new Date(ticket.resolvedAt), 'dd MMM yyyy, HH:mm')}</Typography>
            </Box>
          )}
        </Box>

        {ticket.resolutionNotes && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={700}>Resolution Notes:</Typography>
            <Typography variant="body2">{ticket.resolutionNotes}</Typography>
          </Alert>
        )}
        {ticket.rejectionReason && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={700}>Rejection Reason:</Typography>
            <Typography variant="body2">{ticket.rejectionReason}</Typography>
          </Alert>
        )}

        <Divider sx={{ my: 2 }} />

        <AttachmentUploader
          ticketId={ticket.id}
          attachments={ticket.attachments}
          canUpload={canAttach}
          onAttachmentsChange={(attachments) => setTicket({ ...ticket, attachments })}
        />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <CommentThread
          ticketId={ticket.id}
          comments={ticket.comments}
          currentUserId={user?.id ?? ''}
          isAdmin={isAdmin}
          onCommentsChange={(comments) => setTicket({ ...ticket, comments })}
        />
      </Paper>
    </Box>
  )
}
