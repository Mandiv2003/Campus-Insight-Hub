import { useState, useEffect } from 'react'
import {
  Box, Typography, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PersonIcon from '@mui/icons-material/Person'
import EngineeringIcon from '@mui/icons-material/Engineering'
import ShieldIcon from '@mui/icons-material/Shield'
import { getUsers, updateRole, deleteUser } from '../../api/userApi'
import { format } from 'date-fns'

// ─── Dark theme color tokens ──────────────────────────────────────────────────
const D = {
  surface: '#0b1326',
  surfaceContainer: '#171f33',
  surfaceContainerLow: '#131b2e',
  surfaceContainerHigh: '#222a3d',
  surfaceContainerHighest: '#2d3449',
  onSurface: '#dae2fd',
  onSurfaceVariant: '#c4c5d5',
  outlineVariant: '#444653',
  primary: '#b8c4ff',
  primaryContainer: '#1e40af',
  error: '#ffb4ab',
  tertiary: '#ffb59a',
}

interface UserItem {
  id: string
  email: string
  fullName: string
  username: string | null
  role: 'USER' | 'ADMIN' | 'TECHNICIAN'
  active: boolean
  provider: string
  createdAt: string
}

const ROLES = ['USER', 'ADMIN', 'TECHNICIAN'] as const

function getRolePillStyle(role: string): { bgcolor: string; color: string } {
  if (role === 'ADMIN') return { bgcolor: 'rgba(255,180,171,0.12)', color: '#ffb4ab' }
  if (role === 'TECHNICIAN') return { bgcolor: 'rgba(187,196,246,0.15)', color: '#a9b3e3' }
  return { bgcolor: 'rgba(184,196,255,0.12)', color: '#b8c4ff' }
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function getAvatarStyle(role: string): { bgcolor: string; color: string } {
  if (role === 'ADMIN') return { bgcolor: 'rgba(255,180,171,0.12)', color: '#ffb4ab' }
  if (role === 'TECHNICIAN') return { bgcolor: 'rgba(255,165,131,0.12)', color: '#ffa583' }
  return { bgcolor: 'rgba(184,196,255,0.12)', color: '#b8c4ff' }
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [roleDialog, setRoleDialog] = useState<UserItem | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<UserItem | null>(null)
  const [newRole, setNewRole] = useState<typeof ROLES[number]>('USER')
  const [actionLoading, setActionLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = {}
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter
      const res = await getUsers(params)
      setUsers(res.data?.data?.content ?? res.data?.data ?? [])
    } catch {
      setError('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [search, roleFilter])

  const handleRoleChange = async () => {
    if (!roleDialog) return
    setActionLoading(true)
    try {
      await updateRole(roleDialog.id, newRole)
      setUsers(prev => prev.map(u => u.id === roleDialog.id ? { ...u, role: newRole } : u))
      setRoleDialog(null)
    } catch {
      setError('Failed to update role.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog) return
    setActionLoading(true)
    try {
      await deleteUser(deleteDialog.id)
      setUsers(prev => prev.filter(u => u.id !== deleteDialog.id))
      setDeleteDialog(null)
    } catch {
      setError('Failed to delete user.')
      setDeleteDialog(null)
    } finally {
      setActionLoading(false)
    }
  }

  const totalUsers = users.length
  const adminCount = users.filter(u => u.role === 'ADMIN').length
  const techCount = users.filter(u => u.role === 'TECHNICIAN').length
  const studentCount = users.filter(u => u.role === 'USER').length

  return (
    <Box sx={{ bgcolor: D.surface, minHeight: '100vh', p: 0 }}>

      {/* Page Title */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.5px', color: '#fff', mb: 0.75 }}>
          User Management
        </Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 500, color: D.onSurfaceVariant }}>
          Manage accounts, roles, and access across the institution.
        </Typography>
      </Box>

      {/* Stats chips */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 4 }}>
        <Box sx={{
          px: 2.5, py: 1.25, bgcolor: D.surfaceContainerLow, borderRadius: 1.5,
          display: 'flex', alignItems: 'center', gap: 2,
          border: '1px solid rgba(68,70,83,0.08)',
        }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {totalUsers} Total
          </Typography>
          <Box sx={{ width: 1, height: 12, bgcolor: D.outlineVariant, opacity: 0.3 }} />
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: D.primary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {adminCount} Admins
          </Typography>
          <Box sx={{ width: 1, height: 12, bgcolor: D.outlineVariant, opacity: 0.3 }} />
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {techCount} Technicians
          </Typography>
          <Box sx={{ width: 1, height: 12, bgcolor: D.outlineVariant, opacity: 0.3 }} />
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {studentCount} Students
          </Typography>
        </Box>
      </Box>

      {/* Filter row */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
        {/* Search */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <SearchIcon sx={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: '#4b5563', fontSize: 18,
          }} />
          <Box
            component="input"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            sx={{
              width: '100%', bgcolor: D.surfaceContainerLow, border: 'none',
              borderRadius: 1.5, pl: '40px', pr: 2, py: 1.5,
              fontSize: 13, color: D.onSurface, outline: 'none',
              '&::placeholder': { color: '#3b4563' },
              '&:focus': { bgcolor: D.surfaceContainer },
              boxSizing: 'border-box',
            }}
          />
        </Box>

        {/* Role filter */}
        <Box
          component="select"
          value={roleFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRoleFilter(e.target.value)}
          sx={{
            bgcolor: D.surfaceContainerLow, border: 'none', borderRadius: 1.5,
            px: 2, py: 1.5, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: '#cbd5e1', cursor: 'pointer', outline: 'none',
            minWidth: 140,
          }}
        >
          <option value="">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
          <option value="TECHNICIAN">Technician</option>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: D.primary }} />
        </Box>
      ) : (
        <Box sx={{
          bgcolor: D.surfaceContainerLow, borderRadius: 2.5, overflow: 'hidden',
          border: '1px solid rgba(68,70,83,0.08)',
        }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              {/* Table Head */}
              <Box component="thead">
                <Box component="tr" sx={{ bgcolor: D.surfaceContainer }}>
                  {['User', 'Email', 'Role', 'Status', 'Joined', ''].map(h => (
                    <Box key={h} component="th" sx={{
                      px: 3, py: 2, fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.15em', color: '#4b5563',
                      textAlign: h === '' ? 'right' : 'left',
                    }}>
                      {h || 'Actions'}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Table Body */}
              <Box component="tbody">
                {users.length === 0 ? (
                  <Box component="tr">
                    <Box component="td" colSpan={6} sx={{ px: 3, py: 8, textAlign: 'center', color: D.onSurfaceVariant, fontSize: 14 }}>
                      No users found. Try adjusting your filters.
                    </Box>
                  </Box>
                ) : (
                  users.map(u => (
                    <Box
                      component="tr"
                      key={u.id}
                      sx={{
                        '&:hover': { bgcolor: D.surfaceContainer },
                        '& td': { borderBottom: '1px solid rgba(68,70,83,0.1)' },
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* User */}
                      <Box component="td" sx={{ px: 3, py: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{
                            width: 40, height: 40, borderRadius: 1.5,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 700,
                            ...getAvatarStyle(u.role),
                            textDecoration: u.active ? 'none' : 'line-through',
                          }}>
                            {getInitials(u.fullName)}
                          </Box>
                          <Typography sx={{
                            fontSize: 13, fontWeight: 600, color: u.active ? '#fff' : '#64748b',
                            textDecoration: u.active ? 'none' : 'line-through',
                          }}>
                            {u.fullName}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Email */}
                      <Box component="td" sx={{ px: 3, py: 2.5 }}>
                        <Typography sx={{ fontSize: 13, color: '#475569' }}>{u.email}</Typography>
                      </Box>

                      {/* Role */}
                      <Box component="td" sx={{ px: 3, py: 2.5 }}>
                        <Box component="span" sx={{
                          px: 1.25, py: 0.5, borderRadius: 0.5,
                          fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                          ...getRolePillStyle(u.role),
                        }}>
                          {u.role}
                        </Box>
                      </Box>

                      {/* Status */}
                      <Box component="td" sx={{ px: 3, py: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{
                            width: 8, height: 8, borderRadius: '50%',
                            bgcolor: u.active ? D.tertiary : '#475569',
                            boxShadow: u.active ? `0 0 8px ${D.tertiary}` : 'none',
                          }} />
                          <Typography sx={{ fontSize: 12, color: u.active ? '#cbd5e1' : '#475569' }}>
                            {u.active ? 'Active' : 'Inactive'}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Joined */}
                      <Box component="td" sx={{ px: 3, py: 2.5 }}>
                        <Typography sx={{ fontSize: 13, color: '#475569' }}>
                          {format(new Date(u.createdAt), 'MMM d, yyyy')}
                        </Typography>
                      </Box>

                      {/* Actions */}
                      <Box component="td" sx={{ px: 3, py: 2.5, textAlign: 'right' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Box
                            component="button"
                            onClick={() => { setRoleDialog(u); setNewRole(u.role) }}
                            sx={{
                              display: 'flex', alignItems: 'center', gap: 0.5,
                              px: 1.5, py: 0.75, bgcolor: D.surfaceContainerHigh,
                              border: 'none', borderRadius: 0.75, cursor: 'pointer',
                              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                              letterSpacing: '0.1em', color: D.primary,
                              '&:hover': { bgcolor: 'rgba(184,196,255,0.12)' },
                            }}
                          >
                            Edit Role ▾
                          </Box>
                          <Box
                            component="button"
                            onClick={() => setDeleteDialog(u)}
                            sx={{
                              px: 1.5, py: 0.75, bgcolor: 'rgba(255,180,171,0.08)',
                              border: 'none', borderRadius: 0.75, cursor: 'pointer',
                              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                              letterSpacing: '0.1em', color: D.error,
                              fontFamily: 'Plus Jakarta Sans, sans-serif',
                              '&:hover': { bgcolor: 'rgba(255,180,171,0.18)' },
                            }}
                          >
                            Delete
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
          </Box>

          {/* Pagination footer */}
          <Box sx={{
            p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            bgcolor: 'rgba(6,14,32,0.3)',
          }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569' }}>
              {users.length} users loaded
            </Typography>
          </Box>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteDialog}
        onClose={() => !actionLoading && setDeleteDialog(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: D.surfaceContainer,
            border: '1px solid rgba(255,180,171,0.15)',
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ color: '#fff', fontWeight: 800, fontSize: 18, pb: 0.5 }}>
          Delete User
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: D.onSurfaceVariant, fontSize: 14, mb: 2 }}>
            Are you sure you want to permanently delete{' '}
            <Box component="span" sx={{ color: '#fff', fontWeight: 700 }}>
              {deleteDialog?.fullName}
            </Box>
            ? This action cannot be undone.
          </Typography>
          <Box sx={{
            p: 2, bgcolor: 'rgba(255,180,171,0.06)',
            border: '1px solid rgba(255,180,171,0.15)', borderRadius: 1.5,
          }}>
            <Typography sx={{ fontSize: 11, color: D.error, fontWeight: 500, lineHeight: 1.6 }}>
              All data associated with this account will be permanently removed from the system.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1.5 }}>
          <Button
            fullWidth
            onClick={() => setDeleteDialog(null)}
            disabled={actionLoading}
            sx={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
              color: '#64748b', '&:hover': { color: '#fff' },
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleDelete}
            disabled={actionLoading}
            sx={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
              bgcolor: D.error, color: '#690005',
              '&:hover': { bgcolor: '#ffcfc9' },
              '&.Mui-disabled': { bgcolor: 'rgba(255,180,171,0.3)', color: '#690005' },
            }}
          >
            {actionLoading ? 'Deleting…' : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog
        open={!!roleDialog}
        onClose={() => setRoleDialog(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: D.surfaceContainer,
            border: '1px solid rgba(68,70,83,0.15)',
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ color: '#fff', fontWeight: 800, fontSize: 18, pb: 0.5 }}>
          Update Role — {roleDialog?.fullName}
        </DialogTitle>
        <Box sx={{ px: 3, pb: 0.5 }}>
          <Typography sx={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Select account access level
          </Typography>
        </Box>

        <DialogContent sx={{ pt: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* USER */}
            <Box
              component="label"
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                p: 2, bgcolor: D.surfaceContainerLow, borderRadius: 2,
                cursor: 'pointer', border: '1px solid rgba(68,70,83,0.1)',
                '&:hover': { bgcolor: D.surfaceContainerHigh },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: '50%',
                  bgcolor: 'rgba(184,196,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <PersonIcon sx={{ color: D.primary, fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>USER</Typography>
                  <Typography sx={{ fontSize: 10, color: '#475569' }}>Standard campus application access</Typography>
                </Box>
              </Box>
              <Box
                component="input"
                type="radio"
                name="role"
                checked={newRole === 'USER'}
                onChange={() => setNewRole('USER')}
                sx={{ width: 18, height: 18, accentColor: D.primary, cursor: 'pointer' }}
              />
            </Box>

            {/* TECHNICIAN */}
            <Box
              component="label"
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                p: 2, bgcolor: D.surfaceContainerLow, borderRadius: 2,
                cursor: 'pointer', border: '1px solid rgba(68,70,83,0.1)',
                '&:hover': { bgcolor: D.surfaceContainerHigh },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: '50%',
                  bgcolor: 'rgba(255,165,131,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <EngineeringIcon sx={{ color: '#ffa583', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>TECHNICIAN</Typography>
                  <Typography sx={{ fontSize: 10, color: '#475569' }}>Hardware &amp; maintenance dashboard access</Typography>
                </Box>
              </Box>
              <Box
                component="input"
                type="radio"
                name="role"
                checked={newRole === 'TECHNICIAN'}
                onChange={() => setNewRole('TECHNICIAN')}
                sx={{ width: 18, height: 18, accentColor: D.primary, cursor: 'pointer' }}
              />
            </Box>

            {/* ADMIN */}
            <Box
              component="label"
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                p: 2, bgcolor: D.surfaceContainerLow, borderRadius: 2,
                cursor: 'pointer', border: '1px solid rgba(68,70,83,0.1)',
                '&:hover': { bgcolor: D.surfaceContainerHigh },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: '50%',
                  bgcolor: 'rgba(255,180,171,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ShieldIcon sx={{ color: D.error, fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>ADMIN</Typography>
                  <Typography sx={{ fontSize: 10, color: '#475569' }}>Full system configuration permissions</Typography>
                </Box>
              </Box>
              <Box
                component="input"
                type="radio"
                name="role"
                checked={newRole === 'ADMIN'}
                onChange={() => setNewRole('ADMIN')}
                sx={{ width: 18, height: 18, accentColor: D.primary, cursor: 'pointer' }}
              />
            </Box>

            {/* Warning */}
            <Box sx={{
              display: 'flex', gap: 1.5, p: 2, bgcolor: 'rgba(255,180,171,0.08)',
              borderRadius: 1.5, border: '1px solid rgba(255,180,171,0.2)',
            }}>
              <Typography sx={{ fontSize: 9, color: D.error, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1.5 }}>
                Warning: The ADMIN role grants full system access, including data deletion and user management.
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1.5 }}>
          <Button
            fullWidth
            onClick={() => setRoleDialog(null)}
            sx={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
              color: '#64748b', '&:hover': { color: '#fff' },
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleRoleChange}
            disabled={actionLoading}
            sx={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
              background: `linear-gradient(135deg, ${D.primary} 0%, ${D.primaryContainer} 100%)`,
              color: '#002584',
              boxShadow: `0 4px 16px rgba(184,196,255,0.2)`,
              '&:hover': { background: `linear-gradient(135deg, #c8d4ff 0%, #2550d0 100%)` },
            }}
          >
            {actionLoading ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
