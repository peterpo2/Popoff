import React from 'react';
import { motion } from 'framer-motion';
import { User } from '../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  user?: User | null;
  onLogout?: () => void;
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, user, onLogout, onMenuToggle }) => {
  return (
    <header className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3 md:items-center">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="inline-flex items-center rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-sm text-text shadow-soft/40 transition hover:bg-card md:hidden"
          >
            ☰ Menu
          </button>
        )}
        <div>
          <h1 className="text-3xl font-semibold text-text text-glow">{title}</h1>
          {subtitle && <p className="text-primary mt-1">{subtitle}</p>}
        </div>
      </div>
      {user && (
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ y: -2 }}
            className="flex items-center gap-3 rounded-full bg-card/70 px-4 py-2 border border-border/70 shadow-soft/50"
          >
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent-2 to-primary flex items-center justify-center text-body font-semibold">
              {user.displayName.charAt(0)}
            </div>
            <div className="text-sm">
              <div className="text-text">{user.displayName}</div>
              <div className="text-primary">{user.role}</div>
            </div>
          </motion.div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="rounded-full border border-border/70 px-4 py-2 text-sm text-text hover:text-body hover:bg-primary/80 transition shadow-soft/50"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
};
