import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { apiClient } from '../api/client';
import { LogEntry } from '../types';
import { EnvironmentWithProject, Project } from '../types';

const levelColors: Record<string, string> = {
  INFO: 'text-accent-2',
  WARNING: 'text-accent-1',
  ERROR: 'text-red-400',
};

export const Logs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [envMatrix, setEnvMatrix] = useState<EnvironmentWithProject[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedEnv, setSelectedEnv] = useState('');

  useEffect(() => {
    apiClient.getProjects().then(setProjects);
    apiClient.getEnvironmentMatrix().then(setEnvMatrix);
    apiClient.getLogs().then(setLogs);
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const env = envMatrix.find((e) => e.id === log.environmentId);
      if (selectedProject && env?.projectId !== selectedProject) return false;
      if (selectedEnv && env?.id !== selectedEnv) return false;
      return true;
    });
  }, [envMatrix, logs, selectedEnv, selectedProject]);

  return (
    <div className="space-y-6 pb-12">
      <Card className="border-white/10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-xs text-primary">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                setSelectedEnv('');
              }}
              className="mt-1 w-full rounded-lg bg-body border border-white/10 px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-primary">Environment</label>
            <select
              value={selectedEnv}
              onChange={(e) => setSelectedEnv(e.target.value)}
              className="mt-1 w-full rounded-lg bg-body border border-white/10 px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {envMatrix
                .filter((env) => !selectedProject || env.projectId === selectedProject)
                .map((env) => (
                  <option key={env.id} value={env.id}>
                    {env.projectName} – {env.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="rounded-lg bg-accent-2/20 border border-accent-2/50 text-accent-2 px-4 py-2 font-semibold hover:shadow-glow"
              onClick={() => apiClient.getLogs().then(setLogs)}
            >
              Refresh
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="h-[480px] overflow-auto rounded-xl border border-white/5 bg-black/40 p-4 font-mono text-sm">
          {filteredLogs.map((log) => {
            const env = envMatrix.find((e) => e.id === log.environmentId);
            return (
              <div key={log.id} className="flex gap-3 py-1 border-b border-white/5 last:border-none">
                <span className="text-primary text-xs w-40">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={`font-semibold w-24 ${levelColors[log.level]}`}>{log.level}</span>
                <span className="text-text flex-1">{log.message}</span>
                <span className="text-primary text-xs">{env?.projectCode}/{env?.slug}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
