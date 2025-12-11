import { Deployment, Environment, EnvironmentWithProject, HealthCheckResult, Project, Server, User } from '../types';

type LogLevel = 'INFO' | 'WARNING' | 'ERROR';

export interface LogEntry {
  id: string;
  environmentId: string;
  level: LogLevel;
  message: string;
  timestamp: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalEnvironments: number;
  totalServers: number;
  activeDeployments: number;
}

const user: User = {
  id: '11111111-1111-1111-1111-111111111111',
  displayName: 'Petar Popov',
  email: 'petar@crm.popoff.com',
  role: 'Admin',
  createdOn: '2024-12-01T10:00:00Z',
  updatedOn: null,
  isDeleted: false,
};

const servers: Server[] = [
  {
    id: '5b9ccebe-0c09-4f71-9f9c-b19ec4e1c001',
    name: 'Hetzner-Prod-1',
    description: 'Primary production server running Docker',
    hostName: 'prod-1.crm.popoff.com',
    ipAddress: '144.76.21.10',
    connectionType: 'LocalShell',
    connectionData: '{}',
    isActive: true,
    createdOn: '2024-12-01T10:00:00Z',
    updatedOn: '2024-12-10T12:00:00Z',
    isDeleted: false,
  },
  {
    id: '7f08bfc4-9585-4a1c-8ae2-20812a534002',
    name: 'Hetzner-Test-1',
    description: 'Test workloads and staging',
    hostName: 'test-1.crm.popoff.com',
    ipAddress: '144.76.21.11',
    connectionType: 'LocalShell',
    connectionData: '{}',
    isActive: true,
    createdOn: '2024-12-01T10:00:00Z',
    updatedOn: '2024-12-08T14:00:00Z',
    isDeleted: false,
  },
];

const projects: Project[] = [
  {
    id: '2d6f51d1-9e67-46c7-886e-9acba500a100',
    name: 'Latelina',
    code: 'LAT',
    description: 'E-commerce storefront for artisan pasta',
    repositoryUrl: 'https://github.com/popoff/latelina',
    createdOn: '2024-12-01T10:00:00Z',
    updatedOn: '2024-12-12T10:00:00Z',
    isDeleted: false,
  },
  {
    id: 'bdd9e0c4-d7ad-47b2-9a63-9f7d57a3a200',
    name: 'SignalQ',
    code: 'SIG',
    description: 'Real-time status monitor for microservices',
    repositoryUrl: 'https://github.com/popoff/signalq',
    createdOn: '2024-12-03T09:00:00Z',
    updatedOn: '2024-12-11T15:00:00Z',
    isDeleted: false,
  },
];

const environments: Environment[] = [
  {
    id: 'fa58cf0b-133a-4c7c-acb1-9699be060401',
    projectId: projects[0].id,
    serverId: servers[0].id,
    name: 'Prod',
    slug: 'prod',
    isProduction: true,
    frontendUrl: 'https://latelina.com',
    apiUrl: 'https://api.latelina.com',
    dockerComposePath: '/srv/latelina/prod/docker-compose.yml',
    dockerProjectName: 'latelina-prod',
    gitBranch: 'main',
    createdOn: '2024-12-01T10:00:00Z',
    updatedOn: '2024-12-12T09:00:00Z',
    isDeleted: false,
  },
  {
    id: 'f2a3e17b-44f9-45b0-8571-6d5ed5a30502',
    projectId: projects[0].id,
    serverId: servers[1].id,
    name: 'Test',
    slug: 'test',
    isProduction: false,
    frontendUrl: 'https://test.latelina.com',
    apiUrl: 'https://api-test.latelina.com',
    dockerComposePath: '/srv/latelina/test/docker-compose.yml',
    dockerProjectName: 'latelina-test',
    gitBranch: 'develop',
    createdOn: '2024-12-02T10:00:00Z',
    updatedOn: '2024-12-12T08:00:00Z',
    isDeleted: false,
  },
  {
    id: 'd1e84a03-1a52-4db3-b929-a92bb8c90603',
    projectId: projects[1].id,
    serverId: servers[0].id,
    name: 'Prod',
    slug: 'prod',
    isProduction: true,
    frontendUrl: 'https://signalq.com',
    apiUrl: 'https://api.signalq.com',
    dockerComposePath: '/srv/signalq/prod/docker-compose.yml',
    dockerProjectName: 'signalq-prod',
    gitBranch: 'main',
    createdOn: '2024-12-05T10:00:00Z',
    updatedOn: '2024-12-10T08:00:00Z',
    isDeleted: false,
  },
  {
    id: '87fc5b4e-0bfb-430c-9e6c-e8610f1b0404',
    projectId: projects[1].id,
    serverId: servers[1].id,
    name: 'Test',
    slug: 'test',
    isProduction: false,
    frontendUrl: 'https://test.signalq.com',
    apiUrl: 'https://api-test.signalq.com',
    dockerComposePath: '/srv/signalq/test/docker-compose.yml',
    dockerProjectName: 'signalq-test',
    gitBranch: 'develop',
    createdOn: '2024-12-05T10:00:00Z',
    updatedOn: '2024-12-10T08:00:00Z',
    isDeleted: false,
  },
];

