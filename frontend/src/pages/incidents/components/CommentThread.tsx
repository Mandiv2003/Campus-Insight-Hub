import { useState } from 'react'
import {
  Box, Typography, Avatar, TextField, Button,
  IconButton, Divider, CircularProgress,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SendIcon from '@mui/icons-material/Send'
import { format } from 'date-fns'
import { addComment, editComment, deleteComment } from '../../../api/incidentApi'
import type { Comment } from '../../../types/incident'

interface Props {
  ticketId: string
  comments: Comment[]
  currentUserId: string
  isAdmin: boolean
  onCommentsChange: (comments: Comment[]) => void
}

export default function CommentThread({
  ticketId, comments, currentUserId, isAdmin, onCommentsChange
}: Props) {
  const [newBody, setNewBody] = useState('')
  const [posting, setPosting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')

  const handlePost = async () => {
    if (!newBody.trim()) return
    setPosting(true)
    try {
      const res = await addComment(ticketId, newBody.trim())
      onCommentsChange([...comments, res.data.data])
      setNewBody('')
    } finally {
      setPosting(false)
    }
  }

  const handleEdit = async (commentId: string) => {
    if (!editBody.trim()) return
    const res = await editComment(ticketId, commentId, editBody.trim())
    onCommentsChange(comments.map((c) => (c.id === commentId ? res.data.data : c)))
    setEditingId(null)
  }

  const handleDelete = async (commentId: string) => {
    await deleteComment(ticketId, commentId)
    onCommentsChange(comments.filter((c) => c.id !== commentId))
  }

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700} mb={2}>
        Comments ({comments.length})
      </Typography>

      {comments.map((c, i) => (
        <Box key={c.id}>
          <Box display="flex" gap={1.5} mb={1.5}>
            <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
              {c.authorName.charAt(0)}
            </Avatar>
            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" fontWeight={700}>{c.authorName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(c.createdAt), 'dd MMM yyyy, HH:mm')}
                </Typography>
                {c.edited && (
                  <Typography variant="caption" color="text.secondary">(edited)</Typography>
                )}
                {(c.authorId === currentUserId || isAdmin) && (
                  <Box ml="auto" display="flex">
                    {c.authorId === currentUserId && (
                      <IconButton size="small" onClick={() => { setEditingId(c.id); setEditBody(c.body) }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>

              {editingId === c.id ? (
                <Box mt={1}>
                  <TextField
                    fullWidth multiline minRows={2}
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    size="small"
                  />
                  <Box display="flex" gap={1} mt={1}>
                    <Button size="small" variant="contained" onClick={() => handleEdit(c.id)}>Save</Button>
                    <Button size="small" onClick={() => setEditingId(null)}>Cancel</Button>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" mt={0.5} sx={{ whiteSpace: 'pre-wrap' }}>
                  {c.body}
                </Typography>
              )}
            </Box>
          </Box>
          {i < comments.length - 1 && <Divider sx={{ mb: 1.5 }} />}
        </Box>
      ))}

      {comments.length === 0 && (
        <Typography color="text.secondary" variant="body2" mb={2}>No comments yet.</Typography>
      )}

      <Box display="flex" gap={1} mt={2}>
        <TextField
          fullWidth multiline minRows={2}
          placeholder="Add a comment..."
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
          size="small"
        />
        <Button
          variant="contained"
          onClick={handlePost}
          disabled={posting || !newBody.trim()}
          sx={{ alignSelf: 'flex-end' }}
          endIcon={posting ? <CircularProgress size={14} /> : <SendIcon />}
        >
          Post
        </Button>
      </Box>
    </Box>
  )
}
