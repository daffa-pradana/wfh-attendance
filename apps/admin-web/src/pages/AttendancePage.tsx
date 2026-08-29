import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ApiError,
  clearToken,
  listAdminAttendance,
  type AdminAttendanceRecord,
} from 'api-client';
import { wibDateTime } from '../lib/wib';

export function AttendancePage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<AdminAttendanceRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAdminAttendance()
      .then(setRecords)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          navigate('/login', { replace: true });
          return;
        }
        setError('Could not load attendance');
      });
  }, [navigate]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!records) return <p className="text-sm text-gray-500">Loading…</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-gray-900">
        Attendance (all employees)
      </h1>
      <p className="text-xs text-gray-500">Read-only — HRD does not edit attendance records.</p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="py-2 pr-4 font-medium">Employee</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 font-medium">Recorded at</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b border-gray-100">
                <td className="py-2 pr-4">{record.employee.name}</td>
                <td className="py-2 pr-4">{record.status}</td>
                <td className="py-2">{wibDateTime(record.recordedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 && (
          <p className="py-4 text-sm text-gray-500">No attendance recorded yet.</p>
        )}
      </div>
    </div>
  );
}
