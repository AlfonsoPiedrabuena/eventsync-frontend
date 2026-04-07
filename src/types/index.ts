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

export type EventModality = 'in_person' | 'virtual' | 'hybrid'

export interface Event {
  id: string
  title: string
  slug: string
  description: string
  status: EventStatus
  modality: EventModality
  is_virtual: boolean  // derived from modality, kept for backward compat
  location: string
  location_url: string
  virtual_access_url: string | null
  hero_image_url: string | null
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
  modality: EventModality
  location?: string
  location_url?: string
  virtual_access_url?: string
  hero_image_url?: string
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

// ── Check-in (E4) ────────────────────────────────────────────────────────────

export interface CheckinRegistration {
  id: string
  full_name: string
  first_name: string
  last_name: string
  email: string
  company: string
  position: string
  status: RegistrationStatus
  checked_in: boolean
  checked_in_at: string | null
}

export interface CheckinResponse {
  registration: CheckinRegistration
  already_checked_in: boolean
}

export interface EventStats {
  confirmed: number
  checked_in: number
  pending: number
  waitlisted: number
  cancelled: number
}

// ── Communications (E5) ───────────────────────────────────────────────────────

export type EmailType = 'confirmation' | 'reminder_24h' | 'reminder_1h' | 'post_event' | 'manual'
export type EmailStatus = 'sent' | 'failed'

export interface EmailLog {
  id: string
  email_type: EmailType
  email_type_display: string
  recipient_email: string
  recipient_name: string
  subject: string
  status: EmailStatus
  status_display: string
  error_message: string
  sent_at: string | null
  created_at: string
}

export type EmailSegment = 'all' | 'confirmed' | 'waitlisted' | 'checked_in' | 'no_show'

export interface ManualSendPayload {
  subject: string
  message: string
  segment: EmailSegment
}

// ── Analytics (E6) ────────────────────────────────────────────────────────────

export interface EventSummary {
  event_id: string
  event_title: string
  status: EventStatus
  confirmed: number
  waitlisted: number
  cancelled: number
  checked_in: number
  no_show: number
  check_in_rate: number
  max_capacity: number | null
  capacity_utilization: number | null
  emails_sent: number
  emails_failed: number
}

export interface RegistrationsTimeline {
  labels: string[]
  daily: number[]
  cumulative: number[]
}

export interface UpcomingEvent {
  id: string
  title: string
  start_date: string
  confirmed: number
  max_capacity: number | null
}

export interface TopEvent {
  id: string
  title: string
  status: EventStatus
  confirmed: number
}

export interface TenantDashboard {
  total_events: number
  events_by_status: Partial<Record<EventStatus, number>>
  total_registrations: number
  total_checked_in: number
  upcoming_events: UpcomingEvent[]
  top_events: TopEvent[]
}
