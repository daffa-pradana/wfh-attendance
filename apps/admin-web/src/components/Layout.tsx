import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearToken } from 'api-client';
import { Button } from './Button';
import { Toast } from './Toast';
import { useNotifications } from '../context/NotificationsContext';

const LINK_CLASS =
  'rounded-md px-3 py-2 text-sm font-medium aria-[current=page]:bg-indigo-100 aria-[current=page]:text-indigo-700 text-gray-600 hover:bg-gray-100';

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { connected } = useNotifications();

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col">
      <Toast />
      <header className="flex items-center justify-between gap-2 border-b border-gray-200 px-4 py-3">
        <nav className="flex flex-wrap gap-1">
          <NavLink to="/employees" className={LINK_CLASS}>
            Employees
          </NavLink>
          <NavLink to="/attendance" className={LINK_CLASS}>
            Attendance
          </NavLink>
        </nav>
        <div className="flex items-center gap-3">
          <span
            title={connected ? 'Live updates connected' : 'Reconnecting…'}
            className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`}
          />
          <Button
            variant="secondary"
            onClick={() => {
              clearToken();
              navigate('/login', { replace: true });
            }}
          >
            Logout
          </Button>
        </div>
      </header>
      <main className="flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
