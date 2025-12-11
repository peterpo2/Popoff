# Popoff CRM Backend

Popoff CRM is an internal CRM that keeps track of projects, servers, deployment environments, and their health. The backend is a multi-layer .NET 8 solution designed to orchestrate deployments running on Docker (local today, Hetzner VPS tomorrow) and expose a clean Web API surface for future frontend and automation needs.

---

## Project Overview

The backend powers an internal control plane for managing your own web applications:

- Track projects and their environments (test, production, etc.).
- Store server metadata and where each environment is deployed.
- Trigger deployments and review recent deployment activity.
- Monitor health checks and retrieve environment-specific logs.
- Secure access with JWT-based authentication.

---

## Architecture

The solution is split into four projects that align with clean architecture principles.

### PopoffCrm.Domain
- **Entities**: `User`, `Server`, `Project`, `Environment`, `Deployment`, `HealthCheckResult`, `ProjectErrorLog`, `ProjectAuditLog`, `ProjectPerformanceLog`.
- **Enums**: `DeploymentStatus`, `HealthStatus`.
- **Base**: `AuditedEntity` adds `CreatedOn`, `UpdatedOn`, and `IsDeleted` to every entity.

### PopoffCrm.Application
- **Purpose**: Application services, DTOs, and interfaces that express use cases.
- **Responsibilities**: Query projects/environments/servers, orchestrate deployments, produce DTOs for the API layer.

### PopoffCrm.Infrastructure
- **Persistence**: `PopoffCrmDbContext` (EF Core for SQL Server) with initial seeding and migrations.
- **Repositories & Services**: Implementations of application interfaces plus `DockerService` (Variant A, local shell-based) and a background `HealthCheckBackgroundService`.
- **Authentication**: JWT settings binding and helpers for issuing tokens.

### PopoffCrm.WebApi
- **Framework**: ASP.NET Core Web API with Swagger/OpenAPI.
- **Controllers**: `AuthController`, `ProjectsController`, `ServersController`, `EnvironmentsController`, `DeploymentsController`, `HealthController`, `LogsController`.
- **Security**: JWT authentication middleware configured via configuration/environment variables.

---

## Tech Stack

- .NET 8
- ASP.NET Core Web API
- Entity Framework Core (SQL Server)
- JWT Authentication
- Docker & Docker Compose
- SQL Server 2022 (containerized)

---

## Prerequisites

- Docker + Docker Compose installed locally.
- (Optional) .NET 8 SDK if you plan to run the API without Docker.
- VS Code is recommended; the Docker extension makes it easy to inspect containers and follow logs.

---

## Running Everything with Docker

1. Copy the environment template and fill in secrets:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:

   - `SA_PASSWORD` – SQL Server system administrator password (must meet SQL Server complexity requirements).
   - `DB_NAME`/`DB_USER` – optional database name/user overrides (defaults: `PopoffCrm`/`sa`).
   - `JWT_KEY` – signing key for JWT tokens.
   - `JWT_ISSUER` and `JWT_AUDIENCE` – override defaults of `crm.popoff.com` when needed.
   - `PUBLIC_BASE_URL` – the externally reachable base URL for the API (defaults to `http://localhost:5000`).
   - `ALLOWED_ORIGINS` – comma-separated CORS origins (defaults to `http://localhost:4173`).

2. Start the full stack (API + SQL Server) from the solution root:

   ```bash
   docker compose up --build
   ```

   - SQL Server is exposed on `localhost:1433`.
   - The API listens on `http://localhost:5000` (Swagger at `/swagger`).

3. Stop the stack:

   ```bash
   docker compose down
   ```

4. Reset data (drops the database volume):

   ```bash
   docker compose down -v
   docker compose up --build
   ```

### What the compose file does

- **db**: Runs `mcr.microsoft.com/mssql/server:2022-latest`, persists data in the named volume `popoffcrm_db`.
- **api**: Builds from `PopoffCrm.WebApi/Dockerfile`, sets `ASPNETCORE_ENVIRONMENT=Development`, injects connection string and JWT key via environment variables, and maps container port 8080 to host port 5000.

---

## Running Without Docker (optional)

If you prefer to run locally with your own SQL Server instance:

```bash
cd PopoffCrm.WebApi
ASPNETCORE_ENVIRONMENT=Development dotnet run
```

Use a connection string such as:

```
Server=localhost;Database=PopoffCrm;User Id=sa;Password=<YourStrongPassword>;TrustServerCertificate=True;
```

Docker remains the recommended path for consistent local development.

---

## Database Migrations

Add a new migration:

```bash
dotnet ef migrations add <MigrationName> -p PopoffCrm.Infrastructure -s PopoffCrm.WebApi
```

Apply migrations (if not applied on startup):

