import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Button, Paper, Typography, CircularProgress, Alert,
  Table, TableBody, TableCell, TableRow, Grid, Divider,
  TextField, Avatar, IconButton,
} from '@mui/material'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import {
  getTicket, addComment, editComment, deleteComment,
  uploadAttachment, deleteAttachment,
} from '../../api/incidentApi'
import type { Ticket } from '../../types/incident'
import { format } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080'

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commentBody, setCommentBody] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const load = async () => {
    try {
      const res = await getTicket(id!)
      setTicket(res.data?.data)
    } catch {
      setError('Failed to load ticket.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleAddComment = async () => {
    if (!commentBody.trim()) return
    setSubmittingComment(true)
    try {
      const res = await addComment(id!, commentBody)
      setTicket(t => t ? { ...t, comments: [...t.comments, res.data?.data] } : t)
      setCommentBody('')
    } catch {
      setError('Failed to add comment.')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editBody.trim()) return
    try {
      await editComment(id!, commentId, editBody)
      setTicket(t => t ? {
        ...t,
        comments: t.comments.map(c => c.id === commentId ? { ...c, body: editBody, edited: true } : c),
      } : t)
      setEditingComment(null)
    } catch {
      setError('Failed to edit comment.')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(id!, commentId)
      setTicket(t => t ? { ...t, comments: t.comments.filter(c => c.id !== commentId) } : t)
    } catch {
      setError('Failed to delete comment.')
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadAttachment(id!, file)
      setTicket(t => t ? { ...t, attachments: [...t.attachments, res.data?.data] } : t)
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to upload attachment.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await deleteAttachment(id!, attachmentId)
      setTicket(t => t ? { ...t, attachments: t.attachments.filter(a => a.id !== attachmentId) } : t)
    } catch {
      setError('Failed to delete attachment.')
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
  if (error && !ticket) return <Alert severity="error">{error}</Alert>
  if (!ticket) return <Alert severity="error">Ticket not found.</Alert>

  const canEdit = ticket.status === 'OPEN' && ticket.reportedById === user?.id

  return (
    <Box>
      <Button startIcon={<ArrowBackOutlinedIcon />} onClick={() => navigate('/tickets')} sx={{ mb: 2, color: '#6b7280' }}>
        Back to Tickets
      </Button>

      <PageHeader
        title={ticket.title}
        subtitle={`#${ticket.id.slice(0, 8)} · Reported on ${format(new Date(ticket.createdAt), 'dd MMM yyyy')}`}
        action={
          canEdit ? (
            <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => navigate(`/tickets/${id}/edit`)}>
              Edit
            </Button>
          ) : undefined
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Main info */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography sx={{ fontWeight: 600, mb: 2, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>Details</Typography>
            <Table size="small">
              <TableBody>
                {[
                  { label: 'Status',   value: <StatusBadge label={ticket.status} /> },
                  { label: 'Priority', value: <StatusBadge label={ticket.priority} /> },
                  { label: 'Category', value: ticket.category.replace(/_/g, ' ') },
                  { label: 'Reported by', value: ticket.reportedByName },
                  { label: 'Assigned to', value: ticket.assignedToName ?? 'Unassigned' },
                  { label: 'Location',  value: ticket.locationDetail ?? '—' },
                ].map(row => (
                  <TableRow key={row.label}>
                    <TableCell sx={{ color: '#6b7280', border: 'none', pl: 0, width: 130, py: 1 }}>{row.label}</TableCell>
                    <TableCell sx={{ border: 'none', py: 1 }}>{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.7 }}>{ticket.description}</Typography>
            {ticket.resolutionNotes && (
              <Box sx={{ mt: 2, p: 2, background: 'rgba(22,163,74,0.06)', borderRadius: '6px', borderLeft: '3px solid #16a34a' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Resolution
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, color: '#374151' }}>{ticket.resolutionNotes}</Typography>
              </Box>
            )}
          </Paper>

          {/* Comments */}
          <Paper sx={{ p: 3 }}>
            <Typography sx={{ fontWeight: 600, mb: 2 }}>Comments ({ticket.comments.length})</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              {ticket.comments.map(c => (
                <Box key={c.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: 12, background: '#1e40af' }}>
                      {c.authorName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" fontWeight={600}>{c.authorName}</Typography>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      {format(new Date(c.createdAt), 'dd MMM, HH:mm')}
                    </Typography>
                    {c.edited && <Typography variant="caption" sx={{ color: '#9ca3af' }}>(edited)</Typography>}
                    {c.authorId === user?.id && (
                      <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => { setEditingComment(c.id); setEditBody(c.body) }}>
                          <EditOutlinedIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                        <IconButton size="small" sx={{ color: '#ef4444' }} onClick={() => handleDeleteComment(c.id)}>
                          <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  {editingComment === c.id ? (
                    <Box sx={{ display: 'flex', gap: 1, ml: 4.5 }}>
                      <TextField
                        size="small" fullWidth multiline
                        value={editBody}
                        onChange={e => setEditBody(e.target.value)}
                      />
                      <Button size="small" variant="contained" onClick={() => handleEditComment(c.id)}>Save</Button>
                      <Button size="small" onClick={() => setEditingComment(null)}>Cancel</Button>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ ml: 4.5, color: '#374151' }}>{c.body}</Typography>
                  )}
                </Box>
              ))}
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small" fullWidth
                placeholder="Add a comment…"
                value={commentBody}
                onChange={e => setCommentBody(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment() } }}
                multiline maxRows={4}
              />
              <IconButton
                onClick={handleAddComment}
                disabled={!commentBody.trim() || submittingComment}
                sx={{ background: '#1e40af', color: '#fff', '&:hover': { background: '#1d3a9a' }, borderRadius: '8px', height: 36, width: 36, alignSelf: 'flex-end' }}
              >
                <SendOutlinedIcon fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>
                Attachments ({ticket.attachments.length}/3)
              </Typography>
              {ticket.attachments.length < 3 && ticket.reportedById === user?.id && (
                <>
                  <Button
                    size="small"
                    startIcon={<AttachFileOutlinedIcon fontSize="small" />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading…' : 'Attach'}
                  </Button>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" hidden onChange={handleUpload} />
                </>
              )}
            </Box>
            {ticket.attachments.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>No attachments.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {ticket.attachments.map(a => (
                  <Box key={a.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, background: '#f8fafc', borderRadius: '6px' }}>
                    <AttachFileOutlinedIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <a href={`${BACKEND_URL}${a.fileUrl}`} target="_blank" rel="noreferrer" style={{ color: '#1e40af' }}>
                          {a.fileName}
                        </a>
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                        {(a.fileSize / 1024).toFixed(1)} KB
                      </Typography>
                    </Box>
                    {a.uploadedById === user?.id && (
                      <IconButton size="small" sx={{ color: '#ef4444' }} onClick={() => handleDeleteAttachment(a.id)}>
                        <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
