import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

type CardProps = HTMLMotionProps<'div'> & {
  children: React.ReactNode;
  className?: string;
};

export const Card: React.FC<CardProps> = ({ children, className = '', ...rest }) => (
  <motion.div
    whileHover={{ y: -2 }}
    whileTap={{ y: 0 }}
    className={`glass-panel card-glow rounded-2xl border border-border/70 p-5 transition duration-200 ${className}`}
    {...rest}
  >
    {children}
  </motion.div>
);
