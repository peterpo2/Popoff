import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon }) => (
  <motion.div
    whileHover={{ rotateX: -1, rotateY: 1 }}
    className="glass-panel card-glow rounded-2xl border border-border/70 p-5 shadow-soft"
    style={{ transformStyle: 'preserve-3d' }}
  >
    <div className="flex items-center justify-between text-sm text-primary mb-2 uppercase tracking-wide">
      <span>{label}</span>
      {icon}
    </div>
    <div className="text-3xl font-semibold text-text text-glow">{value}</div>
  </motion.div>
);
