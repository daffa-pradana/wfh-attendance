import { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ApiError,
  clearToken,
  createEmployee,
  listEmployees,
  updateEmployee,
  type CreateEmployeeInput,
  type Profile,
} from 'api-client';
import { Button } from '../components/Button';
import { EmployeeForm } from '../components/EmployeeForm';
import { useNotifications } from '../context/NotificationsContext';
import { wibDateTime } from '../lib/wib';

export function EmployeesPage() {
  const navigate = useNavigate();
  const { recent } = useNotifications();
  const [employees, setEmployees] = useState<Profile[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleAuthError(err: unknown) {
    if (err instanceof ApiError && err.status === 401) {
      clearToken();
      navigate('/login', { replace: true });
      return true;
    }
    return false;
  }

  function load() {
    listEmployees()
      .then(setEmployees)
      .catch((err) => {
        if (handleAuthError(err)) return;
        setLoadError('Could not load employees');
      });
  }

  useEffect(load, []);

  if (loadError) return <p className="text-sm text-red-600">{loadError}</p>;
  if (!employees) return <p className="text-sm text-gray-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Employees</h1>
        <Button onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? 'Close' : 'Add employee'}
        </Button>
      </div>

      {recent.length > 0 && (
        <details className="rounded-lg border border-gray-200 p-3 text-sm">
          <summary className="cursor-pointer font-medium text-gray-700">
            Recent profile changes ({recent.length})
          </summary>
          <ul className="mt-2 space-y-1 text-gray-600">
            {recent.map((entry) => (
              <li key={entry.id}>
                {wibDateTime(entry.at)} — employee changed their{' '}
                {entry.changedField}
              </li>
            ))}
          </ul>
        </details>
      )}

      {showCreate && (
        <div className="rounded-lg border border-gray-200 p-4">
          <EmployeeForm
            mode="create"
            submitLabel="Create employee"
            onSubmit={async (values) => {
              const created = await createEmployee(
                values as CreateEmployeeInput,
              ).catch((err) => {
                if (handleAuthError(err)) throw err;
                throw new Error(
                  err instanceof ApiError ? err.message : 'Could not create',
                );
              });
              setEmployees((prev) => (prev ? [...prev, created] : [created]));
              setShowCreate(false);
            }}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Email</th>
              <th className="py-2 pr-4 font-medium">Position</th>
              <th className="py-2 pr-4 font-medium">Phone</th>
              <th className="py-2 font-medium">Role</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <Fragment key={employee.id}>
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-4">{employee.name}</td>
                  <td className="py-2 pr-4">{employee.email}</td>
                  <td className="py-2 pr-4">{employee.position}</td>
                  <td className="py-2 pr-4">{employee.phone}</td>
                  <td className="py-2">{employee.role}</td>
                  <td className="py-2 text-right">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setEditingId((id) =>
                          id === employee.id ? null : employee.id,
                        )
                      }
                    >
                      {editingId === employee.id ? 'Close' : 'Edit'}
                    </Button>
                  </td>
                </tr>
                {editingId === employee.id && (
                  <tr>
                    <td colSpan={6} className="bg-gray-50 p-4">
                      <EmployeeForm
                        mode="edit"
                        initial={employee}
                        submitLabel="Save changes"
                        onSubmit={async (values) => {
                          const updated = await updateEmployee(
                            employee.id,
                            values,
                          ).catch((err) => {
                            if (handleAuthError(err)) throw err;
                            throw new Error(
                              err instanceof ApiError
                                ? err.message
                                : 'Could not update',
                            );
                          });
                          setEmployees((prev) =>
                            prev
                              ? prev.map((e) =>
                                  e.id === updated.id ? updated : e,
                                )
                              : prev,
                          );
                          setEditingId(null);
                        }}
                        onCancel={() => setEditingId(null)}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
