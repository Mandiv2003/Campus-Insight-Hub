import api from './axiosInstance'

export const getResources = (params?: object) =>
  api.get('/resources', { params })

export const getResource = (id: string) =>
  api.get(`/resources/${id}`)

export const createResource = (data: object) =>
  api.post('/resources', data)

export const updateResource = (id: string, data: object) =>
  api.put(`/resources/${id}`, data)

export const updateResourceStatus = (id: string, status: string) =>
  api.patch(`/resources/${id}/status`, { status })

export const deleteResource = (id: string) =>
  api.delete(`/resources/${id}`)

export const addAvailabilityWindow = (resourceId: string, data: object) =>
  api.post(`/resources/${resourceId}/availability`, data)

export const deleteAvailabilityWindow = (resourceId: string, windowId: string) =>
  api.delete(`/resources/${resourceId}/availability/${windowId}`)
