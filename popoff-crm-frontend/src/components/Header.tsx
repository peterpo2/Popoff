import React from 'react';
import { motion } from 'framer-motion';
import { User } from '../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  user?: User | null;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, user }) => {
  return (
    <header className="flex items-center justify-between py-6">
      <div>
        <h1 className="text-3xl font-semibold text-text text-glow">{title}</h1>
        {subtitle && <p className="text-primary mt-1">{subtitle}</p>}
      </div>
      {user && (
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
      )}
    </header>
  );
};
