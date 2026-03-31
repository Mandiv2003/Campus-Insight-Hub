export type TicketStatus   = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED'
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type TicketCategory =
  | 'ELECTRICAL' | 'PLUMBING' | 'IT_EQUIPMENT'
  | 'FURNITURE'  | 'HVAC'     | 'SAFETY' | 'OTHER'

export interface Attachment {
  id: string
  ticketId: string
  uploadedById: string
  uploadedByName: string
  fileName: string
  fileSize: number
  contentType: string
  fileUrl: string
  createdAt: string
}

export interface Comment {
  id: string
  ticketId: string
  authorId: string
  authorName: string
  authorAvatarUrl: string | null
  body: string
  edited: boolean
  createdAt: string
  updatedAt: string
}

export interface Ticket {
  id: string
  resourceId: string | null
  resourceName: string | null
  reportedById: string
  reportedByName: string
  assignedToId: string | null
  assignedToName: string | null
  title: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  locationDetail: string | null
  contactPhone: string | null
  contactEmail: string | null
  status: TicketStatus
  resolutionNotes: string | null
  rejectionReason: string | null
  resolvedAt: string | null
  attachments: Attachment[]
  comments: Comment[]
  createdAt: string
  updatedAt: string
}
