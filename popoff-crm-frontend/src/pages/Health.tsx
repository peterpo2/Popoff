import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { mockClient } from '../api/mockClient';
import { EnvironmentWithProject, HealthCheckResult } from '../types';

export const Health: React.FC = () => {
  const [health, setHealth] = useState<HealthCheckResult[]>([]);
  const [envMatrix, setEnvMatrix] = useState<EnvironmentWithProject[]>([]);

  useEffect(() => {
    mockClient.getHealth().then(setHealth);
    mockClient.getEnvironmentMatrix().then(setEnvMatrix);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <Card>
        <h3 className="text-lg font-semibold mb-4">Current Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {health.map((item) => {
            const env = envMatrix.find((e) => e.id === item.environmentId);
            return (
              <Card key={item.id} className="border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-primary">{env?.projectName}</div>
                    <h4 className="text-xl font-semibold text-text">{env?.name}</h4>
                    <p className="text-primary text-sm">Latency: {item.responseTimeMs ?? '—'} ms</p>
                    <p className="text-primary text-xs">Last check: {new Date(item.checkedOn).toLocaleTimeString()}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Health History (mock)</h3>
        <div className="space-y-3">
          {envMatrix.slice(0, 3).map((env) => (
            <div key={env.id} className="rounded-xl border border-white/5 bg-white/5 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-primary">{env.projectName}</div>
                  <div className="text-text font-semibold">{env.name}</div>
                </div>
                <div className="flex gap-1">
                  {['Healthy', 'Healthy', 'Degraded', 'Healthy', 'Down', 'Healthy'].map((status, idx) => (
                    <div
                      key={idx}
                      className={`h-12 w-5 rounded-md ${
                        status === 'Healthy'
                          ? 'bg-accent-2/70'
                          : status === 'Degraded'
                          ? 'bg-accent-1/70'
                          : 'bg-red-500/70'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
