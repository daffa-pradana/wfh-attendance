import type { AttendanceRecord } from 'api-client';
import { wibDate, wibDateTime } from '../lib/wib';

interface DayRow {
  date: string;
  masuk?: string;
  pulang?: string;
}

function groupByDay(records: AttendanceRecord[]): DayRow[] {
  const byDay = new Map<string, DayRow>();
  for (const record of records) {
    const date = wibDate(record.recordedAt);
    const row = byDay.get(date) ?? { date };
    if (record.status === 'MASUK' && !row.masuk) row.masuk = record.recordedAt;
    if (record.status === 'PULANG') row.pulang = record.recordedAt;
    byDay.set(date, row);
  }
  return [...byDay.values()].sort((a, b) => b.date.localeCompare(a.date));
}

export function AttendanceTable({ records }: { records: AttendanceRecord[] }) {
  const rows = groupByDay(records);

  if (rows.length === 0) {
    return <p className="text-sm text-gray-500">No attendance records in this range.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="py-2 pr-4 font-medium">Masuk</th>
            <th className="py-2 font-medium">Pulang</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.date} className="border-b border-gray-100">
              <td className="py-2 pr-4">
                {row.masuk ? wibDateTime(row.masuk) : '-'}
              </td>
              <td className="py-2">
                {row.pulang ? wibDateTime(row.pulang) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