const deployments: Deployment[] = [
  {
    id: '82f1d0f4-a9b8-4d62-a9f0-0dfd5ac00701',
    environmentId: environments[0].id,
    requestedByUserId: user.id,
    startedAt: '2024-12-12T11:00:00Z',
    finishedAt: '2024-12-12T11:05:00Z',
    status: 'Success',
    version: '1.4.2',
    branch: 'main',
    triggerType: 'Manual',
    logExcerpt: 'Deployment completed successfully.',
    createdOn: '2024-12-12T11:00:00Z',
    updatedOn: '2024-12-12T11:05:00Z',
    isDeleted: false,
  },
  {
    id: '0f3a81c5-4c8f-4d9e-a508-4298e7f90702',
    environmentId: environments[1].id,
    requestedByUserId: user.id,
    startedAt: '2024-12-12T09:00:00Z',
    finishedAt: '2024-12-12T09:04:00Z',
    status: 'Success',
    version: '1.4.2-rc',
    branch: 'develop',
    triggerType: 'Manual',
    logExcerpt: 'Smoke tests passed.',
    createdOn: '2024-12-12T09:00:00Z',
    updatedOn: '2024-12-12T09:04:00Z',
    isDeleted: false,
  },
  {
    id: 'c6cc1269-dc92-4c23-af4d-d8d0bcf50703',
    environmentId: environments[2].id,
    requestedByUserId: user.id,
    startedAt: '2024-12-11T18:00:00Z',
    finishedAt: '2024-12-11T18:07:00Z',
    status: 'Failed',
    version: '0.9.0',
    branch: 'main',
    triggerType: 'Auto',
    logExcerpt: 'Container healthcheck failed after deploy.',
    createdOn: '2024-12-11T18:00:00Z',
    updatedOn: '2024-12-11T18:07:00Z',
    isDeleted: false,
  },
  {
    id: 'e95e9ee3-1c02-4e46-bf90-6a8c3acf0704',
    environmentId: environments[3].id,
    requestedByUserId: user.id,
    startedAt: '2024-12-12T06:30:00Z',
    finishedAt: null,
    status: 'Running',
    version: '0.9.1-beta',
    branch: 'develop',
    triggerType: 'Manual',
    logExcerpt: 'Rolling update in progress...',
    createdOn: '2024-12-12T06:30:00Z',
    updatedOn: '2024-12-12T06:45:00Z',
    isDeleted: false,
  },
];

