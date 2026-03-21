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

export interface Event {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  long_description?: string;
  event_type: 'presencial' | 'virtual' | 'hibrido';
  start_datetime: string;
  end_datetime: string;
  timezone: string;
  location?: string;
  virtual_url?: string;
  max_capacity?: number;
  cover_image?: string;
  status: 'borrador' | 'publicado' | 'cerrado' | 'cancelado' | 'finalizado';
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  event_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  status: 'confirmado' | 'cancelado' | 'en_espera';
  checked_in: boolean;
  checked_in_at?: string;
  qr_token: string;
  created_at: string;
}
