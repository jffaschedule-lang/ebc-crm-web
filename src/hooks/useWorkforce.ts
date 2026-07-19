import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/client';
import { Platoon } from '../types/domain';

export interface WorkforceEmployeeDetail {
  employee_id: string;
  emp_number: number;
  last_name: string;
  first_name: string;
  rank: string;
  duty_status: string;
  acting_note: string | null;
  hours_worked: string;
  det_flag: boolean;
  mwa_flag: boolean;
  ot_flag: boolean;
  notes: string | null;
}

export interface WorkforceCompanyReport {
  company_code: string;
  station: string;
  district: number | null;
  required_seats: number;
  on_duty_count: number;
  total_assigned: number;
  det_out: number;
  det_in: number;
  mwa_count: number;
  ot_count: number;
  shortage: number;
  shortage_flag: boolean;
  employees: WorkforceEmployeeDetail[];
}

export function useWorkforceReport(date: string, platoon?: Platoon) {
  return useQuery({
    queryKey: ['workforce', date, platoon ?? 'all'],
    queryFn: () => apiGet<WorkforceCompanyReport[]>(`/api/workforce/date/${date}`, platoon ? { platoon } : undefined),
    enabled: Boolean(date),
  });
}
