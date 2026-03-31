import api from './axiosInstance'

// Tickets
export const createTicket = (data: object) =>
  api.post('/tickets', data)

export const getMyTickets = (params?: object) =>
  api.get('/tickets/my', { params })

export const getTicket = (id: string) =>
  api.get(`/tickets/${id}`)

export const updateTicket = (id: string, data: object) =>
  api.put(`/tickets/${id}`, data)

export const deleteTicket = (id: string) =>
  api.delete(`/tickets/${id}`)

// Admin / Technician
export const getAdminTickets = (params?: object) =>
  api.get('/admin/tickets', { params })

export const updateTicketStatus = (id: string, data: object) =>
  api.patch(`/admin/tickets/${id}/status`, data)

export const assignTechnician = (id: string, technicianId: string) =>
  api.patch(`/admin/tickets/${id}/assign`, { technicianId })

// Attachments
export const uploadAttachment = (id: string, file: File) => {
  const form = new FormData()
  form.append('file', file)
  return api.post(`/tickets/${id}/attachments`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const deleteAttachment = (ticketId: string, attachmentId: string) =>
  api.delete(`/tickets/${ticketId}/attachments/${attachmentId}`)

// Comments
export const addComment = (ticketId: string, body: string) =>
  api.post(`/tickets/${ticketId}/comments`, { body })

export const editComment = (ticketId: string, commentId: string, body: string) =>
  api.put(`/tickets/${ticketId}/comments/${commentId}`, { body })

export const deleteComment = (ticketId: string, commentId: string) =>
  api.delete(`/tickets/${ticketId}/comments/${commentId}`)
