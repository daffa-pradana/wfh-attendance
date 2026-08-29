import { useState } from 'react';
import { Button } from './Button';

interface DateRangeFilterProps {
  initialFrom?: string;
  initialTo?: string;
  onSearch: (from: string, to: string) => void;
}

export function DateRangeFilter({
  initialFrom = '',
  initialTo = '',
  onSearch,
}: DateRangeFilterProps) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(from, to);
      }}
    >
      <label className="flex flex-col text-sm text-gray-700">
        From
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="flex flex-col text-sm text-gray-700">
        To
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </label>
      <Button type="submit">Cari</Button>
    </form>
  );
}
