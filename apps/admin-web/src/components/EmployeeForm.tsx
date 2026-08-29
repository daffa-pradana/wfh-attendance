import { useState, type FormEvent } from 'react';
import type { CreateEmployeeInput, UpdateEmployeeInput } from 'api-client';
import { Button } from './Button';

interface EmployeeFormValues {
  name: string;
  email: string;
  password: string;
  position: string;
  phone: string;
}

interface EmployeeFormProps {
  mode: 'create' | 'edit';
  initial?: Partial<EmployeeFormValues>;
  submitLabel: string;
  onSubmit: (values: CreateEmployeeInput | UpdateEmployeeInput) => Promise<void>;
  onCancel?: () => void;
}

export function EmployeeForm({
  mode,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: EmployeeFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [password, setPassword] = useState('');
  const [position, setPosition] = useState(initial?.position ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'create') {
        await onSubmit({ name, email, password, position, phone });
      } else {
        await onSubmit({ name, email, position, phone });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'block w-full rounded-md border border-gray-300 px-3 py-2 text-sm';

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm text-gray-700">
        Name
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="text-sm text-gray-700">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </label>
      {mode === 'create' && (
        <label className="text-sm text-gray-700">
          Initial password
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </label>
      )}
      <label className="text-sm text-gray-700">
        Position
        <input
          required
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="text-sm text-gray-700">
        Phone
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
        />
      </label>

      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}

      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
