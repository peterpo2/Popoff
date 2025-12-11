export interface AuditedEntity {
  id: string; // GUID
  createdOn: string; // ISO string
  updatedOn: string | null;
  isDeleted: boolean;
}

export interface Server extends AuditedEntity {
  name: string;
  description?: string;
  hostName?: string;
  ipAddress: string;
  connectionType: 'LocalShell' | 'RemoteAgent';
  connectionData?: string; // JSON or string placeholder
  isActive: boolean;
}

export interface Project extends AuditedEntity {
  name: string;
  code: string;
  description?: string;
  repositoryUrl?: string;
}

export interface Environment extends AuditedEntity {
  projectId: string;
  serverId: string;
  name: string; // "Prod" / "Test" / "Staging"
  slug: string; // "prod" / "test"
  isProduction: boolean;
  frontendUrl?: string;
  apiUrl?: string;
  dockerComposePath?: string;
  dockerProjectName?: string;
  gitBranch?: string;
}

export type DeploymentStatus = 'Pending' | 'Running' | 'Success' | 'Failed';

export interface Deployment extends AuditedEntity {
  environmentId: string;
  requestedByUserId: string;
  startedAt: string;
  finishedAt: string | null;
  status: DeploymentStatus;
  version?: string;
  branch?: string;
  triggerType: 'Manual' | 'Auto';
  logExcerpt?: string;
}

export type HealthStatus = 'Healthy' | 'Degraded' | 'Down';

export interface HealthCheckResult extends AuditedEntity {
  environmentId: string;
  status: HealthStatus;
  checkedOn: string;
  responseTimeMs?: number;
  statusCode?: number | null;
  message?: string | null;
}

export interface User extends AuditedEntity {
  email: string;
  displayName: string;
  role: 'Admin';
}

export interface EnvironmentWithProject extends Environment {
  projectName: string;
  projectCode: string;
  serverName?: string;
}
