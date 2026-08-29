import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ApiError,
  clearToken,
  recordAttendance,
  type AttendanceRecord,
} from 'api-client';
import { Button } from '../components/Button';
import { wibDateTime } from '../lib/wib';

export function AbsenPage() {
  const navigate = useNavigate();
  const [last, setLast] = useState<AttendanceRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<'MASUK' | 'PULANG' | null>(null);

  async function record(status: 'MASUK' | 'PULANG') {
    setError(null);
    setLoading(status);
    try {
      setLast(await recordAttendance(status));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearToken();
        navigate('/login', { replace: true });
        return;
      }
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">Absen</h1>

      <div className="flex gap-3">
        <Button
          onClick={() => record('MASUK')}
          loading={loading === 'MASUK'}
          disabled={loading !== null}
        >
          Masuk
        </Button>
        <Button
          variant="secondary"
          onClick={() => record('PULANG')}
          loading={loading === 'PULANG'}
          disabled={loading !== null}
        >
          Pulang
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {last && (
        <p className="text-sm text-gray-600">
          Recorded {last.status} at {wibDateTime(last.recordedAt)}
        </p>
      )}
    </div>
  );
}
