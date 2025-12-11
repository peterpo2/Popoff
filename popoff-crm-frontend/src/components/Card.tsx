import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <motion.div
    whileHover={{ y: -2 }}
    whileTap={{ y: 0 }}
    className={`glass-panel card-glow rounded-2xl border border-white/5 p-5 transition duration-200 ${className}`}
  >
    {children}
  </motion.div>
);
