import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  API_URL,
  ApiError,
  changePassword,
  clearToken,
  getProfile,
  updatePhone,
  updatePhoto,
  type Profile,
} from 'api-client';
import { Button } from '../components/Button';

function useAuthGuardedAction<T extends unknown[]>(
  action: (...args: T) => Promise<Profile>,
  onSuccess: (profile: Profile) => void,
) {
  const navigate = useNavigate();
  return async (...args: T) => {
    try {
      onSuccess(await action(...args));
      return null;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearToken();
        navigate('/login', { replace: true });
      }
      return err instanceof ApiError ? err.message : 'Something went wrong';
    }
  };
}

export function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneSaving, setPhoneSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const savePhone = useAuthGuardedAction(updatePhone, (p) => setProfile(p));
  const savePassword = useAuthGuardedAction(changePassword, (p) =>
    setProfile(p),
  );
  const savePhoto = useAuthGuardedAction(updatePhoto, (p) => setProfile(p));

  useEffect(() => {
    getProfile()
      .then((p) => {
        setProfile(p);
        setPhone(p.phone);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          navigate('/login', { replace: true });
          return;
        }
        setLoadError('Could not load profile');
      });
  }, [navigate]);

  if (loadError) return <p className="text-sm text-red-600">{loadError}</p>;
  if (!profile) return <p className="text-sm text-gray-500">Loading…</p>;

  async function handlePhoneSubmit(e: FormEvent) {
    e.preventDefault();
    setPhoneSaving(true);
    setPhoneError(await savePhone(phone));
    setPhoneSaving(false);
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordSuccess(false);
    const err = await savePassword(currentPassword, newPassword);
    setPasswordError(err);
    setPasswordSaving(false);
    if (!err) {
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
    }
  }

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    setPhotoError(await savePhoto(file));
    setPhotoUploading(false);
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section className="flex items-center gap-4">
        {profile.photoUrl ? (
          <img
            src={`${API_URL}${profile.photoUrl}`}
            alt={profile.name}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-2xl text-gray-500">
            {profile.name.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            {profile.name}
          </h1>
          <p className="text-sm text-gray-500">{profile.email}</p>
          <p className="text-sm text-gray-500">{profile.position}</p>
        </div>
      </section>

      <section className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Change photo
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            disabled={photoUploading}
            className="mt-1 block w-full text-sm"
          />
        </label>
        {photoUploading && <p className="text-sm text-gray-500">Uploading…</p>}
        {photoError && <p className="text-sm text-red-600">{photoError}</p>}
      </section>

      <form onSubmit={handlePhoneSubmit} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Phone number
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:max-w-sm"
          />
        </label>
        {phoneError && <p className="text-sm text-red-600">{phoneError}</p>}
        <Button type="submit" loading={phoneSaving}>
          Save phone
        </Button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="space-y-2">
        <h2 className="text-sm font-medium text-gray-700">Change password</h2>
        <input
          type="password"
          placeholder="Current password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:max-w-sm"
        />
        <input
          type="password"
          placeholder="New password (min 8 characters)"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:max-w-sm"
        />
        {passwordError && (
          <p className="text-sm text-red-600">{passwordError}</p>
        )}
        {passwordSuccess && (
          <p className="text-sm text-green-600">Password updated.</p>
        )}
        <Button type="submit" loading={passwordSaving}>
          Save password
        </Button>
      </form>
    </div>
  );
}
