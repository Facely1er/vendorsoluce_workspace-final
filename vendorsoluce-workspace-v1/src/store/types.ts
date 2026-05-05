export type UUID = string

export type Criticality = 'Low' | 'Medium' | 'High'

export type ServiceType =
  | 'Cloud hosting'
  | 'SaaS application'
  | 'Payment processor'
  | 'HR/payroll provider'
  | 'Data analytics provider'
  | 'IT/security provider'
  | 'Other'

export type DataHandled =
  | 'No sensitive data'
  | 'Business contact data'
  | 'Employee data'
  | 'Customer personal data'
  | 'Financial data'
  | 'Health data'
  | 'Authentication/security data'

export type Vendor = {
  id: UUID
  name: string
  service: string
  criticality: Criticality
  serviceType?: ServiceType
  dataHandled?: DataHandled[]
  serviceDescription?: string
  contractOwner?: string
  reviewDueDate?: string
  createdAt: string
}

export type RiskType = 'Vendor dependency' | 'Data exposure' | 'Supply chain risk'
export type RiskStatus = 'Open' | 'Mitigated'

export type Risk = {
  id: UUID
  vendorId: UUID
  type: RiskType
  title: string
  notes: string
  status: RiskStatus
  createdAt: string
  resolvedAt?: string
}

export type EvidenceType = 'Vendor documentation' | 'Contracts' | 'Assessments'

export type Evidence = {
  id: UUID
  vendorId: UUID
  type: EvidenceType
  title: string
  url?: string
  notes?: string
  createdAt: string
}

export type ActionStatus = 'Open' | 'In Progress' | 'Completed'
export type ActionSource = 'Criticality' | 'Missing evidence' | 'Unresolved risks' | 'Manual'

export type ActionItem = {
  id: UUID
  vendorId?: UUID
  title: string
  rationale: string
  source: ActionSource
  status: ActionStatus
  createdAt: string
  completedAt?: string
}

export type WorkspaceSettings = {
  theme: 'system' | 'light' | 'dark'
}

export type WorkspaceState = {
  vendors: Vendor[]
  risks: Risk[]
  evidence: Evidence[]
  actions: ActionItem[]
  settings: WorkspaceSettings
  updatedAt: string
}

