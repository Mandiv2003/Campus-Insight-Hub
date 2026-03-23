import api from './axiosInstance'

export const getNotifications = (params?: object) => api.get('/notifications', { params })
export const markRead = (id: string) => api.patch(`/notifications/${id}/read`)
export const markAllRead = () => api.patch('/notifications/read-all')
export const deleteNotification = (id: string) => api.delete(`/notifications/${id}`)
export const getUnreadCount = () => api.get('/notifications/unread-count')
