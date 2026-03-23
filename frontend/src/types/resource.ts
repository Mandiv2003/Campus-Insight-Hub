export type ResourceType = 'LECTURE_HALL' | 'LAB' | 'MEETING_ROOM' | 'EQUIPMENT'
export type ResourceStatus = 'ACTIVE' | 'OUT_OF_SERVICE' | 'MAINTENANCE' | 'ARCHIVED'

export interface AvailabilityWindow {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
}

export interface Resource {
  id: string
  name: string
  type: ResourceType
  capacity: number | null
  location: string
  description: string | null
  status: ResourceStatus
  imageUrl: string | null
  createdById: string
  availabilityWindows: AvailabilityWindow[]
  createdAt: string
  updatedAt: string
}
