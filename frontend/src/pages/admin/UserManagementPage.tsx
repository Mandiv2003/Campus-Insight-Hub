import { useState, useEffect } from 'react'
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Select, MenuItem, Button, Chip, FormControl,
} from '@mui/material'
import { getUsers, updateRole, deactivateUser } from '../../api/userApi'

interface User {
  id: string
  email: string
  fullName: string
  role: string
  active: boolean
}

const ROLES = ['USER', 'ADMIN', 'TECHNICIAN']

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => { load() }, [])

  const load = async () => {
    const res = await getUsers({ size: 50 })
    setUsers(res.data.data.content)
  }

  const handleRoleChange = async (id: string, role: string) => {
    await updateRole(id, role)
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u))
  }

  const handleDeactivate = async (id: string) => {
    await deactivateUser(id)
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, active: false } : u))
  }

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={3}>User Management</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.fullName}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <FormControl size="small">
                  <Select value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}>
                    {ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell>
                <Chip label={u.active ? 'Active' : 'Inactive'}
                      color={u.active ? 'success' : 'default'} size="small" />
              </TableCell>
              <TableCell>
                {u.active && (
                  <Button size="small" color="error"
                          onClick={() => handleDeactivate(u.id)}>
                    Deactivate
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}
