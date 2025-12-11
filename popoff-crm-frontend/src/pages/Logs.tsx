import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { apiClient } from '../api/client';
import { useToast } from '../contexts/ToastContext';
import { EnvironmentWithProject, LogEntry, Project } from '../types';

export const Logs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [envMatrix, setEnvMatrix] = useState<EnvironmentWithProject[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedEnv, setSelectedEnv] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [metaError, setMetaError] = useState('');
  const [logsError, setLogsError] = useState('');
  const { showToast } = useToast();

  const loadMeta = useCallback(async () => {
    try {
      const [projectData, envData] = await Promise.all([apiClient.getProjects(), apiClient.getEnvironmentMatrix()]);
      setProjects(projectData);
      setEnvMatrix(envData);
      setMetaError('');
    } catch (err) {
      setMetaError('Unable to load projects and environments.');
      showToast({ type: 'error', title: 'Logs', message: 'Failed to fetch project metadata.' });
    }
  }, [showToast]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  const filteredEnvironments = useMemo(
    () => envMatrix.filter((env) => !selectedProject || env.projectId === selectedProject),
    [envMatrix, selectedProject]
  );

  useEffect(() => {
    if (selectedEnv) {
      const envExists = filteredEnvironments.some((env) => env.id === selectedEnv);
      if (!envExists) {
        setSelectedEnv('');
        setLogs([]);
        return;
      }
    }
  }, [filteredEnvironments, selectedEnv]);

  useEffect(() => {
    if (!selectedEnv) return;

    const fetchLogs = () => {
      setIsLoading(true);
      setLogsError('');
      apiClient
        .getLogsByEnvironment(selectedEnv, 200)
        .then((result) => {
          setLogs(result.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
        })
        .catch(() => {
          setLogsError('Failed to load logs for this environment.');
          showToast({ type: 'error', title: 'Logs', message: 'Unable to fetch logs right now.' });
        })
        .finally(() => setIsLoading(false));
    };

    fetchLogs();

    if (!autoRefresh) return;

    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, selectedEnv, showToast]);

  const getLineColor = (text: string) => {
    if (/ERROR/i.test(text)) return 'text-red-400';
    if (/WARN/i.test(text)) return 'text-accent-1';
    if (/INFO/i.test(text)) return 'text-accent-2';
    return 'text-text';
  };

  const handleRefresh = () => {
    if (!selectedEnv) return;
    setIsLoading(true);
    apiClient
      .getLogsByEnvironment(selectedEnv, 200)
      .then((result) => {
        setLogsError('');
        setLogs(result.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
      })
      .catch(() => {
        setLogsError('Failed to refresh logs.');
        showToast({ type: 'error', title: 'Logs', message: 'Refreshing logs failed.' });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="space-y-6 pb-12">
      <Card className="border-border/70">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-xs text-primary">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                setSelectedEnv('');
                setLogs([]);
              }}
              className="mt-1 w-full rounded-lg bg-card/70 border border-border/70 px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
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
              className="mt-1 w-full rounded-lg bg-card/70 border border-border/70 px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Select environment</option>
              {filteredEnvironments.map((env) => (
                <option key={env.id} value={env.id}>
                  {env.projectName} – {env.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm text-primary">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border/70 bg-card/70"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                disabled={!selectedEnv}
              />
              Auto refresh every 10s
            </label>
            <button
              className="rounded-lg bg-accent-2/20 border border-accent-2/40 text-accent-2 px-4 py-2 font-semibold hover:shadow-glow hover:bg-accent-2/25 disabled:opacity-50"
              onClick={handleRefresh}
              disabled={!selectedEnv || isLoading}
            >
              Refresh
            </button>
          </div>
        </div>

        {metaError && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-border/60 bg-card/60 px-4 py-3 text-sm text-primary">
            <span>{metaError}</span>
            <button
              onClick={loadMeta}
              className="rounded-lg border border-border/70 px-3 py-1 text-xs font-semibold text-text hover:bg-card"
            >
              Retry
            </button>
          </div>
        )}
      </Card>

      <Card>
        <div className="h-[480px] overflow-auto rounded-xl border border-border/70 bg-card/80 p-4 font-mono text-sm space-y-2">
          {!selectedEnv && <div className="text-primary">Select an environment to view logs.</div>}
          {selectedEnv && isLoading && <div className="text-primary">Loading logs...</div>}
          {selectedEnv && logsError && !isLoading && (
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 px-4 py-3 text-sm text-primary">
              <span>{logsError}</span>
              <button
                onClick={handleRefresh}
                className="rounded-lg border border-border/70 px-3 py-1 text-xs font-semibold text-text hover:bg-card"
              >
                Retry
              </button>
            </div>
          )}
          {selectedEnv && !isLoading && logs.length === 0 && <div className="text-primary">No logs found.</div>}

          {selectedEnv &&
            logs.map((log) => {
              const env = envMatrix.find((e) => e.id === log.environmentId);
              const line = `[${new Date(log.timestamp).toLocaleTimeString()}] [${log.level}] ${log.message} (${env?.projectCode}/${env?.slug})`;
              return (
                <div key={log.id} className={`whitespace-pre-wrap ${getLineColor(line)}`}>
                  {line}
                </div>
              );
            })}
        </div>
      </Card>
    </div>
  );
};
