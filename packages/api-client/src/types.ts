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

export interface AuthMe {
  sub: string;
  role: Role;
}

export interface AdminAttendanceRecord extends AttendanceRecord {
  employee: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateEmployeeInput {
  name: string;
  email: string;
  password: string;
  position: string;
  phone: string;
  role?: Role;
}

export interface UpdateEmployeeInput {
  name?: string;
  email?: string;
  position?: string;
  phone?: string;
}

export interface ProfileChangedEvent {
  employeeId: string;
  changedField: 'phone' | 'photo' | 'password';
}
