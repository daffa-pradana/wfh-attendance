import { apiFetch } from './http';
import type {
  AdminAttendanceRecord,
  AttendanceRecord,
  AttendanceStatus,
  AuthMe,
  CreateEmployeeInput,
  LoginResponse,
  Profile,
  UpdateEmployeeInput,
} from './types';

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function me(): Promise<AuthMe> {
  return apiFetch<AuthMe>('/auth/me');
}

export function getProfile(): Promise<Profile> {
  return apiFetch<Profile>('/profile');
}

export function updatePhone(phone: string): Promise<Profile> {
  return apiFetch<Profile>('/profile/phone', {
    method: 'PATCH',
    body: JSON.stringify({ phone }),
  });
}

export function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<Profile> {
  return apiFetch<Profile>('/profile/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function updatePhoto(file: File): Promise<Profile> {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch<Profile>('/profile/photo', {
    method: 'PATCH',
    body: formData,
  });
}

export function recordAttendance(
  status: AttendanceStatus,
): Promise<AttendanceRecord> {
  return apiFetch<AttendanceRecord>('/attendance', {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}

export function getAttendanceSummary(
  from?: string,
  to?: string,
): Promise<AttendanceRecord[]> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString();
  return apiFetch<AttendanceRecord[]>(
    `/attendance/summary${query ? `?${query}` : ''}`,
  );
}

export function listEmployees(): Promise<Profile[]> {
  return apiFetch<Profile[]>('/admin/employees');
}

export function createEmployee(input: CreateEmployeeInput): Promise<Profile> {
  return apiFetch<Profile>('/admin/employees', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateEmployee(
  id: string,
  input: UpdateEmployeeInput,
): Promise<Profile> {
  return apiFetch<Profile>(`/admin/employees/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function listAdminAttendance(): Promise<AdminAttendanceRecord[]> {
  return apiFetch<AdminAttendanceRecord[]>('/admin/attendance');
}
