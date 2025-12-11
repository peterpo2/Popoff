import React from 'react';
import { DeploymentStatus, HealthStatus } from '../types';

interface Props {
  status: HealthStatus | DeploymentStatus | string;
}

const statusStyles: Record<string, string> = {
  Healthy: 'bg-accent-2/20 text-accent-2 border border-accent-2/40',
  Degraded: 'bg-accent-1/20 text-accent-1 border border-accent-1/40',
  Down: 'bg-red-500/20 text-red-300 border border-red-500/50',
  Success: 'bg-accent-2/15 text-accent-2 border border-accent-2/40',
  Running: 'bg-primary/15 text-primary border border-primary/40',
  Pending: 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/40',
  Failed: 'bg-red-500/20 text-red-300 border border-red-500/50',
};

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const style = statusStyles[status] ?? 'bg-card text-text border border-white/10';
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${style}`}>{status}</span>;
};
