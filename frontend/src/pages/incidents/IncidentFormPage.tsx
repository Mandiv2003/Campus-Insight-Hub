import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Box, CircularProgress } from '@mui/material'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import { createTicket, updateTicket, getTicket } from '../../api/incidentApi'
import type { TicketPriority, TicketCategory } from '../../types/incident'

interface FormData {
  title: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  locationDetail: string
  contactPhone: string
  contactEmail: string
}

const CATEGORIES: TicketCategory[] = ['ELECTRICAL', 'PLUMBING', 'IT_EQUIPMENT', 'FURNITURE', 'HVAC', 'SAFETY', 'OTHER']
const PRIORITIES: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

const C = {
  bg: '#0b1326',
  card: '#131b2e',
  input: '#131b2e',
  inputFocus: '#222a3d',
  primary: '#b8c4ff',
  primaryContainer: '#1e40af',
  onSurface: '#dae2fd',
  onSurfaceVariant: '#c4c5d5',
  outlineVariant: '#444653',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: C.input,
  border: 'none',
  borderRadius: 8,
  padding: '12px 16px',
  color: C.onSurface,
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 500,
  color: '#94a3b8',
  marginBottom: 6,
  marginLeft: 2,
}

const sectionHeaderStyle = (_num: number): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
})

export default function IncidentFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = !!id

  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loadingTicket, setLoadingTicket] = useState(isEditMode)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues: { priority: 'MEDIUM', category: 'OTHER' },
  })

  useEffect(() => {
    if (!isEditMode) return
    getTicket(id)
      .then(res => {
        const t = res.data?.data
        reset({
          title:         t.title         ?? '',
          description:   t.description   ?? '',
          category:      t.category      ?? 'OTHER',
          priority:      t.priority      ?? 'MEDIUM',
          locationDetail: t.locationDetail ?? '',
          contactPhone:  t.contactPhone  ?? '',
          contactEmail:  t.contactEmail  ?? '',
        })
      })
      .catch(() => setError('Failed to load ticket data.'))
      .finally(() => setLoadingTicket(false))
  }, [id])

  const onSubmit = handleSubmit(async (data) => {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...data,
        locationDetail: data.locationDetail || null,
        contactPhone:   data.contactPhone   || null,
        contactEmail:   data.contactEmail   || null,
      }
      if (isEditMode) {
        await updateTicket(id, payload)
        navigate(`/tickets/${id}`)
      } else {
        const res = await createTicket(payload)
        navigate(`/tickets/${res.data?.data?.id}`)
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? (isEditMode ? 'Failed to update ticket.' : 'Failed to submit ticket.'))
    } finally {
      setSaving(false)
    }
  })

  if (loadingTicket) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', background: C.bg, color: C.onSurface, p: { xs: 2, md: 4 } }}>
      {/* Back button */}
      <button
        onClick={() => navigate(isEditMode ? `/tickets/${id}` : '/tickets')}
        style={{
          background: 'none', border: 'none', color: '#94a3b8',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 14, fontWeight: 500, marginBottom: 24, padding: 0,
          fontFamily: 'inherit',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = C.onSurface)}
        onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
      >
        <ArrowBackOutlinedIcon sx={{ fontSize: 18 }} />
        {isEditMode ? 'Back to Ticket' : 'Back to Tickets'}
      </button>

      {/* Page Header */}
      <div style={{ maxWidth: 720, marginBottom: 28 }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', margin: 0, marginBottom: 8 }}>
          {isEditMode ? 'Edit Incident' : 'Report an Incident'}
        </h2>
        <p style={{ color: C.onSurfaceVariant, fontSize: 16, margin: 0 }}>
          {isEditMode
            ? 'Update the incident details below. Only OPEN tickets can be edited.'
            : 'Describe the issue and our team will address it promptly.'}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: '#f8717120', border: '1px solid #f87171', color: '#f87171',
          padding: '12px 16px', borderRadius: 8, marginBottom: 20, maxWidth: 720,
        }}>
          {error}
        </div>
      )}

      {/* Form Card */}
      <div style={{
        maxWidth: 720,
        background: C.card,
        borderRadius: 12,
        padding: '32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        {/* Top accent bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${C.primary}, ${C.primaryContainer})`,
        }} />

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Section 1: Incident Details */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={sectionHeaderStyle(1)}>
              <span style={{
                width: 22, height: 22, borderRadius: 4,
                background: `${C.primary}18`, color: C.primary,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>1</span>
              <h3 style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: `${C.primary}cc` }}>
                Incident Details
              </h3>
            </div>

            <div>
              <label style={labelStyle}>Title *</label>
              <input
                {...register('title', { required: 'Title is required' })}
                placeholder="Brief title of the issue"
                style={inputStyle}
              />
              {errors.title && <span style={{ color: '#f87171', fontSize: 11, marginTop: 4, display: 'block' }}>{errors.title.message}</span>}
            </div>

            <div>
              <label style={labelStyle}>Description *</label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                placeholder="Describe the issue in detail — what happened, when, symptoms…"
                rows={4}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
              />
              {errors.description && <span style={{ color: '#f87171', fontSize: 11, marginTop: 4, display: 'block' }}>{errors.description.message}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Category *</label>
                <select
                  {...register('category', { required: 'Required' })}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Priority *</label>
                <select
                  {...register('priority', { required: 'Required' })}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {PRIORITIES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Section 2: Location */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={sectionHeaderStyle(2)}>
              <span style={{
                width: 22, height: 22, borderRadius: 4,
                background: `${C.primary}18`, color: C.primary,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>2</span>
              <h3 style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: `${C.primary}cc` }}>
                Location Detail
              </h3>
            </div>
            <div>
              <label style={labelStyle}>Location (optional)</label>
              <input
                {...register('locationDetail')}
                placeholder="Room number, floor, or specific spot"
                style={inputStyle}
              />
            </div>
          </section>

          {/* Section 3: Contact */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={sectionHeaderStyle(3)}>
              <span style={{
                width: 22, height: 22, borderRadius: 4,
                background: `${C.primary}18`, color: C.primary,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>3</span>
              <h3 style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: `${C.primary}cc` }}>
                Contact Information
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Phone (optional)</label>
                <input
                  {...register('contactPhone')}
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email (optional)</label>
                <input
                  {...register('contactEmail')}
                  type="email"
                  placeholder="your@email.com"
                  style={inputStyle}
                />
              </div>
            </div>
          </section>

          {/* Footer */}
          <div style={{
            paddingTop: 24,
            borderTop: `1px solid ${C.outlineVariant}1a`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
          }}>
            <p style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic', margin: 0 }}>
              {isEditMode
                ? 'Changes are saved immediately and the ticket status stays OPEN.'
                : 'Once submitted, you can track the status in My Tickets.'}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => navigate(isEditMode ? `/tickets/${id}` : '/tickets')}
                style={{
                  background: 'none', border: 'none', color: '#94a3b8',
                  padding: '10px 20px', borderRadius: 8, fontSize: 14,
                  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
                  color: '#001453', border: 'none', borderRadius: 8,
                  padding: '10px 28px', fontSize: 14, fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                {saving ? (
                  <><CircularProgress size={14} sx={{ color: '#001453' }} /> {isEditMode ? 'Saving…' : 'Submitting…'}</>
                ) : (isEditMode ? 'Save Changes' : 'Submit Report')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Box>
  )
}
