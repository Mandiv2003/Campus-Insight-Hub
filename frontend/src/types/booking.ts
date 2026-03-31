export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export interface TimeSlot {
  startDatetime: string
  endDatetime: string
}

export interface Booking {
  id: string
  resourceId: string
  resourceName: string
  requestedById: string
  requestedByName: string
  reviewedById: string | null
  reviewedByName: string | null
  title: string
  purpose: string
  expectedAttendees: number | null
  startDatetime: string
  endDatetime: string
  status: BookingStatus
  rejectionReason: string | null
  cancellationNote: string | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
}
