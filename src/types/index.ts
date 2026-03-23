export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'super_admin' | 'tenant_admin' | 'organizer' | 'checkin_staff';
  tenant_id?: string;
}

export interface Tenant {
  id: string;
  schema_name: string;
  name: string;
  created_at: string;
}

export type EventStatus = 'draft' | 'published' | 'closed' | 'cancelled' | 'finalized'

export interface EventStatusOption {
  value: EventStatus
  label: string
}

export interface Event {
  id: string
  title: string
  slug: string
  description: string
  status: EventStatus
  is_virtual: boolean
  location: string
  location_url: string
  start_date: string
  end_date: string
  max_capacity: number | null
  registration_count: number
  spots_remaining: number | null
  is_open_for_registration: boolean
  cover_image_url: string | null
  organizer: number
  organizer_name: string
  valid_transitions: EventStatusOption[]
  created_at: string
  updated_at: string
  published_at: string | null
}

export interface EventCreatePayload {
  title: string
  description?: string
  is_virtual: boolean
  location?: string
  location_url?: string
  start_date: string
  end_date: string
  max_capacity?: number | null
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type RegistrationStatus = 'confirmed' | 'waitlisted' | 'cancelled'

export interface Registration {
  id: string
  event: string
  full_name: string
  first_name: string
  last_name: string
  email: string
  phone: string
  company: string
  position: string
  status: RegistrationStatus
  checked_in: boolean
  checked_in_at: string | null
  qr_token: string
  created_at: string
  updated_at: string
}

export interface RegistrationCreatePayload {
  event_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  company?: string
  position?: string
}

export interface RegistrationListResponse {
  count: number
  results: Registration[]
}
