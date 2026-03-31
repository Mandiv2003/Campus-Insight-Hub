import api from './axiosInstance'

export const createBooking = (data: object) =>
  api.post('/bookings', data)

export const getMyBookings = (params?: object) =>
  api.get('/bookings/my', { params })

export const getBooking = (id: string) =>
  api.get(`/bookings/${id}`)

export const cancelBooking = (id: string, data?: object) =>
  api.patch(`/bookings/${id}/cancel`, data ?? {})

export const getAdminBookings = (params?: object) =>
  api.get('/admin/bookings', { params })

export const approveBooking = (id: string) =>
  api.patch(`/admin/bookings/${id}/approve`)

export const rejectBooking = (id: string, data: object) =>
  api.patch(`/admin/bookings/${id}/reject`, data)

export const getResourceAvailability = (resourceId: string, date: string) =>
  api.get(`/resources/${resourceId}/bookings/availability`, { params: { date } })
