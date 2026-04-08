import api from './axiosInstance'

export const getMe = () => api.get('/auth/me')
export const logout = () => api.post('/auth/logout')
export const getUsers = (params?: object) => api.get('/admin/users', { params })
export const updateRole = (id: string, role: string) =>
  api.patch(`/admin/users/${id}/role`, { role })
export const deactivateUser = (id: string) => api.patch(`/admin/users/${id}/deactivate`)
export const deleteUser = (id: string) => api.delete(`/admin/users/${id}`)
export const getTechnicians = () => api.get('/users/technicians')
