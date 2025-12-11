import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { apiClient } from '../api/client';
import { useToast } from '../contexts/ToastContext';
import { useUISettings } from '../contexts/UISettingsContext';
import { User } from '../types';

export const Settings: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { ambientEnabled, cursorTrailEnabled, toggleAmbient, toggleCursorTrail } = useUISettings();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = await apiClient.getUser();
        setUser(profile);
        setError('');
      } catch (err) {
        setError('Failed to load profile.');
        showToast({ type: 'error', title: 'Profile', message: 'Unable to load your profile details.' });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [showToast]);

  return (
    <div className="space-y-6 pb-12">
      <Card className="border-border/70">
        <h3 className="text-lg font-semibold mb-3">Profile</h3>
        {loading && <div className="text-primary">Loading profile...</div>}
        {error && !loading && (
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 px-4 py-3 text-sm text-primary">
            <span>{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg border border-border/70 px-3 py-1 text-xs font-semibold text-text hover:bg-card"
            >
              Retry
            </button>
          </div>
        )}
        {user && !loading && (
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent-2 to-primary flex items-center justify-center text-body font-semibold">
              {user.displayName.charAt(0)}
            </div>
            <div>
              <div className="text-text text-xl font-semibold">{user.displayName}</div>
              <div className="text-primary text-sm">{user.email}</div>
              <div className="text-primary text-sm">Role: {user.role}</div>
            </div>
          </div>
        )}
      </Card>

      <Card className="border-border/70 space-y-4">
        <h3 className="text-lg font-semibold">Preferences</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-text">Ambient animations</div>
            <div className="text-primary text-sm">Toggle ambient particles and gradients.</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only" checked={ambientEnabled} onChange={toggleAmbient} />
            <span className={`w-11 h-6 flex items-center bg-border/60 rounded-full p-1 duration-200 ${ambientEnabled ? 'bg-accent-2/40' : ''}`}>
              <span
                className={`bg-text w-4 h-4 rounded-full shadow transform duration-200 ${ambientEnabled ? 'translate-x-5' : ''}`}
              />
            </span>
          </label>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-text">Show cursor trail</div>
            <div className="text-primary text-sm">Soft glow following your pointer.</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only" checked={cursorTrailEnabled} onChange={toggleCursorTrail} />
            <span className={`w-11 h-6 flex items-center bg-border/60 rounded-full p-1 duration-200 ${cursorTrailEnabled ? 'bg-accent-1/40' : ''}`}>
              <span
                className={`bg-text w-4 h-4 rounded-full shadow transform duration-200 ${cursorTrailEnabled ? 'translate-x-5' : ''}`}
              />
            </span>
          </label>
        </div>
      </Card>
    </div>
  );
};