const healthChecks: HealthCheckResult[] = [
  {
    id: '5c5a5c8a-7e8d-4c0e-9fe5-7c556aa30801',
    environmentId: environments[0].id,
    status: 'Healthy',
    checkedOn: new Date().toISOString(),
    responseTimeMs: 120,
    statusCode: 200,
    message: 'All systems nominal',
    createdOn: '2024-12-12T10:50:00Z',
    updatedOn: null,
    isDeleted: false,
  },
  {
    id: 'bdb4d2a1-4f24-40a2-9af3-81f965c20802',
    environmentId: environments[1].id,
    status: 'Degraded',
    checkedOn: new Date().toISOString(),
    responseTimeMs: 480,
    statusCode: 200,
    message: 'Elevated latency on checkout API',
    createdOn: '2024-12-12T10:40:00Z',
    updatedOn: null,
    isDeleted: false,
  },
  {
    id: '3cb4bb27-7d36-4389-9d63-09da8a2c0803',
    environmentId: environments[2].id,
    status: 'Down',
    checkedOn: new Date().toISOString(),
    responseTimeMs: undefined,
    statusCode: 503,
    message: 'Database connection refused',
    createdOn: '2024-12-12T10:30:00Z',
    updatedOn: null,
    isDeleted: false,
  },
  {
    id: 'd7b70bb1-7b0f-4066-9dd4-4c2bf1d50804',
    environmentId: environments[3].id,
    status: 'Healthy',
    checkedOn: new Date().toISOString(),
    responseTimeMs: 160,
    statusCode: 200,
    message: 'Stable response times',
    createdOn: '2024-12-12T10:20:00Z',
    updatedOn: null,
    isDeleted: false,
  },
];

const logs: LogEntry[] = Array.from({ length: 40 }).map((_, idx) => {
  const env = environments[idx % environments.length];
  const levels: LogLevel[] = ['INFO', 'WARNING', 'ERROR'];
  const level = levels[idx % levels.length];
  return {
    id: crypto.randomUUID(),
    environmentId: env.id,
    level,
    message:
      level === 'INFO'
        ? 'Background job heartbeat tick.'
        : level === 'WARNING'
        ? 'High memory usage observed on worker pod.'
        : 'Unhandled exception in payment service.',
    timestamp: new Date(Date.now() - idx * 60_000).toISOString(),
  };
});

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockClient = {
  async getUser() {
    await delay();
    return user;
  },
  async getProjects() {
    await delay();
    return projects;
  },
  async getProject(id: string) {
    await delay();
    return projects.find((p) => p.id === id) ?? null;
  },
  async getServers() {
    await delay();
    return servers;
  },
  async getServer(id: string) {
    await delay();
    return servers.find((s) => s.id === id) ?? null;
  },
  async getEnvironmentsByProject(projectId: string) {
    await delay();
    return environments.filter((env) => env.projectId === projectId);
  },
  async getEnvironment(id: string) {
    await delay();
    return environments.find((env) => env.id === id) ?? null;
  },
  async getDeployments(filter?: { projectId?: string }) {
    await delay();
    const filtered = filter?.projectId
      ? deployments.filter((d) => environments.find((env) => env.id === d.environmentId)?.projectId === filter.projectId)
      : deployments;
    return filtered.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  },
  async getHealth() {
    await delay();
    return healthChecks;
  },
  async getLogs(filter?: { environmentId?: string }) {
    await delay();
    return filter?.environmentId ? logs.filter((l) => l.environmentId === filter.environmentId) : logs;
  },
  async getDashboardStats(): Promise<DashboardStats> {
    await delay();
    return {
      totalProjects: projects.length,
      totalEnvironments: environments.length,
      totalServers: servers.length,
      activeDeployments: deployments.filter((d) => d.status === 'Running' || d.status === 'Pending').length,
    };
  },
  async getEnvironmentMatrix(): Promise<EnvironmentWithProject[]> {
    await delay();
    return environments.map((env) => {
      const project = projects.find((p) => p.id === env.projectId)!;
      const server = servers.find((s) => s.id === env.serverId);
      return {
        ...env,
        projectName: project.name,
        projectCode: project.code,
        serverName: server?.name,
      };
    });
  },
};

export type { LogLevel };
