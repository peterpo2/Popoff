export type DeploymentStatus = 'Pending' | 'Running' | 'Success' | 'Failed';

export type HealthStatus = 'Healthy' | 'Degraded' | 'Down';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  repositoryUrl?: string | null;
}

export interface Server {
  id: string;
  name: string;
  ipAddress: string;
  hostName?: string | null;
  isActive: boolean;
  connectionType: string;
  connectionData?: string | null;
  description?: string | null;
}

export interface Environment {
  id: string;
  projectId: string;
  serverId: string;
  name: string;
  slug: string;
  isProduction: boolean;
  frontendUrl?: string | null;
  apiUrl?: string | null;
  dockerComposePath?: string | null;
  dockerProjectName?: string | null;
  gitBranch?: string | null;
  projectName: string;
  serverName: string;
  projectCode?: string;
}

export interface Deployment {
  id: string;
  environmentId: string;
  requestedByUserId: string;
  startedAt: string;
  finishedAt: string | null;
  status: DeploymentStatus;
  version?: string | null;
  branch?: string | null;
  triggerType: string;
  logExcerpt?: string | null;
}

export interface HealthCheckResult {
  id: string;
  environmentId: string;
  status: HealthStatus;
  checkedOn: string;
  responseTimeMs?: number | null;
  statusCode?: number | null;
  message?: string | null;
}

export interface HealthOverview {
  environmentId: string;
  projectId: string;
  projectName: string;
  environmentName: string;
  status: HealthStatus;
  checkedOn: string;
  responseTimeMs?: number | null;
  statusCode?: number | null;
  message?: string | null;
}

export type EnvironmentWithProject = Environment;

export interface DashboardStats {
  totalProjects: number;
  totalEnvironments: number;
  totalServers: number;
  activeDeployments: number;
}

export type LogLevel = 'INFO' | 'WARNING' | 'ERROR';

export interface LogEntry {
  id: string;
  environmentId: string;
  level: LogLevel;
  message: string;
  timestamp: string;
}
