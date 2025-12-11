using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PopoffCrm.Application.Common;
using PopoffCrm.Application.DTOs;
using PopoffCrm.Infrastructure.Persistence;

namespace PopoffCrm.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly PopoffCrmDbContext _dbContext;

    public HealthController(PopoffCrmDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("overview")]
    public async Task<ActionResult<IEnumerable<HealthOverviewDto>>> GetOverview()
    {
        var latestResults = await _dbContext.HealthCheckResults
            .Include(h => h.Environment)
            .ThenInclude(e => e.Project)
            .GroupBy(h => h.EnvironmentId)
            .Select(g => g.OrderByDescending(x => x.CheckedOn).First())
            .ToListAsync();

        return Ok(latestResults.Select(r => r.ToOverviewDto()));
    }

    [HttpGet("environment/{environmentId}")]
    public async Task<ActionResult<IEnumerable<HealthCheckDto>>> GetByEnvironment(Guid environmentId)
    {
        var results = await _dbContext.HealthCheckResults
            .Where(h => h.EnvironmentId == environmentId)
            .OrderByDescending(h => h.CheckedOn)
            .ToListAsync();

        return Ok(results.Select(r => r.ToDto()));
    }
}
