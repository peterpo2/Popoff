using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PopoffCrm.Application.Interfaces;
using PopoffCrm.Application.DTOs;
using PopoffCrm.Infrastructure.Persistence;

namespace PopoffCrm.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class LogsController : ControllerBase
{
    private readonly PopoffCrmDbContext _dbContext;
    private readonly IDockerService _dockerService;
    private readonly IProjectLogService _projectLogService;

    public LogsController(PopoffCrmDbContext dbContext, IDockerService dockerService, IProjectLogService projectLogService)
    {
        _dbContext = dbContext;
        _dockerService = dockerService;
        _projectLogService = projectLogService;
    }

    [HttpGet("environment/{environmentId}")]
    public async Task<ActionResult<string>> GetEnvironmentLogs(Guid environmentId, [FromQuery] int tail = 200)
    {
        var env = await _dbContext.Environments.AsNoTracking().FirstOrDefaultAsync(e => e.Id == environmentId);
        if (env == null)
        {
            return NotFound();
        }

        var tailCount = tail <= 0 ? 200 : tail;
        try
        {
            var logs = await _dockerService.GetLogs(env, tailCount);
            return Content(logs, "text/plain");
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, $"Unable to read logs: {ex.Message}");
        }
    }

    [HttpPost("error")]
    public async Task<ActionResult<ProjectErrorLogDto>> CreateErrorLog([FromBody] CreateProjectErrorLogRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        try
        {
            var log = await _projectLogService.CreateErrorLogAsync(request, HttpContext.RequestAborted);
            return CreatedAtAction(nameof(GetErrorLogs), new { projectId = log.ProjectId }, log);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("audit")]
    public async Task<ActionResult<ProjectAuditLogDto>> CreateAuditLog([FromBody] CreateProjectAuditLogRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        try
        {
            var log = await _projectLogService.CreateAuditLogAsync(request, HttpContext.RequestAborted);
            return Created(string.Empty, log);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("performance")]
    public async Task<ActionResult<ProjectPerformanceLogDto>> CreatePerformanceLog([FromBody] CreateProjectPerformanceLogRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        try
        {
            var log = await _projectLogService.CreatePerformanceLogAsync(request, HttpContext.RequestAborted);
            return Created(string.Empty, log);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("error")]
    public async Task<ActionResult<IEnumerable<ProjectErrorLogDto>>> GetErrorLogs(
        [FromQuery] Guid projectId,
        [FromQuery(Name = "env")] Guid? environmentId,
        [FromQuery] int? severity,
        [FromQuery] string? text)
    {
        try
        {
            var logs = await _projectLogService.GetErrorLogsAsync(projectId, environmentId, severity, text, HttpContext.RequestAborted);
            return Ok(logs);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("performance")]
    public async Task<ActionResult<IEnumerable<ProjectPerformanceLogDto>>> GetPerformanceLogs(
        [FromQuery] Guid projectId,
        [FromQuery(Name = "env")] Guid? environmentId,
        [FromQuery] bool slowOnly = false)
    {
        try
        {
            var logs = await _projectLogService.GetPerformanceLogsAsync(projectId, environmentId, slowOnly, HttpContext.RequestAborted);
            return Ok(logs);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
}
