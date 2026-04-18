import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { getMyTickets, deleteTicket } from '../../api/incidentApi'
import type { Ticket, TicketStatus, TicketPriority } from '../../types/incident'
import { useAuth } from '../../context/AuthContext'
import { format } from 'date-fns'

const C = {
  bg: '#0b1326',
  card: '#171f33',
  cardLow: '#131b2e',
  surfaceHigh: '#222a3d',
  surfaceHighest: '#2d3449',
  primary: '#b8c4ff',
  primaryContainer: '#1e40af',
  onSurface: '#dae2fd',
  onSurfaceVariant: '#c4c5d5',
  outlineVariant: '#444653',
  tertiary: '#ffb59a',
}

const PRIORITY_BADGE: Record<string, { bg: string; text: string }> = {
  CRITICAL: { bg: '#ffb4ab20', text: '#ffb4ab' },
  HIGH:     { bg: '#fb923c20', text: '#fb923c' },
  MEDIUM:   { bg: '#facc1520', text: '#facc15' },
  LOW:      { bg: '#4ade8020', text: '#4ade80' },
}

const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  OPEN:        { bg: '#ffb59a20', text: '#ffb59a' },
  IN_PROGRESS: { bg: '#b8c4ff20', text: '#b8c4ff' },
  RESOLVED:    { bg: '#4ade8020', text: '#4ade80' },
  CLOSED:      { bg: '#6b728020', text: '#9ca3af' },
  REJECTED:    { bg: '#f8717120', text: '#f87171' },
}

const CATEGORY_ICON: Record<string, string> = {
  ELECTRICAL:   '⚡',
  PLUMBING:     '🔧',
  IT_EQUIPMENT: '💻',
  FURNITURE:    '🪑',
  HVAC:         '❄️',
  SAFETY:       '🛡️',
  OTHER:        '📋',
}

const STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']
const PRIORITIES: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

function PriorityBadge({ priority }: { priority: string }) {
  const c = PRIORITY_BADGE[priority] ?? { bg: '#6b728020', text: '#9ca3af' }
  return (
    <span style={{
      background: c.bg, color: c.text,
      padding: '2px 10px', borderRadius: 999,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
    }}>
      {priority}
    </span>
  )
}

