import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { io } from 'socket.io-client';
import { API_URL, type ProfileChangedEvent } from 'api-client';

interface ChangeEntry extends ProfileChangedEvent {
  id: string;
  at: string;
}

interface NotificationsValue {
  toast: ChangeEntry | null;
  recent: ChangeEntry[];
  connected: boolean;
}

const NotificationsContext = createContext<NotificationsValue>({
  toast: null,
  recent: [],
  connected: false,
});

export function useNotifications() {
  return useContext(NotificationsContext);
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ChangeEntry | null>(null);
  const [recent, setRecent] = useState<ChangeEntry[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(API_URL);
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('profile-changed', (event: ProfileChangedEvent) => {
      const entry: ChangeEntry = {
        ...event,
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
      };
      setToast(entry);
      setRecent((prev) => [entry, ...prev].slice(0, 20));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <NotificationsContext.Provider value={{ toast, recent, connected }}>
      {children}
    </NotificationsContext.Provider>
  );
}
