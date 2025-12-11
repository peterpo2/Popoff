import { motion } from 'framer-motion';
import React from 'react';

const floatingTokens = ['{ }', '< />', '();', '∞', '::'];

export const BackgroundEffects: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-body">
      <div className="absolute inset-0 opacity-60 bg-grid-lines bg-[length:48px_48px]" />
      <motion.div
        className="absolute inset-0"
        animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
        transition={{ duration: 18, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(126, 200, 200, 0.12), transparent 25%), radial-gradient(circle at 80% 10%, rgba(232, 168, 124, 0.12), transparent 20%), radial-gradient(circle at 60% 80%, rgba(201, 167, 176, 0.1), transparent 18%)',
        }}
      />
      <div className="absolute inset-0">
        {Array.from({ length: 12 }).map((_, idx) => {
          const size = 18 + (idx % 5) * 4;
          return (
            <motion.div
              key={idx}
              className="text-primary/40 font-mono"
              style={{
                position: 'absolute',
                left: `${(idx * 13) % 100}%`,
                top: `${(idx * 17) % 100}%`,
                fontSize: `${size}px`,
              }}
              animate={{
                y: [0, -12, 0],
                rotate: [0, 2, -2, 0],
              }}
              transition={{ duration: 12 + idx, repeat: Infinity, ease: 'easeInOut' }}
            >
              {floatingTokens[idx % floatingTokens.length]}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
