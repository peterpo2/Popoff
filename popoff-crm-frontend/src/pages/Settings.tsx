import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { mockClient } from '../api/mockClient';
import { User } from '../types';

export const Settings: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [ambient, setAmbient] = useState(true);
  const [cursorTrail, setCursorTrail] = useState(true);

  useEffect(() => {
    mockClient.getUser().then(setUser);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <Card className="border-white/10">
        <h3 className="text-lg font-semibold mb-3">Profile</h3>
        {user && (
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

      <Card className="border-white/10 space-y-4">
        <h3 className="text-lg font-semibold">Preferences</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-text">Ambient animations</div>
            <div className="text-primary text-sm">Toggle ambient particles and gradients.</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only" checked={ambient} onChange={() => setAmbient((v) => !v)} />
            <span className={`w-11 h-6 flex items-center bg-white/10 rounded-full p-1 duration-200 ${ambient ? 'bg-accent-2/50' : ''}`}>
              <span
                className={`bg-text w-4 h-4 rounded-full shadow transform duration-200 ${ambient ? 'translate-x-5' : ''}`}
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
            <input type="checkbox" className="sr-only" checked={cursorTrail} onChange={() => setCursorTrail((v) => !v)} />
            <span className={`w-11 h-6 flex items-center bg-white/10 rounded-full p-1 duration-200 ${cursorTrail ? 'bg-accent-1/50' : ''}`}>
              <span
                className={`bg-text w-4 h-4 rounded-full shadow transform duration-200 ${cursorTrail ? 'translate-x-5' : ''}`}
              />
            </span>
          </label>
        </div>
      </Card>
    </div>
  );
};
