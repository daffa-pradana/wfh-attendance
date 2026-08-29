export type Role = 'EMPLOYEE' | 'ADMIN';

export interface Profile {
  id: string;
  name: string;
  email: string;
  position: string;
  phone: string;
  photoUrl: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export type AttendanceStatus = 'MASUK' | 'PULANG';

export interface AttendanceRecord {
  id: string;
  status: AttendanceStatus;
  recordedAt: string;
}

export interface LoginResponse {
  accessToken: string;
}
