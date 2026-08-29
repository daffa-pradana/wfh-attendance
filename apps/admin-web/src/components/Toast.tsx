import { useNotifications } from '../context/NotificationsContext';

const FIELD_LABEL: Record<string, string> = {
  phone: 'phone number',
  photo: 'photo',
  password: 'password',
};

export function Toast() {
  const { toast } = useNotifications();
  if (!toast) return null;

  return (
    <div
      role="status"
      className="fixed top-4 right-4 z-50 max-w-xs rounded-md bg-gray-900 px-4 py-3 text-sm text-white shadow-lg"
    >
      Employee updated their {FIELD_LABEL[toast.changedField] ?? toast.changedField}
    </div>
  );
}
