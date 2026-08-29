import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearToken } from 'api-client';
import { Button } from './Button';

const LINK_CLASS =
  'rounded-md px-3 py-2 text-sm font-medium aria-[current=page]:bg-indigo-100 aria-[current=page]:text-indigo-700 text-gray-600 hover:bg-gray-100';

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col">
      <header className="flex items-center justify-between gap-2 border-b border-gray-200 px-4 py-3">
        <nav className="flex flex-wrap gap-1">
          <NavLink to="/profile" className={LINK_CLASS}>
            Profile
          </NavLink>
          <NavLink to="/absen" className={LINK_CLASS}>
            Absen
          </NavLink>
          <NavLink to="/summary" className={LINK_CLASS}>
            Summary
          </NavLink>
        </nav>
        <Button
          variant="secondary"
          onClick={() => {
            clearToken();
            navigate('/login', { replace: true });
          }}
        >
          Logout
        </Button>
      </header>
      <main className="flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
