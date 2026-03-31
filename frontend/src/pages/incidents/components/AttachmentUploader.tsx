import { useState, useRef } from 'react'
import { Box, Button, Typography, IconButton, CircularProgress, Alert } from '@mui/material'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import DeleteIcon from '@mui/icons-material/Delete'
import { uploadAttachment, deleteAttachment } from '../../../api/incidentApi'
import type { Attachment } from '../../../types/incident'

interface Props {
  ticketId: string
  attachments: Attachment[]
  canUpload: boolean          // false if ticket is not OPEN or user is not owner/admin
  onAttachmentsChange: (attachments: Attachment[]) => void
}

const MAX_ATTACHMENTS = 3

export default function AttachmentUploader({ ticketId, attachments, canUpload, onAttachmentsChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const res = await uploadAttachment(ticketId, file)
      onAttachmentsChange([...attachments, res.data.data])
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleDelete = async (attachmentId: string) => {
    try {
      await deleteAttachment(ticketId, attachmentId)
      onAttachmentsChange(attachments.filter((a) => a.id !== attachmentId))
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Delete failed')
    }
  }

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} mb={1}>
        Attachments ({attachments.length}/{MAX_ATTACHMENTS})
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

      {attachments.map((a) => (
        <Box key={a.id} display="flex" alignItems="center" gap={1} mb={0.5}>
          <a
            href={`http://localhost:8080${a.fileUrl}`}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 13, flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {a.fileName}
          </a>
          <Typography variant="caption" color="text.secondary">
            {(a.fileSize / 1024).toFixed(1)} KB
          </Typography>
          {canUpload && (
            <IconButton size="small" color="error" onClick={() => handleDelete(a.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ))}

      {canUpload && attachments.length < MAX_ATTACHMENTS && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <Button
            size="small"
            variant="outlined"
            startIcon={uploading ? <CircularProgress size={14} /> : <AttachFileIcon />}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            sx={{ mt: 1 }}
          >
            {uploading ? 'Uploading...' : 'Add Image'}
          </Button>
          <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
            JPEG or PNG only · max 5 MB
          </Typography>
        </>
      )}
    </Box>
  )
}