```bash
dotnet ef database update -p PopoffCrm.Infrastructure -s PopoffCrm.WebApi
```

If you enable automatic migration execution in `Program.cs` (e.g., `Database.Migrate()`), document that behavior alongside the command above.

---

## Authentication

- Seeded admin user:
  - Email: `admin@popoffcrm.com`
  - Password: `Admin123!`
- Obtain a JWT by calling `POST /api/auth/login` with the credentials above.
- Use the token in the `Authorization: Bearer <token>` header for protected endpoints.

---

## Core API Endpoints (overview)

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/auth/login` | Authenticate and receive a JWT token. |
| GET | `/api/projects` | List all projects. |
| GET | `/api/projects/{id}` | Fetch project details by ID. |
| GET | `/api/servers` | List servers. |
| GET | `/api/environments/by-project/{projectId}` | Environments for a given project. |
| GET | `/api/deployments` | List deployments. |
| POST | `/api/environments/{environmentId}/deploy` | Trigger a deployment for an environment. |
| GET | `/api/health/overview` | High-level health status. |
| GET | `/api/logs/environment/{environmentId}?tail=200` | Tail container logs for an environment. |
| POST | `/api/logs/error` | Create a structured project error log. |
| POST | `/api/logs/audit` | Record an audit entry for a project/environment. |
| POST | `/api/logs/performance` | Submit a performance log (flags slow calls). |
| GET | `/api/logs/error?projectId=&env=&severity=&text=` | Query error logs by project, environment, severity, or text. |
| GET | `/api/logs/performance?projectId=&env=&slowOnly=` | Query performance logs; filter to slow entries. |

Swagger provides the complete contract at `/swagger` once the API is running.

---

## Posting Logs from External Servers

Projects can stream telemetry into Popoff CRM from outside the cluster (e.g., production web servers) over HTTPS:

1. **Obtain a JWT**: call `POST /api/auth/login` (or your SSO flow) and save the `accessToken`.
2. **Use your public API URL**: set `PUBLIC_BASE_URL` to the HTTPS endpoint that exposes the API and enable TLS termination (e.g., via a reverse proxy). `EnableHttpsRedirection` can be set in appsettings to force HTTPS when the API is hosted directly.
3. **Send logs with Bearer auth**. Examples:

   ```bash
   # Error log
   curl -X POST "$PUBLIC_BASE_URL/api/logs/error" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
           "projectId": "<project-guid>",
           "environmentId": "<environment-guid>",
           "occurredOn": "2025-01-01T12:00:00Z",
           "errorType": "UnhandledException",
           "message": "Failed to process request",
           "details": "Stack trace...",
           "source": "api",
           "severity": 3,
           "correlationId": "trace-id-123",
           "requestData": "{ \"path\": \"/orders\" }"
         }'

   # Performance log (auto-flags slow calls when duration exceeds threshold)
   curl -X POST "$PUBLIC_BASE_URL/api/logs/performance" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
           "projectId": "<project-guid>",
           "environmentId": "<environment-guid>",
           "timestamp": "2025-01-01T12:00:05Z",
           "operationName": "GET /orders",
           "durationMs": 850,
           "thresholdMs": 500,
           "details": "Fetched 200 orders"
         }'
   ```

4. **Query logs** as needed:
   - Errors: `GET /api/logs/error?projectId=<id>&env=<envId>&severity=2&text=timeout`
   - Performance: `GET /api/logs/performance?projectId=<id>&env=<envId>&slowOnly=true`

Requests validate that the specified `projectId` and `environmentId` exist before persisting data, so mismatches return `404` with a helpful message.

---

## Environment Variables & Configuration

- **Connection string**: The API reads `ConnectionStrings:Default` from configuration. In Docker, this is set via `ConnectionStrings__Default=Server=db;Database=PopoffCrm;User Id=sa;Password=${SA_PASSWORD};TrustServerCertificate=True;`.
- **JWT**: The signing key binds from `Jwt:Key`, supplied in Docker as `JWT__Key=${JWT_KEY}`. Issuer/audience defaults come from `appsettings.json` but can also be overridden via environment variables.

Place secrets in `.env` (not committed) and Docker Compose will inject them into the containers.

---

## VS Code Developer Experience

- Install the **Docker** extension to view containers, volumes, and live logs.
- The primary development command is:

  ```bash
  docker compose up --build
  ```

  This spins up SQL Server and the Web API together so you can immediately hit `http://localhost:5000/swagger`.
- You can attach to the `api` container’s logs from the Docker extension or via `docker compose logs -f api` for quick debugging.

---

## Future Work / Roadmap

- Connect to a real Hetzner VPS using a RemoteAgent (Variant B) for remote deployments.
- Add a React + TypeScript frontend (e.g., at `crm.popoff.com`).
- Enhance analytics, centralized log storage, and alerting around deployment/health events.

