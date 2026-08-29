import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ApiError,
  clearToken,
  getAttendanceSummary,
  type AttendanceRecord,
} from 'api-client';
import { AttendanceTable } from '../components/AttendanceTable';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { wibDate } from '../lib/wib';

function todayWib(): string {
  return wibDate(new Date().toISOString());
}

function startOfMonthWib(): string {
  return `${todayWib().slice(0, 7)}-01`;
}

export function SummaryPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const search = useCallback(
    async (from: string, to: string) => {
      setLoading(true);
      setError(null);
      try {
        setRecords(await getAttendanceSummary(from, to));
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          navigate('/login', { replace: true });
          return;
        }
        setError('Could not load summary');
      } finally {
        setLoading(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    void search(startOfMonthWib(), todayWib());
  }, [search]);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">Summary Absen</h1>
      <DateRangeFilter
        initialFrom={startOfMonthWib()}
        initialTo={todayWib()}
        onSearch={search}
      />
      {loading && <p className="text-sm text-gray-500">Loading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && <AttendanceTable records={records} />}
    </div>
  );
}
