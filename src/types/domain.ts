// Mirrors ebc-crm-api/src/types/index.ts. NUMERIC columns arrive as strings
// from Postgres — parse with parseFloat() only at the display layer (see
// project constraint #4). DATE/TIME columns are plain strings — format with
// date-fns for display, never `new Date()` for shift-date logic.

export type Rank =
  | 'AC' | 'Sub-AC' | 'DC' | 'Sub-DC' | 'Capt' | 'Sub-CAPT'
  | 'LT' | 'Sub-LT' | 'OP' | 'Sub-OP' | 'FF' | 'Sub-FF';

/** Canonical seniority order, most senior first — use for rank dropdowns and sorting. */
export const RANK_SENIORITY: readonly Rank[] = [
  'AC', 'Sub-AC', 'DC', 'Sub-DC', 'Capt', 'Sub-CAPT',
  'LT', 'Sub-LT', 'OP', 'Sub-OP', 'FF', 'Sub-FF',
];
export type Platoon = 'A' | 'B' | 'C';
export type EmployeeStatus = 'Active' | 'Inactive';

// 'Train' is duty (not leave): the employee stays listed but is excluded from
// on-duty counts, and keeps normal work credit on timesheet/payroll.
export type DutyStatus =
  | 'O' | 'Train' | 'AL' | 'SL' | 'EAL' | 'ISSL' | 'FODI' | 'ADM' | 'AWOL'
  | 'FL' | 'CT' | 'CL' | 'DET' | 'MWA' | 'OWD';

export type LeaveType =
  | 'AL' | 'EAL' | 'SL' | 'ISSL' | 'FODI' | 'ADM' | 'AWOL'
  | 'FL' | 'CT' | 'CL' | 'DET' | 'MWA';

export type LeaveStatus =
  | 'PendingApproval' | 'Granted' | 'Active' | 'Waitlist' | 'Promoted' | 'Cancelled' | 'Deleted';

export type AppRole = 'admin' | 'supervisor' | 'member';

export interface Employee {
  id: string;
  emp_number: number;
  last_name: string;
  first_name: string;
  middle_initial: string | null;
  rank: Rank;
  platoon: Platoon;
  company_code: string;
  station_override: string | null;
  dc_initial: string | null;
  supervisor: boolean;
  status: EmployeeStatus;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  code: string;
  station: string;
  district: number | null;
  suffix_rule: string | null;
  records_only: boolean;
  station_override: string | null;
}

export interface RotationDay {
  id: string;
  shift_date: string;
  platoon: Platoon;
  pp_start: string;
  pp_end: string;
  shift_window_start?: string;
  shift_window_end?: string;
}

export interface DutyLedgerRow {
  id: string;
  shift_date: string;
  platoon: Platoon;
  employee_id: string;
  company_code: string;
  station: string;
  duty_status: DutyStatus;
  acting_note: string | null;
  shift_start: string;
  shift_end: string;
  hours_worked: string;
  is_closed: boolean;
  closed_at: string | null;
}

export interface LeaveRecord {
  id: string;
  entry_id: string;
  employee_id: string;
  leave_type: LeaveType;
  shift_date: string;
  span_start: string;
  span_end: string;
  reason: string | null;
  status: LeaveStatus;
  parent_id: string | null;
  submitted_at: string;
  supervisor_id: string | null;
  sl_illness: boolean;
  sl_medical: boolean;
  sl_dental: boolean;
  sl_optical: boolean;
  sl_death: boolean;
  /** Present when the list query joins `employees!inner(platoon)` (see GET /api/leave-records). */
  employees?: { platoon: Platoon };
}

export interface AlSlotLedger {
  platoon: Platoon;
  shift_date: string;
  peak_concurrent: number;
  max_slots: number;
  last_rebuilt_at?: string;
}

export interface PayrollRow {
  id: string;
  shift_date: string;
  employee_id: string;
  company_code: string;
  station: string;
  platoon: Platoon;
  hours_worked: string;
  acting_note: string | null;
  acting_hours: string;
  leave_type: string | null;
  leave_hours_used: string;
  district: number | null;
}

export interface TimesheetSegment {
  id: string;
  employee_id: string;
  pp_end: string;
  shift_date: string;
  segment_type: 'work' | 'leave';
  time_in: string | null;
  time_out: string | null;
  leave_time_in: string | null;
  leave_time_out: string | null;
  hours: string;
  leave_type: string | null;
}

export interface ShiftClose {
  id: string;
  shift_date: string;
  station: string;
  platoon: Platoon;
  supervisor_id: string;
  signed_at: string;
  packet_sent_at: string | null;
  correction_count: number;
}

export interface AuditLogEntry {
  id: string;
  occurred_at: string;
  actor_type: 'member' | 'supervisor' | 'admin' | 'system';
  actor_id: string | null;
  action: string;
  entry_id: string | null;
  detail: string | null;
}

export interface Setting {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

export interface OtTierBoardRow {
  employee_id: string;
  full_name: string;
  rank: Rank;
  platoon: Platoon;
  days_since_ot: number;
  last_ot_date: string | null;
}

export interface OtRequest {
  id: string;
  shift_date: string;
  company_code: string | null;
  rank_group: string;
  status: 'Open' | 'Offered' | 'Filled' | 'Cancelled' | 'Expired';
  filled_by: string | null;
  ladder_stage: string | null;
}

export interface RoleAssignment {
  id: string;
  employee_id: string;
  role: AppRole;
  assigned_at: string;
  assigned_by: string | null;
  employees?: { last_name: string; first_name: string; emp_number: number; email: string | null };
}

export interface AdminAuthUser {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

export interface NotificationRule {
  event: string;
  enabled: boolean;
  recipients: string;
  description: string | null;
  updated_at: string;
}

export interface SystemInfo {
  emailProvider: string;
  rotationRange: { start: string | null; end: string | null; days: number };
  timezone: string;
  nextPacketRun: string;
}

export interface StaffAccount {
  emp_number: number;
  name: string;
  email: string;
  role: AppRole;
  roles: AppRole[];
  last_sign_in: string | null;
  status: EmployeeStatus;
}
