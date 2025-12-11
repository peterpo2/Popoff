import React, { useEffect, useState } from 'react';

export const CursorGlow: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 transition duration-200"
      style={{
        background: `radial-gradient(120px at ${position.x}px ${position.y}px, rgba(126, 200, 200, 0.15), transparent 55%)`,
      }}
    />
  );
};
