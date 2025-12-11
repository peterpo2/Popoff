import { httpClient } from './httpClient';
import { mockClient } from './mockClient';
import {
  Deployment,
  Environment,
  EnvironmentWithProject,
  HealthOverview,
  Project,
  Server,
  User,
} from '../types';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

async function withFallback<T>(realCall: () => Promise<T>, mockCall: () => Promise<T>) {
  if (useMock) {
    return mockCall();
  }

  try {
    return await realCall();
  } catch (error) {
    console.warn('Falling back to mock API due to error', error);
    return mockCall();
  }
}

async function fetchEnvironmentsWithProjects(): Promise<EnvironmentWithProject[]> {
  const projects = await httpClient.get<Project[]>('/api/project');
  const results = await Promise.all(
    projects.map(async (project) => {
      const envs = await httpClient.get<Environment[]>(`/api/environment/by-project/${project.id}`);
      return envs.map((env) => ({ ...env, projectCode: project.code }));
    })
  );

  return results.flat();
}

export const apiClient = {
  getUser: () => withFallback(() => httpClient.get<User>('/api/auth/me'), () => mockClient.getUser()),
  getProjects: () => withFallback(() => httpClient.get<Project[]>('/api/project'), () => mockClient.getProjects()),
  getProject: (id: string) =>
    withFallback(() => httpClient.get<Project>(`/api/project/${id}`), () => mockClient.getProject(id)),
  getServers: () => withFallback(() => httpClient.get<Server[]>('/api/server'), () => mockClient.getServers()),
  getServer: (id: string) =>
    withFallback(() => httpClient.get<Server>(`/api/server/${id}`), () => mockClient.getServer(id)),
  getEnvironmentsByProject: (projectId: string) =>
    withFallback(() => httpClient.get<Environment[]>(`/api/environment/by-project/${projectId}`), () => mockClient.getEnvironmentsByProject(projectId)),
  getEnvironment: (id: string) =>
    withFallback(() => httpClient.get<Environment>(`/api/environment/${id}`), () => mockClient.getEnvironment(id)),
  getDeployments: (filter?: { projectId?: string }) =>
    withFallback(
      async () => {
        const data = await httpClient.get<Deployment[]>('/api/deployment');
        if (filter?.projectId) {
          const environments = await fetchEnvironmentsWithProjects();
          const allowedEnvIds = environments
            .filter((env) => env.projectId === filter.projectId)
            .map((env) => env.id);
          return data.filter((deployment) => allowedEnvIds.includes(deployment.environmentId));
        }

        return data;
      },
      () => mockClient.getDeployments(filter)
    ),
  getHealthOverview: () =>
    withFallback(
      () => httpClient.get<HealthOverview[]>('/api/health/overview'),
      async () => {
        const [healthResults, envs] = await Promise.all([
          mockClient.getHealth(),
          mockClient.getEnvironmentMatrix(),
        ]);

        return healthResults.map((result) => {
          const env = envs.find((e) => e.id === result.environmentId);
          return {
            environmentId: result.environmentId,
            projectId: env?.projectId ?? '',
            projectName: env?.projectName ?? 'Unknown project',
            environmentName: env?.name ?? 'Unknown environment',
            status: result.status,
            checkedOn: result.checkedOn,
            responseTimeMs: result.responseTimeMs,
            statusCode: result.statusCode,
            message: result.message,
          } satisfies HealthOverview;
        });
      }
    ),
  getEnvironmentMatrix: () => withFallback(fetchEnvironmentsWithProjects, () => mockClient.getEnvironmentMatrix()),
  getLogs: () => mockClient.getLogs(),
  getDashboardStats: () => mockClient.getDashboardStats(),
};
