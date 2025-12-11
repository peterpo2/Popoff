import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/projects', label: 'Projects' },
  { path: '/servers', label: 'Servers' },
  { path: '/deployments', label: 'Deployments' },
  { path: '/health', label: 'Health' },
  { path: '/logs', label: 'Logs' },
  { path: '/settings', label: 'Settings' },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 shrink-0 px-5 py-6 glass-panel border-r border-border/70 relative z-10">
      <div className="mb-10">
        <div className="text-2xl font-semibold text-text text-glow">Popoff CRM</div>
        <p className="text-sm text-primary">The Cozy Code Realm</p>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-card/70 hover:text-text ${
                isActive ? 'bg-border/60 text-text shadow-glow' : 'text-primary'
              }`
            }
          >
            <motion.span whileHover={{ x: 2 }} className="inline-block">
              {item.label}
            </motion.span>
          </NavLink>
        ))}
      </nav>
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-body via-transparent to-transparent pointer-events-none" />
    </aside>
  );
};
