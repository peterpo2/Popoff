using PopoffCrm.Application.DTOs;

namespace PopoffCrm.Application.Interfaces;

public interface IProjectLogService
{
    Task<ProjectErrorLogDto> CreateErrorLogAsync(CreateProjectErrorLogRequest request, CancellationToken cancellationToken = default);
    Task<ProjectAuditLogDto> CreateAuditLogAsync(CreateProjectAuditLogRequest request, CancellationToken cancellationToken = default);
    Task<ProjectPerformanceLogDto> CreatePerformanceLogAsync(CreateProjectPerformanceLogRequest request, CancellationToken cancellationToken = default);
    Task<IEnumerable<ProjectErrorLogDto>> GetErrorLogsAsync(Guid projectId, Guid? environmentId, int? severity, string? text, CancellationToken cancellationToken = default);
    Task<IEnumerable<ProjectPerformanceLogDto>> GetPerformanceLogsAsync(Guid projectId, Guid? environmentId, bool slowOnly, CancellationToken cancellationToken = default);
}