function StatusChip({ status }: { status: string }) {
  const c = STATUS_BADGE[status] ?? { bg: '#6b728020', text: '#9ca3af' }
  return (
    <span style={{
      background: c.bg, color: c.text,
      padding: '3px 10px', borderRadius: 6,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
      border: `1px solid ${c.text}30`,
    }}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

const selectStyle: React.CSSProperties = {
  background: C.card,
  border: 'none',
  color: C.onSurface,
  borderRadius: 8,
  padding: '9px 12px',
  fontSize: 13,
  outline: 'none',
  cursor: 'pointer',
  minWidth: 140,
}

export default function IncidentListPage() {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = {}
      if (statusFilter)   params.status = statusFilter
      if (priorityFilter) params.priority = priorityFilter
      const res = await getMyTickets(params)
      const raw = res.data?.data?.content ?? res.data?.data
      setTickets(Array.isArray(raw) ? raw : [])
    } catch {
      setError('Failed to load tickets.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter, priorityFilter])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteTicket(deleteTarget.id)
      setTickets(prev => prev.filter(t => t.id !== deleteTarget.id))
      setToast({ msg: 'Ticket deleted successfully.', ok: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to delete ticket.'
      setToast({ msg, ok: false })
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', background: C.bg, color: C.onSurface, p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', color: C.onSurface, margin: 0, marginBottom: 6 }}>
            Incident Tickets
          </h1>
          <p style={{ color: '#94a3b8', margin: 0, fontWeight: 500 }}>
            Report and track campus maintenance and IT issues.
          </p>
        </div>
        <button
          onClick={() => navigate('/tickets/new')}
          style={{
            background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
            color: '#001453',
            border: 'none',
            borderRadius: 8,
            padding: '11px 22px',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 24px #1e40af30',
          }}
        >
          <AddOutlinedIcon sx={{ fontSize: 20 }} />
          Report Incident
        </button>
      </Box>

      {/* Filter Row */}
      <div style={{
        background: C.cardLow, borderRadius: 12, padding: '16px 20px',
        display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end', marginBottom: 28,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Status
          </label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Priority
          </label>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={selectStyle}>
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#f8717120', border: '1px solid #f87171', color: '#f87171', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: C.primary }} />
        </Box>
      ) : tickets.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: C.card, borderRadius: 16, color: '#64748b',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: C.onSurfaceVariant, marginBottom: 8 }}>No tickets yet</p>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>Report an issue and we'll get it resolved.</p>
          <button
            onClick={() => navigate('/tickets/new')}
            style={{
              background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
              color: '#001453', border: 'none', borderRadius: 8,
              padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}
          >
            Report Issue
          </button>
        </div>
      ) : (
        <div style={{ background: C.cardLow, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: `${C.surfaceHigh}4d`, borderBottom: `1px solid ${C.outlineVariant}1a` }}>
                  {['#', 'Title', 'Category', 'Priority', 'Status', 'Assigned To', 'Created', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '14px 20px', fontSize: 10, fontWeight: 700,
                      color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em',
                      textAlign: h === 'Actions' ? 'right' : 'left',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr
                    key={t.id}
                    style={{ borderBottom: `1px solid ${C.outlineVariant}0d`, cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.card)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => navigate(`/tickets/${t.id}`)}
                  >
                    <td style={{ padding: '18px 20px', fontSize: 12, fontFamily: 'monospace', color: `${C.primary}b3` }}>
                      #{t.id.slice(0, 6)}
                    </td>
                    <td style={{ padding: '18px 20px', fontSize: 13, fontWeight: 600, color: C.onSurface }}>
                      {t.title}
                    </td>
                    <td style={{ padding: '18px 20px' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                        textTransform: 'uppercase', color: '#94a3b8',
                      }}>
                        {CATEGORY_ICON[t.category] ?? '📋'} {t.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '18px 20px' }}>
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td style={{ padding: '18px 20px' }}>
                      <StatusChip status={t.status} />
                    </td>
                    <td style={{ padding: '18px 20px', fontSize: 13, color: t.assignedToName ? '#94a3b8' : '#4b5563', fontStyle: t.assignedToName ? 'normal' : 'italic' }}>
                      {t.assignedToName ?? 'Unassigned'}
                    </td>
                    <td style={{ padding: '18px 20px', fontSize: 13, color: '#64748b' }}>
                      {format(new Date(t.createdAt), 'MMM d')}
                    </td>
                    <td style={{ padding: '18px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/tickets/${t.id}`) }}
                          style={{
                            background: 'none', border: 'none', color: C.primary,
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            padding: '4px 8px', borderRadius: 6,
                            transition: 'color 0.15s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                          onMouseLeave={e => (e.currentTarget.style.color = C.primary)}
                        >
                          View
                        </button>
                        {(t.reportedById === user?.id || isAdmin()) && t.status === 'OPEN' && (
                          <button
                            title="Delete ticket"
                            onClick={e => { e.stopPropagation(); setDeleteTarget({ id: t.id, title: t.title }) }}
                            style={{
                              background: 'none', border: 'none', color: '#f87171',
                              cursor: 'pointer', padding: '4px 6px', borderRadius: 6,
                              display: 'flex', alignItems: 'center',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f8717115')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                          >
                            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
          background: toast.ok ? '#166534' : '#7f1d1d',
          border: `1px solid ${toast.ok ? '#4ade80' : '#f87171'}`,
          color: toast.ok ? '#4ade80' : '#f87171',
          padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600,
          boxShadow: '0 8px 32px #00000060', maxWidth: 360,
        }}>
          {toast.msg}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1500,
          background: '#00000080', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            style={{
              background: C.card, borderRadius: 16, padding: '32px 28px', maxWidth: 440, width: '90%',
              border: `1px solid ${C.outlineVariant}`,
              boxShadow: '0 24px 64px #00000080',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 32, marginBottom: 12, textAlign: 'center' }}>🗑️</div>
            <h2 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 800, color: C.onSurface, textAlign: 'center' }}>
              Delete Ticket?
            </h2>
            <p style={{ margin: '0 0 8px', fontSize: 14, color: C.onSurfaceVariant, textAlign: 'center' }}>
              <strong style={{ color: C.onSurface }}>{deleteTarget.title}</strong>
            </p>
            <p style={{ margin: '0 0 28px', fontSize: 13, color: '#94a3b8', textAlign: 'center', lineHeight: 1.6 }}>
              This action cannot be undone and will permanently delete all comments and attachments.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                style={{
                  background: C.surfaceHigh, color: C.onSurfaceVariant,
                  border: 'none', borderRadius: 8, padding: '10px 24px',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                style={{
                  background: '#7f1d1d', color: '#f87171',
                  border: '1px solid #f8717140', borderRadius: 8, padding: '10px 24px',
                  fontWeight: 700, fontSize: 14, cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Policy footer */}
      <div style={{
        marginTop: 32, padding: '20px 24px',
        background: C.surfaceHigh, borderRadius: 12,
        borderLeft: `4px solid ${C.primary}`,
        display: 'flex', gap: 16,
      }}>
        <span style={{ fontSize: 20 }}>ℹ️</span>
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#dde1ff', marginBottom: 4 }}>
            Important Ticket Policy
          </p>
          <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
            OPEN tickets can be edited or deleted. Once assigned, a technician will be in touch.
            If an issue is an emergency (leaking water, fire hazard), please use the Campus Emergency Hotline immediately.
          </p>
        </div>
      </div>
    </Box>
  )
}
