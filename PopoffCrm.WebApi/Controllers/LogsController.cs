using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PopoffCrm.Application.Interfaces;
using PopoffCrm.Infrastructure.Persistence;

namespace PopoffCrm.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class LogsController : ControllerBase
{
    private readonly PopoffCrmDbContext _dbContext;
    private readonly IDockerService _dockerService;

    public LogsController(PopoffCrmDbContext dbContext, IDockerService dockerService)
    {
        _dbContext = dbContext;
        _dockerService = dockerService;
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
}
