export type Role = 'resident' | 'admin'

export type ReportType =
  | 'typhoon_damage'
  | 'flood'
  | 'landslide'
  | 'storm_surge'
  | 'fallen_tree'
  | 'power_outage'
  | 'road_blocked'
  | 'missing_stranded'
  | 'other'

export type Severity = 'low' | 'moderate' | 'high' | 'critical'

export type ReportStatus = 'pending' | 'verified' | 'responding' | 'resolved' | 'rejected'

export type AdvisoryKind = 'typhoon' | 'flood' | 'general'

export interface Profile {
  id: string
  full_name: string
  phone: string | null
  barangay: string | null
  role: Role
  created_at: string
}

export interface Report {
  id: string
  reporter_id: string
  type: ReportType
  severity: Severity
  title: string
  description: string
  barangay: string
  lat: number
  lng: number
  photo_url: string | null
  status: ReportStatus
  admin_notes: string | null
  created_at: string
  updated_at: string
  profiles?: { full_name: string; phone: string | null } | null
}

export interface Advisory {
  id: string
  title: string
  body: string
  kind: AdvisoryKind
  signal_level: number | null
  is_active: boolean
  created_by: string | null
  created_at: string
}
